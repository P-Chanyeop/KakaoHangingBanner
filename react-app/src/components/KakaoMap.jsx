import React, { useEffect, useRef, useState } from 'react';
import './KakaoMap.css';

function KakaoMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' },
  showRoadview = true,
  roadviewMode = 'toggle', // 'toggle' or 'selector'
  roadviewTarget = null, // 로드뷰를 보여줄 특정 좌표 (핀 위치)
  showPermanentLabels = false, // 상시 라벨 표시 여부
  sidebarCollapsed = true // 사이드바 상태 (모바일에서 버튼 가시성 제어)
}) {
  const mapRef = useRef(null);
  const roadviewRef = useRef(null);
  const mapInstance = useRef(null);
  const roadviewInstance = useRef(null);
  const markersRef = useRef([]);
  const isSelectingRoadviewRef = useRef(false); // ref로 상태 추적
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);
  const [isSelectingRoadview, setIsSelectingRoadview] = useState(false);
  const [roadviewAvailable, setRoadviewAvailable] = useState(true);

  // ref 동기화
  useEffect(() => {
    isSelectingRoadviewRef.current = isSelectingRoadview;
  }, [isSelectingRoadview]);

  // 카카오맵 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았습니다. index.html에 API 키를 설정했는지 확인하세요.');
      return;
    }

    const container = mapRef.current;
    // 초기 위치 설정: 게시대 등록 페이지에서만 roadviewTarget 사용
    const isStandFormPage = roadviewMode === 'toggle'; // 게시대 등록 페이지는 toggle 모드
    const initialCenter = (isStandFormPage && roadviewTarget) 
      ? new window.kakao.maps.LatLng(roadviewTarget.lat, roadviewTarget.lng)
      : new window.kakao.maps.LatLng(center.lat, center.lng);
    
    const initialLevel = (isStandFormPage && roadviewTarget) 
      ? 3 // 핀이 있으면 확대
      : (zoom === 7 ? 14 : zoom === 13 ? 6 : zoom === 16 ? 3 : zoom === 12 ? 6 : Math.max(1, 15 - zoom));

    const options = {
      center: initialCenter,
      level: initialLevel
    };

    mapInstance.current = new window.kakao.maps.Map(container, options);

    // 초기 로딩 시 roadviewTarget이 있으면 해당 위치로 이동
    if (roadviewTarget) {
      const targetLatLng = new window.kakao.maps.LatLng(roadviewTarget.lat, roadviewTarget.lng);
      mapInstance.current.setCenter(targetLatLng);
      mapInstance.current.setLevel(3);
    }

    // 로드뷰 초기화
    if (showRoadview && window.kakao.maps.Roadview) {
      roadviewInstance.current = new window.kakao.maps.Roadview(roadviewRef.current);
      
      // 로드뷰 초기 위치 설정
      const roadviewClient = new window.kakao.maps.RoadviewClient();
      roadviewClient.getNearestPanoId(new window.kakao.maps.LatLng(center.lat, center.lng), 50, function(panoId) {
        if (panoId === null) {
          setRoadviewAvailable(false);
        } else {
          roadviewInstance.current.setPanoId(panoId, new window.kakao.maps.LatLng(center.lat, center.lng));
        }
      });
    }

    // 한국 범위로 제한
    const bounds = new window.kakao.maps.LatLngBounds(
      new window.kakao.maps.LatLng(33.0, 124.5), // 남서쪽
      new window.kakao.maps.LatLng(38.9, 132.0)  // 북동쪽
    );

    // 지도 클릭 이벤트
    if (onMapClick || (showRoadview && roadviewMode === 'selector')) {
      window.kakao.maps.event.addListener(mapInstance.current, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        const coords = {
          lat: latlng.getLat(),
          lng: latlng.getLng()
        };

        // onMapClick 콜백 호출
        if (onMapClick) {
          onMapClick(coords);
        }

        // 로드뷰 선택 모드일 때 로드뷰 열기
        if (showRoadview && roadviewMode === 'selector' && isSelectingRoadviewRef.current) {
          openRoadviewAt(coords);
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        // 카카오맵 정리
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      if (roadviewInstance.current) {
        // 로드뷰 정리
        roadviewInstance.current = null;
      }
    };
  }, []);

  // 중심 이동 및 줌 레벨 변경
  useEffect(() => {
    if (mapInstance.current && window.kakao) {
      const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapInstance.current.setCenter(moveLatLon);
      // 카카오 지도는 레벨이 낮을수록 확대됨 (다른 지도와 반대)
      // 초기 로딩 시에는 한국 전체가 보이도록 높은 레벨 사용
      const kakaoLevel = zoom === 7 ? 13 : zoom === 13 ? 6 : zoom === 16 ? 3 : zoom === 12 ? 6 : Math.max(1, 15 - zoom);
      mapInstance.current.setLevel(kakaoLevel);
    }
  }, [center, zoom]);

  // 지도 전환 시에만 roadviewTarget 위치로 이동 (초기 마운트 시)
  useEffect(() => {
    if (mapInstance.current && window.kakao && roadviewTarget) {
      const targetLatLng = new window.kakao.maps.LatLng(roadviewTarget.lat, roadviewTarget.lng);
      mapInstance.current.setCenter(targetLatLng);
      mapInstance.current.setLevel(3);
    }
  }, []); // 빈 의존성 배열로 초기 마운트 시에만 실행

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.kakao) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    markers.forEach(markerData => {
      const markerPosition = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapInstance.current
      });

      // 인포윈도우 추가
      if (markerData.content) {
        // 제목 추출 (h3 태그 내용)
        const titleMatch = markerData.content.match(/<h3[^>]*>(.*?)<\/h3>/);
        const title = titleMatch ? titleMatch[1] : '';
        
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="width: 280px; max-width: 280px; overflow: hidden; padding: 15px;">${markerData.content}</div>`
        });

        // 상시 라벨 표시
        if (showPermanentLabels && title) {
          const labelWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding: 5px 10px; background: white; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-weight: bold; white-space: nowrap;">${title}</div>`,
            removable: false
          });
          labelWindow.open(mapInstance.current, marker);
        }

        window.kakao.maps.event.addListener(marker, 'click', function() {
          if (infowindow.getMap()) {
            // 이미 열려있으면 닫기
            infowindow.close();
          } else {
            // 닫혀있으면 열기
            infowindow.open(mapInstance.current, marker);
          }
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, showPermanentLabels]);

  // 로드뷰 열기 함수
  const openRoadviewAt = (coords) => {
    if (!roadviewInstance.current || !window.kakao.maps.RoadviewClient) return;

    const roadviewClient = new window.kakao.maps.RoadviewClient();
    const position = new window.kakao.maps.LatLng(coords.lat, coords.lng);

    roadviewClient.getNearestPanoId(position, 50, function(panoId) {
      if (panoId === null) {
        setRoadviewAvailable(false);
        alert('이 위치에서는 로드뷰를 사용할 수 없습니다.');
      } else {
        setRoadviewAvailable(true);
        roadviewInstance.current.setPanoId(panoId, position);
        setIsRoadviewOpen(true);
        if (roadviewMode === 'selector') {
          setIsSelectingRoadview(false); // 로드뷰가 열리면 선택 모드 해제
        }
      }
    });
  };

  // 로드뷰 토글
  const toggleRoadview = () => {
    if (!roadviewInstance.current) {
      alert('로드뷰를 사용할 수 없습니다.');
      return;
    }

    if (roadviewMode === 'selector') {
      // Selector 모드
      if (isRoadviewOpen) {
        // 로드뷰가 열려있으면 바로 닫고 선택 모드도 해제
        setIsRoadviewOpen(false);
        setIsSelectingRoadview(false);
      } else {
        // 로드뷰가 닫혀있으면 선택 모드 토글
        const newSelectingState = !isSelectingRoadview;
        setIsSelectingRoadview(newSelectingState);
      }
    } else {
      // Toggle 모드: 특정 좌표 또는 현재 중심점에서 로드뷰 열기/닫기
      if (!isRoadviewOpen) {
        let targetCoords;
        if (roadviewTarget) {
          // 핀이 찍힌 좌표 사용
          targetCoords = roadviewTarget;
        } else {
          // 지도 중심점 사용
          const currentCenter = mapInstance.current.getCenter();
          targetCoords = {
            lat: currentCenter.getLat(),
            lng: currentCenter.getLng()
          };
        }
        openRoadviewAt(targetCoords);
      } else {
        setIsRoadviewOpen(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* 지도 */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          display: isRoadviewOpen ? 'none' : 'block'
        }}
      ></div>

      {/* 로드뷰 */}
      {showRoadview && (
        <div
          ref={roadviewRef}
          style={{
            width: '100%',
            height: '100%',
            display: isRoadviewOpen ? 'block' : 'none'
          }}
        ></div>
      )}

      {/* 로드뷰 토글 버튼 */}
      {showRoadview && (
        <button
          type="button"
          className={`kakao-roadview-btn ${sidebarCollapsed ? '' : 'roadview-btn-hidden-mobile'}`}
          onClick={toggleRoadview}
          disabled={!roadviewAvailable && isRoadviewOpen}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '10px 15px',
            backgroundColor:
              roadviewMode === 'selector'
                ? (isSelectingRoadview ? '#10b981' : '#2563eb')
                : (isRoadviewOpen ? '#ef4444' : '#2563eb'),
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: roadviewAvailable || !isRoadviewOpen ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            opacity: (!roadviewAvailable && isRoadviewOpen) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (roadviewAvailable || !isRoadviewOpen) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          }}
        >
          <span className="roadview-icon">
            {roadviewMode === 'selector'
              ? (isRoadviewOpen
                  ? '🗺️'
                  : (isSelectingRoadview ? '🚫' : '👁️'))
              : (isRoadviewOpen ? '🗺️' : '👁️')
            }
          </span>
          <span className="roadview-text">
            {roadviewMode === 'selector'
              ? (isRoadviewOpen
                  ? ' 지도 보기'
                  : (isSelectingRoadview ? ' 선택 취소' : ' 로드뷰 선택'))
              : (isRoadviewOpen ? ' 지도 보기' : ' 로드뷰')
            }
          </span>
        </button>
      )}

      {/* 로드뷰 선택 모드 안내 */}
      {roadviewMode === 'selector' && isSelectingRoadview && !isRoadviewOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 999,
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap'
        }}>
          📍 지도에서 원하는 위치를 클릭하여 로드뷰를 확인하세요
        </div>
      )}

      {/* 로드뷰 사용 불가 안내 */}
      {!roadviewAvailable && isRoadviewOpen && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 999,
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
            이 위치에서는 로드뷰를 사용할 수 없습니다
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            다른 위치로 이동해주세요
          </p>
        </div>
      )}
    </div>
  );
}

export default KakaoMap;
