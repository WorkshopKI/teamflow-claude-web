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
- **No Server Required**: Full functionality without backend infrastructure
- **Data Sovereignty**: Your data never leaves your device unless you choose to sync

### 🤖 AI-Native Collaboration
- **AI Agents as Team Members**: Create custom AI personas with specific roles and skills
- **Multi-LLM Support**: OpenAI, Anthropic Claude, and local models (Ollama)
- **Agent Tools**: 7 built-in tools for task manipulation, comments, and status updates
- **Autonomous Execution**: Agents can work independently with configurable constraints
- **Workflow Integration**: Deploy AI agents as workflow nodes for automated decision-making

### ⚡ Visual Workflow Automation
- **Drag-and-Drop Builder**: Intuitive visual interface for workflow creation
- **7 Node Types**: Triggers, Actions, Conditions, AI Agents, Tasks, Delays, Webhooks
- **Real-Time Execution**: Run workflows and view logs in real-time
- **Variable System**: Pass data between nodes with `${variableName}` syntax
- **Conditional Branching**: Dynamic workflow paths based on conditions
- **External Integration**: Webhook nodes for API calls and external services

### 📋 Project Management
- **Hierarchical Organization**: Group tasks into projects with custom statuses
- **Real-Time Statistics**: Track completion rates, task distribution, and progress
- **Project Detail Pages**: Comprehensive views with task boards and analytics
- **Dynamic Task Linking**: Connect tasks to projects seamlessly
- **Activity Tracking**: Complete audit trail of all project and task changes

### 🚀 Zero-Configuration Onboarding
- **5-Minute Setup**: Productive immediately, no configuration required
- **Default Data Seeding**: General project and default personas auto-created
- **Intuitive UI**: Clean, modern interface built with TailwindCSS
- **Keyboard Shortcuts**: Power user features for rapid task management
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## 📦 Project Structure

```
teamflow-claude-web/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # Next.js App Router pages
│       │   ├── tasks/          # Task management interface
│       │   ├── projects/       # Project management & detail pages
│       │   ├── workflows/      # Visual workflow builder
│       │   ├── team/           # Persona/agent management
│       │   └── settings/       # API key configuration
│       └── src/
│           ├── components/     # React components
│           │   ├── tasks/      # Task-related components
│           │   ├── projects/   # Project components
│           │   └── workflow/   # Workflow builder components
│           ├── hooks/          # Custom React hooks
│           ├── lib/            # Utility functions
│           └── providers/      # React Context providers
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── core/                   # Core business logic & factories
│   ├── database/               # Local-first database with CRDTs (Yjs + IndexedDB)
│   ├── workflow-engine/        # Workflow execution engine
│   ├── ai-agents/              # AI agent framework (LLM clients, tools, executor)
│   ├── p2p/                    # P2P networking (planned)
│   └── ui/                     # Shared UI components (planned)
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

### First-Time Setup

1. **Visit the Application**: Navigate to `http://localhost:3000`
2. **Explore Default Content**: A "General" project and default personas are auto-created
3. **Create Your First Task**: Click "+ New Task" on the tasks page
4. **Configure AI Agents** (Optional):
   - Go to Settings (`/settings`)
   - Add API keys for OpenAI, Anthropic, or Ollama
   - Assign AI agents to tasks for autonomous execution
5. **Build a Workflow** (Optional):
   - Visit Workflows (`/workflows`)
   - Create a new workflow
   - Drag nodes onto the canvas
   - Connect them and configure properties
   - Click "Run Workflow" to execute

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

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.3
- **Styling**: TailwindCSS 3.4 with custom design system
- **State Management**: Custom CRDT-based hooks with Yjs
- **Database**: IndexedDB via Yjs (CRDT collections)
- **AI Integration**: Custom LLM clients for OpenAI, Anthropic, Ollama
- **Workflow Engine**: Custom visual builder with SVG-based node connections
- **Build System**: npm workspaces (monorepo)

### Core Principles

1. **Local-First**: Data lives on your device, syncs peer-to-peer
2. **Privacy-First**: No data collection, no tracking, no servers
3. **Offline-First**: Full functionality without internet
4. **Zero-Config**: No setup required, sensible defaults everywhere
5. **Extensible**: Modular architecture for easy customization

## 📖 Core Concepts

### Tasks
Individual units of work with:
- **Status**: Todo, In Progress, Done, Blocked, Cancelled
- **Priority**: Low, Medium, High, Urgent
- **Assignee**: Human team member or AI agent
- **Project**: Parent project for organization
- **Comments**: Threaded discussions
- **Activity Log**: Complete change history

### Projects
Collections of related tasks with:
- **Status**: Active, Completed, Archived
- **Statistics**: Real-time progress tracking
- **Task Board**: Kanban-style view filtered by project
- **Description**: Project goals and context

### Personas (Agents)
Team members (human or AI) with:
- **Role**: Developer, Designer, Project Manager, etc.
- **Skills**: Specialized capabilities
- **LLM Configuration**: Model, temperature, max tokens (for AI agents)
- **Tools**: Permissions for task manipulation
- **Memory**: Conversation history and context (optional)

### Workflows
Automated processes with:
- **Visual Canvas**: Drag-and-drop node editor
- **Node Types**:
  - ⚡ **Trigger**: Start workflows (manual, scheduled, event-based)
  - ⚙️ **Action**: Generic action nodes
  - ❓ **Condition**: Conditional branching
  - 🤖 **AI Agent**: Delegate to AI agents
  - 📋 **Task**: Create tasks dynamically
  - ⏱️ **Delay**: Time-based delays
  - 🔗 **Webhook**: External API calls
- **Execution Logs**: Detailed runtime information
- **Variables**: Pass data between nodes

## 🎯 Use Cases

### Software Development Teams
- **Automated Code Review**: AI agents review PRs and provide feedback
- **Sprint Planning**: Workflows create tasks from epics automatically
- **Bug Triage**: AI categorizes and prioritizes bug reports
- **CI/CD Integration**: Webhook nodes trigger deployments

### Marketing Teams
- **Content Creation Pipelines**: Multi-agent collaboration on blog posts
- **Social Media Scheduling**: Workflows post to multiple platforms
- **Lead Nurturing**: Automated email sequences with AI personalization
- **Campaign Analytics**: AI agents analyze performance and suggest optimizations

### Research Teams
- **Literature Review**: AI agents summarize papers and extract insights
- **Data Collection**: Workflows automate data gathering from APIs
- **Experiment Tracking**: Tasks track hypotheses, methods, and results
- **Collaborative Writing**: Comments and activity logs coordinate co-authors

### Personal Productivity
- **Daily Routines**: Workflows create recurring tasks automatically
- **Learning Plans**: AI agents curate learning resources
- **Habit Tracking**: Track and analyze personal goals
- **Home Automation**: Webhook nodes control smart home devices

## 🗺️ Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Project setup and monorepo structure
- [x] Core data models and types
- [x] Next.js web application
- [x] TypeScript configuration
- [x] Local database with IndexedDB
- [x] Basic task management UI
- [x] Drag-and-drop task boards
- [x] Comments and activity feeds
- [x] Filtering and keyboard shortcuts

### Phase 2: AI Integration ✅ COMPLETE
- [x] Persona system (human & AI)
- [x] AI agent framework
- [x] LLM provider integration (OpenAI, Anthropic, Ollama)
- [x] Agent tools (7 built-in tools)
- [x] Agent executor with context building
- [x] Settings page for API keys
- [x] Agent execution UI in task modals

### Phase 3: Project Management ✅ COMPLETE
- [x] Project CRUD operations
- [x] Project list with status filtering
- [x] Project detail pages
- [x] Real-time statistics calculation
- [x] Task-project linking
- [x] Project selector in task creation
- [x] Edit project modal
- [x] Activity tracking for projects

### Phase 4: Workflow Engine ✅ COMPLETE
- [x] Visual workflow builder
- [x] Core workflow nodes (7 types)
- [x] Workflow execution runtime
- [x] Node property editor
- [x] Real-time execution logs
- [x] Variable system
- [x] Conditional branching
- [x] AI agent workflow nodes
- [x] Webhook integration

### Phase 5: P2P & Sync (In Progress)
- [ ] CRDT implementation with Yjs (partial)
- [ ] WebRTC peer connections
- [ ] Signal Protocol encryption
- [ ] Team invitation flow
- [ ] Multi-device synchronization

### Phase 6: Templates & Onboarding
- [ ] Template system
- [ ] Default templates (Agile, Marketing, Research)
- [ ] Interactive tutorial
- [ ] Workflow marketplace

### Phase 7: Extensions
- [ ] Plugin system
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] CLI tool

## 🎨 Features in Detail

### Task Management
- **Kanban Board**: Drag-and-drop interface with status columns
- **Task Details**: Rich modal with tabs for details, comments, activity
- **Comments**: Threaded discussions with mentions (@username)
- **Activity Log**: Automatic tracking of all changes
- **Filtering**: By status, priority, assignee, and tags
- **Keyboard Shortcuts**: Rapid task creation and navigation

### Project Management
- **Project Cards**: Visual cards with progress bars
- **Statistics Dashboard**: Completion %, total tasks, status breakdown
- **Quick Actions**: Set active, mark complete, archive
- **Project Detail View**: Dedicated page with project-specific task board
- **Default Project**: "General" project auto-created for new users

### AI Agents
- **7 Built-in Tools**:
  1. `add_comment`: Add comments to tasks
  2. `update_status`: Change task status
  3. `update_priority`: Modify task priority
  4. `complete_task`: Mark tasks as done
  5. `request_clarification`: Ask for more information
  6. `assign_task`: Assign tasks to team members
  7. `add_tags`: Add tags to tasks
- **LLM Clients**: Unified interface for multiple providers
- **Context Building**: Automatic context from task, project, and team
- **Execution UI**: Visual feedback during agent execution

### Workflow Builder
- **Interactive Canvas**: Zoom, pan, drag nodes
- **Node Palette**: 7 node types organized by category
- **Property Panel**: Edit node configuration
- **Execution Engine**: Sequential node execution with error handling
- **Execution Logs**: Timestamped logs with severity levels
- **Status Management**: Draft → Active → Paused → Archived
- **Statistics**: Track node count, connections, and execution count

## 🛠️ API Reference

### Custom Hooks

#### `useTasks()`
```typescript
const {
  items,           // Task[]
  create,         // (task: Task) => Task
  update,         // (id: TaskId, updates: Partial<Task>) => Task
  remove,         // (id: TaskId) => void
  getByStatus,    // (status: TaskStatus) => Task[]
  getByProject,   // (projectId: ProjectId) => Task[]
  getByAssignee,  // (assigneeId: PersonaId) => Task[]
  getOverdue,     // () => Task[]
} = useTasks();
```

#### `useProjects()`
```typescript
const {
  projects,              // Project[]
  create,               // (input: CreateProjectInput) => Project
  update,               // (id: ProjectId, updates: Partial<Project>) => Project
  remove,               // (id: ProjectId) => void
  getProjectStats,      // (projectId: ProjectId, tasks: Task[]) => ProjectStats
  getActiveProjects,    // () => Project[]
} = useProjects();
```

#### `useWorkflows()`
```typescript
const {
  workflows,            // Workflow[]
  create,              // (input: CreateWorkflowInput) => Workflow
  update,              // (id: WorkflowId, updates: Partial<Workflow>) => Workflow
  remove,              // (id: WorkflowId) => void
  addNode,             // (workflowId, node: WorkflowNode) => void
  updateNode,          // (workflowId, nodeId, updates) => void
  removeNode,          // (workflowId, nodeId) => void
  addEdge,             // (workflowId, edge: WorkflowEdge) => void
  removeEdge,          // (workflowId, edgeId) => void
} = useWorkflows();
```

#### `useAgentExecution()`
```typescript
const {
  execute,            // (task: Task, agent: AIPersona) => Promise<Result>
  isExecuting,        // boolean
  executionError,     // string | null
} = useAgentExecution();
```

### Factory Functions

```typescript
// Create entities with sensible defaults
import {
  createTask,
  createProject,
  createHumanPersona,
  createAIPersona,
  createWorkflow,
  createWorkflowNode,
  createWorkflowEdge,
  createWorkflowExecution,
} from '@teamflow/core';
```

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
- Add tests for new features (coming soon)
- Update documentation as needed
- Keep commits atomic and well-described

### Community Standards

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Celebrate diverse perspectives

## 🐛 Known Issues & Limitations

### Current Limitations
- **No P2P Sync Yet**: Multi-device sync is not yet implemented
- **Single-User Mode**: Team collaboration features are planned but not active
- **Limited Mobile Support**: Best experienced on desktop browsers
- **No Persistence Layer**: Data is stored in IndexedDB (local-only)

### Planned Improvements
- WebRTC-based peer-to-peer synchronization
- Mobile-responsive workflow builder
- Undo/redo functionality
- Workflow templates and marketplace
- Plugin system for custom nodes
- Import/export workflows as JSON

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

TeamFlow AI is inspired by and builds upon the work of many amazing open-source projects:

- **Node-RED & n8n**: Visual workflow automation
- **CrewAI & AutoGen**: Multi-agent AI collaboration
- **Local-First Software**: Principles and patterns by Ink & Switch
- **Yjs**: Excellent CRDT implementation
- **Next.js & React**: Modern web development framework
- **TailwindCSS**: Utility-first CSS framework

## 📞 Contact & Support

- **Documentation**: [docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/WorkshopKI/teamflow-claude-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/WorkshopKI/teamflow-claude-web/discussions)

## 🌟 Star History

If you find TeamFlow AI useful, please consider giving it a star on GitHub! Your support helps the project grow.

---

**Built with ❤️ by the TeamFlow AI community**

*Empowering teams to work smarter, not harder*
