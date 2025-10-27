# TeamFlow AI

> **Local-first collaborative platform where humans and AI agents work together**

TeamFlow AI empowers teams with a privacy-first, open-source platform that combines task management, visual workflow automation, and AI agent collaboration. Work offline, own your data, and be productive in under 5 minutes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## ✨ Key Features

### 🔒 Local-First Architecture
- **Complete Offline Capability**: All data stored locally with IndexedDB
- **CRDT Synchronization**: Conflict-free peer-to-peer data sync using Yjs
- **End-to-End Encryption**: Signal Protocol ensures data sovereignty
- **No Server Required**: Optional signaling server for remote collaboration only

### 🤖 AI-Native Collaboration
- **AI Agents as Team Members**: Create custom AI personas with specific roles and skills
- **Multi-Agent Orchestration**: Agents collaborate to solve complex tasks
- **LLM Flexibility**: Support for OpenAI, Anthropic, and local models (Ollama)
- **Tool Sandboxing**: Fine-grained permissions control what agents can access

### ⚡ Visual Workflow Automation
- **No-Code Builder**: Drag-and-drop interface inspired by Node-RED and n8n
- **Portable Workflows**: Export/import as JSON, version control with Git
- **Hybrid Execution**: Combine deterministic logic with AI decision-making
- **Proactive Assistant**: AI suggests automations based on repetitive patterns

### 🚀 Zero-Configuration Onboarding
- **5-Minute Setup**: Productive immediately, no configuration required
- **Team Templates**: Pre-built workflows for Agile, Marketing, and Research teams
- **Interactive Tutorials**: Learn by doing with guided onboarding tasks
- **Sensible Defaults**: Everything just works out of the box

## 📦 Project Structure

```
teamflow-claude-web/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── mobile/                 # React Native app (coming soon)
│   └── extension/              # Browser extension (coming soon)
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── core/                   # Core business logic
│   ├── database/               # Local-first database with CRDTs
│   ├── workflow-engine/        # Visual workflow automation
│   ├── ai-agents/              # AI agent framework
│   ├── p2p/                    # P2P networking
│   └── ui/                     # Shared UI components
│
├── templates/                  # Team templates
│   ├── agile-development/
│   ├── marketing-campaign/
│   └── academic-research/
│
└── docs/                       # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/WorkshopKI/teamflow-claude-web.git
cd teamflow-claude-web

# Install dependencies
npm install

# Build all packages
npm run build

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Commands

```bash
# Start development server
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## 🏗️ Architecture Overview

TeamFlow AI is built on modern web technologies with a focus on local-first principles:

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand (lightweight, local-first friendly)
- **Database**: IndexedDB via Dexie.js
- **Synchronization**: Yjs (CRDTs) + y-webrtc (P2P)
- **Workflow Editor**: React Flow
- **AI Integration**: LangChain/LangGraph (planned)

### Core Principles

1. **Local-First**: Data lives on your device, syncs peer-to-peer
2. **Privacy-First**: End-to-end encryption, no data harvesting
3. **Offline-First**: Full functionality without internet
4. **Zero-Config**: No setup, no servers, just start working
5. **Extensible**: Plugin architecture for community contributions

## 📖 Core Concepts

### Tasks & Projects
Organize work with flexible task management. Assign tasks to humans or AI agents, set priorities, track dependencies, and collaborate in real-time.

### Personas
Every team member—human or AI—has a persona defining their role, skills, and capabilities. Create custom AI agents tailored to your workflow.

### Workflows
Automate repetitive processes with visual workflows. Trigger actions based on events, schedules, or manual invocation. Delegate complex steps to AI agents.

### Teams
Invite collaborators with a simple link or QR code. Peer-to-peer sync ensures everyone stays updated without a central server.

## 🎯 Use Cases

### Software Development Teams
- Automated code review workflows
- Sprint planning and stand-up summaries
- CI/CD integration and deployment automation
- Bug triage with AI assistance

### Marketing Teams
- Content creation pipelines
- Social media scheduling
- Lead nurturing sequences
- Campaign analytics automation

### Research Teams
- Automated literature reviews
- Data collection and analysis
- Experiment tracking
- Collaborative writing

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup and monorepo structure
- [x] Core data models and types
- [x] Next.js web application
- [x] TypeScript configuration
- [ ] Local database with IndexedDB
- [ ] Basic task management UI

### Phase 2: Workflow Engine
- [ ] Visual workflow builder
- [ ] Core workflow nodes (triggers, actions, logic)
- [ ] Workflow execution runtime
- [ ] JSON import/export

### Phase 3: AI Integration
- [ ] Persona system
- [ ] AI agent framework
- [ ] LLM provider integration (OpenAI, Anthropic, Ollama)
- [ ] Agent tools and permissions

### Phase 4: P2P & Sync
- [ ] CRDT implementation with Yjs
- [ ] WebRTC peer connections
- [ ] Signal Protocol encryption
- [ ] Team invitation flow

### Phase 5: Templates & Onboarding
- [ ] Template system
- [ ] Default templates (Agile, Marketing, Research)
- [ ] Zero-config onboarding
- [ ] Interactive tutorial

### Phase 6: Extensions
- [ ] Plugin system
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Community marketplace

## 🤝 Contributing

We welcome contributions from the community! TeamFlow AI is built on the principle that great collaboration tools should be owned by their users, not vendors.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Write TypeScript with strict type checking
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### Community Standards

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Celebrate diverse perspectives

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

TeamFlow AI is inspired by and builds upon the work of many amazing open-source projects:

- **Node-RED & n8n**: Visual workflow automation
- **CrewAI & AutoGen**: Multi-agent AI collaboration
- **Local-First Software**: Principles and patterns
- **Yjs**: CRDT implementation
- **Next.js & React**: Modern web development

## 📞 Contact & Support

- **Documentation**: [docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/WorkshopKI/teamflow-claude-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/WorkshopKI/teamflow-claude-web/discussions)

## 🌟 Star History

If you find TeamFlow AI useful, please consider giving it a star on GitHub! Your support helps the project grow.

---

**Built with ❤️ by the TeamFlow AI community**

*Empowering teams to work smarter, not harder*
