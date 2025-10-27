# TeamFlow AI - Technical Architecture

## Overview

TeamFlow AI is a local-first, open-source collaborative platform that combines task management, visual workflow automation, and AI agent collaboration. This document outlines the technical architecture and implementation strategy.

## Core Principles

1. **Local-First**: All data is stored locally first, synced peer-to-peer
2. **Zero-Configuration**: Users productive within 5 minutes, no setup required
3. **Privacy-First**: End-to-end encryption, data sovereignty
4. **Extensible**: Plugin architecture for community contributions
5. **AI-Native**: AI agents as first-class team members

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **UI Library**: React 18+
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand (lightweight, local-first friendly)
- **Visual Editor**: React Flow (for workflow builder)

### Data Layer
- **Local Storage**: IndexedDB via Dexie.js
- **CRDT Engine**: Yjs for conflict-free synchronization
- **Sync Protocol**: y-websocket + y-webrtc for P2P sync
- **Encryption**: libsignal-protocol-typescript (Signal Protocol)

### Workflow Engine
- **Architecture**: Node-based execution graph (inspired by Node-RED)
- **Definition Format**: Portable JSON
- **Execution**: Client-side JavaScript runtime
- **Nodes**: Extensible plugin system

### AI Integration
- **Orchestration**: LangChain/LangGraph
- **Agent Framework**: Custom implementation (CrewAI/AutoGen inspired)
- **LLM Support**: OpenAI, Anthropic, local models (Ollama)
- **Tool System**: Function calling with sandboxed permissions

### Networking
- **P2P Protocol**: WebRTC (simple-peer)
- **Discovery**: mDNS for local network, signaling server for remote
- **Relay**: Optional TURN server for NAT traversal

## Project Structure

```
teamflow-claude-web/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities and helpers
│   │   └── public/             # Static assets
│   ├── mobile/                 # React Native app (future)
│   └── extension/              # Browser extension (future)
│
├── packages/
│   ├── core/                   # Core business logic
│   │   ├── models/             # Data models (Task, Project, Team)
│   │   ├── services/           # Business logic services
│   │   └── utils/              # Shared utilities
│   │
│   ├── database/               # Local-first database layer
│   │   ├── crdt/               # CRDT synchronization
│   │   ├── storage/            # IndexedDB adapter
│   │   └── sync/               # P2P sync protocols
│   │
│   ├── workflow-engine/        # Workflow execution engine
│   │   ├── nodes/              # Built-in workflow nodes
│   │   ├── runtime/            # Execution runtime
│   │   ├── parser/             # JSON workflow parser
│   │   └── builder/            # Visual builder utilities
│   │
│   ├── ai-agents/              # AI agent framework
│   │   ├── personas/           # Agent persona system
│   │   ├── tools/              # Agent tool interfaces
│   │   ├── orchestration/      # Multi-agent orchestration
│   │   └── providers/          # LLM provider adapters
│   │
│   ├── p2p/                    # P2P networking
│   │   ├── discovery/          # Peer discovery
│   │   ├── webrtc/             # WebRTC implementation
│   │   └── encryption/         # Signal Protocol
│   │
│   ├── ui/                     # Shared UI components
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # React hooks
│   │   └── styles/             # Shared styles
│   │
│   └── types/                  # Shared TypeScript types
│       └── index.ts            # Type definitions
│
├── templates/                  # Team templates
│   ├── agile-development/      # Agile dev template
│   ├── marketing-campaign/     # Marketing template
│   └── academic-research/      # Research template
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── guides/                 # User guides
│   └── architecture/           # Architecture docs
│
└── tools/                      # Development tools
    ├── scripts/                # Build/deploy scripts
    └── generators/             # Code generators
```

## Core Data Models

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: PersonaId | null;
  project: ProjectId;
  tags: string[];
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: PersonaId;
  metadata: Record<string, any>;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: PersonaId;
  tags: string[];
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}
```

### Persona (Human or AI)
```typescript
interface Persona {
  id: string;
  type: 'human' | 'ai';
  name: string;
  role: string;
  avatar: string;
  skills: string[];

  // AI-specific fields
  goals?: string[];
  tools?: string[];
  llmConfig?: {
    provider: 'openai' | 'anthropic' | 'ollama';
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
  };

  // Human-specific fields
  email?: string;
  publicKey?: string;
}
```

### Team
```typescript
interface Team {
  id: string;
  name: string;
  template: string;
  members: PersonaId[];
  projects: ProjectId[];
  workflows: WorkflowId[];
  settings: TeamSettings;
  createdAt: Date;
  inviteCode?: string;
}
```

## Workflow Engine Architecture

### Node Types

1. **Trigger Nodes**
   - Schedule (cron)
   - Webhook
   - Manual
   - Event (task created, status changed, etc.)

2. **Action Nodes**
   - Create Task
   - Update Task
   - Send Notification
   - HTTP Request
   - Run Script (sandboxed)
   - Transform Data

3. **Logic Nodes**
   - Conditional
   - Loop
   - Switch
   - Merge

4. **AI Nodes**
   - Assign to Agent
   - Agent Team
   - LLM Call
   - Summarize
   - Generate

### Execution Model

1. **Trigger** activates the workflow
2. **Runtime** loads workflow definition (JSON)
3. **Parser** creates execution graph
4. **Executor** traverses nodes, executing each
5. **Context** maintains state between nodes
6. **Output** captures results and logs

## AI Agent Framework

### Agent Architecture

```typescript
class AIAgent {
  persona: Persona;
  tools: Tool[];
  memory: ConversationMemory;

  async execute(task: Task): Promise<Result> {
    // 1. Analyze task and goals
    // 2. Plan approach
    // 3. Execute using available tools
    // 4. Return result
  }

  async collaborate(agents: AIAgent[], goal: string): Promise<Result> {
    // Multi-agent collaboration
  }
}
```

### Tool System

Tools define what agents can do:

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: any) => Promise<any>;
}
```

## P2P Synchronization

### Connection Flow

1. **Team Creation**: Generate crypto identity (key pair)
2. **Invitation**: Create invite link with team ID
3. **Discovery**:
   - LAN: mDNS broadcast
   - Remote: Signaling server handshake
4. **Connection**: WebRTC peer connection
5. **Key Exchange**: Signal Protocol session
6. **Sync**: CRDT state synchronization

### CRDT Strategy

- **Yjs** for shared data structures
- **Y.Map** for documents and tasks
- **Y.Array** for lists and collections
- **Y.Text** for collaborative text editing

## Security Model

1. **Identity**: Ed25519 key pairs
2. **Encryption**: Signal Protocol (double ratchet)
3. **Authentication**: Public key verification
4. **Authorization**: Role-based access control
5. **Sandboxing**: Agent tool permissions

## Template System

### Template Structure

```typescript
interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  workflows: Workflow[];
  personas: Persona[];
  projects: Partial<Project>[];
  uiLayout: UIConfiguration;
}
```

### Default Templates

1. **Agile Development**
   - Pull Request Review workflow
   - Daily Stand-up workflow
   - Sprint Planning workflow
   - Code Reviewer, QA Tester, Scrum Master agents

2. **Marketing Campaign**
   - Blog Post Pipeline workflow
   - Lead Nurturing workflow
   - Social Media Scheduler workflow
   - Copywriter, Social Manager, Data Analyst agents

3. **Academic Research**
   - Literature Review workflow
   - Data Analysis Pipeline workflow
   - Experiment Manager, Research Assistant agents

## Development Roadmap

### Phase 1: Foundation (Current)
- [ ] Project setup and monorepo structure
- [ ] Core data models and types
- [ ] Local database with IndexedDB
- [ ] Basic task management UI
- [ ] Simple workflow engine (no visual editor yet)

### Phase 2: Workflow Engine
- [ ] Visual workflow builder (React Flow)
- [ ] Node library (triggers, actions, logic)
- [ ] Workflow execution runtime
- [ ] JSON import/export

### Phase 3: AI Integration
- [ ] Persona system
- [ ] AI agent framework
- [ ] LLM provider integration
- [ ] Agent tools and permissions

### Phase 4: P2P & Sync
- [ ] CRDT implementation with Yjs
- [ ] WebRTC peer connections
- [ ] Signal Protocol encryption
- [ ] Team invitation flow

### Phase 5: Templates & Onboarding
- [ ] Template system
- [ ] Default templates (3)
- [ ] Zero-config onboarding
- [ ] Interactive tutorial

### Phase 6: Extensions
- [ ] Plugin system
- [ ] Browser extension
- [ ] Mobile app (React Native)

## Performance Considerations

1. **Local-First**: Sub-50ms response time for UI interactions
2. **Lazy Loading**: Load workflows and large data on demand
3. **Web Workers**: Run workflow engine in background thread
4. **IndexedDB Optimization**: Indexed queries, pagination
5. **CRDT Efficiency**: Batched updates, delta synchronization

## Testing Strategy

1. **Unit Tests**: Vitest for core logic
2. **Integration Tests**: Workflow execution, CRDT sync
3. **E2E Tests**: Playwright for critical user flows
4. **P2P Tests**: Simulated multi-peer scenarios
5. **AI Tests**: Mock LLM responses for deterministic tests

## Deployment

### Web Application
- Static export or SSR via Vercel/Netlify
- Optional self-hosted (Docker)

### Signaling Server
- Lightweight Node.js server
- WebSocket support
- Optional (for remote collaboration)

### Documentation
- Hosted on GitHub Pages
- Auto-generated API docs

---

**Note**: This architecture is designed to evolve. We prioritize getting a working MVP quickly, then iterate based on user feedback and community contributions.
