import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import MapTabs from './MapTabs';
import KakaoMap from './KakaoMap';
import NaverMap from './NaverMap';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 설정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function UnifiedMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' },
  showTabs = true,
  defaultProvider = 'kakao',
  autoFitBounds = true,
  roadviewMode = 'toggle',
  roadviewTarget = null, // 로드뷰 대상 좌표
  tabPosition = 'top-center', // 탭 위치: 'top-center' or 'bottom-right'
  showPermanentLabels = false
}) {
  const [mapProvider, setMapProvider] = useState(defaultProvider);
  const leafletMapRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const leafletMarkersRef = useRef([]);

  // Leaflet 지도 초기화
  useEffect(() => {
    if (mapProvider === 'leaflet' && leafletMapRef.current && !leafletInstanceRef.current) {
      leafletInstanceRef.current = L.map(leafletMapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [
          [33.0, 124.5],
          [38.9, 132.0]
        ],
        maxBoundsViscosity: 1.0
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletInstanceRef.current);

      if (onMapClick) {
        leafletInstanceRef.current.on('click', (e) => {
          onMapClick({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
        });
      }

      // 지도 크기 재계산
      setTimeout(() => {
        if (leafletInstanceRef.current) {
          leafletInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapProvider !== 'leaflet' && leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, [mapProvider]);

  // Leaflet 중심 이동
  useEffect(() => {
    if (mapProvider === 'leaflet' && leafletInstanceRef.current) {
      leafletInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, mapProvider]);

  // Leaflet 마커 업데이트
  useEffect(() => {
    if (mapProvider === 'leaflet' && leafletInstanceRef.current) {
      // 기존 마커 제거
      leafletMarkersRef.current.forEach(marker => leafletInstanceRef.current.removeLayer(marker));
      leafletMarkersRef.current = [];

      // 새 마커 추가
      markers.forEach(markerData => {
        const marker = L.marker([markerData.lat, markerData.lng])
          .addTo(leafletInstanceRef.current);

        if (markerData.content) {
          marker.bindPopup(markerData.content);
        }

        leafletMarkersRef.current.push(marker);
      });

      // 마커가 있으면 범위에 맞게 조정 (autoFitBounds가 true일 때만)
      if (autoFitBounds && leafletMarkersRef.current.length > 0) {
        const group = L.featureGroup(leafletMarkersRef.current);
        leafletInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [markers, mapProvider, autoFitBounds]);

  // 지도 제공자 변경 시 크기 재계산
  useEffect(() => {
    if (mapProvider === 'leaflet') {
      setTimeout(() => {
        if (leafletInstanceRef.current) {
          leafletInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [mapProvider]);

  return (
    <div style={{ position: 'relative', ...style }}>
      {showTabs && (
        <div style={{
          position: 'absolute',
          ...(tabPosition === 'bottom-right' 
            ? { bottom: '1rem', right: '1rem' }
            : { top: '1rem', left: '50%', transform: 'translateX(-50%)' }
          ),
          zIndex: 1000
        }}>
          <MapTabs
            activeProvider={mapProvider}
            onProviderChange={setMapProvider}
          />
        </div>
      )}

      <div style={{ width: '100%', height: '100%', display: mapProvider === 'leaflet' ? 'block' : 'none' }}>
        <div ref={leafletMapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>

      {mapProvider === 'kakao' && (
        <KakaoMap
          center={center}
          zoom={zoom}
          markers={markers}
          onMapClick={onMapClick}
          style={{ width: '100%', height: '100%' }}
          showRoadview={true}
          roadviewMode={roadviewMode}
          roadviewTarget={roadviewMode === 'selector' ? null : roadviewTarget}
          showPermanentLabels={showPermanentLabels}
        />
      )}

      {mapProvider === 'naver' && (
        <NaverMap
          center={center}
          zoom={zoom}
          markers={markers}
          onMapClick={onMapClick}
          style={{ width: '100%', height: '100%' }}
          autoFitBounds={autoFitBounds}
          roadviewMode={roadviewMode}
          roadviewTarget={roadviewMode === 'selector' ? null : roadviewTarget}
          showPermanentLabels={showPermanentLabels}
        />
      )}
    </div>
  );
}

export default UnifiedMap;
