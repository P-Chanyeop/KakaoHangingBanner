import React, { useEffect, useRef } from 'react';

function KakaoMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' }
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 카카오맵 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았습니다. index.html에 API 키를 설정했는지 확인하세요.');
      return;
    }

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: zoom
    };

    mapInstance.current = new window.kakao.maps.Map(container, options);

    // 한국 범위로 제한
    const bounds = new window.kakao.maps.LatLngBounds(
      new window.kakao.maps.LatLng(33.0, 124.5), // 남서쪽
      new window.kakao.maps.LatLng(38.9, 132.0)  // 북동쪽
    );

    // 지도 클릭 이벤트
    if (onMapClick) {
      window.kakao.maps.event.addListener(mapInstance.current, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        onMapClick({
          lat: latlng.getLat(),
          lng: latlng.getLng()
        });
      });
    }

    return () => {
      if (mapInstance.current) {
        // 카카오맵 정리
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, []);

  // 중심 이동
  useEffect(() => {
    if (mapInstance.current && window.kakao) {
      const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapInstance.current.setCenter(moveLatLon);
    }
  }, [center]);

  // 줌 레벨 변경
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setLevel(zoom);
    }
  }, [zoom]);

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
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;">${markerData.content}</div>`
        });

        window.kakao.maps.event.addListener(marker, 'click', function() {
          infowindow.open(mapInstance.current, marker);
        });
      }

      markersRef.current.push(marker);
    });

    // 마커가 있으면 범위에 맞게 조정
    if (markers.length > 0 && window.kakao) {
      const bounds = new window.kakao.maps.LatLngBounds();
      markers.forEach(markerData => {
        bounds.extend(new window.kakao.maps.LatLng(markerData.lat, markerData.lng));
      });
      mapInstance.current.setBounds(bounds);
    }
  }, [markers]);

  return <div ref={mapRef} style={style}></div>;
}

export default KakaoMap;
