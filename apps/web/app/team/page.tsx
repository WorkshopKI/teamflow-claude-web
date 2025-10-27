'use client';

export default function TeamPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Team</h1>
        <p className="text-muted-foreground mb-8">
          Manage team members and AI agents working on your projects.
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-semibold mb-2">Team & AI Agents Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Team collaboration and AI persona features are currently under development.
              Soon you&apos;ll be able to:
            </p>
            <ul className="text-left text-muted-foreground space-y-2 mb-6">
              <li>• Invite team members with a link or QR code</li>
              <li>• Create custom AI agent personas</li>
              <li>• Assign tasks to humans or AI agents</li>
              <li>• Configure agent roles and permissions</li>
              <li>• Collaborate in real-time with P2P sync</li>
              <li>• View team member activity</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              This feature is planned for Phase 3B of development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
