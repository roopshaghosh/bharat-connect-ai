import api from './api';

const aiService = {
  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  }
};

export default aiService;
