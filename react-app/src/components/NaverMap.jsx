import React, { useEffect, useRef } from 'react';

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

  // 네이버맵 초기화
  useEffect(() => {
    if (!window.naver || !window.naver.maps) {
      console.error('네이버맵 API가 로드되지 않았습니다. index.html에 Client ID를 설정했는지 확인하세요.');
      return;
    }

    const mapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT
      }
    };

    mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);

    // 한국 범위로 제한
    const bounds = new window.naver.maps.LatLngBounds(
      new window.naver.maps.LatLng(33.0, 124.5), // 남서쪽
      new window.naver.maps.LatLng(38.9, 132.0)  // 북동쪽
    );

    // 지도 클릭 이벤트
    if (onMapClick) {
      window.naver.maps.Event.addListener(mapInstance.current, 'click', function(e) {
        onMapClick({
          lat: e.coord.y,
          lng: e.coord.x
        });
      });
    }

    return () => {
      if (mapInstance.current) {
        // 네이버맵 정리
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
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
    markers.forEach(markerData => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
        map: mapInstance.current
      });

      // 인포윈도우 추가
      if (markerData.content) {
        const infowindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:10px; min-width:200px;">${markerData.content}</div>`
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
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [markers]);

  return <div ref={mapRef} style={style}></div>;
}

export default NaverMap;
