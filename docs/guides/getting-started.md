# Getting Started with TeamFlow AI

Welcome to TeamFlow AI! This guide will help you get up and running in under 5 minutes.

## Table of Contents

- [Installation](#installation)
- [First Launch](#first-launch)
- [Creating Your First Task](#creating-your-first-task)
- [Inviting Team Members](#inviting-team-members)
- [Creating an AI Agent](#creating-an-ai-agent)
- [Building Your First Workflow](#building-your-first-workflow)
- [Next Steps](#next-steps)

## Installation

### Prerequisites

Ensure you have the following installed:
- Node.js >= 18.0.0
- npm >= 9.0.0

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/WorkshopKI/teamflow-claude-web.git
cd teamflow-claude-web

# Install dependencies
npm install

# Build all packages
npm run build

# Start the development server
npm run dev
```

The application will open at `http://localhost:3000`

## First Launch

When you first launch TeamFlow AI:

1. **Automatic Setup**: No configuration needed! A local workspace is created automatically
2. **Choose a Template**: Select from:
   - **Agile Development**: For software teams
   - **Marketing Campaign**: For marketing teams
   - **Academic Research**: For research teams
   - **Blank**: Start from scratch

3. **Create Your Persona**: Define your name, role, and avatar

That's it! You're ready to work.

## Creating Your First Task

1. Click the **"+ New Task"** button
2. Enter a title (e.g., "Review project requirements")
3. Optionally add:
   - Description
   - Priority (Low, Medium, High, Urgent)
   - Due date
   - Tags
4. Click **"Create"**

Your task is now saved locally on your device.

## Inviting Team Members

### Local Network (Same WiFi)

1. Click **"Team Settings"** in the sidebar
2. Click **"Generate Invite Link"**
3. Share the link or QR code with your teammate
4. They click the link and join instantly via peer-to-peer connection

### Remote (Different Networks)

1. Same as above, but uses a lightweight signaling server for initial handshake
2. All data syncs peer-to-peer with end-to-end encryption
3. No data is stored on the server

## Creating an AI Agent

AI agents are team members that can:
- Execute tasks autonomously
- Collaborate with other agents
- Use tools you authorize

### Creating an Agent

1. Go to **"Team"** → **"Personas"**
2. Click **"+ New AI Agent"**
3. Configure:
   - **Name**: e.g., "Code Reviewer"
   - **Role**: e.g., "Senior Software Engineer"
   - **Goals**: What should this agent accomplish?
   - **Tools**: What can it access? (files, APIs, etc.)
   - **LLM**: Choose provider and model

4. Click **"Create"**

### Assigning Tasks to Agents

Just like human team members:
1. Open a task
2. Click the **"Assignee"** dropdown
3. Select your AI agent
4. The agent will work on it automatically

## Building Your First Workflow

Workflows automate repetitive processes:

1. Go to **"Workflows"** in the sidebar
2. Click **"+ New Workflow"**
3. Name it (e.g., "New PR Review")
4. Add nodes by dragging from the sidebar:
   - **Trigger**: "New Pull Request"
   - **Action**: "Assign to Code Reviewer Agent"
   - **Condition**: "If approved, notify team"
5. Connect nodes by dragging between ports
6. Click **"Activate"**

Your workflow now runs automatically!

## Next Steps

### Learn More

- [Architecture Overview](../architecture)
- [Workflow Builder Guide](./workflows.md)
- [AI Agent Guide](./ai-agents.md)
- [Team Collaboration](./teams.md)

### Explore Templates

Check out pre-built workflows in your team template:
- Agile: Sprint planning, daily standups, code review
- Marketing: Content pipelines, social scheduling
- Research: Literature reviews, data analysis

### Customize

- Create custom AI agent personas
- Build workflow templates for your team
- Share with the community

### Get Help

- [Documentation](../README.md)
- [GitHub Issues](https://github.com/WorkshopKI/teamflow-claude-web/issues)
- [Community Discussions](https://github.com/WorkshopKI/teamflow-claude-web/discussions)

---

**Congratulations!** You're now up and running with TeamFlow AI. Happy collaborating!
