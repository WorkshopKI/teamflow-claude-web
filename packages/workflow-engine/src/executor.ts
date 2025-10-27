/**
 * Workflow Execution Engine
 *
 * Executes workflow nodes in the correct order, manages state, and handles errors
 */

import type {
  Workflow,
  WorkflowNode,
  WorkflowExecution,
  ExecutionLog,
  NodeId,
} from '@teamflow/types';

// ============================================================================
// Execution Engine
// ============================================================================

export interface WorkflowExecutionOptions {
  workflow: Workflow;
  execution: WorkflowExecution;
  context?: {
    createTask?: (taskData: any) => any;
    executeAgent?: (agentData: any) => Promise<any>;
    webhook?: (url: string, options: any) => Promise<any>;
  };
}

export class WorkflowExecutor {
  private workflow: Workflow;
  private execution: WorkflowExecution;
  private context: WorkflowExecutionOptions['context'];

  constructor(options: WorkflowExecutionOptions) {
    this.workflow = options.workflow;
    this.execution = options.execution;
    this.context = options.context || {};
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<WorkflowExecution> {
    try {
      this.log('info', null, `Starting workflow execution: ${this.workflow.name}`);
      this.execution.status = 'running';

      // Find starting node (trigger node)
      const startNode = this.workflow.nodes.find(n => n.type === 'trigger');
      if (!startNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Execute from the start node
      await this.executeNode(startNode);

      // Mark as complete
      this.execution.status = 'success';
      this.execution.completedAt = new Date();
      this.execution.duration = Date.now() - new Date(this.execution.startedAt).getTime();

      this.log('info', null, 'Workflow execution completed successfully');

      return this.execution;
    } catch (error: any) {
      this.execution.status = 'failed';
      this.execution.completedAt = new Date();
      this.execution.duration = Date.now() - new Date(this.execution.startedAt).getTime();
      this.execution.error = {
        nodeId: this.execution.context.currentNodeId || ('' as NodeId),
        message: error.message,
        stack: error.stack,
        recoverable: false,
      };

      this.log('error', null, `Workflow execution failed: ${error.message}`, { error });

      return this.execution;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode): Promise<any> {
    try {
      this.execution.context.currentNodeId = node.id;
      this.log('info', node.id, `Executing node: ${node.data.label || node.type}`);

      let result: any;

      // Execute based on node type
      switch (node.type) {
        case 'trigger':
          result = await this.executeTriggerNode(node);
          break;
        case 'action':
          result = await this.executeActionNode(node);
          break;
        case 'condition':
          result = await this.executeConditionNode(node);
          break;
        case 'ai-agent':
          result = await this.executeAIAgentNode(node);
          break;
        case 'task':
          result = await this.executeTaskNode(node);
          break;
        case 'delay':
          result = await this.executeDelayNode(node);
          break;
        case 'webhook':
          result = await this.executeWebhookNode(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Store result
      this.execution.context.nodeResults[node.id] = result;
      this.log('info', node.id, 'Node executed successfully', { result });

      // Find and execute next nodes
      await this.executeNextNodes(node, result);

      return result;
    } catch (error: any) {
      this.log('error', node.id, `Node execution failed: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Execute next nodes based on edges
   */
  private async executeNextNodes(node: WorkflowNode, result: any): Promise<void> {
    // Find outgoing edges
    const edges = this.workflow.edges.filter(e => e.source === node.id);

    for (const edge of edges) {
      // Check if edge condition is met
      if (edge.condition) {
        const conditionMet = this.evaluateCondition(edge.condition, result);
        if (!conditionMet) {
          this.log('debug', node.id, `Edge condition not met: ${edge.condition}`);
          continue;
        }
      }

      // Find target node
      const targetNode = this.workflow.nodes.find(n => n.id === edge.target);
      if (!targetNode) {
        this.log('warn', node.id, `Target node not found: ${edge.target}`);
        continue;
      }

      // Execute target node
      await this.executeNode(targetNode);
    }
  }

  /**
   * Execute trigger node
   */
  private async executeTriggerNode(node: WorkflowNode): Promise<any> {
    return {
      triggered: true,
      timestamp: new Date(),
      triggerType: node.data.triggerType,
    };
  }

  /**
   * Execute action node
   */
  private async executeActionNode(node: WorkflowNode): Promise<any> {
    const { actionType } = node.data;

    return {
      success: true,
      actionType,
      executedAt: new Date(),
    };
  }

  /**
   * Execute condition node
   */
  private async executeConditionNode(node: WorkflowNode): Promise<any> {
    const { operator, leftValue, rightValue } = node.data;

    // Evaluate variables
    const left = this.resolveVariable(leftValue);
    const right = this.resolveVariable(rightValue);

    // Evaluate condition
    let result = false;
    switch (operator) {
      case 'equals':
        result = left === right;
        break;
      case 'not_equals':
        result = left !== right;
        break;
      case 'greater_than':
        result = left > right;
        break;
      case 'less_than':
        result = left < right;
        break;
      case 'contains':
        result = String(left).includes(String(right));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return {
      result,
      operator,
      leftValue: left,
      rightValue: right,
    };
  }

  /**
   * Execute AI agent node
   */
  private async executeAIAgentNode(node: WorkflowNode): Promise<any> {
    const { agentId, instruction, outputVariable } = node.data;

    if (!agentId) {
      throw new Error('AI agent node requires agentId');
    }

    if (!this.context?.executeAgent) {
      this.log('warn', node.id, 'No executeAgent callback provided, skipping');
      return { skipped: true };
    }

    // Execute agent via callback
    const agentResult = await this.context.executeAgent({
      agentId,
      instruction,
    });

    // Store result in variable if specified
    if (outputVariable) {
      this.execution.context.variables[outputVariable] = agentResult;
    }

    return agentResult;
  }

  /**
   * Execute task creation node
   */
  private async executeTaskNode(node: WorkflowNode): Promise<any> {
    const { taskTitle, taskDescription, priority, assigneeId, projectId } = node.data;

    if (!taskTitle) {
      throw new Error('Task node requires taskTitle');
    }

    if (!this.context?.createTask) {
      this.log('warn', node.id, 'No createTask callback provided, skipping');
      return { skipped: true };
    }

    // Create task via callback
    const task = await this.context.createTask({
      title: this.resolveVariable(taskTitle),
      description: this.resolveVariable(taskDescription) || '',
      priority: priority || 'medium',
      assignee: assigneeId || null,
      project: projectId || 'default',
    });

    return {
      taskId: task?.id,
      task,
    };
  }

  /**
   * Execute delay node
   */
  private async executeDelayNode(node: WorkflowNode): Promise<any> {
    const { duration, unit } = node.data;

    let ms = duration;
    if (unit === 'seconds') ms = duration * 1000;
    if (unit === 'minutes') ms = duration * 60 * 1000;
    if (unit === 'hours') ms = duration * 60 * 60 * 1000;

    await new Promise(resolve => setTimeout(resolve, ms));

    return {
      delayed: ms,
      unit,
    };
  }

  /**
   * Execute webhook node
   */
  private async executeWebhookNode(node: WorkflowNode): Promise<any> {
    const { url, method, headers, body } = node.data;

    if (!url) {
      throw new Error('Webhook node requires url');
    }

    if (this.context?.webhook) {
      return await this.context.webhook(url, {
        method: method || 'POST',
        headers: headers || {},
        body: this.resolveVariables(body),
      });
    }

    // Default fetch implementation
    const response = await fetch(url, {
      method: method || 'POST',
      headers: headers || {},
      body: body ? JSON.stringify(this.resolveVariables(body)) : undefined,
    });

    const data = await response.json();

    return {
      status: response.status,
      statusText: response.statusText,
      data,
    };
  }

  /**
   * Evaluate a condition string
   */
  private evaluateCondition(condition: string, result: any): boolean {
    // Simple condition evaluation
    // Format: "result.success === true"
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('result', `return ${condition}`);
      return fn(result);
    } catch (error) {
      this.log('warn', null, `Failed to evaluate condition: ${condition}`);
      return false;
    }
  }

  /**
   * Resolve a variable reference
   */
  private resolveVariable(value: any): any {
    if (typeof value !== 'string') return value;

    // Check if it's a variable reference: ${variableName}
    const match = value.match(/^\$\{(.+)\}$/);
    if (match) {
      const varName = match[1];
      return this.execution.context.variables[varName] || value;
    }

    return value;
  }

  /**
   * Resolve all variable references in an object
   */
  private resolveVariables(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.resolveVariable(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveVariables(item));
    }

    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = this.resolveVariables(value);
    }
    return resolved;
  }

  /**
   * Add a log entry
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', nodeId: NodeId | null, message: string, data?: any): void {
    const logEntry: ExecutionLog = {
      timestamp: new Date(),
      level,
      nodeId,
      message,
      data,
    };

    this.execution.logs.push(logEntry);
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

export async function executeWorkflow(options: WorkflowExecutionOptions): Promise<WorkflowExecution> {
  const executor = new WorkflowExecutor(options);
  return executor.execute();
}
