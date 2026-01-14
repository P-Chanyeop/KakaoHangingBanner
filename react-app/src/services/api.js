// API 기본 URL
// 개발 환경에서는 프록시를 통해, 프로덕션에서는 상대 경로 사용
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:8081/api';

// JWT 토큰을 포함한 헤더 생성
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API 요청 처리 (401 처리 포함)
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, options);

  // 401 Unauthorized 응답 시 로그인 페이지로 리다이렉트
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('인증이 필요합니다.');
  }

  return response;
};

// 게시대 관련 API
export const standsAPI = {
  // 모든 게시대 조회
  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('게시대 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // ID로 게시대 조회
  getById: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('게시대 정보를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 지역별 게시대 조회
  getByRegion: async (region) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands?region=${region}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('게시대 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 검색
  search: async (keyword) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('검색에 실패했습니다.');
    return response.json();
  },

  // 게시대 생성
  create: async (data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('게시대 등록에 실패했습니다.');
    return response.json();
  },

  // 파일과 함께 게시대 생성
  createWithFile: async (formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/stands/with-file`, {
      method: 'POST',
      headers: headers,
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
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('게시대 수정에 실패했습니다.');
    return response.json();
  },

  // 게시대 수정 (파일 포함)
  updateWithFile: async (id, formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/stands/${id}/with-file`, {
      method: 'PUT',
      headers: headers,
      body: formData
    });
    if (!response.ok) throw new Error('게시대 수정에 실패했습니다.');
    return response.json();
  },

  // 게시대 삭제
  delete: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('게시대 삭제에 실패했습니다.');
  },

  // 주소를 좌표로 변환 (Geocoding)
  geocode: async (address) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/geocode?address=${encodeURIComponent(address)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('주소 변환에 실패했습니다.');
    return response.json();
  },

  // 좌표를 주소로 변환 (Reverse Geocoding)
  reverseGeocode: async (lat, lng) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/stands/reverse-geocode?lat=${lat}&lng=${lng}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('좌표 변환에 실패했습니다.');
    return response.json();
  }
};

// 버튼 관련 API
export const buttonsAPI = {
  // 모든 버튼 조회
  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/button-links`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('버튼 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 색상별 버튼 조회
  getByType: async (type) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/button-links/type/${type}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('버튼 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 버튼 생성
  create: async (data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/button-links`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('버튼 등록에 실패했습니다.');
    return response.json();
  },

  // 버튼 수정
  update: async (id, data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/button-links/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('버튼 수정에 실패했습니다.');
    return response.json();
  },

  // 버튼 삭제
  delete: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/button-links/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('버튼 삭제에 실패했습니다.');
  }
};

// 캘린더 이벤트 관련 API
export const calendarAPI = {
  // 날짜 범위로 이벤트 조회
  getByDateRange: async (startDate, endDate) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/calendar-events/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('일정 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 이벤트 생성
  create: async (data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/calendar-events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('일정 등록에 실패했습니다.');
    return response.json();
  },

  // 이벤트 삭제
  delete: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/calendar-events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('일정 삭제에 실패했습니다.');
  }
};


// Hero 이미지 관련 API
export const heroImageAPI = {
  // 모든 Hero 이미지 조회
  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/hero-images`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Hero 이미지 데이터를 불러오는데 실패했습니다.');
    return response.json();
  },

  // 이름으로 Hero 이미지 조회
  getByName: async (name) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/hero-images/${name}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Hero 이미지를 불러오는데 실패했습니다.');
    return response.json();
  },

  // Hero 이미지 업로드
  upload: async (name, imageFile) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetchWithAuth(`${API_BASE_URL}/hero-images/${name}`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    if (!response.ok) throw new Error('Hero 이미지 업로드에 실패했습니다.');
    return response.json();
  }
};

/**
 * 팝업 메시지 관련 API
 */
export const popupMessagesAPI = {
  /**
   * 모든 팝업 메시지 조회
   * @returns {Promise<Array>} 팝업 메시지 배열
   */
  getAll: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/popup-messages`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('팝업 메시지를 불러오는데 실패했습니다.');
    return response.json();
  },

  /**
   * 이름으로 팝업 메시지 조회
   * @param {string} name - 팝업 메시지 이름 (webhard, notice)
   * @returns {Promise<Object>} 팝업 메시지 객체
   */
  getByName: async (name) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/popup-messages/${name}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('팝업 메시지를 불러오는데 실패했습니다.');
    return response.json();
  },

  /**
   * 팝업 메시지 저장
   * @param {string} name - 팝업 메시지 이름
   * @param {string} content - 팝업 메시지 내용
   * @returns {Promise<Object>} 저장된 팝업 메시지 객체
   */
  save: async (name, content) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/popup-messages/${name}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('팝업 메시지 저장에 실패했습니다.');
    return response.json();
  }
};
