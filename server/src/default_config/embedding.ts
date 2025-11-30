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
    },
  },
};
