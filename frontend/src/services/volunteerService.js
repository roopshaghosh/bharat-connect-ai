import api from './api';

const volunteerService = {
  getOpportunities: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);

    const response = await api.get(`/volunteer/opportunities?${params.toString()}`);
    return response.data;
  },

  getOpportunityById: async (id) => {
    const response = await api.get(`/volunteer/opportunities/${id}`);
    return response.data;
  },

  createOpportunity: async (oppData) => {
    const response = await api.post('/volunteer/opportunities', oppData);
    return response.data;
  },

  applyForOpportunity: async (id, message, skillsOffered) => {
    const response = await api.post(`/volunteer/opportunities/${id}/apply`, { message, skillsOffered });
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/volunteer/applications');
    return response.data;
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/volunteer/applications/${id}`, { status });
    return response.data;
  }
};

export default volunteerService;
