import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { standsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UnifiedMap from '../components/UnifiedMap';
import './MapSearch.css';

const REGION_COORDS = {
  '경산시': [35.8250, 128.7414],
  '경주시': [35.8562, 129.2247],
  '고령군': [35.7273, 128.2623],
  '고성군': [34.9733, 128.3228],
  '구미시': [36.1195, 128.3445],
  '군위군': [36.2428, 128.5731],
  '거제시': [34.8806, 128.6211],
  '거창군': [35.6864, 127.9094],
  '김천시': [36.1399, 128.1138],
  '김해시': [35.2286, 128.8894],
  '남해군': [34.8375, 127.8925],
  '대구광역시': [35.8714, 128.6014],
  '문경시': [36.5864, 128.1867],
  '밀양시': [35.5036, 128.7461],
  '봉화군': [36.8930, 128.7324],
  '부산시': [35.1796, 129.0756],
  '사천시': [35.0036, 128.0642],
  '산청군': [35.4153, 127.8736],
  '상주시': [36.4109, 128.1591],
  '성주군': [35.9194, 128.2811],
  '안동시': [36.5684, 128.7294],
  '양산시': [35.3350, 129.0372],
  '영덕군': [36.4150, 129.3655],
  '영양군': [36.6667, 129.1124],
  '영주시': [36.8056, 128.6238],
  '영천시': [35.9733, 128.9386],
  '예천군': [36.6573, 128.4519],
  '울산시': [35.5384, 129.3114],
  '울진군': [36.9931, 129.4006],
  '의령군': [35.3222, 128.2619],
  '의성군': [36.3524, 128.6969],
  '진주시': [35.1800, 128.1076],
  '창녕군': [35.5444, 128.4925],
  '창원시': [35.2281, 128.6811],
  '청도군': [35.6476, 128.7355],
  '청송군': [36.4364, 129.0572],
  '칠곡군': [35.9952, 128.4019],
  '통영시': [34.8544, 128.4331],
  '포항시': [36.0190, 129.3435],
  '하동군': [35.0672, 127.7514],
  '함안군': [35.2722, 128.4064],
  '함양군': [35.5203, 127.7253],
  '합천군': [35.5664, 128.1656]
};

// 경북 지역
const GYEONGBUK_REGIONS = [
  '경산시', '경주시', '고령군', '구미시', '군위군', '김천시',
  '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군',
  '영양군', '영주시', '영천시', '예천군', '울진군', '의성군',
  '청도군', '청송군', '칠곡군', '포항시', '대구광역시'
].sort();

// 경남 지역
const GYEONGNAM_REGIONS = [
  '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시',
  '부산시', '사천시', '산청군', '양산시', '울산시', '의령군',
  '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군',
  '함양군', '합천군'
].sort();

function MapSearch() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stands, setStands] = useState([]);
  const [filteredStands, setFilteredStands] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 });
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedStand, setSelectedStand] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    region: '',
    address: '',
    description: '',
    imageFile: null,
    latitude: 0,
    longitude: 0
  });
  const [imagePreview, setImagePreview] = useState(null);

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
    let results = stands;
    
    // 지역 필터링
    if (selectedRegion) {
      results = results.filter(stand => stand.region === selectedRegion);
    }
    
    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      results = results.filter(stand => 
        (stand.name && stand.name.toLowerCase().includes(keyword)) ||
        (stand.address && stand.address.toLowerCase().includes(keyword))
      );
    }
    
    setFilteredStands(results);
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
      // 지역 선택 시 해당 지역 게시대만 필터링
      setFilteredStands(stands.filter(stand => stand.region === region));
    } else {
      // 지역 선택 해제 시 전체 표시
      setFilteredStands(stands);
    }
  };

  // 엑셀 다운로드
  const exportToExcel = () => {
    if (filteredStands.length === 0) {
      alert('다운로드할 게시대가 없습니다.');
      return;
    }

    const headers = ['이름', '지역', '주소', '위도', '경도', '설명'];
    const rows = filteredStands.map(stand => [
      stand.name || '',
      stand.region || '',
      stand.address || '',
      stand.latitude || '',
      stand.longitude || '',
      stand.description || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `게시대목록_${selectedRegion || '전체'}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const focusStand = (stand) => {
    if (stand.latitude && stand.longitude) {
      setMapCenter({ lat: stand.latitude, lng: stand.longitude });
      setMapZoom(16);
      setSelectedStand(stand);
    }
  };

  const handleEdit = (stand) => {
    setSelectedStand(stand);
    setEditFormData({
      name: stand.name,
      region: stand.region || '',
      address: stand.address || '',
      description: stand.description || '',
      imageFile: null,
      latitude: stand.latitude,
      longitude: stand.longitude
    });
    setImagePreview(stand.imageUrl || null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setEditFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('region', editFormData.region);
      formData.append('address', editFormData.address);
      formData.append('latitude', selectedStand.latitude);
      formData.append('longitude', selectedStand.longitude);
      formData.append('description', editFormData.description);
      
      if (editFormData.imageFile) {
        formData.append('image', editFormData.imageFile);
      }
      
      await standsAPI.updateWithFile(selectedStand.id, formData);
      
      alert('게시대가 수정되었습니다.');
      setShowEditModal(false);
      loadStands();
    } catch (error) {
      console.error('수정 실패:', error);
      alert('게시대 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (stand) => {
    if (!window.confirm(`"${stand.name}" 게시대를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await standsAPI.delete(stand.id);
      alert('게시대가 삭제되었습니다.');
      setSelectedStand(null);
      loadStands();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('게시대 삭제에 실패했습니다.');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 지도에 표시할 마커 데이터 변환
  const mapMarkers = filteredStands
    .filter(stand => stand.latitude && stand.longitude)
    .map(stand => {
      const imageUrl = stand.imageUrl;
      
      const naverMapUrl = stand.address 
        ? `https://map.naver.com/p/search/${encodeURIComponent(stand.address)}`
        : `https://map.naver.com/p?c=${stand.longitude},${stand.latitude},15,0,0,0,dh`;
      
      return {
        lat: stand.latitude,
        lng: stand.longitude,
        title: stand.name,
        content: `
          <div style="min-width: 200px; max-width: 300px; padding: 10px; word-wrap: break-word;">
            ${imageUrl ? `<img src="${imageUrl}" alt="${stand.name}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" onerror="this.style.display='none';">` : ''}
            <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-blue); font-size: 1rem; line-height: 1.3; word-break: break-word;">${stand.name}</h3>
            <p style="margin: 0.25rem 0; font-size: 0.9rem; line-height: 1.4; word-break: break-word;"><strong>주소:</strong> <a href="${naverMapUrl}" target="_blank" style="color: #03c75a; text-decoration: none;">${stand.address || '없음'} <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i></a></p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem; line-height: 1.4;"><strong>지역:</strong> ${stand.region || '없음'}</p>
            ${stand.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666; line-height: 1.4; word-break: break-word;">${stand.description}</p>` : ''}
            <button onclick="window.openRoadview(${stand.latitude}, ${stand.longitude})" style="margin-top: 8px; padding: 6px 12px; background: #03c75a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; width: 100%;"><i class="fas fa-street-view"></i> 로드뷰</button>
          </div>
        `
      };
    });

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
              <optgroup label="=== 경북 ===">
                {GYEONGBUK_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </optgroup>
              <optgroup label="=== 경남 ===">
                {GYEONGNAM_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </optgroup>
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
                  className={`map-search-stand-item ${selectedStand?.id === stand.id ? 'active' : ''}`}
                >
                  <div onClick={() => focusStand(stand)} style={{ flex: 1, cursor: 'pointer' }}>
                    <div className="map-search-stand-name">{stand.name}</div>
                    <div className="map-search-stand-address">{stand.address || '주소 정보 없음'}</div>
                    <span className="map-search-stand-region">{stand.region || '지역 정보 없음'}</span>
                  </div>
                  {isAuthenticated && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(stand); }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(stand); }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="map-search-stats-bar">
            <span className="map-search-stats-text">
              총 <span className="map-search-stats-number">{filteredStands.length}</span>개의 게시대
            </span>
            <button
              onClick={exportToExcel}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-file-excel"></i> 엑셀
            </button>
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
            onMapClick={() => {}}
            showTabs={true}
            defaultProvider="naver"
            autoFitBounds={false}
            roadviewMode="selector"
            tabPosition="bottom-right"
            showPermanentLabels={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2563eb' }}>게시대 수정</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>지역 *</label>
                <select
                  name="region"
                  value={editFormData.region}
                  onChange={handleEditInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">지역 선택</option>
                  <optgroup label="=== 경북 ===">
                    {GYEONGBUK_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </optgroup>
                  <optgroup label="=== 경남 ===">
                    {GYEONGNAM_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>주소</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>설명</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: '0.5rem' }}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem'
                    }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  수정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapSearch;
