/**
 * WorkflowCanvas Component
 *
 * Visual canvas for building and editing workflows with drag-and-drop nodes
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import type { Workflow, WorkflowNode, WorkflowEdge, NodeId, Position } from '@teamflow/types';
import { WorkflowNodeComponent } from './WorkflowNodeComponent';
import { WorkflowEdgeComponent } from './WorkflowEdgeComponent';

interface WorkflowCanvasProps {
  workflow: Workflow;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onNodeClick?: (node: WorkflowNode) => void;
  readonly?: boolean;
}

export function WorkflowCanvas({
  workflow,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  readonly = false,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<NodeId | null>(null);
  const [connecting, setConnecting] = useState<{
    sourceNode: NodeId;
    sourcePort: string;
    mousePos: Position;
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);

  /**
   * Handle node drag start
   */
  const handleNodeDragStart = useCallback((nodeId: NodeId) => {
    if (readonly) return;
    setDraggedNode(nodeId);
  }, [readonly]);

  /**
   * Handle node drag
   */
  const handleNodeDrag = useCallback(
    (nodeId: NodeId, deltaX: number, deltaY: number) => {
      if (readonly || !draggedNode) return;

      const nodeIndex = workflow.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return;

      const updatedNodes = [...workflow.nodes];
      const node = updatedNodes[nodeIndex];
      updatedNodes[nodeIndex] = {
        ...node,
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      };

      onNodesChange(updatedNodes);
    },
    [workflow.nodes, draggedNode, readonly, onNodesChange]
  );

  /**
   * Handle node drag end
   */
  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  /**
   * Handle connection start
   */
  const handleConnectionStart = useCallback(
    (nodeId: NodeId, portId: string, event: React.MouseEvent) => {
      if (readonly) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setConnecting({
        sourceNode: nodeId,
        sourcePort: portId,
        mousePos: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    },
    [readonly]
  );

  /**
   * Handle connection end
   */
  const handleConnectionEnd = useCallback(
    (targetNode: NodeId, targetPort: string) => {
      if (!connecting || readonly) return;

      // Create new edge
      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}`,
        source: connecting.sourceNode,
        target: targetNode,
        sourcePort: connecting.sourcePort,
        targetPort,
      };

      // Check if edge already exists
      const edgeExists = workflow.edges.some(
        (e) =>
          e.source === newEdge.source &&
          e.target === newEdge.target &&
          e.sourcePort === newEdge.sourcePort &&
          e.targetPort === newEdge.targetPort
      );

      if (!edgeExists) {
        onEdgesChange([...workflow.edges, newEdge]);
      }

      setConnecting(null);
    },
    [connecting, workflow.edges, readonly, onEdgesChange]
  );

  /**
   * Handle canvas mouse move (for connection dragging)
   */
  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!connecting) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setConnecting({
        ...connecting,
        mousePos: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    },
    [connecting]
  );

  /**
   * Handle canvas mouse up (cancel connection)
   */
  const handleCanvasMouseUp = useCallback(() => {
    if (connecting) {
      setConnecting(null);
    }
  }, [connecting]);

  /**
   * Handle node click
   */
  const handleNodeClickInternal = useCallback(
    (node: WorkflowNode) => {
      setSelectedNode(node.id);
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  /**
   * Handle edge delete
   */
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      if (readonly) return;
      onEdgesChange(workflow.edges.filter((e) => e.id !== edgeId));
    },
    [workflow.edges, readonly, onEdgesChange]
  );

  /**
   * Get node center position
   */
  const getNodeCenter = (nodeId: NodeId): Position | null => {
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    return {
      x: node.position.x + 100, // Assuming node width of 200px
      y: node.position.y + 50, // Assuming node height of 100px
    };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-secondary/20 overflow-hidden"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      style={{ minHeight: '600px' }}
    >
      {/* SVG Layer for edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" className="text-primary" />
          </marker>
        </defs>

        {/* Render edges */}
        {workflow.edges.map((edge) => {
          const source = getNodeCenter(edge.source);
          const target = getNodeCenter(edge.target);
          if (!source || !target) return null;

          return (
            <WorkflowEdgeComponent
              key={edge.id}
              edge={edge}
              source={source}
              target={target}
              onDelete={() => handleEdgeDelete(edge.id)}
              readonly={readonly}
            />
          );
        })}

        {/* Render connecting line */}
        {connecting && (() => {
          const source = getNodeCenter(connecting.sourceNode);
          if (!source) return null;

          return (
            <line
              x1={source.x}
              y1={source.y}
              x2={connecting.mousePos.x}
              y2={connecting.mousePos.y}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="5,5"
              className="text-primary opacity-50"
            />
          );
        })()}
      </svg>

      {/* Nodes Layer */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {workflow.nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            onDragStart={handleNodeDragStart}
            onDrag={handleNodeDrag}
            onDragEnd={handleNodeDragEnd}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onClick={handleNodeClickInternal}
            readonly={readonly}
          />
        ))}
      </div>

      {/* Empty state */}
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No nodes yet</p>
            <p className="text-sm">Drag nodes from the palette to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
