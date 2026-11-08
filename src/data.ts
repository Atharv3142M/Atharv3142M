export type ProjectCategory = 'Security' | 'AI & Data' | 'Spatial Computing' | 'Systems' | 'Web' | 'Games';
export type ProjectStatus = 'Active development' | 'Prototype' | 'Research build';

export type Project = {
  id: string;
  name: string;
  category: ProjectCategory;
  language: string;
  status: ProjectStatus;
  description: string;
  overview: string;
  approach: string[];
  engineeringNotes: string[];
  stack: string[];
  github: string;
  live?: string;
  featured?: boolean;
  note?: string;
};

export const projects: Project[] = [
  {
    id: 'graphyte',
    name: 'Graphyte OSINT',
    category: 'Security',
    language: 'Python',
    status: 'Active development',
    description: 'An open-source investigation workspace for collecting, correlating and exploring public-source information.',
    overview: 'Graphyte brings multiple OSINT workflows into one investigation environment. Its documented design includes a beginner-friendly search surface, an advanced graph workspace, modular collectors and structured outputs for follow-up analysis.',
    approach: [
      'A single investigation entry point accepts common target types such as IP addresses, domains, email addresses, usernames and URLs.',
      'A playbook layer routes a target to relevant modules based on the target type and requested investigation depth.',
      'Results use a normalized envelope so summaries, artifacts, tables, raw output and errors can be displayed consistently.'
    ],
    engineeringNotes: [
      'The repository documents 26 modular OSINT tools, including DNS, WHOIS, certificate transparency, HTTP security, username discovery and IP intelligence.',
      'Advanced investigations can be explored through a graph workspace and a live task surface.',
      'Successful module output can be represented as STIX 2.1 bundles for graph exploration with Neo4j.',
      'The platform is designed around public information and responsible investigation workflows.'
    ],
    stack: ['Python', 'FastAPI', 'Next.js', 'Celery', 'Redis', 'STIX 2.1', 'Neo4j', 'Docker'],
    github: 'https://github.com/Atharv3142M/Graphyte-OSINT',
    featured: true,
    note: 'Independently developed with AI-assisted tooling. API-key integrations are optional for selected modules.'
  },
  {
    id: 'poseye',
    name: 'posEye',
    category: 'Spatial Computing',
    language: 'Python',
    status: 'Active development',
    description: 'A Windows desktop application that turns drone video and GPS telemetry into georeferenced 3D reconstructions.',
    overview: 'posEye is built around a local photogrammetry workflow. It accepts drone video and companion telemetry, prepares geotagged images, runs a reconstruction pipeline and presents the resulting model in an interactive viewer.',
    approach: [
      'Probe the source video and extract frames at a configurable interval.',
      'Filter blurred and near-duplicate frames before reconstruction.',
      'Parse drone telemetry and attach location and altitude metadata to the selected images.',
      'Send the prepared image set to a local OpenDroneMap service, then convert and preview the generated model.'
    ],
    engineeringNotes: [
      'The repository documents an 11-stage processing lifecycle from input validation through model-ready output.',
      'The pipeline uses FFmpeg for video processing, OpenCV for image analysis and OpenDroneMap for photogrammetry.',
      'The desktop client is designed for Windows 10 and Windows 11. Local processing keeps source footage and location metadata on the workstation.',
      'The current repository contains a pre-release build, so it is presented as active development rather than a finished commercial product.'
    ],
    stack: ['Python', 'FFmpeg', 'OpenCV', 'OpenDroneMap', 'OpenSfM', 'OpenMVS', 'Three.js', 'Trimesh'],
    github: 'https://github.com/Atharv3142M/posEye',
    live: 'https://atharv3142m.github.io/posEye/',
    featured: true,
    note: 'The repository describes a local photogrammetry pipeline. Reconstruction quality still depends on source footage, telemetry and capture conditions.'
  },
  {
    id: 'poai',
    name: 'POAi v2.0',
    category: 'AI & Data',
    language: 'Python',
    status: 'Prototype',
    description: 'A local-first meeting recorder with transcription and AI-assisted meeting analysis.',
    overview: 'POAi is a meeting intelligence project focused on keeping recordings, transcripts and summaries close to the user. A browser extension captures meeting media while a local Python backend handles repair, transcription, analysis and library management.',
    approach: [
      'Capture screen video, microphone audio and system audio from the browser recording flow.',
      'Repair and prepare the recording before transcription.',
      'Use Whisper for speech-to-text and a local Ollama model for summaries and extracted action items.',
      'Store processed meeting records in a local MongoDB instance and expose them through a dashboard.'
    ],
    engineeringNotes: [
      'The README documents a Chrome extension and a Python backend as the two main components.',
      'The local workflow uses FFmpeg, Whisper and Ollama. An NVIDIA GPU is recommended for faster transcription, not required by the concept.',
      'The project is designed around local processing. It should be evaluated on the target machine before making performance claims.'
    ],
    stack: ['Python', 'Chrome Extension', 'Whisper', 'Ollama', 'Llama 3', 'MongoDB', 'FFmpeg'],
    github: 'https://github.com/Atharv3142M/POAi-v2.0',
    featured: true,
    note: 'The repository describes a local-first architecture. It is presented as a prototype, not as a hosted SaaS product.'
  },
  {
    id: 'ecosphere',
    name: 'EcoSphere',
    category: 'Web',
    language: 'TypeScript',
    status: 'Prototype',
    description: 'An ESG management platform prototype for environmental, social and governance workflows.',
    overview: 'EcoSphere organizes sustainability work into dashboards and operational modules. The documented interface covers environmental tracking, social programmes, governance tasks, department views and employee participation.',
    approach: [
      'Bring ESG indicators and department progress into a unified dashboard.',
      'Separate environmental, social and governance workflows into focused application areas.',
      'Use roles such as employee, department head, ESG manager and administrator to shape the experience.',
      'Add missions, leagues and participation features to make sustainability work visible across teams.'
    ],
    engineeringNotes: [
      'The README documents a Next.js App Router application using React, Tailwind CSS and Recharts.',
      'The current repository describes demonstration data and client-side session flows. It is not represented here as a production-secured enterprise deployment.',
      'The project includes documentation for architecture, data models, APIs and deployment.'
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Vercel'],
    github: 'https://github.com/Atharv3142M/Eco-Sphere',
    live: 'https://eco-sphere-woad.vercel.app/',
    featured: true,
    note: 'The live site is a prototype. Demo data and demonstration authentication are not a substitute for production identity and data services.'
  },
  {
    id: 'capstone-mis',
    name: 'Capstone Project MIS',
    category: 'Web',
    language: 'TypeScript',
    status: 'Active development',
    description: 'A role-based management information system for organizing university capstone projects.',
    overview: 'The system is designed to organize the capstone lifecycle across students, faculty and administrators. It separates project tracking from the underlying API, database and operational documentation.',
    approach: [
      'Use a Next.js application for the user-facing workflow.',
      'Expose backend services through FastAPI and SQLAlchemy.',
      'Support local development with SQLite and production-like database workflows with PostgreSQL.',
      'Use role-aware guards and JWT access/refresh tokens for protected application areas.'
    ],
    engineeringNotes: [
      'The repository has separate frontend, backend and documentation areas.',
      'Database changes are managed through Alembic migrations.',
      'The README documents local setup, deployment notes, seed data and backend test commands.'
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'SQLAlchemy', 'Alembic', 'SQLite', 'PostgreSQL'],
    github: 'https://github.com/Atharv3142M/Capstone-Project-Management-Information-System',
    featured: true,
    note: 'This is an evolving university MIS project. The repository README describes the current implementation and local runbook.'
  },
  {
    id: 'croptellect',
    name: 'CropTellect',
    category: 'AI & Data',
    language: 'Python',
    status: 'Prototype',
    description: 'An image-based crop disease diagnosis application using a VGG19 model and a Flask interface.',
    overview: 'CropTellect explores how a trained image classifier can support early crop disease identification. The documented application accepts a crop-leaf image, prepares it for inference and returns a predicted class through a web interface.',
    approach: [
      'Accept a crop-leaf image through the browser interface.',
      'Resize and prepare the image for the model input shape.',
      'Run inference using a VGG19-based TensorFlow/Keras model.',
      'Present the predicted class in the application interface.'
    ],
    engineeringNotes: [
      'The repository README describes a Flask application and a TensorFlow Lite model artifact.',
      'The project includes a model-training notebook and a Kaggle dataset reference.',
      'The README describes multilingual interface support for farmers and agronomists.'
    ],
    stack: ['Python', 'Flask', 'TensorFlow', 'Keras', 'VGG19', 'Jupyter Notebook'],
    github: 'https://github.com/Atharv3142M/CropTellect',
    featured: true,
    note: 'A model prediction is an experimental aid, not a replacement for field diagnosis by an agricultural specialist.'
  },
  {
    id: 'mazgaon',
    name: 'Mazagon Dock MIS',
    category: 'Systems',
    language: 'JavaScript',
    status: 'Prototype',
    description: 'A static shipyard management information system prototype with role-based modules, audit trails and SAP-inspired data workflows.',
    overview: 'MDL Command is a browser-based shipyard MIS prototype. It brings together financial, project, supply-chain, workforce, health-and-safety, compliance and audit workflows in a single static interface.',
    approach: [
      'Use a role-selection entry point and client-side role-based module visibility to demonstrate six user profiles.',
      'Separate Finance, Project and Spatial MIS, Supply Chain and ROMIS, Human Capital and HSE, Compliance and Audit into focused modules.',
      'Model SAP-style BAPI and RFC operations with a localStorage data layer so records can be created and reviewed in a repeatable browser walkthrough.'
    ],
    engineeringNotes: [
      'The repository describes a three-file static application with no npm dependency, build step, backend or database server.',
      'The role-selection flow, mock JWT session and audit history are client-side demonstrations. They are not a production security boundary.',
      'Chart.js and Grid.js support visual summaries and sortable data grids. All demonstration records are stored in browser localStorage.',
      'The project has a published GitHub Pages demo.'
    ],
    stack: ['JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'localStorage', 'Chart.js', 'Grid.js'],
    github: 'https://github.com/Atharv3142M/Mazgaon-Dock-MIS',
    live: 'https://atharv3142m.github.io/Mazgaon-Dock-MIS/',
    featured: true,
    note: 'The figures and records in the prototype are illustrative. The app is not connected to MDL infrastructure and does not represent an official company system.'
  },
  {
    id: 'finance-optimizer',
    name: 'ML Personal Finance Optimizer',
    category: 'AI & Data',
    language: 'Dart',
    status: 'Prototype',
    description: 'A hackathon project concept for bill capture, transaction organization and machine-learning-assisted spending insights.',
    overview: 'The project explores a mobile-first personal finance workflow. Its README describes transaction tracking, bill image extraction, spending analysis and predictions intended to help users understand their spending patterns.',
    approach: [
      'Capture bill images and extract transaction details.',
      'Organize transaction records into searchable categories.',
      'Use analysis and prediction features to surface spending patterns.',
      'Provide account access through Firebase authentication.'
    ],
    engineeringNotes: [
      'The repository README documents a Flutter frontend, Node.js backend, Python machine-learning services, MongoDB and Firebase authentication.',
      'The project is a hackathon prototype. The README describes intended capabilities, not independently measured prediction accuracy.'
    ],
    stack: ['Flutter', 'Dart', 'Node.js', 'Python', 'MongoDB', 'Firebase'],
    github: 'https://github.com/Atharv3142M/RTMSSU-HACKATHON',
    live: 'https://atharv3142m.github.io/RTMSSU-HACKATHON/',
    featured: true,
    note: 'The repository is documented as a hackathon prototype. No prediction accuracy or production financial integration is claimed.'
  },
  {
    id: 'chess-trainer',
    name: 'Free Chess Trainer',
    category: 'Games',
    language: 'Python',
    status: 'Research build',
    description: 'An offline chess training simulator with focused drills for board vision and piece movement.',
    overview: 'The trainer isolates chess fundamentals into short practice modes. The README documents nine training modes, a board that can be rotated and edited, and keyboard and mouse interaction.',
    approach: [
      'Separate board-coordinate recognition, square-colour recognition and piece movement into dedicated drills.',
      'Add line and geometry exercises for rook, bishop and queen movement.',
      'Provide starting-position, board-control, mental calculation and free-edit modes.',
      'Keep the trainer usable offline without an account.'
    ],
    engineeringNotes: [
      'The repository documents a single Python file as the entry point.',
      'The nine modes cover COORDS, COLOR, DIAGONALS, STARTING, GEOMETRY, CONTROL, MENTAL, Move Learning and FREE.',
      'The interface includes hints, answer demonstrations and a Russian/English language toggle.'
    ],
    stack: ['Python', 'Chess logic', 'Desktop UI'],
    github: 'https://github.com/Atharv3142M/Free-Chess-Trainer',
    featured: true,
    note: 'This is a personal learning tool. It is included because it has a clearly documented training workflow, not because it is a large commercial application.'
  }
];

export const skillGroups = [
  {
    name: 'Programming',
    intro: 'Languages used across applications, automation and experiments.',
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Dart', 'HTML', 'CSS', 'Bash', 'PowerShell']
  },
  {
    name: 'Web and application development',
    intro: 'Frontend, backend and user-facing application work.',
    items: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Flask', 'FastAPI', 'Flutter', 'Vite']
  },
  {
    name: 'AI, data and vision',
    intro: 'Applied model workflows and computer vision tools.',
    items: ['TensorFlow', 'Keras', 'OpenCV', 'Whisper', 'Ollama', 'NumPy', 'Pandas', 'Jupyter', 'Recharts']
  },
  {
    name: 'Databases and infrastructure',
    intro: 'Data storage, deployment and development infrastructure.',
    items: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Redis', 'Docker', 'Git', 'GitHub Actions', 'Firebase', 'AWS']
  },
  {
    name: 'Cybersecurity and OSINT',
    intro: 'Research interests and tools explored through independent projects.',
    items: ['Open-source intelligence', 'DNS and domain research', 'HTTP security headers', 'Certificate transparency', 'Privacy-aware workflows', 'STIX 2.1']
  },
  {
    name: 'Systems and hardware',
    intro: 'Practical environments, server setup and embedded exploration.',
    items: ['Linux', 'Windows administration', 'Minecraft server hosting', 'Minecraft modding', 'ESP32', 'Arduino', 'Raspberry Pi', 'Firmware research']
  },
  {
    name: 'Creative tools',
    intro: 'Editing, media preparation and 3D tools used in personal work.',
    items: ['Adobe Premiere Pro', 'After Effects', 'Photoshop', 'Lightroom', 'Blender', 'FFmpeg', 'Canva']
  }
];

export const certificates = [
  { name: 'Microsoft Security Essentials: Concepts, Solutions, and AI-Powered Protection', issuer: 'Certificate listed on LinkedIn', category: 'Security' },
  { name: 'The What and How of Esports Management', issuer: 'edX verified certificate', category: 'Gaming and management' },
  { name: 'Generative AI: From Prompts to Partnership', issuer: 'Certificate listed on LinkedIn', category: 'AI' },
  { name: 'Practical GitHub Actions', issuer: 'Certificate listed on LinkedIn', category: 'Developer tooling' },
  { name: 'CryptoGuard: Securing the Future of Game Development with Blockchain', issuer: 'edX verified certificate', category: 'Security and games' }
];

export const milestones = [
  { date: '2026', title: 'First place, RTMSSU Foundation Day Week Hackathon', detail: 'Award documented by a personal event photograph. No online verification page is available.' },
  { date: '2026', title: 'Bharatiya Antariksh Hackathon', detail: 'Participation.' },
  { date: '2026', title: 'AMD Slingshot Campus Ideathon', detail: 'Participation.' },
  { date: '2026', title: 'QuizOff', detail: 'Participation.' }
];

export const education = {
  institution: 'Ratan Tata Maharashtra State Skills University',
  programme: 'B.Tech in Information Technology',
  period: '2024 to 2028',
  location: 'Mumbai Metropolitan Region, India'
};

export const contact = {
  email: 'atharvpose41@gmail.com',
  github: 'https://github.com/Atharv3142M',
  linkedin: 'https://www.linkedin.com/in/atharv-pose',
  holopin: 'https://holopin.io/@atharv3142m'
};

export const wallpaperLibrary = [
  { id: 'railway', name: 'Railway Crossing', file: '/wallpapers/railway-crossing.webp', description: 'Default wallpaper. Green trackside light and a quiet crossing.' },
  { id: 'amber', name: 'Amber Evening', file: '/wallpapers/amber-evening.webp', description: 'Warm illustrated evening scene.' },
  { id: 'japan', name: 'Japan in Autumn', file: '/wallpapers/japan-autumn.webp', description: 'Red maple leaves, a lakeside pagoda and Mount Fuji.' },
  { id: 'ghost', name: 'Ghost Unit', file: '/wallpapers/ghost-unit.webp', description: 'A dark tactical game-inspired scene.' },
  { id: 'last-light', name: 'Last Light', file: '/wallpapers/last-light.webp', description: 'A red dusk landscape.' }
] as const;

export type WallpaperId = typeof wallpaperLibrary[number]['id'];
