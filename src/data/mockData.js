export const projects = [
  {
    id: 1,
    name: 'Neural Architecture Search',
    description: 'Automated discovery of optimal neural network architectures using evolutionary strategies and reinforcement learning.',
    progress: 72,
    tags: ['Deep Learning', 'AutoML', 'NAS'],
    lastUpdated: '2 hours ago',
  },
  {
    id: 2,
    name: 'Climate Modeling with GNNs',
    description: 'Applying graph neural networks to improve long-range climate prediction accuracy for extreme weather events.',
    progress: 45,
    tags: ['Climate Science', 'GNN', 'Forecasting'],
    lastUpdated: '1 day ago',
  },
  {
    id: 3,
    name: 'Transformer Efficiency Study',
    description: 'Benchmarking attention mechanisms and sparse transformers for resource-constrained edge deployment scenarios.',
    progress: 88,
    tags: ['Transformers', 'Efficiency', 'Edge AI'],
    lastUpdated: '3 hours ago',
  },
]

export const papers = [
  {
    id: 1,
    title: 'EfficientNet: Rethinking Model Scaling for CNNs',
    authors: 'Tan, M. & Le, Q.',
    year: 2019,
    abstract: 'We systematically study model scaling and identify that carefully balancing network depth, width, and resolution can lead to significant improvements in accuracy.',
    tags: ['CNN', 'Scaling', 'Efficiency'],
  },
  {
    id: 2,
    title: 'Attention Is All You Need',
    authors: 'Vaswani, A. et al.',
    year: 2017,
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    tags: ['Attention', 'Transformers', 'NLP'],
  },
  {
    id: 3,
    title: 'Graph Neural Networks for Climate Prediction',
    authors: 'Keisler, R.',
    year: 2022,
    abstract: 'We present a graph neural network approach for medium-range weather forecasting that outperforms traditional numerical weather prediction models.',
    tags: ['GNN', 'Climate', 'Prediction'],
  },
  {
    id: 4,
    title: 'DARTS: Differentiable Architecture Search',
    authors: 'Liu, H. et al.',
    year: 2019,
    abstract: 'We address the scalability challenge of architecture search by formulating the task in a differentiable manner using continuous relaxation.',
    tags: ['NAS', 'AutoML', 'Optimization'],
  },
  {
    id: 5,
    title: 'ClimaX: A Foundation Model for Weather and Climate',
    authors: 'Nguyen, T. et al.',
    year: 2023,
    abstract: 'We develop ClimaX, a flexible and generalizable deep learning model for weather and climate science that can be fine-tuned for a broad range of tasks.',
    tags: ['Foundation Model', 'Climate', 'Transfer Learning'],
  },
  {
    id: 6,
    title: 'Sparse Transformers for Long-Range Dependencies',
    authors: 'Child, R. et al.',
    year: 2019,
    abstract: 'We introduce sparse factorizations of the attention matrix which reduce the computational cost from quadratic to linear in the sequence length.',
    tags: ['Transformers', 'Sparse Attention', 'Efficiency'],
  },
]

export const experiments = [
  { id: 1, name: 'NAS Benchmark v3', status: 'Active', hypothesis: 'Evolutionary search outperforms random search by >15% on CIFAR-10', date: '2026-03-10' },
  { id: 2, name: 'GNN Climate Ensemble', status: 'Completed', hypothesis: 'Ensemble of 5 GNN models reduces MAE by 8% vs single model', date: '2026-03-05' },
  { id: 3, name: 'Sparse Attention Ablation', status: 'Active', hypothesis: 'Removing 70% of attention heads maintains 95% accuracy', date: '2026-03-08' },
  { id: 4, name: 'Transfer Learning Baseline', status: 'Pending', hypothesis: 'Pre-trained ClimaX transfers effectively to regional forecasting', date: '2026-03-12' },
  { id: 5, name: 'Edge Deployment Latency', status: 'Completed', hypothesis: 'Quantized model achieves <50ms inference on Jetson Nano', date: '2026-02-28' },
]

export const insights = [
  {
    id: 1,
    title: 'Architecture Scaling Laws',
    description: 'Compound scaling of depth, width, and resolution follows a power-law relationship that generalizes across model families.',
    linkedPapers: 3,
  },
  {
    id: 2,
    title: 'GNN Expressiveness Gap',
    description: 'Current message-passing GNNs cannot distinguish certain graph structures, limiting climate pattern recognition.',
    linkedPapers: 2,
  },
  {
    id: 3,
    title: 'Attention Sparsity Threshold',
    description: 'Below 30% attention density, model performance degrades non-linearly — suggesting a critical information bottleneck.',
    linkedPapers: 4,
  },
  {
    id: 4,
    title: 'Cross-Domain Transfer Potential',
    description: 'Weather prediction features transfer surprisingly well to oceanography and atmospheric chemistry tasks.',
    linkedPapers: 2,
  },
]

export const activities = [
  { action: 'Added paper "ClimaX: A Foundation Model" to Climate Modeling project', time: '2 hours ago' },
  { action: 'Completed experiment "GNN Climate Ensemble" — hypothesis confirmed', time: '5 hours ago' },
  { action: 'AI Assistant generated 3 new insight connections', time: '8 hours ago' },
  { action: 'Updated experiment "NAS Benchmark v3" status to Active', time: '1 day ago' },
  { action: 'Created new project "Transformer Efficiency Study"', time: '1 day ago' },
  { action: 'Similarity check flagged 85% overlap in methodology sections', time: '2 days ago' },
  { action: 'Added 4 papers to Neural Architecture Search project', time: '3 days ago' },
]

export const workflowColumns = [
  {
    title: 'Literature Review',
    items: [
      { id: 1, text: 'Survey sparse attention mechanisms', tags: ['Transformers'] },
      { id: 2, text: 'Review GNN expressiveness literature', tags: ['GNN'] },
    ],
  },
  {
    title: 'Hypothesis',
    items: [
      { id: 3, text: 'Compound scaling generalizes to vision transformers', tags: ['Scaling'] },
      { id: 4, text: 'Graph attention improves climate node interactions', tags: ['Climate'] },
    ],
  },
  {
    title: 'Experiment Design',
    items: [
      { id: 5, text: 'Design ablation study for attention heads', tags: ['Ablation'] },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { id: 6, text: 'Statistical analysis of NAS benchmark results', tags: ['NAS'] },
      { id: 7, text: 'Visualize climate prediction error maps', tags: ['Climate'] },
    ],
  },
]

export const graphNodes = [
  { id: 1, label: 'Neural Architecture Search', x: 400, y: 250, type: 'paper' },
  { id: 2, label: 'Attention Mechanisms', x: 250, y: 120, type: 'insight' },
  { id: 3, label: 'Climate Prediction', x: 600, y: 150, type: 'paper' },
  { id: 4, label: 'Graph Neural Networks', x: 550, y: 350, type: 'paper' },
  { id: 5, label: 'Transfer Learning', x: 200, y: 350, type: 'insight' },
  { id: 6, label: 'Model Efficiency', x: 100, y: 200, type: 'experiment' },
  { id: 7, label: 'Sparse Transformers', x: 350, y: 450, type: 'paper' },
  { id: 8, label: 'Scaling Laws', x: 700, y: 280, type: 'insight' },
  { id: 9, label: 'Edge Deployment', x: 150, y: 450, type: 'experiment' },
  { id: 10, label: 'Foundation Models', x: 500, y: 50, type: 'paper' },
]

export const graphEdges = [
  [1, 2], [1, 5], [1, 7], [2, 3], [2, 6], [3, 4], [3, 8], [3, 10],
  [4, 5], [4, 7], [5, 9], [6, 7], [6, 9], [7, 2], [8, 10], [4, 8],
]

export const chatMessages = [
  {
    role: 'user',
    text: 'Can you summarize the key findings from the EfficientNet paper and how they relate to our NAS project?',
  },
  {
    role: 'assistant',
    text: 'The EfficientNet paper introduces compound scaling — simultaneously scaling network depth, width, and resolution using a fixed ratio. Key findings:\n\n• Compound scaling improves accuracy by up to 2.5% over single-dimension scaling\n• The optimal scaling coefficients follow φ relationships: depth=α^φ, width=β^φ, resolution=γ^φ\n• This directly supports your NAS project hypothesis that search spaces should include multi-dimensional scaling rather than just depth or width alone.\n\nI\'ve linked this insight to 3 related papers in your project.',
  },
  {
    role: 'user',
    text: 'Are there any research gaps between our climate modeling work and the GNN literature?',
  },
  {
    role: 'assistant',
    text: 'I\'ve identified 2 significant gaps in your Climate Modeling project:\n\n1. **Temporal dynamics**: Current GNN approaches in your project model spatial relationships well but lack explicit temporal modeling. Recent work on Temporal Graph Networks could address this.\n\n2. **Multi-scale representation**: Your GNN operates at a single spatial resolution. Papers on hierarchical graph pooling suggest multi-scale approaches improve prediction at both local and global levels.\n\nI recommend adding the "Temporal Graph Networks" (Rossi et al., 2020) paper to your literature review.',
  },
  {
    role: 'user',
    text: 'Can you suggest any unexpected connections between our three projects?',
  },
  {
    role: 'assistant',
    text: 'Here are 3 cross-project connections I\'ve discovered:\n\n1. **NAS → Climate**: The neural architecture search strategies you\'re developing could be applied to automatically discover optimal GNN architectures for climate modeling, rather than hand-designing them.\n\n2. **Efficiency → Climate**: Your transformer efficiency findings (sparse attention) could dramatically reduce the computational cost of climate foundation models like ClimaX, enabling real-time forecasting.\n\n3. **Climate → NAS**: The graph-based representations used in your climate models could inspire a new graph-based search space for NAS, where architectures are represented as graphs with learnable topology.\n\nThese connections have been added to your Knowledge Graph.',
  },
]

export const sampleDocA = `Abstract: We present a novel approach to neural architecture search (NAS) that leverages evolutionary strategies combined with weight sharing to efficiently explore the architecture search space. Our method, EvoNAS, reduces the computational cost of architecture search by 60% compared to traditional NAS methods while maintaining competitive accuracy on standard benchmarks.

Our approach builds upon the observation that architectures with similar topological properties tend to share performance characteristics. By exploiting this structure, we design a mutation operator that makes targeted modifications to promising architectures rather than random perturbations.

We evaluate EvoNAS on CIFAR-10, CIFAR-100, and ImageNet, demonstrating that it discovers architectures achieving 97.4% top-1 accuracy on CIFAR-10 and 79.2% on ImageNet, while requiring only 0.4 GPU-days of search time. This represents a significant improvement over prior evolutionary NAS methods.`

export const sampleDocB = `Abstract: This paper introduces an evolutionary computation framework for efficient neural network architecture discovery. Our proposed method combines evolutionary search with parameter sharing techniques to reduce the computational overhead associated with architecture optimization. The framework achieves a 55% reduction in search cost compared to conventional architecture search approaches while producing competitive results across multiple benchmarks.

The key insight of our work is that network architectures exhibiting similar structural properties often demonstrate correlated performance patterns. Leveraging this observation, we develop a targeted mutation strategy that focuses modifications on high-potential candidate architectures instead of relying on random changes.

Experimental results on CIFAR-10, CIFAR-100, and ImageNet show that our discovered architectures achieve 97.1% accuracy on CIFAR-10 and 78.8% on ImageNet, with a total search budget of 0.5 GPU-days. These results compare favorably to existing evolutionary approaches for architecture search.`
