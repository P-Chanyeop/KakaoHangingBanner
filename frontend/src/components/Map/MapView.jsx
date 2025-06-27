import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapMarker from './MapMarker';
import api from '../../services/api';

// 지도 중심 변경 시 이벤트 처리를 위한 컴포넌트
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// 지도 이동 제한을 설정하는 컴포넌트
function MapBoundary() {
  const map = useMap();
  
  useEffect(() => {
    // 한국 영역의 경계 설정 (대략적인 좌표)
    const southWest = L.latLng(32.0, 124.0);  // 한국 남서쪽 경계
    const northEast = L.latLng(39.0, 132.0);  // 한국 북동쪽 경계
    const bounds = L.latLngBounds(southWest, northEast);
    
    // 지도 이동 제한 설정
    map.setMaxBounds(bounds);
    map.options.minZoom = 7;  // 최소 줌 레벨 (한국 전체 보기)
    map.options.maxZoom = 18; // 최대 줌 레벨
    
    // 경계를 벗어나는 이동 방지
    map.on('drag', function() {
      map.panInsideBounds(bounds, { animate: false });
    });
    
    // 초기 뷰 설정
    map.fitBounds(bounds);
    
  }, [map]);
  
  return null;
}

const MapView = ({ onSelectPostStand }) => {
  // 초기 지도 중심 좌표 (한국 중심)
  const [center, setCenter] = useState([36.5, 127.8]); // 한국 중심 좌표
  const [zoom, setZoom] = useState(7); // 한국 전체가 보이는 줌 레벨
  const [postStands, setPostStands] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSubRegion, setSelectedSubRegion] = useState('');
  const [searchRadius, setSearchRadius] = useState(2); // 기본 2km 반경

  // 지역 및 시군구 데이터
  const regionData = {
    '대구': {
      center: [35.8714, 128.6014],
      subRegions: [
        '중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'
      ]
    },
    '경북': {
      center: [36.5760, 128.5050],
      subRegions: [
        '포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', 
        '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', 
        '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'
      ]
    },
    '경남': {
      center: [35.4606, 128.2132],
      subRegions: [
        '창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', 
        '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', 
        '거창군', '합천군'
      ]
    }
  };

  // 시군구별 좌표 데이터 (대표적인 좌표)
  const subRegionCoordinates = {
    // 대구
    '중구': [35.8691, 128.5975],
    '동구': [35.8858, 128.6355],
    '서구': [35.8719, 128.5594],
    '남구': [35.8460, 128.5974],
    '북구': [35.8858, 128.5830],
    '수성구': [35.8582, 128.6309],
    '달서구': [35.8299, 128.5327],
    '달성군': [35.7746, 128.4307],
    
    // 경북
    '포항시': [36.0199, 129.3434],
    '경주시': [35.8562, 129.2246],
    '김천시': [36.1398, 128.1135],
    '안동시': [36.5684, 128.7295],
    '구미시': [36.1196, 128.3445],
    '영주시': [36.8051, 128.6231],
    '영천시': [35.9733, 128.9387],
    '상주시': [36.4109, 128.1592],
    '문경시': [36.5869, 128.1864],
    '경산시': [35.8252, 128.7414],
    '군위군': [36.2428, 128.5728],
    '의성군': [36.3527, 128.6970],
    '청송군': [36.4361, 129.0571],
    '영양군': [36.6667, 129.1122],
    '영덕군': [36.4153, 129.3656],
    '청도군': [35.6472, 128.7336],
    '고령군': [35.7266, 128.2628],
    '성주군': [35.9193, 128.2830],
    '칠곡군': [36.0092, 128.4017],
    '예천군': [36.6577, 128.4529],
    '봉화군': [36.8932, 128.7329],
    '울진군': [36.9931, 129.4011],
    '울릉군': [37.5046, 130.8561],
    
    // 경남
    '창원시': [35.2540, 128.6411],
    '진주시': [35.1795, 128.1076],
    '통영시': [34.8544, 128.4332],
    '사천시': [35.0038, 128.0642],
    '김해시': [35.2282, 128.8812],
    '밀양시': [35.5038, 128.7464],
    '거제시': [34.8806, 128.6211],
    '양산시': [35.3350, 129.0371],
    '의령군': [35.3222, 128.2617],
    '함안군': [35.2723, 128.4066],
    '창녕군': [35.5444, 128.4925],
    '고성군': [34.9730, 128.3222],
    '남해군': [34.8376, 127.8924],
    '하동군': [35.0674, 127.7514],
    '산청군': [35.4156, 127.8731],
    '함양군': [35.5202, 127.7250],
    '거창군': [35.6864, 127.9097],
    '합천군': [35.5669, 128.1653]
  };

  // 지역 선택 핸들러
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedSubRegion('');
    
    if (region && regionData[region]) {
      setCenter(regionData[region].center);
      setZoom(10);
      loadPostStandsByRegion(region);
    } else {
      setCenter([36.5, 127.8]); // 한국 중심으로 리셋
      setZoom(7);
      loadAllPostStands();
    }
  };

  // 시군구 선택 핸들러
  const handleSubRegionChange = (e) => {
    const subRegion = e.target.value;
    setSelectedSubRegion(subRegion);
    
    if (subRegion && subRegionCoordinates[subRegion]) {
      setCenter(subRegionCoordinates[subRegion]);
      setZoom(13);
      loadPostStandsBySubRegion(selectedRegion, subRegion);
    } else if (selectedRegion) {
      setCenter(regionData[selectedRegion].center);
      setZoom(10);
      loadPostStandsByRegion(selectedRegion);
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
      setPostStands(data || []);
    } catch (error) {
      console.error('Failed to load post stands:', error);
      setPostStands([]);
    }
  };

  // 특정 지역의 게시대 로드
  const loadPostStandsByRegion = async (region) => {
    try {
      const data = await api.getPostStandsByRegion(region);
      setPostStands(data || []);
    } catch (error) {
      console.error(`Failed to load post stands for region ${region}:`, error);
      setPostStands([]);
    }
  };

  // 특정 시군구의 게시대 로드
  const loadPostStandsBySubRegion = async (region, subRegion) => {
    try {
      // 백엔드에 시군구 필터링 API가 있다고 가정
      // 실제로는 백엔드 API를 수정하거나 프론트에서 필터링 필요
      const data = await api.getPostStandsByRegion(region);
      const filteredData = (data || []).filter(stand => 
        stand.address && stand.address.includes(subRegion)
      );
      setPostStands(filteredData);
    } catch (error) {
      console.error(`Failed to load post stands for subregion ${subRegion}:`, error);
      setPostStands([]);
    }
  };

  // 특정 반경 내의 게시대 로드
  const loadPostStandsWithinRadius = async (lat, lng, radius) => {
    try {
      const data = await api.getPostStandsWithinRadius(lat, lng, radius);
      setPostStands(data || []);
    } catch (error) {
      console.error('Failed to load post stands within radius:', error);
      setPostStands([]);
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
            className="form-select"
          >
            <option value="">전체</option>
            {Object.keys(regionData).sort().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        {selectedRegion && (
          <div className="subregion-selector">
            <label htmlFor="subregion-select">시군구 선택:</label>
            <select 
              id="subregion-select" 
              value={selectedSubRegion} 
              onChange={handleSubRegionChange}
              className="form-select"
            >
              <option value="">전체</option>
              {regionData[selectedRegion].subRegions.sort().map(subRegion => (
                <option key={subRegion} value={subRegion}>{subRegion}</option>
              ))}
            </select>
          </div>
        )}
        
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
            className="form-range"
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
        minZoom={7}
        maxZoom={18}
        scrollWheelZoom={true}
        maxBounds={[
          [32.0, 124.0], // 남서쪽 경계
          [39.0, 132.0]  // 북동쪽 경계
        ]}
        maxBoundsViscosity={1.0} // 경계를 벗어나지 못하게 함
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        <MapBoundary />
        
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
      
      <style jsx>{`
        .map-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .map-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .region-selector,
        .subregion-selector,
        .radius-selector {
          flex: 1;
          min-width: 200px;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        .form-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          font-size: 1rem;
        }
        
        .form-range {
          width: 100%;
        }
        
        .post-stands-count {
          padding: 0.5rem 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default MapView;
