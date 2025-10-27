/**
 * WorkflowEdgeComponent
 *
 * Renders a connection line between workflow nodes
 */

'use client';

import { useState } from 'react';
import type { WorkflowEdge, Position } from '@teamflow/types';

interface WorkflowEdgeComponentProps {
  edge: WorkflowEdge;
  source: Position;
  target: Position;
  onDelete?: () => void;
  readonly?: boolean;
}

export function WorkflowEdgeComponent({
  edge,
  source,
  target,
  onDelete,
  readonly = false,
}: WorkflowEdgeComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate path (curved line)
  const dx = target.x - source.x;
  const curve = Math.abs(dx) / 2;

  const path = `M ${source.x} ${source.y} C ${source.x + curve} ${source.y}, ${target.x - curve} ${target.y}, ${target.x} ${target.y}`;

  return (
    <g
      className="pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible thick line for easier hover detection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />

      {/* Visible line */}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={isHovered ? 3 : 2}
        markerEnd="url(#arrowhead)"
        className={`transition-all ${
          isHovered ? 'text-primary' : 'text-border'
        }`}
      />

      {/* Label */}
      {edge.label && (
        <text
          x={(source.x + target.x) / 2}
          y={(source.y + target.y) / 2}
          fill="currentColor"
          className="text-xs text-muted-foreground pointer-events-none"
          textAnchor="middle"
        >
          {edge.label}
        </text>
      )}

      {/* Delete button on hover */}
      {isHovered && !readonly && onDelete && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer"
        >
          <circle
            cx={(source.x + target.x) / 2}
            cy={(source.y + target.y) / 2 - 10}
            r={10}
            fill="currentColor"
            className="text-destructive"
          />
          <text
            x={(source.x + target.x) / 2}
            y={(source.y + target.y) / 2 - 10}
            fill="white"
            fontSize={12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}
