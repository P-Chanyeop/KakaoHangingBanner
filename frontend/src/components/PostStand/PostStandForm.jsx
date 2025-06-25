import React, { useState, useEffect } from 'react';
import './PostStandForm.css';

const PostStandForm = ({ postStand, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    region: '',
    description: '',
    imageUrl: ''
  });

  // 수정 모드인 경우 기존 데이터로 폼 초기화
  useEffect(() => {
    if (postStand) {
      setFormData({
        name: postStand.name || '',
        address: postStand.address || '',
        latitude: postStand.latitude || '',
        longitude: postStand.longitude || '',
        region: postStand.region || '',
        description: postStand.description || '',
        imageUrl: postStand.imageUrl || ''
      });
    }
  }, [postStand]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.region) {
      alert('이름, 주소, 위치(위도/경도), 지역은 필수 입력 항목입니다.');
      return;
    }
    
    // 위도/경도 숫자 검증
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('위도와 경도는 유효한 숫자여야 합니다.');
      return;
    }
    
    // 위도/경도 범위 검증
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('위도는 -90에서 90 사이, 경도는 -180에서 180 사이여야 합니다.');
      return;
    }
    
    // 숫자 타입으로 변환
    const submissionData = {
      ...formData,
      latitude: lat,
      longitude: lng
    };
    
    onSubmit(submissionData);
  };

  // 지역 목록
  const regions = [
    '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  return (
    <div className="post-stand-form-overlay">
      <div className="post-stand-form">
        <h2>{postStand ? '게시대 수정' : '새 게시대 등록'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">주소 *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">위도 *</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="longitude">경도 *</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="region">지역 *</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="">지역 선택</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="imageUrl">이미지 URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              취소
            </button>
            <button type="submit" className="submit-button">
              {postStand ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostStandForm;
