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
  const panoRef = useRef(null);
  const mapInstance = useRef(null);
  const panoInstance = useRef(null);
  const markersRef = useRef([]);
  const [apiError, setApiError] = useState(null);
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);
  const [roadviewAvailable, setRoadviewAvailable] = useState(true);

  // 네이버맵 초기화
  useEffect(() => {
    if (!window.naver || !window.naver.maps) {
      const errorMsg = '네이버맵 API가 로드되지 않았습니다.';
      console.error(errorMsg);
      setApiError(errorMsg);
      return;
    }

    try {
      // 기본 지도 옵션 (공식 문서 기준)
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
        scaleControl: false,
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

      // 지도 클릭 이벤트
      if (onMapClick) {
        window.naver.maps.Event.addListener(mapInstance.current, 'click', function(e) {
          onMapClick({
            lat: e.coord.lat(),
            lng: e.coord.lng()
          });
        });
      }

      // 파노라마 초기화 (showRoadview가 true일 때)
      if (showRoadview && window.naver.maps.Panorama) {
        try {
          const panoOptions = {
            position: new window.naver.maps.LatLng(center.lat, center.lng),
            pov: {
              pan: -135,
              tilt: 29,
              fov: 100
            },
            visible: false
          };

          panoInstance.current = new window.naver.maps.Panorama(panoRef.current, panoOptions);

          // 파노라마 초기화 완료 이벤트
          window.naver.maps.Event.addListener(panoInstance.current, 'init', function() {
            console.log('파노라마 초기화 완료');
          });

          // 파노라마 상태 이벤트
          window.naver.maps.Event.addListener(panoInstance.current, 'pano_status', function(status) {
            console.log('파노라마 상태:', status);
            if (status === 'ERROR') {
              setRoadviewAvailable(false);
              console.warn('이 위치에서는 로드뷰를 사용할 수 없습니다.');
            } else {
              setRoadviewAvailable(true);
            }
          });

          // 파노라마 변경 이벤트
          window.naver.maps.Event.addListener(panoInstance.current, 'pano_changed', function() {
            const location = panoInstance.current.getLocation();
            console.log('파노라마 위치:', location);
          });

          // 파노라마 시야 변경 이벤트
          window.naver.maps.Event.addListener(panoInstance.current, 'pov_changed', function() {
            const pov = panoInstance.current.getPov();
            console.log('파노라마 시야:', pov);
          });

        } catch (error) {
          console.error('파노라마 초기화 오류:', error);
          setRoadviewAvailable(false);
        }
      }

      return () => {
        if (mapInstance.current) {
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
          window.naver.maps.Event.clearInstanceListeners(mapInstance.current);
        }
        if (panoInstance.current) {
          window.naver.maps.Event.clearInstanceListeners(panoInstance.current);
        }
      };
    } catch (error) {
      console.error('네이버 지도 초기화 오류:', error);
      setApiError(error.message);
    }
  }, []);

  // 중심 이동
  useEffect(() => {
    if (mapInstance.current && window.naver) {
      const moveLatLng = new window.naver.maps.LatLng(center.lat, center.lng);
      mapInstance.current.setCenter(moveLatLng);
    }
  }, [center]);

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
        title: markerData.title || `마커 ${index + 1}`
      });

      // 인포윈도우 추가
      if (markerData.content) {
        const infowindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:15px; min-width:200px; max-width:300px;">
            ${markerData.content}
          </div>`
        });

        window.naver.maps.Event.addListener(marker, 'click', function() {
          if (infowindow.getMap()) {
            infowindow.close();
          } else {
            infowindow.open(mapInstance.current, marker);
          }
        });
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
    if (!panoInstance.current) {
      alert('로드뷰를 사용할 수 없습니다.');
      return;
    }

    const newState = !isRoadviewOpen;
    setIsRoadviewOpen(newState);

    if (newState) {
      // 로드뷰 열기
      const currentCenter = mapInstance.current.getCenter();
      panoInstance.current.setPosition(currentCenter);
      panoInstance.current.setVisible(true);
    } else {
      // 로드뷰 닫기
      panoInstance.current.setVisible(false);
    }
  };

  // 에러 표시
  if (apiError) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        border: '2px solid #dc3545',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>네이버 지도 API 오류</h3>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '5px',
            textAlign: 'left',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '15px', fontWeight: 'bold', color: '#dc3545' }}>
              {apiError}
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* 로드뷰 (파노라마) */}
      {showRoadview && (
        <div
          ref={panoRef}
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
          disabled={!roadviewAvailable && isRoadviewOpen}
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
          {isRoadviewOpen ? '🗺️ 지도 보기' : '👁️ 로드뷰'}
        </button>
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

export default NaverMap;
