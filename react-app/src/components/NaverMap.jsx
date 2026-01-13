import React, { useEffect, useRef, useState } from 'react';

function NaverMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' },
  showRoadview = true
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const panoramaRef = useRef(null);
  const mapInstance = useRef(null);
  const panoramaInstance = useRef(null);
  const markersRef = useRef([]);
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);

  // 네이버맵 초기화
  useEffect(() => {
    if (!window.naver || !window.naver.maps) {
      console.error('네이버맵 API가 로드되지 않았습니다. index.html에 Client ID (k5oupq96xi)가 설정되어 있는지 확인하세요.');
      return;
    }

    // Dynamic Map 옵션 (공식 문서 기준)
    const mapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      minZoom: 6,
      maxZoom: 21,
      zoomControl: true,
      zoomControlOptions: {
        style: window.naver.maps.ZoomControlStyle.SMALL,
        position: window.naver.maps.Position.TOP_RIGHT
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.naver.maps.MapTypeControlStyle.BUTTON,
        position: window.naver.maps.Position.TOP_LEFT
      },
      scaleControl: true,
      scaleControlOptions: {
        position: window.naver.maps.Position.BOTTOM_RIGHT
      },
      logoControl: true,
      logoControlOptions: {
        position: window.naver.maps.Position.BOTTOM_LEFT
      },
      mapDataControl: true,
      mapDataControlOptions: {
        position: window.naver.maps.Position.BOTTOM_LEFT
      }
    };

    mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);

    // 한국 영역 제한 (Bounds)
    const koreaCenter = new window.naver.maps.LatLng(36.5, 127.5);
    const maxBounds = new window.naver.maps.LatLngBounds(
      new window.naver.maps.LatLng(33.0, 124.5), // 남서쪽
      new window.naver.maps.LatLng(38.9, 132.0)  // 북동쪽
    );

    // 지도 이동 제한
    window.naver.maps.Event.addListener(mapInstance.current, 'bounds_changed', function() {
      const bounds = mapInstance.current.getBounds();
      if (!maxBounds.hasLatLng(bounds.getNE()) || !maxBounds.hasLatLng(bounds.getSW())) {
        mapInstance.current.setCenter(koreaCenter);
      }
    });

    // 지도 클릭 이벤트
    if (onMapClick) {
      window.naver.maps.Event.addListener(mapInstance.current, 'click', function(e) {
        onMapClick({
          lat: e.coord.lat(),
          lng: e.coord.lng()
        });
      });
    }

    // 로드뷰 초기화 (showRoadview가 true일 때만)
    if (showRoadview && panoramaRef.current) {
      try {
        panoramaInstance.current = new window.naver.maps.Panorama(panoramaRef.current, {
          position: new window.naver.maps.LatLng(center.lat, center.lng),
          pov: {
            pan: 0,
            tilt: 0,
            fov: 100
          }
        });

        // 로드뷰 위치 변경 시 지도 중심 이동
        window.naver.maps.Event.addListener(panoramaInstance.current, 'position_changed', function() {
          const position = panoramaInstance.current.getPosition();
          if (mapInstance.current && position) {
            mapInstance.current.setCenter(position);
          }
        });
      } catch (error) {
        console.warn('로드뷰 초기화 실패:', error);
      }
    }

    return () => {
      if (mapInstance.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        window.naver.maps.Event.clearInstanceListeners(mapInstance.current);
      }
      if (panoramaInstance.current) {
        window.naver.maps.Event.clearInstanceListeners(panoramaInstance.current);
      }
    };
  }, []);

  // 중심 이동
  useEffect(() => {
    if (mapInstance.current && window.naver) {
      const moveLatLng = new window.naver.maps.LatLng(center.lat, center.lng);
      mapInstance.current.setCenter(moveLatLng);

      // 로드뷰가 열려있으면 로드뷰도 이동
      if (isRoadviewOpen && panoramaInstance.current) {
        panoramaInstance.current.setPosition(moveLatLng);
      }
    }
  }, [center, isRoadviewOpen]);

  // 줌 레벨 변경
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    markers.forEach((markerData, index) => {
      const position = new window.naver.maps.LatLng(markerData.lat, markerData.lng);

      const marker = new window.naver.maps.Marker({
        position: position,
        map: mapInstance.current,
        title: markerData.title || `마커 ${index + 1}`,
        icon: {
          content: `<div style="
            background: #2563eb;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">${markerData.label || '📍'}</div>`,
          anchor: new window.naver.maps.Point(20, 40)
        }
      });

      // 인포윈도우 추가
      if (markerData.content) {
        const infowindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:15px; min-width:200px; max-width:300px;">
            ${markerData.content}
          </div>`,
          backgroundColor: '#fff',
          borderColor: '#2563eb',
          borderWidth: 2,
          anchorSize: new window.naver.maps.Size(10, 10),
          anchorSkew: true,
          pixelOffset: new window.naver.maps.Point(0, -10)
        });

        window.naver.maps.Event.addListener(marker, 'click', function() {
          if (infowindow.getMap()) {
            infowindow.close();
          } else {
            infowindow.open(mapInstance.current, marker);
          }
        });

        // 마커에 인포윈도우 참조 저장
        marker.infowindow = infowindow;
      }

      markersRef.current.push(marker);
    });

    // 마커가 있으면 범위에 맞게 조정
    if (markers.length > 0 && window.naver) {
      const bounds = new window.naver.maps.LatLngBounds();
      markers.forEach(markerData => {
        bounds.extend(new window.naver.maps.LatLng(markerData.lat, markerData.lng));
      });
      mapInstance.current.fitBounds(bounds, { padding: { top: 50, right: 50, bottom: 50, left: 50 } });
    }
  }, [markers]);

  // 로드뷰 토글
  const toggleRoadview = () => {
    if (!showRoadview || !panoramaInstance.current) return;

    const newState = !isRoadviewOpen;
    setIsRoadviewOpen(newState);

    if (newState) {
      // 로드뷰 열기
      const center = mapInstance.current.getCenter();
      panoramaInstance.current.setPosition(center);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
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
          ref={panoramaRef}
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
          onClick={toggleRoadview}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '10px 15px',
            backgroundColor: isRoadviewOpen ? '#ef4444' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          }}
        >
          {isRoadviewOpen ? '🗺️ 지도 보기' : '👁️ 로드뷰'}
        </button>
      )}
    </div>
  );
}

export default NaverMap;
