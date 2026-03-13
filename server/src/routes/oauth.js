const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const router = express.Router();
const prisma = new PrismaClient();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
  // 1. Try exact provider+providerId match
  let user = await prisma.user.findFirst({ where: { provider, providerId } });

  // 2. Try to link to existing local account by email
  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider, providerId, avatar: avatar || user.avatar },
      });
    }
  }

  // 3. Create brand-new OAuth user
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name || 'User',
        email: email || `${provider}_${providerId}@oauth.local`,
        provider,
        providerId,
        avatar,
      },
    });
  }

  return user;
}

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function oauthError(res, code = 'oauth_failed') {
  return res.redirect(`${CLIENT_URL}/login?error=${code}`);
}

// ─── Google ─────────────────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return oauthError(res, 'oauth_cancelled');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SERVER_URL}/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return oauthError(res);

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const user = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    const token = issueToken(user);
    res.redirect(`${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    oauthError(res);
  }
});

// ─── GitHub ──────────────────────────────────────────────────────────────────

router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/auth/github/callback`,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return oauthError(res, 'oauth_cancelled');

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${SERVER_URL}/auth/github/callback`,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return oauthError(res);

    const [profileRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Nexus-Research-App',
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Nexus-Research-App',
        },
      }),
    ]);

    const profile = await profileRes.json();
    const emails = await emailsRes.json();
    const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
    const email = primary ? primary.email : profile.email;

    const user = await findOrCreateOAuthUser({
      provider: 'github',
      providerId: String(profile.id),
      email,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
    });

    const token = issueToken(user);
    res.redirect(`${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    oauthError(res);
  }
});

// ─── LinkedIn (OpenID Connect) ───────────────────────────────────────────────

router.get('/linkedin', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/auth/linkedin/callback`,
    scope: 'openid profile email',
  });
  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
});

router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return oauthError(res, 'oauth_cancelled');

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${SERVER_URL}/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return oauthError(res);

    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const user = await findOrCreateOAuthUser({
      provider: 'linkedin',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    const token = issueToken(user);
    res.redirect(`${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('LinkedIn OAuth error:', err);
    oauthError(res);
  }
});

module.exports = router;
