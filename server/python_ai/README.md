# Nexus Python AI Service

This service hosts the RAG pipeline used by `server/src/services/ai.service.js`.

## 1) Create environment and install dependencies

```bash
cd server/python_ai
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configure environment

Create `server/python_ai/.env` with:

```env
GROQ_API_KEY=your_groq_api_key
PY_AI_UPLOAD_DIR=uploads
```

## 3) Run service

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

`http://127.0.0.1:8000/health`

## 4) Node server bridge

Set in `server/.env`:

```env
FASTAPI_URL=http://127.0.0.1:8000
```

Then run the Node API (`server/`) as usual.
