'use client';

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Workflows</h1>
        <p className="text-muted-foreground mb-8">
          Automate repetitive processes with visual workflows.
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-semibold mb-2">Workflow Engine Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Visual workflow automation is currently under development. Soon you&apos;ll be able
              to:
            </p>
            <ul className="text-left text-muted-foreground space-y-2 mb-6">
              <li>• Build workflows with drag-and-drop editor</li>
              <li>• Automate task creation and updates</li>
              <li>• Trigger workflows based on events</li>
              <li>• Integrate with external services</li>
              <li>• Delegate tasks to AI agents</li>
              <li>• Export workflows as JSON</li>
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
