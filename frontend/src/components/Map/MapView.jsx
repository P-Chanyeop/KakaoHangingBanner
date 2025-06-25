import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapMarker from './MapMarker';
import api from '../../services/api';

// 지도 중심 변경 시 이벤트 처리를 위한 컴포넌트
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapView = ({ onSelectPostStand }) => {
  // 초기 지도 중심 좌표 (서울시청)
  const [center, setCenter] = useState([37.5665, 126.9780]);
  const [zoom, setZoom] = useState(13);
  const [postStands, setPostStands] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchRadius, setSearchRadius] = useState(2); // 기본 2km 반경

  // 지역 목록
  const regions = [
    '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  // 지역 선택 시 해당 지역의 중심 좌표로 이동
  const regionCoordinates = {
    '서울': [37.5665, 126.9780],
    '부산': [35.1796, 129.0756],
    '인천': [37.4563, 126.7052],
    '대구': [35.8714, 128.6014],
    '대전': [36.3504, 127.3845],
    '광주': [35.1595, 126.8526],
    '울산': [35.5384, 129.3114],
    '세종': [36.4800, 127.2890],
    '경기': [37.4138, 127.5183],
    '강원': [37.8228, 128.1555],
    '충북': [36.6357, 127.4914],
    '충남': [36.6588, 126.6728],
    '전북': [35.8202, 127.1080],
    '전남': [34.8160, 126.4629],
    '경북': [36.5760, 128.5050],
    '경남': [35.4606, 128.2132],
    '제주': [33.4996, 126.5312]
  };

  // 지역 선택 핸들러
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    
    if (region && regionCoordinates[region]) {
      setCenter(regionCoordinates[region]);
      setZoom(13);
      loadPostStandsByRegion(region);
    } else {
      loadAllPostStands();
    }
  };

  // 반경 변경 핸들러
  const handleRadiusChange = (e) => {
    const radius = parseFloat(e.target.value);
    setSearchRadius(radius);
    loadPostStandsWithinRadius(center[0], center[1], radius);
  };

  // 모든 게시대 로드
  const loadAllPostStands = async () => {
    try {
      const data = await api.getAllPostStands();
      setPostStands(data);
    } catch (error) {
      console.error('Failed to load post stands:', error);
    }
  };

  // 특정 지역의 게시대 로드
  const loadPostStandsByRegion = async (region) => {
    try {
      const data = await api.getPostStandsByRegion(region);
      setPostStands(data);
    } catch (error) {
      console.error(`Failed to load post stands for region ${region}:`, error);
    }
  };

  // 특정 반경 내의 게시대 로드
  const loadPostStandsWithinRadius = async (lat, lng, radius) => {
    try {
      const data = await api.getPostStandsWithinRadius(lat, lng, radius);
      setPostStands(data);
    } catch (error) {
      console.error('Failed to load post stands within radius:', error);
    }
  };

  // 지도 이동 완료 후 현재 중심 좌표 기준으로 게시대 로드
  const handleMapMoveEnd = (e) => {
    const map = e.target;
    const center = map.getCenter();
    setCenter([center.lat, center.lng]);
    loadPostStandsWithinRadius(center.lat, center.lng, searchRadius);
  };

  // 컴포넌트 마운트 시 모든 게시대 로드
  useEffect(() => {
    loadAllPostStands();
  }, []);

  return (
    <div className="map-container">
      <div className="map-controls">
        <div className="region-selector">
          <label htmlFor="region-select">지역 선택:</label>
          <select 
            id="region-select" 
            value={selectedRegion} 
            onChange={handleRegionChange}
          >
            <option value="">전체</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="radius-selector">
          <label htmlFor="radius-select">검색 반경 (km):</label>
          <input
            id="radius-select"
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={searchRadius}
            onChange={handleRadiusChange}
          />
          <span>{searchRadius} km</span>
        </div>
      </div>
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '600px', width: '100%' }}
        whenReady={(map) => {
          map.target.on('moveend', handleMapMoveEnd);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        
        {postStands.map(postStand => (
          <MapMarker
            key={postStand.id}
            postStand={postStand}
            onSelect={() => onSelectPostStand(postStand)}
          />
        ))}
      </MapContainer>
      
      <div className="post-stands-count">
        <p>표시된 게시대: {postStands.length}개</p>
      </div>
    </div>
  );
};

export default MapView;
