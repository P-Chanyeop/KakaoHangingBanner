import React, { useEffect, useRef, useState } from 'react';

function NaverMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' }
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [apiError, setApiError] = useState(null);

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

      return () => {
        if (mapInstance.current) {
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
          window.naver.maps.Event.clearInstanceListeners(mapInstance.current);
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
          <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>네이버 지도 API 인증 실패</h3>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '5px',
            textAlign: 'left',
            fontSize: '14px',
            lineHeight: '1.8',
            marginBottom: '20px'
          }}>
            <p style={{ marginBottom: '15px', fontWeight: 'bold', color: '#dc3545' }}>
              {apiError}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Web 서비스 URL 설정이 필요합니다:</strong>
            </p>
            <ol style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li>네이버 클라우드 플랫폼 콘솔 접속: <a href="https://console.ncloud.com" target="_blank" rel="noopener noreferrer">console.ncloud.com</a></li>
              <li>Services → AI·Application Service → AI·NAVER API → Application</li>
              <li><strong>softcat</strong> 애플리케이션 클릭</li>
              <li><strong>Web 서비스 URL</strong> 섹션에 다음 추가:</li>
            </ol>
            <div style={{
              backgroundColor: '#f1f3f5',
              padding: '10px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              marginBottom: '15px'
            }}>
              http://localhost:3000<br/>
              http://localhost:3000/*<br/>
              http://127.0.0.1:3000<br/>
              http://127.0.0.1:3000/*
            </div>
            <ol start="5" style={{ marginLeft: '20px' }}>
              <li><strong>저장</strong> 버튼 클릭</li>
              <li>1-2분 대기 (설정 반영 시간)</li>
              <li>이 페이지를 <strong>새로고침</strong> (Ctrl + F5)</li>
            </ol>
          </div>
          <p style={{ fontSize: '12px', color: '#6c757d' }}>
            Client ID: <code>k5oupq96xi</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default NaverMap;
