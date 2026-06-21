import api from './api';

const bloodDonationService = {
  getRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.bloodGroup && filters.bloodGroup !== 'All') params.append('bloodGroup', filters.bloodGroup);
    if (filters.location) params.append('location', filters.location);

    const response = await api.get(`/blood-donation/requests?${params.toString()}`);
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await api.post('/blood-donation/requests', requestData);
    return response.data;
  },

  respondToRequest: async (id) => {
    const response = await api.post(`/blood-donation/requests/${id}/respond`);
    return response.data;
  },

  updateRequestStatus: async (id, status) => {
    const response = await api.put(`/blood-donation/requests/${id}`, { status });
    return response.data;
  }
};

export default bloodDonationService;
