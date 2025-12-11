export default {
  doubao: {
    type: 'embedding',
    config: {
      model: 'doubao-embedding-text-240715',
      endpoint: 'https://ark.cn-beijing.volces.com/api/v3/embeddings',
      apiKey: process.env.DOUBAO_API_KEY || '',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer {{apiKey}}',
      },
      method: 'POST',
      paramMapping: {
        model: '{{model}}',
        encoding_format: '{{const(float)}}',
        input: '{{input}}',
      },
      resultMapping: {
        'data.result': 'data.0.embedding',
        object: 'data.0.object',
        'usage.total_tokens': 'usage.total_tokens',
        'usage.prompt_tokens': 'usage.prompt_tokens',
        'usage.completion_tokens': 'usage.completion_tokens',
      },
    },
  },
};
