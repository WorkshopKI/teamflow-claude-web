'use client';

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-muted-foreground mb-8">
          Organize your work into projects and manage them effectively.
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold mb-2">Projects Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Project management features are currently under development. Soon you&apos;ll be able
              to:
            </p>
            <ul className="text-left text-muted-foreground space-y-2 mb-6">
              <li>• Create and manage multiple projects</li>
              <li>• Organize tasks by project</li>
              <li>• Set project goals and milestones</li>
              <li>• Track project progress</li>
              <li>• Assign team members to projects</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              For now, all tasks are in the default project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
