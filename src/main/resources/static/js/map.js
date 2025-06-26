let map;
let markers = [];
let currentPosition = null;
let selectedStandId = null;

// 지도 초기화
function initMap() {
    // 서울 중심 좌표
    const defaultCenter = [37.5665, 126.9780];
    
    map = L.map('map').setView(defaultCenter, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                currentPosition = [latitude, longitude];
                
                // 현재 위치로 지도 이동
                map.setView(currentPosition, 14);
                
                // 현재 위치 마커 추가
                L.marker(currentPosition, {
                    icon: L.divIcon({
                        className: 'current-location',
                        html: '<div class="current-marker"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(map)
                .bindPopup('현재 위치')
                .openPopup();
            },
            (error) => {
                console.error('위치 정보를 가져오는데 실패했습니다:', error);
            }
        );
    }
    
    // 지도 클릭 이벤트
    map.on('click', function() {
        closeDetail();
    });
}

// 게시대 데이터 로드 및 마커 표시
function loadStands(stands) {
    // 기존 마커 제거
    clearMarkers();
    
    // 게시대 목록 업데이트
    updateStandsList(stands);
    
    // 새 마커 추가
    stands.forEach(stand => {
        addMarker(stand);
    });
}

// 마커 추가
function addMarker(stand) {
    const marker = L.marker([stand.latitude, stand.longitude])
        .addTo(map)
        .bindPopup(`<b>${stand.name}</b><br>${stand.address}`);
    
    marker.on('click', function() {
        selectStand(stand.id);
    });
    
    markers.push({
        id: stand.id,
        marker: marker
    });
}

// 모든 마커 제거
function clearMarkers() {
    markers.forEach(item => {
        map.removeLayer(item.marker);
    });
    markers = [];
}

// 게시대 목록 업데이트
function updateStandsList(stands) {
    const listElement = document.getElementById('stands-list');
    listElement.innerHTML = '';
    
    stands.forEach(stand => {
        const li = document.createElement('li');
        li.className = 'stand-item';
        li.dataset.id = stand.id;
        li.onclick = function() { selectStand(stand.id); };
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = stand.name;
        
        const addressSpan = document.createElement('span');
        addressSpan.className = 'stand-address';
        addressSpan.textContent = stand.address;
        
        li.appendChild(nameSpan);
        li.appendChild(addressSpan);
        listElement.appendChild(li);
    });
}

// 게시대 선택
function selectStand(id) {
    selectedStandId = id;
    
    // 서버에서 상세 정보 가져오기
    fetch(`/api/stands/${id}`)
        .then(response => response.json())
        .then(stand => {
            // 상세 정보 표시
            document.getElementById('detail-name').textContent = stand.name;
            document.getElementById('detail-address').textContent = stand.address;
            document.getElementById('detail-description').textContent = stand.description || '설명 없음';
            
            // 상세 패널 표시
            document.getElementById('stand-detail').classList.remove('hidden');
            
            // 지도에서 해당 위치로 이동
            map.setView([stand.latitude, stand.longitude], 16);
            
            // 해당 마커 강조
            const markerObj = markers.find(m => m.id === id);
            if (markerObj) {
                markerObj.marker.openPopup();
            }
            
            // 목록에서 해당 항목 강조
            document.querySelectorAll('.stand-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.id == id) {
                    item.classList.add('active');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        })
        .catch(error => {
            console.error('게시대 정보를 가져오는데 실패했습니다:', error);
        });
}

// 상세 정보 패널 닫기
function closeDetail() {
    document.getElementById('stand-detail').classList.add('hidden');
    selectedStandId = null;
    
    // 마커 팝업 닫기
    markers.forEach(item => {
        item.marker.closePopup();
    });
    
    // 목록에서 강조 제거
    document.querySelectorAll('.stand-item').forEach(item => {
        item.classList.remove('active');
    });
}

// 지역별 필터링
function filterByRegion() {
    const region = document.getElementById('region-select').value;
    window.location.href = region ? `/stands?region=${region}` : '/stands';
}

// 반경 검색
function searchByRadius() {
    if (!currentPosition) {
        alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        return;
    }
    
    const radius = document.getElementById('radius-input').value;
    if (!radius || radius <= 0) {
        alert('유효한 반경을 입력해주세요.');
        return;
    }
    
    const [lat, lng] = currentPosition;
    window.location.href = `/stands?lat=${lat}&lng=${lng}&radius=${radius}`;
}

// 게시대 수정
function editStand() {
    if (selectedStandId) {
        window.location.href = `/stands/${selectedStandId}/edit`;
    }
}

// 게시대 삭제
function deleteStand() {
    if (!selectedStandId) return;
    
    if (confirm('정말로 이 게시대를 삭제하시겠습니까?')) {
        fetch(`/api/stands/${selectedStandId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('게시대가 삭제되었습니다.');
                window.location.reload();
            } else {
                throw new Error('게시대 삭제에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('오류:', error);
            alert(error.message);
        });
    }
}
