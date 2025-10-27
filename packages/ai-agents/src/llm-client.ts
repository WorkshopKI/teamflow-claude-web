/**
 * TeamFlow AI - LLM Client
 *
 * Unified client for interacting with different LLM providers
 */

export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMClientConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LLMClient {
  constructor(private config: LLMClientConfig) {}

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.chatOpenAI(messages);
      case 'anthropic':
        return this.chatAnthropic(messages);
      case 'ollama':
        return this.chatOllama(messages);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async chatOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  private async chatAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Anthropic requires separating system messages
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens ?? 2000,
        temperature: this.config.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  private async chatOllama(messages: LLMMessage[]): Promise<LLMResponse> {
    const baseURL = this.config.baseURL || 'http://localhost:11434';

    const response = await fetch(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature ?? 0.7,
          num_predict: this.config.maxTokens ?? 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.message.content,
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }
}

export function createLLMClient(config: LLMClientConfig): LLMClient {
  return new LLMClient(config);
}
