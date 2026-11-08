export type Project = {
  id: string;
  name: string;
  description: string;
  category: 'Security' | 'AI & Data' | 'Spatial Computing' | 'Systems' | 'Web' | 'Experiments';
  language: string;
  stack: string[];
  github: string;
  live?: string;
  status: 'Active' | 'Prototype' | 'Experiment';
  featured?: boolean;
  note?: string;
};

export const projects: Project[] = [
  {
    id: 'graphyte',
    name: 'Graphyte OSINT',
    description: 'An open-source investigation workspace for collecting, correlating and exploring public intelligence. It combines 26 modular OSINT tools, playbook orchestration, a searchable workflow and STIX-compatible graph exploration.',
    category: 'Security', language: 'Python',
    stack: ['FastAPI', 'Next.js', 'Celery', 'Redis', 'STIX 2.1', 'Neo4j'],
    github: 'https://github.com/Atharv3142M/Graphyte-OSINT', status: 'Active', featured: true,
    note: 'Built for responsible research using public information and permitted sources.'
  },
  {
    id: 'poseye',
    name: 'posEye',
    description: 'A Windows desktop application that transforms drone flight video and GPS telemetry into georeferenced 3D reconstructions. Its pipeline covers frame extraction, image filtering, metadata injection, photogrammetry and model viewing.',
    category: 'Spatial Computing', language: 'Python',
    stack: ['FFmpeg', 'OpenCV', 'OpenDroneMap', 'Three.js', 'Photogrammetry'],
    github: 'https://github.com/Atharv3142M/posEye', live: 'https://atharv3142m.github.io/posEye/', status: 'Active', featured: true
  },
  {
    id: 'poai',
    name: 'POAi v2.0',
    description: 'A production-grade, local-first meeting recorder with AI-powered analysis. The project focuses on keeping the recording and analysis workflow close to the user rather than relying on a cloud-first pipeline.',
    category: 'AI & Data', language: 'Python',
    stack: ['Python', 'Local-first workflow', 'AI-assisted analysis'],
    github: 'https://github.com/Atharv3142M/POAi-v2.0', status: 'Prototype', featured: true
  },
  {
    id: 'ai-hygiene',
    name: 'AI Hygiene Companion',
    description: 'A browser extension concept for teaching safer online behaviour through real-time guidance and gamification. Its documented direction includes local model inference and a Safe-to-Earn learning loop.',
    category: 'Security', language: 'TypeScript',
    stack: ['TypeScript', 'React', 'Chrome Extensions', 'Transformers.js', 'ONNX'],
    github: 'https://github.com/Bonsai05/ai-hygiene-extension', status: 'Prototype', featured: true,
    note: 'Repository is hosted under Bonsai05.'
  },
  {
    id: 'croptellect',
    name: 'CropTellect',
    description: 'An AI-powered crop disease detection web application. It uses a VGG19-based image classification workflow to help identify disease patterns from crop-leaf images.',
    category: 'AI & Data', language: 'Jupyter Notebook',
    stack: ['Python', 'Flask', 'TensorFlow', 'Keras', 'VGG19'],
    github: 'https://github.com/Atharv3142M/CropTellect', status: 'Prototype', featured: true
  },
  {
    id: 'capstone-mis',
    name: 'Capstone Project MIS',
    description: 'A role-based management information system for university capstone projects, with a web frontend, API backend, database migrations and a documented local development workflow.',
    category: 'Web', language: 'TypeScript',
    stack: ['Next.js', 'Tailwind CSS', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
    github: 'https://github.com/Atharv3142M/Capstone-Project-Management-Information-System', status: 'Active', featured: true
  },
  {
    id: 'mazgaon',
    name: 'Mazgaon Dock MIS',
    description: 'A management information system prototype exploring how operational information and workflows can be organized for an industrial context.',
    category: 'Web', language: 'JavaScript',
    stack: ['JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/Atharv3142M/Mazgaon-Dock-MIS', live: 'https://atharv3142m.github.io/Mazgaon-Dock-MIS/', status: 'Prototype'
  },
  {
    id: 'rtmssu-hackathon',
    name: 'RTMSSU Hackathon Project',
    description: 'A personal-finance application concept covering bill capture, transaction organization and AI-assisted spending insights.',
    category: 'AI & Data', language: 'Dart',
    stack: ['Flutter', 'Node.js', 'Python', 'MongoDB', 'Firebase'],
    github: 'https://github.com/Atharv3142M/RTMSSU-HACKATHON', status: 'Prototype'
  },
  {
    id: 'poserion-zero',
    name: 'Poserion ZERO',
    description: 'An ongoing exploration into a low-cost, open-hardware portable electronics and security multi-tool. The work focuses on component selection, practical firmware and a modular design.',
    category: 'Systems', language: 'Embedded / Web',
    stack: ['ESP32', 'Embedded systems', 'Firmware research', 'Electronics'],
    github: 'https://github.com/Atharv3142M/Poserion-ZERO', status: 'Experiment', featured: true,
    note: 'Early-stage hardware exploration. Not presented as a finished device.'
  },
  {
    id: 'chess',
    name: 'Free Chess Trainer',
    description: 'A chess practice project focused on tactical patterns, deliberate repetition and structured training.',
    category: 'Experiments', language: 'Python',
    stack: ['Python'], github: 'https://github.com/Atharv3142M/Free-Chess-Trainer', status: 'Experiment'
  },
  {
    id: 'sneakers',
    name: 'E-Commerce SneakersStore',
    description: 'A responsive storefront experiment with product browsing, sorting, a local cart, simulated account flows and a mock checkout experience.',
    category: 'Web', language: 'HTML',
    stack: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
    github: 'https://github.com/Atharv3142M/E-Commerce_SneakersStore', status: 'Experiment'
  },
  {
    id: 'neev',
    name: 'Neev Investments',
    description: 'A hackathon-oriented micro-investment platform concept aimed at exploring access to small-scale investment tools.',
    category: 'Experiments', language: 'TypeScript',
    stack: ['TypeScript', 'Web application'],
    github: 'https://github.com/Atharv3142M/Neev-A-Investments-App', status: 'Prototype'
  }
];

export const skillGroups = [
  { name: 'Languages & scripting', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Dart', 'HTML', 'CSS', 'Bash', 'PowerShell'] },
  { name: 'Web & application development', items: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Flask', 'FastAPI', 'Flutter'] },
  { name: 'Data & computer vision', items: ['TensorFlow', 'Keras', 'OpenCV', 'NumPy', 'Pandas', 'Jupyter'] },
  { name: 'Databases & infrastructure', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Redis', 'Docker', 'GitHub Actions', 'Firebase'] },
  { name: 'Security & investigation', items: ['OSINT', 'Public-source research', 'Network fundamentals', 'Privacy and security awareness', 'STIX workflows'] },
  { name: 'Hardware & systems', items: ['ESP32 exploration', 'Arduino', 'Linux', 'Windows administration', 'Minecraft server hosting', 'Minecraft modding'] },
  { name: 'Creative tools', items: ['Adobe Premiere Pro', 'After Effects', 'Photoshop', 'Lightroom', 'Blender', 'Canva', 'FFmpeg'] }
];

export const certificates = [
  { name: 'Microsoft Security Essentials: Concepts, Solutions, and AI-Powered Protection', issuer: 'Listed on LinkedIn' },
  { name: 'The What and How of Esports Management', issuer: 'edX · Verified Certificate' },
  { name: 'Generative AI: From Prompts to Partnership', issuer: 'Listed on LinkedIn' },
  { name: 'Practical GitHub Actions', issuer: 'Listed on LinkedIn' },
  { name: 'CryptoGuard: Securing the Future of Game Development with Blockchain', issuer: 'edX · Verified Certificate' }
];

export const education = {
  institution: 'Ratan Tata Maharashtra State Skills University',
  program: 'B.Tech in Information Technology',
  period: '2024–2028',
  location: 'Mumbai Metropolitan Region, India'
};

export const contact = {
  email: 'atharvpose41@gmail.com',
  github: 'https://github.com/Atharv3142M',
  linkedin: 'https://www.linkedin.com/in/atharv-pose',
  holopin: 'https://holopin.io/@atharv3142m'
};
