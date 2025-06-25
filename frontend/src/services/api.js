import axios from 'axios';

const API_BASE_URL = '/api';

const api = {
  // 모든 게시대 가져오기
  getAllPostStands: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stands`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post stands:', error);
      throw error;
    }
  },
  
  // 특정 지역의 게시대 가져오기
  getPostStandsByRegion: async (region) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stands?region=${region}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post stands for region ${region}:`, error);
      throw error;
    }
  },
  
  // 특정 반경 내의 게시대 가져오기
  getPostStandsWithinRadius: async (lat, lng, radius) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stands?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching post stands within radius:', error);
      throw error;
    }
  },
  
  // 특정 게시대 상세 정보 가져오기
  getPostStandById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stands/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post stand with id ${id}:`, error);
      throw error;
    }
  },
  
  // 새 게시대 생성
  createPostStand: async (postStandData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/stands`, postStandData);
      return response.data;
    } catch (error) {
      console.error('Error creating post stand:', error);
      throw error;
    }
  },
  
  // 게시대 정보 업데이트
  updatePostStand: async (id, postStandData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/stands/${id}`, postStandData);
      return response.data;
    } catch (error) {
      console.error(`Error updating post stand with id ${id}:`, error);
      throw error;
    }
  },
  
  // 게시대 삭제
  deletePostStand: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/stands/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting post stand with id ${id}:`, error);
      throw error;
    }
  }
};

export default api;
