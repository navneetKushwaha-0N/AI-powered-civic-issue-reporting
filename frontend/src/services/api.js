import axiosInstance from './axiosInstance';

// Auth API
export const authAPI = {
  sendOTP: (phone) => axiosInstance.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => axiosInstance.post('/auth/verify-otp', { phone, otp }),
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getMe: () => axiosInstance.get('/auth/me'),
  updateProfile: (formData) => axiosInstance.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

// Issue API
export const issueAPI = {
  createIssue: (formData) => {
    return axiosInstance.post('/issues/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getUserIssues: (userId) => axiosInstance.get(`/issues/user/${userId}`),
  getUserIssuesByStatus: (userId, status) => axiosInstance.get(`/issues/user/${userId}/${status}`),
  getNearbyIssues: (lat, lng, radius) => 
    axiosInstance.get(`/issues/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getIssueById: (id) => axiosInstance.get(`/issues/${id}`),
  getIssueDetails: (id) => axiosInstance.get(`/issues/${id}/details`),
  supportIssue: (id) => axiosInstance.post(`/issues/support/${id}`),
  getDashboardStats: () => axiosInstance.get('/issues/stats/dashboard'),
  
  // Admin endpoints
  getAllIssues: (params) => axiosInstance.get('/issues', { params }),
  updateIssueStatus: (id, data) => axiosInstance.put(`/issues/status/${id}`, data),
  updateIssueCategory: (id, data) => axiosInstance.put(`/issues/category/${id}`, data),
  assignIssue: (id, data) => axiosInstance.put(`/issues/assign/${id}`, data),
  getIssuesForMap: () => axiosInstance.get('/issues/map')
};

// Analytics API
export const analyticsAPI = {
  getStats: () => axiosInstance.get('/analytics/stats')
};

export default { authAPI, issueAPI };
