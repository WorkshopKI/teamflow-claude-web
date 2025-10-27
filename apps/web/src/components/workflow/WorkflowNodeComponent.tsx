/**
 * WorkflowNodeComponent
 *
 * Renders an individual workflow node with drag support and connection ports
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import type { WorkflowNode, NodeId } from '@teamflow/types';
import { getNodeTypeByType } from '@teamflow/core';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onDragStart: (nodeId: NodeId) => void;
  onDrag: (nodeId: NodeId, deltaX: number, deltaY: number) => void;
  onDragEnd: () => void;
  onConnectionStart: (nodeId: NodeId, portId: string, event: React.MouseEvent) => void;
  onConnectionEnd: (nodeId: NodeId, portId: string) => void;
  onClick: (node: WorkflowNode) => void;
  readonly?: boolean;
}

export function WorkflowNodeComponent({
  node,
  selected,
  onDragStart,
  onDrag,
  onDragEnd,
  onConnectionStart,
  onConnectionEnd,
  onClick,
  readonly = false,
}: WorkflowNodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const nodeTypeInfo = getNodeTypeByType(node.type as any);

  /**
   * Handle mouse down for dragging
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readonly || e.button !== 0) return;

      e.stopPropagation();
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      onDragStart(node.id);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartPos.current) return;

        const deltaX = moveEvent.clientX - dragStartPos.current.x;
        const deltaY = moveEvent.clientY - dragStartPos.current.y;

        dragStartPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        onDrag(node.id, deltaX, deltaY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartPos.current = null;
        onDragEnd();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [node.id, readonly, onDragStart, onDrag, onDragEnd]
  );

  /**
   * Handle click
   */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(node);
    },
    [node, onClick]
  );

  /**
   * Handle connection port click
   */
  const handlePortMouseDown = useCallback(
    (portId: string, isOutput: boolean) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (readonly) return;

      if (isOutput) {
        onConnectionStart(node.id, portId, e);
      }
    },
    [node.id, readonly, onConnectionStart]
  );

  /**
   * Handle connection port mouse up
   */
  const handlePortMouseUp = useCallback(
    (portId: string, isInput: boolean) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (readonly) return;

      if (isInput) {
        onConnectionEnd(node.id, portId);
      }
    },
    [node.id, readonly, onConnectionEnd]
  );

  // Node colors based on type
  const nodeColors: Record<string, string> = {
    trigger: 'from-green-500 to-emerald-600',
    action: 'from-blue-500 to-indigo-600',
    condition: 'from-yellow-500 to-orange-600',
    'ai-agent': 'from-purple-500 to-pink-600',
    task: 'from-cyan-500 to-blue-600',
    delay: 'from-gray-500 to-slate-600',
    webhook: 'from-violet-500 to-purple-600',
  };

  const colorClass = nodeColors[node.type] || 'from-gray-500 to-slate-600';

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-move ${isDragging ? 'opacity-70' : ''} ${
        selected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: '200px',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Node Card */}
      <div className={`bg-gradient-to-br ${colorClass} rounded-lg shadow-lg p-3 text-white`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{nodeTypeInfo?.icon || '⚙️'}</span>
          <span className="text-sm font-semibold truncate">{node.data.label}</span>
        </div>

        {/* Description */}
        {node.data.description && (
          <p className="text-xs opacity-90 truncate mb-2">{node.data.description}</p>
        )}

        {/* Additional Info */}
        <div className="text-xs opacity-75">
          <div className="flex items-center justify-between">
            <span className="capitalize">{node.type.replace('-', ' ')}</span>
            {node.data.agentId && <span>🤖</span>}
          </div>
        </div>
      </div>

      {/* Input Ports */}
      {node.inputs && node.inputs.length > 0 && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
          {node.inputs.map((input, index) => (
            <div
              key={input.id}
              className="w-4 h-4 bg-white border-2 border-primary rounded-full cursor-pointer hover:scale-125 transition-transform"
              style={{ marginTop: index > 0 ? '8px' : 0 }}
              onMouseUp={handlePortMouseUp(input.id, true)}
              title={input.name}
            />
          ))}
        </div>
      )}

      {/* Output Ports */}
      {node.outputs && node.outputs.length > 0 && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
          {node.outputs.map((output, index) => (
            <div
              key={output.id}
              className="w-4 h-4 bg-white border-2 border-primary rounded-full cursor-pointer hover:scale-125 transition-transform"
              style={{ marginTop: index > 0 ? '8px' : 0 }}
              onMouseDown={handlePortMouseDown(output.id, true)}
              title={output.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
