import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { standsAPI } from '../services/api';
import './StandForm.css';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 이슈 수정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const REGION_COORDS = {
  '경산시': [35.8250, 128.7414],
  '경주시': [35.8562, 129.2247],
  '고령군': [35.7273, 128.2623],
  '군위군': [36.2428, 128.5731],
  '김천시': [36.1399, 128.1138],
  '대구광역시': [35.8714, 128.6014],
  '문경시': [36.5864, 128.1867],
  '봉화군': [36.8930, 128.7324],
  '상주시': [36.4109, 128.1591],
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
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    address: '',
    latitude: null,
    longitude: null,
    description: '',
    imageUrl: ''
  });

  const [coordsDisplay, setCoordsDisplay] = useState('지도를 클릭하여 위치를 선택하세요');

  useEffect(() => {
    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (mapInstance.current) return;
    if (!mapRef.current) return;

    // 기존 지도 컨테이너 정리
    mapRef.current._leaflet_id = undefined;

    const defaultCenter = [35.8714, 128.6014]; // 대구 중심 좌표

    mapInstance.current = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      maxBounds: [
        [33.0, 124.5],
        [38.9, 132.0]
      ],
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // 지도 클릭 이벤트
    mapInstance.current.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // 기존 마커 제거
      if (markerRef.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }

      // 새 마커 추가
      markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current);

      // 폼 필드 업데이트
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));

      setCoordsDisplay(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setFormData(prev => ({
      ...prev,
      region: region
    }));

    if (region && REGION_COORDS[region]) {
      const [lat, lng] = REGION_COORDS[region];
      mapInstance.current.setView([lat, lng], 13);
    }
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

        // 지도 이동
        mapInstance.current.setView([lat, lng], 16);

        // 기존 마커 제거
        if (markerRef.current) {
          mapInstance.current.removeLayer(markerRef.current);
        }

        // 새 마커 추가
        markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current);

        // 폼 필드 업데이트
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

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

    // 위치 검증
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
      imageUrl: formData.imageUrl || null
    };

    try {
      const result = await standsAPI.create(submitData);
      alert('게시대가 저장되었습니다.');
      navigate('/map');
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
                주소 <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
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
              <p className="help-text">게시대의 정확한 주소를 입력하고 '주소 검색' 버튼을 클릭하면 지도가 이동합니다</p>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                위치 선택 <span className="required">*</span>
              </label>
              <div ref={mapRef} className="stand-form-map"></div>
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
              <label htmlFor="imageUrl" className="form-label">이미지 URL</label>
              <input
                type="url"
                className="form-control"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="help-text">게시대 사진의 URL을 입력하세요 (선택사항)</p>
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
