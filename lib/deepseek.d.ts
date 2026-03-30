declare module 'deepseek' {
  export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatCompletionOptions {
    model?: string;
    messages: Message[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }

  export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: Message;
      finish_reason: string;
    }>;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  export class DeepSeek {
    constructor(apiKey: string);

    chat: {
      completions: {
        create(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
      };
    };
  }

  export default DeepSeek;
}
