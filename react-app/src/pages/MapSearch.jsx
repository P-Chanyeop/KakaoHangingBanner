import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { standsAPI } from '../services/api';
import './MapSearch.css';
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

function MapSearch() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [stands, setStands] = useState([]);
  const [filteredStands, setFilteredStands] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    initMap();
    loadStands();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [filteredStands]);

  const initMap = () => {
    if (mapInstance.current) return;
    if (!mapRef.current) return;

    // 기존 지도 컨테이너 정리
    mapRef.current._leaflet_id = undefined;

    mapInstance.current = L.map(mapRef.current, {
      center: [35.8714, 128.6014],
      zoom: 10,
      maxBounds: [
        [33.0, 124.5],
        [38.9, 132.0]
      ],
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);
  };

  const loadStands = async () => {
    try {
      const data = await standsAPI.getAll();
      setStands(data);
      setFilteredStands(data);
    } catch (error) {
      console.error('게시대 데이터 로드 실패:', error);
    }
  };

  const updateMarkers = () => {
    // 기존 마커 제거
    markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
    markersRef.current = [];

    // 새 마커 추가
    filteredStands.forEach(stand => {
      if (stand.latitude && stand.longitude) {
        const marker = L.marker([stand.latitude, stand.longitude])
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-blue);">${stand.name}</h3>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>주소:</strong> ${stand.address || '없음'}</p>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>지역:</strong> ${stand.region || '없음'}</p>
              ${stand.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666;">${stand.description}</p>` : ''}
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    // 마커가 있으면 지도를 마커들이 모두 보이도록 조정
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setFilteredStands(stands);
      return;
    }

    try {
      const results = await standsAPI.search(searchKeyword);
      setFilteredStands(results);
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const moveToRegion = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);

    if (region && REGION_COORDS[region]) {
      const [lat, lng] = REGION_COORDS[region];
      mapInstance.current.setView([lat, lng], 12);
    }
  };

  const focusStand = (stand) => {
    if (stand.latitude && stand.longitude) {
      mapInstance.current.setView([stand.latitude, stand.longitude], 16);

      const marker = markersRef.current.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === stand.latitude && latLng.lng === stand.longitude;
      });

      if (marker) {
        marker.openPopup();
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 350);
  };

  return (
    <div className="map-page">
      <div className="map-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">게시대 검색</h2>
          <select
            className="region-select"
            value={selectedRegion}
            onChange={moveToRegion}
          >
            <option value="">지역 선택</option>
            {Object.keys(REGION_COORDS).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="게시대 이름 또는 주소로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>검색</button>
          </div>
        </div>

        <div className="sidebar-content">
          {filteredStands.length === 0 ? (
            <div className="no-results">검색 결과가 없습니다.</div>
          ) : (
            filteredStands.map(stand => (
              <div
                key={stand.id}
                className="stand-item"
                onClick={() => focusStand(stand)}
              >
                <div className="stand-name">{stand.name}</div>
                <div className="stand-address">{stand.address || '주소 정보 없음'}</div>
                <span className="stand-region">{stand.region || '지역 정보 없음'}</span>
              </div>
            ))
          )}
        </div>

        <div className="stats-bar">
          <span className="stats-text">
            총 <span className="stats-number">{filteredStands.length}</span>개의 게시대
          </span>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        title="사이드바 토글"
      >
        <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
      </button>

      {/* Map */}
      <div ref={mapRef} id="map"></div>
      </div>
    </div>
  );
}

export default MapSearch;
