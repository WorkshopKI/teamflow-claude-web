/**
 * NodePalette Component
 *
 * Palette of available node types that can be added to the workflow
 */

'use client';

import { getNodeTypes, createWorkflowNode, type NodeType } from '@teamflow/core';
import type { WorkflowNode } from '@teamflow/types';

interface NodePaletteProps {
  onAddNode: (node: WorkflowNode) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const nodeTypes = getNodeTypes();

  /**
   * Handle node add
   */
  const handleAddNode = (type: NodeType) => {
    // Create node at a default position (user can drag it)
    const node = createWorkflowNode({
      type,
      position: { x: 100, y: 100 },
    });

    onAddNode(node);
  };

  // Group nodes by category
  const categories = Array.from(new Set(nodeTypes.map((nt) => nt.category)));

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold">Node Palette</h3>
      <p className="text-sm text-muted-foreground">Click to add nodes to the canvas</p>

      {categories.map((category) => {
        const categoryNodes = nodeTypes.filter((nt) => nt.category === category);

        return (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
            <div className="space-y-2">
              {categoryNodes.map((nodeType) => (
                <button
                  key={nodeType.type}
                  onClick={() => handleAddNode(nodeType.type)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">{nodeType.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{nodeType.label}</div>
                    <div className="text-xs text-muted-foreground truncate capitalize">
                      {nodeType.type.replace('-', ' ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
