// API 기본 URL
// 개발 환경에서는 프록시를 통해, 프로덕션에서는 상대 경로 사용
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:8081/api';

// 게시대 관련 API
export const standsAPI = {
  // 모든 게시대 조회
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/stands`);
    if (!response.ok) throw new Error('게시대 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // ID로 게시대 조회
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stands/${id}`);
    if (!response.ok) throw new Error('게시대 정보를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 지역별 게시대 조회
  getByRegion: async (region) => {
    const response = await fetch(`${API_BASE_URL}/stands?region=${region}`);
    if (!response.ok) throw new Error('게시대 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 검색
  search: async (keyword) => {
    const response = await fetch(`${API_BASE_URL}/stands/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('검색에 실패했습니다.');
    return response.json();
  },

  // 게시대 생성
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/stands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('게시대 등록에 실패했습니다.');
    return response.json();
  },

  // 파일과 함께 게시대 생성
  createWithFile: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/stands/with-file`, {
      method: 'POST',
      body: formData // FormData는 Content-Type 헤더를 자동으로 설정
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('게시대 등록 실패:', response.status, errorText);
      throw new Error(`게시대 등록에 실패했습니다. (${response.status})`);
    }
    return response.json();
  },

  // 게시대 수정
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/stands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('게시대 수정에 실패했습니다.');
    return response.json();
  },

  // 게시대 삭제
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stands/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('게시대 삭제에 실패했습니다.');
  },

  // 주소를 좌표로 변환 (Geocoding)
  geocode: async (address) => {
    const response = await fetch(`${API_BASE_URL}/stands/geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) throw new Error('주소 변환에 실패했습니다.');
    return response.json();
  }
};

// 버튼 관련 API
export const buttonsAPI = {
  // 모든 버튼 조회
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/button-links`);
    if (!response.ok) throw new Error('버튼 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 색상별 버튼 조회
  getByType: async (type) => {
    const response = await fetch(`${API_BASE_URL}/button-links/type/${type}`);
    if (!response.ok) throw new Error('버튼 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 버튼 생성
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/button-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('버튼 등록에 실패했습니다.');
    return response.json();
  },

  // 버튼 수정
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/button-links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('버튼 수정에 실패했습니다.');
    return response.json();
  },

  // 버튼 삭제
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/button-links/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('버튼 삭제에 실패했습니다.');
  }
};

// 캘린더 이벤트 관련 API
export const calendarAPI = {
  // 날짜 범위로 이벤트 조회
  getByDateRange: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/calendar-events/range?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error('일정 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 이벤트 생성
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/calendar-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('일정 등록에 실패했습니다.');
    return response.json();
  },

  // 이벤트 삭제
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/calendar-events/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('일정 삭제에 실패했습니다.');
  }
};
