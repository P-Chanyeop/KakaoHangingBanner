// 지역 및 시군구 데이터
// API 기본 URL
const API_BASE_URL = 'http://localhost:8081/api';

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

// 시군구별 좌표 데이터
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

// 전역 변수
let map;
let markers = [];
let currentPostStands = [];
let selectedPostStand = null;
let allPostStands = []; // 모든 게시대 데이터 저장
let tempMarker = null; // 임시 마커

// 모달 요소
let postStandDetailModal;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initModals();
    initEventListeners();
    loadAllPostStands();
});

// 모달 초기화
function initModals() {
    postStandDetailModal = new bootstrap.Modal(document.getElementById('postStandDetailModal'));
}

// 지도 초기화
function initMap() {
    // 한국 중심 좌표
    const koreaCenter = [36.5, 127.8];
    
    // 지도 생성
    map = L.map('map', {
        center: koreaCenter,
        zoom: 7,
        minZoom: 7,
        maxZoom: 18,
        maxBounds: [
            [32.0, 124.0], // 남서쪽 경계
            [39.0, 132.0]  // 북동쪽 경계
        ],
        maxBoundsViscosity: 1.0 // 경계를 벗어나지 못하게 함
    });
    
    // 타일 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 지도 이동 완료 이벤트
    map.on('moveend', function() {
        // 현재 지도 영역 내의 게시대 표시
        updateVisiblePostStands();
    });
    
    // 지도 클릭 이벤트
    map.on('click', function(e) {
        console.log('지도 클릭: ', e.latlng);
        
        // 위도/경도 필드 업데이트
        document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
        document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
        
        // 임시 마커 표시
        if (tempMarker) {
            map.removeLayer(tempMarker);
        }
        
        tempMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: L.icon({
                iconUrl: '/images/bannerPin.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })
        }).addTo(map);
    });
    
    console.log("지도가 초기화되었습니다.");
}
// 이벤트 리스너 초기화
function initEventListeners() {
    // 지역 선택 변경 이벤트
    document.getElementById('regionSelect').addEventListener('change', function() {
        const region = this.value;
        updateSubRegionSelect(region);
        
        if (region) {
            map.setView(regionData[region].center, 10);
            loadPostStandsByRegion(region);
        } else {
            map.setView([36.5, 127.8], 7);
            loadAllPostStands();
        }
    });
    
    // 시군구 선택 변경 이벤트
    document.getElementById('subRegionSelect').addEventListener('change', function() {
        const subRegion = this.value;
        const region = document.getElementById('regionSelect').value;
        
        if (subRegion) {
            map.setView(subRegionCoordinates[subRegion], 13);
            loadPostStandsBySubRegion(region, subRegion);
        } else if (region) {
            map.setView(regionData[region].center, 10);
            loadPostStandsByRegion(region);
        }
    });
    
    // 게시대 저장 버튼 클릭 이벤트
    document.getElementById('savePostStandBtn').addEventListener('click', function() {
        savePostStand();
    });
    
    // 게시대 수정 버튼 클릭 이벤트
    document.getElementById('editPostStandBtn').addEventListener('click', function() {
        if (selectedPostStand) {
            fillPostStandForm(selectedPostStand);
            postStandDetailModal.hide();
        }
    });
    
    // 게시대 삭제 버튼 클릭 이벤트
    document.getElementById('deletePostStandBtn').addEventListener('click', function() {
        if (selectedPostStand && confirm('정말로 이 게시대를 삭제하시겠습니까?')) {
            deletePostStand(selectedPostStand.id);
        }
    });
}

// 시군구 선택 업데이트
function updateSubRegionSelect(region) {
    const subRegionContainer = document.getElementById('subRegionContainer');
    const subRegionSelect = document.getElementById('subRegionSelect');
    
    // 기존 옵션 제거
    subRegionSelect.innerHTML = '<option value="">전체</option>';
    
    if (region && regionData[region]) {
        // 시군구 옵션 추가
        regionData[region].subRegions.sort().forEach(subRegion => {
            const option = document.createElement('option');
            option.value = subRegion;
            option.textContent = subRegion;
            subRegionSelect.appendChild(option);
        });
        
        // 시군구 선택 컨테이너 표시
        subRegionContainer.style.display = 'block';
    } else {
        // 시군구 선택 컨테이너 숨김
        subRegionContainer.style.display = 'none';
    }
}

// 모든 게시대 로드
function loadAllPostStands() {
    fetch(`${API_BASE_URL}/stands`)
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            allPostStands = data || [];
            updateVisiblePostStands();
        })
        .catch(error => {
            console.error('Failed to load post stands:', error);
            // 오류 시 빈 배열로 처리
            allPostStands = [];
            currentPostStands = [];
            updateMarkers([]);
            updatePostStandList([]);
            updatePostStandCount(0);
            
            // 개발 환경에서는 더미 데이터로 테스트
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('개발 환경에서 더미 데이터 사용');
                const dummyData = generateDummyData();
                allPostStands = dummyData;
                updateVisiblePostStands();
            }
        });
}

// 특정 지역의 게시대 로드
function loadPostStandsByRegion(region) {
    fetch(`${API_BASE_URL}/stands?region=${region}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            allPostStands = data || [];
            updateVisiblePostStands();
        })
        .catch(error => {
            console.error(`Failed to load post stands for region ${region}:`, error);
            // 오류 시 빈 배열로 처리
            allPostStands = [];
            currentPostStands = [];
            updateMarkers([]);
            updatePostStandList([]);
            updatePostStandCount(0);
            
            // 개발 환경에서는 더미 데이터로 테스트
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('개발 환경에서 더미 데이터 사용');
                const dummyData = generateDummyData().filter(item => item.region === region);
                allPostStands = dummyData;
                updateVisiblePostStands();
            }
        });
}

// 특정 시군구의 게시대 로드
function loadPostStandsBySubRegion(region, subRegion) {
    fetch(`${API_BASE_URL}/stands?region=${region}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            // 주소에 시군구명이 포함된 게시대만 필터링
            const filteredData = (data || []).filter(stand => 
                stand.address && stand.address.includes(subRegion)
            );
            
            allPostStands = filteredData;
            updateVisiblePostStands();
        })
        .catch(error => {
            console.error(`Failed to load post stands for subregion ${subRegion}:`, error);
            // 오류 시 빈 배열로 처리
            allPostStands = [];
            currentPostStands = [];
            updateMarkers([]);
            updatePostStandList([]);
            updatePostStandCount(0);
            
            // 개발 환경에서는 더미 데이터로 테스트
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('개발 환경에서 더미 데이터 사용');
                const dummyData = generateDummyData()
                    .filter(item => item.region === region && item.address.includes(subRegion));
                allPostStands = dummyData;
                updateVisiblePostStands();
            }
        });
}
// 현재 지도 영역 내의 게시대 업데이트
function updateVisiblePostStands() {
    if (!map || allPostStands.length === 0) return;
    
    const bounds = map.getBounds();
    
    // 현재 지도 영역 내에 있는 게시대만 필터링
    const visiblePostStands = allPostStands.filter(stand => {
        if (!stand.latitude || !stand.longitude) return false;
        return bounds.contains(L.latLng(stand.latitude, stand.longitude));
    });
    
    currentPostStands = visiblePostStands;
    updateMarkers(visiblePostStands);
    updatePostStandList(visiblePostStands);
    updatePostStandCount(visiblePostStands.length);
}

// 두 지점 간의 거리 계산 (Haversine 공식)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

// 마커 업데이트
function updateMarkers(postStands) {
    // 기존 마커 제거
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // 커스텀 마커 아이콘 생성
    const bannerIcon = L.icon({
        iconUrl: '/images/bannerPin.png',
        iconSize: [32, 32],     // 아이콘 크기 (필요에 따라 조정)
        iconAnchor: [16, 32],   // 아이콘의 "꼭지점" 위치 (필요에 따라 조정)
        popupAnchor: [0, -32]   // 팝업이 나타날 위치 (필요에 따라 조정)
    });
    
    // 새 마커 추가
    postStands.forEach(postStand => {
        if (postStand.latitude && postStand.longitude) {
            const marker = L.marker([postStand.latitude, postStand.longitude], { icon: bannerIcon })
                .addTo(map)
                .bindPopup(createMarkerPopup(postStand));
            
            marker.on('click', function() {
                selectPostStand(postStand);
            });
            
            markers.push(marker);
        }
    });
}

// 마커 팝업 HTML 생성
function createMarkerPopup(postStand) {
    let popupContent = `
        <div class="marker-popup">
            <h3>${postStand.name}</h3>
            <p>${postStand.address}</p>
            <button onclick="selectPostStandById(${postStand.id})">상세 보기</button>
        </div>
    `;
    
    return popupContent;
}

// 게시대 목록 업데이트
function updatePostStandList(postStands) {
    const postStandList = document.getElementById('postStandList');
    postStandList.innerHTML = '';
    
    if (postStands.length === 0) {
        postStandList.innerHTML = '<div class="list-group-item">표시할 게시대가 없습니다.</div>';
        return;
    }
    
    postStands.forEach(postStand => {
        const item = document.createElement('div');
        item.className = 'list-group-item post-stand-item d-flex justify-content-between align-items-center';
        item.dataset.id = postStand.id;
        
        let itemContent = `
            <div class="post-stand-item-content">
                <h5 class="mb-1">${postStand.name}</h5>
                <p class="mb-1 text-muted small">${postStand.address}</p>
                <span class="badge bg-success">${postStand.region}</span>
            </div>
            <div class="post-stand-thumbnail">
                <img src="/images/bannerPin.png" alt="${postStand.name}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px;">
            </div>
        `;
        
        item.innerHTML = itemContent;
        
        item.addEventListener('click', function() {
            selectPostStand(postStand);
        });
        
        postStandList.appendChild(item);
    });
}

// 게시대 개수 업데이트
function updatePostStandCount(count) {
    document.getElementById('postStandCount').textContent = count;
}
// 게시대 선택
function selectPostStand(postStand) {
    selectedPostStand = postStand;
    
    // 목록에서 선택 상태 업데이트
    document.querySelectorAll('.post-stand-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id == postStand.id) {
            item.classList.add('active');
        }
    });
    
    // 상세 정보 모달 업데이트
    document.getElementById('postStandTitle').textContent = postStand.name;
    document.getElementById('postStandAddress').textContent = postStand.address;
    document.getElementById('postStandRegion').textContent = postStand.region;
    document.getElementById('postStandCoords').textContent = `${postStand.latitude}, ${postStand.longitude}`;
    
    const descriptionElement = document.getElementById('postStandDescription');
    if (postStand.description) {
        descriptionElement.innerHTML = `<h5 class="mt-3">설명</h5><p>${postStand.description}</p>`;
    } else {
        descriptionElement.innerHTML = '';
    }
    
    const imageElement = document.getElementById('postStandImage');
    // 항상 bannerPin.png 이미지 사용
    imageElement.src = '/images/bannerPin.png';
    imageElement.style.display = 'block';
    
    // 모달 표시
    postStandDetailModal.show();
}

// ID로 게시대 선택 (마커 팝업에서 호출)
function selectPostStandById(id) {
    const postStand = currentPostStands.find(p => p.id === id);
    if (postStand) {
        selectPostStand(postStand);
    }
}

// 게시대 폼에 데이터 채우기
function fillPostStandForm(postStand) {
    document.getElementById('postStandId').value = postStand.id;
    document.getElementById('name').value = postStand.name;
    document.getElementById('address').value = postStand.address;
    document.getElementById('latitude').value = postStand.latitude;
    document.getElementById('longitude').value = postStand.longitude;
    document.getElementById('region').value = postStand.region;
    document.getElementById('description').value = postStand.description || '';
    
    // 지도에 위치 표시
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    
    tempMarker = L.marker([postStand.latitude, postStand.longitude], {
        icon: L.icon({
            iconUrl: '/images/bannerPin.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }).addTo(map);
    
    // 지도 중심 이동
    map.setView([postStand.latitude, postStand.longitude], 15);
}

// 게시대 저장 (등록/수정)
function savePostStand() {
    const postStandId = document.getElementById('postStandId').value;
    
    // 폼 데이터 수집
    const postStandData = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        region: document.getElementById('region').value,
        imageUrl: '/images/bannerPin.png', // 항상 고정된 이미지 URL 사용
        description: document.getElementById('description').value || null
    };
    
    // 필수 필드 검증
    if (!postStandData.name || !postStandData.address || !postStandData.region || 
        isNaN(postStandData.latitude) || isNaN(postStandData.longitude)) {
        alert('이름, 주소, 위치(위도/경도), 지역은 필수 입력 항목입니다.');
        return;
    }
    
    // 위도/경도 범위 검증
    if (postStandData.latitude < -90 || postStandData.latitude > 90 || 
        postStandData.longitude < -180 || postStandData.longitude > 180) {
        alert('위도는 -90에서 90 사이, 경도는 -180에서 180 사이여야 합니다.');
        return;
    }
    
    // API 호출 (등록 또는 수정)
    const url = postStandId ? `${API_BASE_URL}/stands/${postStandId}` : `${API_BASE_URL}/stands`;
    const method = postStandId ? 'PUT' : 'POST';
    
    console.log(`API 요청: ${method} ${url}`);
    console.log('요청 데이터:', postStandData);
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postStandData)
    })
    .then(response => {
        console.log('응답 상태:', response.status);
        if (!response.ok) {
            throw new Error(`게시대 저장 중 오류가 발생했습니다. 상태 코드: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('응답 데이터:', data);
        
        // 폼 초기화
        document.getElementById('postStandForm').reset();
        document.getElementById('postStandId').value = '';
        
        // 임시 마커 제거
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
        
        // 데이터 새로고침
        loadAllPostStands();
        
        // 성공 메시지
        alert(postStandId ? '게시대가 수정되었습니다.' : '새 게시대가 등록되었습니다.');
    })
    .catch(error => {
        console.error('Failed to save post stand:', error);
        
        // 개발 환경에서는 더미 데이터로 테스트
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('개발 환경에서 더미 저장 처리');
            
            // 폼 초기화
            document.getElementById('postStandForm').reset();
            document.getElementById('postStandId').value = '';
            
            // 임시 마커 제거
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
            
            if (postStandId) {
                // 수정 모드
                const index = allPostStands.findIndex(p => p.id == postStandId);
                if (index !== -1) {
                    allPostStands[index] = { ...allPostStands[index], ...postStandData };
                }
            } else {
                // 등록 모드
                const newId = allPostStands.length > 0 ? 
                    Math.max(...allPostStands.map(p => p.id)) + 1 : 1;
                
                const newPostStand = {
                    id: newId,
                    ...postStandData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                allPostStands.push(newPostStand);
            }
            
            // 데이터 업데이트
            updateVisiblePostStands();
            
            // 성공 메시지
            alert(postStandId ? '게시대가 수정되었습니다.' : '새 게시대가 등록되었습니다.');
        } else {
            alert(error.message);
        }
    });
}

// 게시대 삭제
function deletePostStand(id) {
    fetch(`${API_BASE_URL}/stands/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('게시대 삭제 중 오류가 발생했습니다.');
        }
        
        // 모달 닫기
        postStandDetailModal.hide();
        
        // 데이터 새로고침
        loadAllPostStands();
        
        // 성공 메시지
        alert('게시대가 삭제되었습니다.');
    })
    .catch(error => {
        console.error('Failed to delete post stand:', error);
        
        // 개발 환경에서는 더미 데이터로 테스트
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('개발 환경에서 더미 삭제 처리');
            
            // 모달 닫기
            postStandDetailModal.hide();
            
            // 데이터에서 삭제
            allPostStands = allPostStands.filter(p => p.id != id);
            
            // 데이터 업데이트
            updateVisiblePostStands();
            
            // 성공 메시지
            alert('게시대가 삭제되었습니다.');
        } else {
            alert(error.message);
        }
    });
}

// 개발 환경용 더미 데이터 생성
function generateDummyData() {
    const dummyData = [];
    const bannerImageUrl = '/images/bannerPin.png';
    
    // 대구 지역 더미 데이터
    dummyData.push({
        id: 1,
        name: '대구 중구 게시대',
        address: '대구 중구 동성로',
        latitude: 35.8691,
        longitude: 128.5975,
        region: '대구',
        imageUrl: bannerImageUrl,
        description: '대구 중구 동성로 인근 게시대입니다.',
        createdAt: '2023-01-01T00:00:00',
        updatedAt: '2023-01-01T00:00:00'
    });
    
    dummyData.push({
        id: 2,
        name: '대구 수성구 게시대',
        address: '대구 수성구 범어동',
        latitude: 35.8582,
        longitude: 128.6309,
        region: '대구',
        imageUrl: bannerImageUrl,
        description: '대구 수성구 범어동 인근 게시대입니다.',
        createdAt: '2023-01-02T00:00:00',
        updatedAt: '2023-01-02T00:00:00'
    });
    
    // 경북 지역 더미 데이터
    dummyData.push({
        id: 3,
        name: '경북 포항시 게시대',
        address: '경북 포항시 남구 연일읍',
        latitude: 36.0199,
        longitude: 129.3434,
        region: '경북',
        imageUrl: bannerImageUrl,
        description: '경북 포항시 남구 연일읍 인근 게시대입니다.',
        createdAt: '2023-01-03T00:00:00',
        updatedAt: '2023-01-03T00:00:00'
    });
    
    dummyData.push({
        id: 4,
        name: '경북 경주시 게시대',
        address: '경북 경주시 황남동',
        latitude: 35.8562,
        longitude: 129.2246,
        region: '경북',
        imageUrl: bannerImageUrl,
        description: '경북 경주시 황남동 인근 게시대입니다.',
        createdAt: '2023-01-04T00:00:00',
        updatedAt: '2023-01-04T00:00:00'
    });
    
    // 경남 지역 더미 데이터
    dummyData.push({
        id: 5,
        name: '경남 창원시 게시대',
        address: '경남 창원시 의창구',
        latitude: 35.2540,
        longitude: 128.6411,
        region: '경남',
        imageUrl: bannerImageUrl,
        description: '경남 창원시 의창구 인근 게시대입니다.',
        createdAt: '2023-01-05T00:00:00',
        updatedAt: '2023-01-05T00:00:00'
    });
    
    dummyData.push({
        id: 6,
        name: '경남 진주시 게시대',
        address: '경남 진주시 평거동',
        latitude: 35.1795,
        longitude: 128.1076,
        region: '경남',
        imageUrl: bannerImageUrl,
        description: '경남 진주시 평거동 인근 게시대입니다.',
        createdAt: '2023-01-06T00:00:00',
        updatedAt: '2023-01-06T00:00:00'
    });
    
    return dummyData;
}

// 전역 함수로 노출 (마커 팝업에서 호출하기 위함)
window.selectPostStandById = function(id) {
    const postStand = currentPostStands.find(p => p.id === id);
    if (postStand) {
        selectPostStand(postStand);
    }
};
