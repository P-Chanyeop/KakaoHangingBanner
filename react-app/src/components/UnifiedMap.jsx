import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import MapTabs from './MapTabs';
import KakaoMap from './KakaoMap';
import NaverMap from './NaverMap';
import LocationAlertModal from './LocationAlertModal';
import { getCurrentLocation, isInKorea } from '../utils/geolocation';
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
  showPermanentLabels = false,
  useViewportRendering = false
}) {
  const [mapProvider, setMapProvider] = useState(defaultProvider);
  const leafletMapRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const leafletMarkersRef = useRef([]);
  const leafletCurrentLocationMarkerRef = useRef(null);

  const [leafletBoundsChanged, setLeafletBoundsChanged] = useState(0);
  const [leafletLocationAlert, setLeafletLocationAlert] = useState(null);
  const [isLeafletLocating, setIsLeafletLocating] = useState(false);

  // Leaflet: 현재 위치 마커 제거
  const clearLeafletCurrentLocationMarker = () => {
    if (leafletCurrentLocationMarkerRef.current && leafletInstanceRef.current) {
      leafletInstanceRef.current.removeLayer(leafletCurrentLocationMarkerRef.current);
      leafletCurrentLocationMarkerRef.current = null;
    }
  };

  // Leaflet: 현재 위치로 이동
  const handleLeafletLocate = async () => {
    if (isLeafletLocating) return;
    setIsLeafletLocating(true);
    try {
      const coords = await getCurrentLocation();
      if (!isInKorea(coords)) {
        setLeafletLocationAlert({ type: 'outside-korea' });
        return;
      }
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.setView([coords.lat, coords.lng], 16, {
          animate: true,
          duration: 0.5
        });

        clearLeafletCurrentLocationMarker();

        leafletCurrentLocationMarkerRef.current = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          fillColor: '#4285F4',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1,
          interactive: false
        }).addTo(leafletInstanceRef.current);

        leafletInstanceRef.current.once('dragstart', clearLeafletCurrentLocationMarker);
        leafletInstanceRef.current.once('click', clearLeafletCurrentLocationMarker);
      }
    } catch (err) {
      setLeafletLocationAlert(err);
    } finally {
      setIsLeafletLocating(false);
    }
  };

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

      // 뷰포트 렌더링용 이벤트
      if (useViewportRendering) {
        leafletInstanceRef.current.on('moveend', () => {
          setLeafletBoundsChanged(prev => prev + 1);
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

  // Leaflet 뷰포트 내 마커 필터링
  const getVisibleLeafletMarkers = () => {
    if (!leafletInstanceRef.current || !useViewportRendering) return markers;
    const bounds = leafletInstanceRef.current.getBounds();
    return markers.filter(m => bounds.contains([m.lat, m.lng]));
  };

  // Leaflet 마커 업데이트
  useEffect(() => {
    if (mapProvider === 'leaflet' && leafletInstanceRef.current) {
      // 기존 마커 제거
      leafletMarkersRef.current.forEach(marker => leafletInstanceRef.current.removeLayer(marker));
      leafletMarkersRef.current = [];

      // 뷰포트 렌더링 적용
      const visibleMarkers = getVisibleLeafletMarkers();

      // 새 마커 추가
      visibleMarkers.forEach(markerData => {
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
  }, [markers, mapProvider, autoFitBounds, leafletBoundsChanged, useViewportRendering]);

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
          zIndex: 10002
        }}>
          <MapTabs
            activeProvider={mapProvider}
            onProviderChange={setMapProvider}
          />
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '100%', display: mapProvider === 'leaflet' ? 'block' : 'none' }}>
        <div ref={leafletMapRef} style={{ width: '100%', height: '100%' }}></div>

        {/* 현재 위치 버튼 (Leaflet) */}
        <button
          type="button"
          onClick={handleLeafletLocate}
          disabled={isLeafletLocating}
          title="현재 위치로 이동"
          aria-label="현재 위치로 이동"
          style={{
            position: 'absolute',
            top: '60px',
            right: '10px',
            zIndex: 1000,
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            color: '#374151',
            border: 'none',
            borderRadius: '50%',
            cursor: isLeafletLocating ? 'wait' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            opacity: isLeafletLocating ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLeafletLocating) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          }}
        >
          <i className={`fas ${isLeafletLocating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
        </button>

        <LocationAlertModal alert={leafletLocationAlert} onClose={() => setLeafletLocationAlert(null)} />
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
          useViewportRendering={useViewportRendering}
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
          useViewportRendering={useViewportRendering}
        />
      )}
    </div>
  );
}

export default UnifiedMap;
