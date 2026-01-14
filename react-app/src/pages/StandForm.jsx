import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { standsAPI } from '../services/api';
import UnifiedMap from '../components/UnifiedMap';
import './StandForm.css';

const REGION_COORDS = {
  '경산시': [35.8250, 128.7414],
  '경주시': [35.8562, 129.2247],
  '고령군': [35.7273, 128.2623],
  '구미시': [36.1195, 128.3445],
  '군위군': [36.2428, 128.5731],
  '김천시': [36.1399, 128.1138],
  '대구광역시': [35.8714, 128.6014],
  '문경시': [36.5864, 128.1867],
  '봉화군': [36.8930, 128.7324],
  '상주시': [36.4109, 128.1591],
  '성주군': [35.9194, 128.2811],
  '안동시': [36.5684, 128.7294],
  '영덕군': [36.4150, 129.3655],
  '영양군': [36.6667, 129.1124],
  '영주시': [36.8056, 128.6238],
  '영천시': [35.9733, 128.9386],
  '예천군': [36.6573, 128.4519],
  '울진군': [36.9931, 129.4006],
  '의성군': [36.3524, 128.6969],
  '청도군': [35.6476, 128.7355],
  '청송군': [36.4364, 129.0572],
  '칠곡군': [35.9952, 128.4019],
  '포항시': [36.0190, 129.3435]
};

function StandForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    address: '',
    latitude: null,
    longitude: null,
    description: '',
    imageFile: null // URL 대신 파일로 변경
  });
  const [imagePreview, setImagePreview] = useState(null); // 이미지 미리보기

  const [mapCenter, setMapCenter] = useState({ lat: 35.8714, lng: 128.6014 });
  const [mapZoom, setMapZoom] = useState(14);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [coordsDisplay, setCoordsDisplay] = useState('지도를 클릭하여 위치를 선택하세요');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setFormData(prev => ({
      ...prev,
      region: region,
      latitude: null,  // 지역 변경 시 핀 제거
      longitude: null,
      imageFile: null  // 이미지도 초기화
    }));

    // 마커와 좌표 표시 초기화
    setSelectedMarker(null);
    setCoordsDisplay('지도를 클릭하여 위치를 선택하세요');
    setImagePreview(null);
    
    // 파일 입력 필드 초기화
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }

    if (region && REGION_COORDS[region]) {
      const [lat, lng] = REGION_COORDS[region];
      setMapCenter({ lat, lng });
      setMapZoom(13);
    }
  };

  const handleMapClick = (coords) => {
    const { lat, lng } = coords;

    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    setSelectedMarker({
      lat,
      lng,
      content: '<div style="padding: 10px;">선택된 위치</div>'
    });

    setCoordsDisplay(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const searchAddress = async () => {
    const address = formData.address.trim();
    if (!address) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      const data = await standsAPI.geocode(address);

      if (data && data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);

        setMapCenter({ lat, lng });
        setMapZoom(16);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

        setSelectedMarker({
          lat,
          lng,
          content: `<div style="padding: 10px;">${address}</div>`
        });

        setCoordsDisplay(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        alert('주소를 찾을 수 없습니다. 주소를 확인해주세요.');
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert('지도에서 위치를 선택해주세요.');
      return;
    }

    const submitData = {
      name: formData.name,
      region: formData.region,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description || null,
      imageFile: formData.imageFile || null
    };

    try {
      if (formData.imageFile) {
        // 파일이 있으면 FormData로 전송
        const submitFormData = new FormData();
        submitFormData.append('name', formData.name);
        submitFormData.append('region', formData.region);
        submitFormData.append('address', formData.address);
        submitFormData.append('latitude', formData.latitude);
        submitFormData.append('longitude', formData.longitude);
        if (formData.description) {
          submitFormData.append('description', formData.description);
        }
        submitFormData.append('image', formData.imageFile);
        
        await standsAPI.createWithFile(submitFormData);
      } else {
        // 파일이 없으면 JSON으로 전송
        const submitData = {
          name: formData.name,
          region: formData.region,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          description: formData.description || null
        };
        
        await standsAPI.create(submitData);
      }
      
      alert('게시대가 저장되었습니다.');
      
      // 폼 초기화 (페이지는 그대로 유지)
      setFormData({
        name: '',
        region: '',
        address: '',
        latitude: null,
        longitude: null,
        description: '',
        imageFile: null
      });
      setSelectedMarker(null);
      setCoordsDisplay('지도를 클릭하여 위치를 선택하세요');
      setImagePreview(null);
      
      // 파일 입력 필드 초기화
      const fileInput = document.getElementById('imageFile');
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('저장 오류:', error);
      alert(error.message || '저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/map');
  };

  return (
    <main>
      <div className="form-container">
        <h2 className="form-title">새 게시대 등록</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                게시대 이름 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="region" className="form-label">
                지역 <span className="required">*</span>
              </label>
              <select
                className="form-control"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleRegionChange}
                required
              >
                <option value="">지역 선택</option>
                {Object.keys(REGION_COORDS).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <p className="help-text">지역을 선택하면 지도가 해당 지역으로 이동합니다</p>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address" className="form-label">
                주소
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="주소를 입력하세요 (선택사항)"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={searchAddress}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className="fas fa-search"></i> 주소 검색
                </button>
              </div>
              <p className="help-text">주소를 입력하고 '주소 검색' 버튼을 클릭하면 지도가 이동합니다. 또는 지도를 직접 클릭하여 위치를 선택할 수 있습니다.</p>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                위치 선택 <span className="required">*</span>
              </label>
              <div className="stand-form-map">
                <UnifiedMap
                  center={mapCenter}
                  zoom={mapZoom}
                  markers={selectedMarker ? [selectedMarker] : []}
                  onMapClick={handleMapClick}
                  showTabs={true}
                  defaultProvider="kakao"
                  autoFitBounds={false}
                  roadviewTarget={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="coordinates-display">
                선택된 좌표: <span className="coordinates-value">{coordsDisplay}</span>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">설명</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="게시대에 대한 추가 정보를 입력하세요 (선택사항)"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="imageFile" className="form-label">게시대 이미지</label>
              <div className="custom-file-upload">
                <input
                  type="file"
                  className="file-input"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="imageFile" className="file-upload-btn">
                  <i className="fas fa-camera" style={{ marginRight: '8px' }}></i>
                  {formData.imageFile ? formData.imageFile.name : '이미지 선택'}
                </label>
              </div>
              <p className="help-text">게시대 사진을 업로드하세요 (최대 5MB, JPG/PNG/GIF 등)</p>
              {imagePreview && (
                <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={imagePreview} 
                    alt="미리보기" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      display: 'block'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, imageFile: null }));
                      setImagePreview(null);
                      document.getElementById('imageFile').value = '';
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '24px',
                      height: '24px',
                      padding: '0',
                      backgroundColor: 'rgba(220, 53, 69, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title="이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleCancel}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              등록하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default StandForm;
