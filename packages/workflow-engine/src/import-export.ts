import { nanoid } from 'nanoid';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowId,
} from '@teamflow/types';

/**
 * Export format for workflows
 * Includes all workflow data plus metadata
 */
export interface WorkflowExport {
  version: string;
  exportedAt: Date;
  workflow: {
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables?: Record<string, any>;
    settings?: {
      timeout?: number;
      retryOnError?: boolean;
      maxRetries?: number;
      notifyOnComplete?: boolean;
      notifyOnError?: boolean;
    };
  };
}

/**
 * Import options
 */
export interface ImportOptions {
  /** If true, regenerate all IDs (nodes, edges, workflow) */
  regenerateIds?: boolean;
  /** If true, validate the workflow structure before importing */
  validate?: boolean;
  /** Override workflow name on import */
  nameOverride?: string;
  /** Override workflow description on import */
  descriptionOverride?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * WorkflowImportExport class
 * Handles exporting workflows to JSON and importing them back
 */
export class WorkflowImportExport {
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Export a workflow to JSON format
   */
  static exportWorkflow(workflow: Workflow): WorkflowExport {
    return {
      version: this.CURRENT_VERSION,
      exportedAt: new Date(),
      workflow: {
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        nodes: workflow.nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: { ...node.position },
          data: { ...node.data },
          inputs: node.inputs ? [...node.inputs] : [],
          outputs: node.outputs ? [...node.outputs] : [],
        })),
        edges: workflow.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourcePort: edge.sourcePort,
          targetPort: edge.targetPort,
        })),
        variables: workflow.variables ? { ...workflow.variables } : undefined,
        settings: workflow.settings ? { ...workflow.settings } : undefined,
      },
    };
  }

  /**
   * Export workflow to JSON string
   */
  static exportToJSON(workflow: Workflow, pretty = true): string {
    const exported = this.exportWorkflow(workflow);
    return JSON.stringify(exported, null, pretty ? 2 : 0);
  }

  /**
   * Export workflow and trigger download in browser
   */
  static downloadWorkflow(workflow: Workflow): void {
    const json = this.exportToJSON(workflow);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import a workflow from JSON export format
   */
  static importWorkflow(
    exported: WorkflowExport,
    creatorId: string,
    options: ImportOptions = {}
  ): Workflow {
    const {
      regenerateIds = true,
      validate = true,
      nameOverride,
      descriptionOverride,
    } = options;

    // Validate if requested
    if (validate) {
      const validation = this.validateExport(exported);
      if (!validation.valid) {
        throw new Error(`Invalid workflow export: ${validation.errors.join(', ')}`);
      }
    }

    // Create ID mapping for nodes
    const nodeIdMap = new Map<string, string>();
    const nodes: WorkflowNode[] = exported.workflow.nodes.map(node => {
      const newId = regenerateIds ? nanoid() : node.id;
      nodeIdMap.set(node.id, newId);

      return {
        id: newId,
        type: node.type,
        position: { ...node.position },
        data: { ...node.data },
        inputs: node.inputs ? [...node.inputs] : [],
        outputs: node.outputs ? [...node.outputs] : [],
      };
    });

    // Update edges with new node IDs
    const edges: WorkflowEdge[] = exported.workflow.edges.map(edge => ({
      id: regenerateIds ? nanoid() : edge.id,
      source: nodeIdMap.get(edge.source) || edge.source,
      target: nodeIdMap.get(edge.target) || edge.target,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
    }));

    // Create new workflow
    const workflow: Workflow = {
      id: nanoid() as WorkflowId,
      name: nameOverride || exported.workflow.name,
      description: descriptionOverride || exported.workflow.description,
      status: 'draft', // Always import as draft for safety
      nodes,
      edges,
      variables: exported.workflow.variables ? { ...exported.workflow.variables } : {},
      settings: exported.workflow.settings ? { ...exported.workflow.settings } : {},
      createdBy: creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      lastExecutedAt: undefined,
    };

    return workflow;
  }

  /**
   * Import workflow from JSON string
   */
  static importFromJSON(json: string, creatorId: string, options?: ImportOptions): Workflow {
    try {
      const exported = JSON.parse(json) as WorkflowExport;
      return this.importWorkflow(exported, creatorId, options);
    } catch (error) {
      throw new Error(`Failed to parse workflow JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a workflow export
   */
  static validateExport(exported: WorkflowExport): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check version
    if (!exported.version) {
      errors.push('Missing version field');
    }

    // Check workflow structure
    if (!exported.workflow) {
      errors.push('Missing workflow data');
      return { valid: false, errors, warnings };
    }

    const { workflow } = exported;

    // Validate required fields
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow nodes must be an array');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      errors.push('Workflow edges must be an array');
    }

    // Validate nodes
    const nodeIds = new Set<string>();
    workflow.nodes?.forEach((node, index) => {
      if (!node.id) {
        errors.push(`Node at index ${index} missing ID`);
      } else if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }

      if (!node.type) {
        errors.push(`Node ${node.id || index} missing type`);
      }

      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${node.id || index} has invalid position`);
      }

      if (!node.data) {
        warnings.push(`Node ${node.id || index} has no data`);
      }
    });

    // Validate edges
    const edgeIds = new Set<string>();
    workflow.edges?.forEach((edge, index) => {
      if (!edge.id) {
        errors.push(`Edge at index ${index} missing ID`);
      } else if (edgeIds.has(edge.id)) {
        errors.push(`Duplicate edge ID: ${edge.id}`);
      } else {
        edgeIds.add(edge.id);
      }

      if (!edge.source) {
        errors.push(`Edge ${edge.id || index} missing source`);
      } else if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edge.id || index} references non-existent source node: ${edge.source}`);
      }

      if (!edge.target) {
        errors.push(`Edge ${edge.id || index} missing target`);
      } else if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edge.id || index} references non-existent target node: ${edge.target}`);
      }
    });

    // Check for disconnected nodes (warning only)
    const connectedNodes = new Set<string>();
    workflow.edges?.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    workflow.nodes?.forEach(node => {
      if (node.type !== 'trigger' && !connectedNodes.has(node.id)) {
        warnings.push(`Node ${node.id} (${node.data?.label || 'Unlabeled'}) is not connected to any other nodes`);
      }
    });

    // Check for trigger node
    const hasTrigger = workflow.nodes?.some(node => node.type === 'trigger');
    if (!hasTrigger) {
      warnings.push('Workflow has no trigger node - it may not execute automatically');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Batch export multiple workflows
   */
  static exportMultiple(workflows: Workflow[]): string {
    const exports = workflows.map(w => this.exportWorkflow(w));
    return JSON.stringify({
      version: this.CURRENT_VERSION,
      exportedAt: new Date(),
      count: workflows.length,
      workflows: exports,
    }, null, 2);
  }

  /**
   * Batch import multiple workflows
   */
  static importMultiple(
    json: string,
    creatorId: string,
    options?: ImportOptions
  ): Workflow[] {
    try {
      const data = JSON.parse(json);

      if (!data.workflows || !Array.isArray(data.workflows)) {
        throw new Error('Invalid batch export format');
      }

      return data.workflows.map((exported: WorkflowExport) =>
        this.importWorkflow(exported, creatorId, options)
      );
    } catch (error) {
      throw new Error(`Failed to import workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a shareable workflow (removes creator info, execution history)
   */
  static createShareableExport(workflow: Workflow): WorkflowExport {
    const exported = this.exportWorkflow(workflow);

    // Remove any sensitive or user-specific data
    exported.workflow.nodes.forEach(node => {
      if (node.data) {
        // Remove specific user IDs or sensitive data
        delete node.data.createdBy;
        delete node.data.assignedTo;
      }
    });

    return exported;
  }
}

/**
 * Helper function to export workflow
 */
export function exportWorkflow(workflow: Workflow): WorkflowExport {
  return WorkflowImportExport.exportWorkflow(workflow);
}

/**
 * Helper function to export workflow to JSON
 */
export function exportWorkflowToJSON(workflow: Workflow, pretty = true): string {
  return WorkflowImportExport.exportToJSON(workflow, pretty);
}

/**
 * Helper function to download workflow
 */
export function downloadWorkflow(workflow: Workflow): void {
  WorkflowImportExport.downloadWorkflow(workflow);
}

/**
 * Helper function to import workflow from JSON
 */
export function importWorkflowFromJSON(
  json: string,
  creatorId: string,
  options?: ImportOptions
): Workflow {
  return WorkflowImportExport.importFromJSON(json, creatorId, options);
}

/**
 * Helper function to validate workflow export
 */
export function validateWorkflowExport(exported: WorkflowExport): ValidationResult {
  return WorkflowImportExport.validateExport(exported);
}
