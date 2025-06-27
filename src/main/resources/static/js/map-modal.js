// 모달 관련 코드
document.addEventListener('DOMContentLoaded', function() {
    // 모달 설정
    const postStandFormModalEl = document.getElementById('postStandFormModal');
    const postStandFormModal = new bootstrap.Modal(postStandFormModalEl, {
        backdrop: 'static',
        keyboard: false
    });
    
    // 새 게시대 등록 버튼 클릭 이벤트
    document.getElementById('addPostStandBtn').addEventListener('click', function() {
        // 폼 초기화
        document.getElementById('postStandForm').reset();
        document.getElementById('postStandId').value = '';
        document.getElementById('formTitle').textContent = '새 게시대 등록';
        
        // 현재 지도 중심 좌표로 위치 설정
        const center = map.getCenter();
        document.getElementById('latitude').value = center.lat.toFixed(6);
        document.getElementById('longitude').value = center.lng.toFixed(6);
        
        // 현재 선택된 지역 설정
        const selectedRegion = document.getElementById('regionSelect').value;
        if (selectedRegion) {
            document.getElementById('region').value = selectedRegion;
        }
        
        // 현재 중심 위치에 임시 마커 표시
        if (window.tempMarker) {
            map.removeLayer(window.tempMarker);
        }
        window.tempMarker = L.marker([center.lat, center.lng], {
            icon: L.icon({
                iconUrl: '/images/bannerPin.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })
        }).addTo(map);
        
        // 모달 표시
        postStandFormModal.show();
    });
    
    // 게시대 수정 버튼 클릭 이벤트
    document.getElementById('editPostStandBtn').addEventListener('click', function() {
        if (selectedPostStand) {
            // 폼 데이터 설정
            document.getElementById('postStandId').value = selectedPostStand.id;
            document.getElementById('formTitle').textContent = '게시대 수정';
            document.getElementById('name').value = selectedPostStand.name;
            document.getElementById('address').value = selectedPostStand.address;
            document.getElementById('latitude').value = selectedPostStand.latitude;
            document.getElementById('longitude').value = selectedPostStand.longitude;
            document.getElementById('region').value = selectedPostStand.region;
            document.getElementById('description').value = selectedPostStand.description || '';
            
            // 기존 위치에 임시 마커 표시
            if (window.tempMarker) {
                map.removeLayer(window.tempMarker);
            }
            window.tempMarker = L.marker([selectedPostStand.latitude, selectedPostStand.longitude], {
                icon: L.icon({
                    iconUrl: '/images/bannerPin.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                })
            }).addTo(map);
            
            // 상세 정보 모달 닫기
            bootstrap.Modal.getInstance(document.getElementById('postStandDetailModal')).hide();
            
            // 폼 모달 표시
            postStandFormModal.show();
        }
    });
    
    // 모달이 닫힐 때 이벤트
    postStandFormModalEl.addEventListener('hidden.bs.modal', function() {
        // 임시 마커 제거
        if (window.tempMarker) {
            map.removeLayer(window.tempMarker);
            window.tempMarker = null;
        }
    });
    
    // 저장 버튼 클릭 이벤트
    document.getElementById('savePostStandBtn').addEventListener('click', function() {
        savePostStand();
    });
    
    // 모달 내부 클릭 이벤트가 지도로 전파되지 않도록 방지
    postStandFormModalEl.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
