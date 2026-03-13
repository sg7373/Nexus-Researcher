const bcrypt = require('bcryptjs');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@nexus.com' },
    update: {},
    create: {
      email: 'demo@nexus.com',
      name: 'Dr. Sarah Chen',
      password: hashedPassword,
    },
  });
  console.log('Created user:', user.email);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Neural Architecture Search with Evolutionary Strategies',
      description:
        'Automated discovery of optimal neural network architectures using evolutionary strategies and reinforcement learning for image classification tasks.',
      userId: user.id,
      stage: 'experiment_design',
      tags: ['Deep Learning', 'AutoML', 'NAS', 'Computer Vision'],
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Climate Modeling with Graph Neural Networks',
      description:
        'Applying graph neural networks to improve long-range climate prediction accuracy for extreme weather events and seasonal forecasting.',
      userId: user.id,
      stage: 'literature_review',
      tags: ['Climate Science', 'GNN', 'Forecasting', 'Earth Science'],
    },
  });
  console.log('Created 2 projects');

  // Papers for project 1
  const papers1 = await Promise.all([
    prisma.paper.create({
      data: {
        title: 'EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks',
        authors: ['Mingxing Tan', 'Quoc V. Le'],
        year: 2019,
        abstract:
          'We systematically study model scaling and identify that carefully balancing network depth, width, and resolution can lead to significant improvements in accuracy. Using this observation, we propose a new scaling method that uniformly scales all dimensions of depth/width/resolution using a simple yet effective compound coefficient.',
        tags: ['CNN', 'Scaling', 'Efficiency'],
        keywords: ['compound scaling', 'neural architecture', 'model efficiency'],
        projectId: project1.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'DARTS: Differentiable Architecture Search',
        authors: ['Hanxiao Liu', 'Karen Simonyan', 'Yiming Yang'],
        year: 2019,
        abstract:
          'We address the scalability challenge of architecture search by formulating the task in a differentiable manner. Using continuous relaxation of the architecture representation, we allow efficient search using gradient descent, reducing the search cost to a few GPU days.',
        tags: ['NAS', 'AutoML', 'Optimization'],
        keywords: ['differentiable search', 'architecture optimization', 'gradient-based NAS'],
        projectId: project1.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'Attention Is All You Need',
        authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
        year: 2017,
        abstract:
          'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
        tags: ['Attention', 'Transformers', 'NLP'],
        keywords: ['self-attention', 'transformer', 'sequence modeling'],
        projectId: project1.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'Sparse Transformers for Long-Range Sequence Modeling',
        authors: ['Rewon Child', 'Scott Gray', 'Alec Radford'],
        year: 2019,
        abstract:
          'We introduce sparse factorizations of the attention matrix which reduce the computational cost from quadratic to O(n√n) in the sequence length. These sparse transformers achieve comparable or better performance on various benchmarks while being significantly more efficient.',
        tags: ['Transformers', 'Sparse Attention', 'Efficiency'],
        keywords: ['sparse attention', 'long-range dependencies', 'efficient transformers'],
        projectId: project1.id,
      },
    }),
  ]);

  // Papers for project 2
  const papers2 = await Promise.all([
    prisma.paper.create({
      data: {
        title: 'Graph Neural Networks for Weather and Climate Prediction',
        authors: ['Ryan Keisler'],
        year: 2022,
        abstract:
          'We present a graph neural network approach for medium-range weather forecasting that models the atmosphere as a graph on the sphere. Our method outperforms traditional numerical weather prediction models on several key meteorological variables at 3 to 5 day lead times.',
        tags: ['GNN', 'Climate', 'Prediction'],
        keywords: ['weather forecasting', 'graph networks', 'atmospheric modeling'],
        projectId: project2.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'ClimaX: A Foundation Model for Weather and Climate',
        authors: ['Tung Nguyen', 'Johannes Brandstetter', 'Ashish Kapoor'],
        year: 2023,
        abstract:
          'We develop ClimaX, a flexible and generalizable deep learning model for weather and climate science that can be pre-trained with heterogeneous datasets spanning different variables, spatio-temporal coverage, and physical groundings, and fine-tuned for a broad range of climate tasks.',
        tags: ['Foundation Model', 'Climate', 'Transfer Learning'],
        keywords: ['foundation model', 'climate science', 'pre-training'],
        projectId: project2.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'FourCastNet: A Global Data-driven High-resolution Weather Forecasting Model',
        authors: ['Jaideep Pathak', 'Shashank Subramanian', 'Peter Harrington'],
        year: 2022,
        abstract:
          'We present FourCastNet, a data-driven global weather forecasting model that provides accurate short to medium-range forecasts at 0.25° resolution. The model uses adaptive Fourier neural operators and generates one week forecasts in less than 2 seconds.',
        tags: ['Weather', 'Deep Learning', 'Forecasting'],
        keywords: ['fourier neural operator', 'global forecasting', 'high-resolution'],
        projectId: project2.id,
      },
    }),
    prisma.paper.create({
      data: {
        title: 'GraphCast: Learning Skillful Medium-Range Global Weather Forecasting',
        authors: ['Remi Lam', 'Alvaro Sanchez-Gonzalez', 'Matthew Willson'],
        year: 2023,
        abstract:
          'We introduce GraphCast, a machine learning-based method for weather forecasting that outperforms the most accurate operational deterministic systems on 90% of 1380 verification targets. GraphCast uses graph neural networks in an encode-process-decode configuration.',
        tags: ['GNN', 'Weather', 'Machine Learning'],
        keywords: ['graphcast', 'weather prediction', 'encode-process-decode'],
        projectId: project2.id,
      },
    }),
  ]);
  console.log('Created 8 papers');

  // Experiments for project 1
  const exp1 = await prisma.experiment.create({
    data: {
      name: 'NAS Benchmark v3 — Evolutionary vs Random Search',
      objective: 'Compare evolutionary search against random search on CIFAR-10 architecture discovery',
      methodology:
        'Run 500 architecture evaluations each for evolutionary search (tournament selection, mutation rate 0.1) and random search. Evaluate top-5 discovered architectures on full training schedule.',
      status: 'active',
      projectId: project1.id,
    },
  });

  await prisma.experiment.create({
    data: {
      name: 'Sparse Attention Head Ablation Study',
      objective: 'Determine minimum attention density needed to maintain 95% of full-attention accuracy',
      methodology:
        'Progressively prune attention heads in a 12-layer transformer. Measure accuracy on GLUE benchmarks at 10% pruning intervals from 0% to 90%.',
      status: 'pending',
      projectId: project1.id,
    },
  });

  // Experiments for project 2
  await prisma.experiment.create({
    data: {
      name: 'GNN Climate Ensemble Evaluation',
      objective: 'Evaluate whether ensembling 5 GNN models reduces mean absolute error vs single model',
      methodology:
        'Train 5 GNN models with different random seeds and graph connectivity patterns. Compare ensemble predictions against single best model on 2023 ERA5 reanalysis data.',
      status: 'completed',
      results: 'Ensemble reduced MAE by 8.3% on 5-day forecasts and 12.1% on 10-day forecasts.',
      projectId: project2.id,
    },
  });

  await prisma.experiment.create({
    data: {
      name: 'ClimaX Regional Fine-tuning',
      objective: 'Test ClimaX transfer learning effectiveness on regional European weather prediction',
      methodology:
        'Fine-tune pre-trained ClimaX on ERA5 data for European region. Compare against training from scratch and traditional ECMWF HRES forecasts.',
      status: 'active',
      projectId: project2.id,
    },
  });
  console.log('Created 4 experiments');

  // Add experiment iteration
  await prisma.experimentIteration.create({
    data: {
      notes: 'Initial run with population size 50. Evolutionary search found top architecture with 97.1% accuracy after 200 evaluations. Random search best was 96.4%.',
      outcome: 'Promising — evolutionary search converges faster',
      experimentId: exp1.id,
    },
  });

  // Insights for project 1
  const insights1 = await Promise.all([
    prisma.insight.create({
      data: {
        title: 'Compound Scaling Generalizes Across Architecture Families',
        description:
          'The compound scaling principle from EfficientNet appears to generalize beyond CNNs. Initial evidence suggests similar depth-width-resolution relationships hold for vision transformers and hybrid architectures.',
        projectId: project1.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Attention Sparsity Has a Critical Threshold',
        description:
          'Below approximately 30% attention density, model performance degrades non-linearly. This suggests a critical information bottleneck that constrains how aggressively attention can be pruned.',
        projectId: project1.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Evolutionary Search Spaces Should Be Multi-Dimensional',
        description:
          'NAS methods that search over depth alone miss important accuracy gains. Search spaces should jointly optimize depth, width, resolution, and connectivity patterns.',
        projectId: project1.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Differentiable NAS Converges to Local Optima',
        description:
          'DARTS-style continuous relaxation consistently finds architectures within a narrow region of the search space. Evolutionary methods explore more diverse solutions with potentially better global optima.',
        projectId: project1.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Weight Sharing Introduces Ranking Bias',
        description:
          'Architectures evaluated under weight sharing may be ranked differently than when trained from scratch. This bias affects all one-shot NAS methods and needs further investigation.',
        projectId: project1.id,
      },
    }),
  ]);

  // Insights for project 2
  const insights2 = await Promise.all([
    prisma.insight.create({
      data: {
        title: 'GNN Message Passing Limits Climate Pattern Recognition',
        description:
          'Standard message-passing GNNs cannot distinguish certain symmetric graph structures, which limits their ability to capture complex atmospheric teleconnection patterns.',
        projectId: project2.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Weather Features Transfer to Oceanography',
        description:
          'Pre-trained weather prediction features transfer surprisingly well to oceanographic tasks such as sea surface temperature forecasting and ocean current prediction.',
        projectId: project2.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Multi-Scale Graph Resolution Improves Extreme Events',
        description:
          'Using hierarchical graph pooling to model atmosphere at different spatial scales significantly improves prediction of extreme weather events like hurricanes and heatwaves.',
        projectId: project2.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Ensemble Diversity Outweighs Individual Model Quality',
        description:
          'For climate GNNs, ensemble members trained with different graph connectivity patterns are more valuable than slightly better individual models, as diversity reduces systematic forecast errors.',
        projectId: project2.id,
      },
    }),
    prisma.insight.create({
      data: {
        title: 'Temporal Dynamics Are Underrepresented in Current GNN Approaches',
        description:
          'Most GNN climate models focus on spatial message passing but lack explicit temporal modeling. Incorporating temporal graph networks could significantly improve multi-day forecasts.',
        projectId: project2.id,
      },
    }),
  ]);
  console.log('Created 10 insights');

  // Insight links for project 1
  await Promise.all([
    prisma.insightLink.create({
      data: {
        fromInsightId: insights1[0].id,
        toInsightId: insights1[2].id,
        relationshipType: 'supports',
        strength: 0.8,
      },
    }),
    prisma.insightLink.create({
      data: {
        fromInsightId: insights1[1].id,
        toInsightId: insights1[3].id,
        relationshipType: 'contradicts',
        strength: 0.6,
      },
    }),
    prisma.insightLink.create({
      data: {
        fromInsightId: insights1[3].id,
        toInsightId: insights1[4].id,
        relationshipType: 'related',
        strength: 0.7,
      },
    }),
  ]);

  // Insight links for project 2
  await Promise.all([
    prisma.insightLink.create({
      data: {
        fromInsightId: insights2[0].id,
        toInsightId: insights2[2].id,
        relationshipType: 'supports',
        strength: 0.9,
      },
    }),
    prisma.insightLink.create({
      data: {
        fromInsightId: insights2[1].id,
        toInsightId: insights2[4].id,
        relationshipType: 'related',
        strength: 0.5,
      },
    }),
    prisma.insightLink.create({
      data: {
        fromInsightId: insights2[3].id,
        toInsightId: insights2[0].id,
        relationshipType: 'extends',
        strength: 0.7,
      },
    }),
  ]);
  console.log('Created insight links');

  // Insight-paper links
  await Promise.all([
    prisma.insightPaperLink.create({ data: { insightId: insights1[0].id, paperId: papers1[0].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights1[0].id, paperId: papers1[1].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights1[1].id, paperId: papers1[2].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights1[1].id, paperId: papers1[3].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights1[2].id, paperId: papers1[1].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights2[0].id, paperId: papers2[0].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights2[1].id, paperId: papers2[1].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights2[2].id, paperId: papers2[0].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights2[2].id, paperId: papers2[3].id } }),
    prisma.insightPaperLink.create({ data: { insightId: insights2[3].id, paperId: papers2[0].id } }),
  ]);
  console.log('Created insight-paper links');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
