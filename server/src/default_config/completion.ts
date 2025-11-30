export default {
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
    },
  },
};
