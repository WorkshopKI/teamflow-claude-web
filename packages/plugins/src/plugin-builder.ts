import type {
  Plugin,
  CustomNodeDefinition,
  Tool,
  PluginHooks,
  PluginSettings,
  NodeExecutionContext,
  ToolParameter,
  ToolPermissions,
} from '@teamflow/types';

/**
 * Plugin Builder
 * Fluent API for creating plugins
 */
export class PluginBuilder {
  private plugin: Partial<Plugin>;

  constructor(id: string, name: string, version: string) {
    this.plugin = {
      id,
      name,
      version,
      enabled: false,
      nodes: [],
      tools: [],
    };
  }

  /**
   * Set plugin description
   */
  description(description: string): this {
    this.plugin.description = description;
    return this;
  }

  /**
   * Set plugin author
   */
  author(author: string): this {
    this.plugin.author = author;
    return this;
  }

  /**
   * Add a custom node
   */
  addNode(builder: (nodeBuilder: NodeBuilder) => void): this {
    const nodeBuilder = new NodeBuilder();
    builder(nodeBuilder);

    const node = nodeBuilder.build();
    if (!this.plugin.nodes) {
      this.plugin.nodes = [];
    }
    this.plugin.nodes.push(node);

    return this;
  }

  /**
   * Add a custom tool
   */
  addTool(builder: (toolBuilder: ToolBuilder) => void): this {
    const toolBuilder = new ToolBuilder();
    builder(toolBuilder);

    const tool = toolBuilder.build();
    if (!this.plugin.tools) {
      this.plugin.tools = [];
    }
    this.plugin.tools.push(tool);

    return this;
  }

  /**
   * Add plugin hooks
   */
  hooks(hooks: PluginHooks): this {
    this.plugin.hooks = hooks;
    return this;
  }

  /**
   * Add plugin settings
   */
  settings(settings: PluginSettings): this {
    this.plugin.settings = settings;
    return this;
  }

  /**
   * Build the plugin
   */
  build(): Plugin {
    if (!this.plugin.id || !this.plugin.name || !this.plugin.version) {
      throw new Error('Plugin must have id, name, and version');
    }

    return this.plugin as Plugin;
  }
}

/**
 * Node Builder
 * Fluent API for creating custom nodes
 */
export class NodeBuilder {
  private node: Partial<CustomNodeDefinition>;

  constructor() {
    this.node = {
      inputs: [],
      outputs: [],
    };
  }

  /**
   * Set node type (unique identifier)
   */
  type(type: string): this {
    this.node.type = type;
    return this;
  }

  /**
   * Set node label
   */
  label(label: string): this {
    this.node.label = label;
    return this;
  }

  /**
   * Set node description
   */
  description(description: string): this {
    this.node.description = description;
    return this;
  }

  /**
   * Set node icon
   */
  icon(icon: string): this {
    this.node.icon = icon;
    return this;
  }

  /**
   * Set node category
   */
  category(category: string): this {
    this.node.category = category;
    return this;
  }

  /**
   * Add input port
   */
  addInput(id: string, name: string, type: string = 'flow'): this {
    if (!this.node.inputs) {
      this.node.inputs = [];
    }
    this.node.inputs.push({ id, name, type });
    return this;
  }

  /**
   * Add output port
   */
  addOutput(id: string, name: string, type: string = 'flow'): this {
    if (!this.node.outputs) {
      this.node.outputs = [];
    }
    this.node.outputs.push({ id, name, type });
    return this;
  }

  /**
   * Set node configuration fields
   */
  config(settings: PluginSettings): this {
    this.node.configuration = settings;
    return this;
  }

  /**
   * Set node execution function
   */
  execute(fn: (context: NodeExecutionContext) => Promise<any>): this {
    this.node.execute = fn;
    return this;
  }

  /**
   * Build the node definition
   */
  build(): CustomNodeDefinition {
    if (!this.node.type || !this.node.label || !this.node.execute) {
      throw new Error('Node must have type, label, and execute function');
    }

    return this.node as CustomNodeDefinition;
  }
}

/**
 * Tool Builder
 * Fluent API for creating custom tools
 */
export class ToolBuilder {
  private tool: Partial<Tool>;

  constructor() {
    this.tool = {
      parameters: [],
      permissions: {
        roles: ['owner', 'admin', 'member'],
        scopes: [],
      },
    };
  }

  /**
   * Set tool name
   */
  name(name: string): this {
    this.tool.name = name;
    return this;
  }

  /**
   * Set tool description
   */
  description(description: string): this {
    this.tool.description = description;
    return this;
  }

  /**
   * Add tool parameter
   */
  addParameter(param: ToolParameter): this {
    if (!this.tool.parameters) {
      this.tool.parameters = [];
    }
    this.tool.parameters.push(param);
    return this;
  }

  /**
   * Add string parameter
   */
  stringParam(name: string, description: string, required = false, defaultValue?: string): this {
    return this.addParameter({
      name,
      type: 'string',
      description,
      required,
      default: defaultValue,
    });
  }

  /**
   * Add number parameter
   */
  numberParam(name: string, description: string, required = false, defaultValue?: number): this {
    return this.addParameter({
      name,
      type: 'number',
      description,
      required,
      default: defaultValue,
    });
  }

  /**
   * Add boolean parameter
   */
  booleanParam(name: string, description: string, required = false, defaultValue?: boolean): this {
    return this.addParameter({
      name,
      type: 'boolean',
      description,
      required,
      default: defaultValue,
    });
  }

  /**
   * Set tool permissions
   */
  permissions(permissions: ToolPermissions): this {
    this.tool.permissions = permissions;
    return this;
  }

  /**
   * Set tool execution function
   */
  execute(fn: (params: Record<string, any>) => Promise<any>): this {
    this.tool.execute = fn;
    return this;
  }

  /**
   * Build the tool
   */
  build(): Tool {
    if (!this.tool.name || !this.tool.description || !this.tool.execute) {
      throw new Error('Tool must have name, description, and execute function');
    }

    return this.tool as Tool;
  }
}

/**
 * Helper function to create a plugin
 */
export function createPlugin(id: string, name: string, version: string): PluginBuilder {
  return new PluginBuilder(id, name, version);
}
