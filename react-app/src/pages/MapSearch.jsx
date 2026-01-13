import React, { useState, useEffect } from 'react';
import { standsAPI } from '../services/api';
import UnifiedMap from '../components/UnifiedMap';
import './MapSearch.css';

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
  const [stands, setStands] = useState([]);
  const [filteredStands, setFilteredStands] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 });
  const [mapZoom, setMapZoom] = useState(7);

  useEffect(() => {
    loadStands();
  }, []);

  const loadStands = async () => {
    try {
      const data = await standsAPI.getAll();
      setStands(data);
      setFilteredStands(data);
    } catch (error) {
      console.error('게시대 데이터 로드 실패:', error);
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
      setMapCenter({ lat, lng });
      setMapZoom(13);
    }
  };

  const focusStand = (stand) => {
    if (stand.latitude && stand.longitude) {
      setMapCenter({ lat: stand.latitude, lng: stand.longitude });
      setMapZoom(16);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 지도에 표시할 마커 데이터 변환
  const mapMarkers = filteredStands
    .filter(stand => stand.latitude && stand.longitude)
    .map(stand => ({
      lat: stand.latitude,
      lng: stand.longitude,
      content: `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-blue);">${stand.name}</h3>
          <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>주소:</strong> ${stand.address || '없음'}</p>
          <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>지역:</strong> ${stand.region || '없음'}</p>
          ${stand.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666;">${stand.description}</p>` : ''}
        </div>
      `
    }));

  return (
    <div className="map-search-page">
      <div className="map-search-container">
        {/* Sidebar */}
        <aside className={`map-search-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="map-search-sidebar-header">
            <h2 className="map-search-sidebar-title">게시대 검색</h2>
            <select
              className="map-search-region-select"
              value={selectedRegion}
              onChange={moveToRegion}
            >
              <option value="">지역 선택</option>
              {Object.keys(REGION_COORDS).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <div className="map-search-box">
              <input
                type="text"
                className="map-search-input"
                placeholder="게시대 이름 또는 주소로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="map-search-btn" onClick={handleSearch}>검색</button>
            </div>
          </div>

          <div className="map-search-sidebar-content">
            {filteredStands.length === 0 ? (
              <div className="map-search-no-results">검색 결과가 없습니다.</div>
            ) : (
              filteredStands.map(stand => (
                <div
                  key={stand.id}
                  className="map-search-stand-item"
                  onClick={() => focusStand(stand)}
                >
                  <div className="map-search-stand-name">{stand.name}</div>
                  <div className="map-search-stand-address">{stand.address || '주소 정보 없음'}</div>
                  <span className="map-search-stand-region">{stand.region || '지역 정보 없음'}</span>
                </div>
              ))
            )}
          </div>

          <div className="map-search-stats-bar">
            <span className="map-search-stats-text">
              총 <span className="map-search-stats-number">{filteredStands.length}</span>개의 게시대
            </span>
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          className="map-search-toggle-btn"
          onClick={toggleSidebar}
          title="사이드바 토글"
        >
          <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
        </button>

        {/* Map with Tabs */}
        <div className="map-search-map">
          <UnifiedMap
            center={mapCenter}
            zoom={mapZoom}
            markers={mapMarkers}
            onMapClick={() => {}} // 빈 함수라도 전달해야 카카오맵 클릭 이벤트가 작동
            showTabs={true}
            defaultProvider="leaflet"
            roadviewMode="selector"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default MapSearch;
