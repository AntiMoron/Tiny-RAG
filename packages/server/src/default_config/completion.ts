import { AIProvider } from 'tinyrag-types/aiprovider';

const completionDefaults: Record<string, Omit<AIProvider, 'id' | 'name'>> = {
  doubao: {
    type: 'completion',
    config: {
      model: 'doubao-seed-1-6-251015',
      endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      apiKey: process.env.DOUBAO_API_KEY || '',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer {{apiKey}}',
      },
      method: 'POST',
      paramMapping: {
        'messages[0].content[0].text': '{{input}}',
        'messages[0].content[0].type': '{{const(text)}}',
        model: '{{model}}',
        'messages[0].role': '{{const(user)}}',
      },
      resultMapping: {
        'data.result': 'choices[0].message.content',
        'usage.prompt_tokens': 'usage.prompt_tokens',
        'usage.completion_tokens': 'usage.completion_tokens',
        'usage.total_tokens': 'usage.total_tokens',
      },
    },
  },
};

export default completionDefaults;
