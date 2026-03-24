import React, { useEffect, useRef, useState, useCallback } from 'react';

function NaverMap({
  center = { lat: 36.5, lng: 127.5 },
  zoom = 7,
  markers = [],
  onMapClick,
  style = { width: '100%', height: '100%' },
  showRoadview = true,
  autoFitBounds = true,
  roadviewMode = 'toggle', // 'toggle' or 'selector'
  roadviewTarget = null, // 로드뷰를 보여줄 특정 좌표 (핀 위치)
  showPermanentLabels = false,
  useViewportRendering = false
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const panoRef = useRef(null);
  const minimapRef = useRef(null);
  const mapInstance = useRef(null);
  const panoInstance = useRef(null);
  const panoLayerRef = useRef(null);
  const minimapInstance = useRef(null);
  const minimapMarkerRef = useRef(null);
  const markersRef = useRef([]);
  const labelsRef = useRef([]);
  const clustererRef = useRef(null);
  const allMarkersDataRef = useRef([]);
  const [apiError, setApiError] = useState(null);
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);
  const [isSelectingRoadview, setIsSelectingRoadview] = useState(false);
  const roadviewAvailableRef = useRef(true);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(zoom);

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
      window.naver.maps.Event.addListener(mapInstance.current, 'click', function(e) {
        const clickCoord = {
          lat: e.coord.lat(),
          lng: e.coord.lng()
        };

        // onMapClick 콜백 호출 (있는 경우)
        if (onMapClick) {
          onMapClick(clickCoord);
        }
      });

      // 줌 레벨 변경 이벤트 (라벨 표시 제어용)
      window.naver.maps.Event.addListener(mapInstance.current, 'zoom_changed', function() {
        setCurrentZoom(mapInstance.current.getZoom());
      });

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
            // 파노라마 초기화 완료 (로그 제거)
          });

          // 파노라마 상태 이벤트
          window.naver.maps.Event.addListener(panoInstance.current, 'pano_status', function(status) {
            roadviewAvailableRef.current = (status !== 'ERROR');
          });

          // 파노라마 변경 이벤트 (위치 변경 시 미니맵 업데이트)
          window.naver.maps.Event.addListener(panoInstance.current, 'pano_changed', function() {
            if (minimapInstance.current && minimapMarkerRef.current) {
              const pos = panoInstance.current.getPosition();
              minimapInstance.current.setCenter(pos);
              minimapMarkerRef.current.setPosition(pos);
            }
          });

          // 파노라마 시야 변경 이벤트 (방향 변경 시 마커 회전)
          window.naver.maps.Event.addListener(panoInstance.current, 'pov_changed', function() {
            if (minimapMarkerRef.current) {
              const currentPov = panoInstance.current.getPov();
              minimapMarkerRef.current.setIcon({
                content: `<div style="transform: rotate(${currentPov.pan}deg); transform-origin: center;">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#03c75a" stroke="white" stroke-width="2"/>
                    <polygon points="12,2 16,10 12,8 8,10" fill="white"/>
                  </svg>
                </div>`,
                anchor: new window.naver.maps.Point(12, 12)
              });
            }
          });

          // PanoramaLayer 초기화 (selector 모드용)
          if (roadviewMode === 'selector' && window.naver.maps.PanoramaLayer) {
            panoLayerRef.current = new window.naver.maps.PanoramaLayer();
          }

        } catch (error) {
          console.error('파노라마 초기화 오류:', error);
          roadviewAvailableRef.current = false;
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

  // 전역 로드뷰 열기 함수 등록 (인포윈도우 버튼용)
  useEffect(() => {
    window.openRoadview = (lat, lng) => {
      if (panoInstance.current && window.naver) {
        const position = new window.naver.maps.LatLng(lat, lng);
        panoInstance.current.setPosition(position);
        panoInstance.current.setVisible(true);
        setIsRoadviewOpen(true);
        setIsSelectingRoadview(true); // selector 모드용
      }
    };
    return () => { delete window.openRoadview; };
  }, []);

  // 미니맵 초기화 (한 번만)
  useEffect(() => {
    if (!showRoadview || !minimapRef.current || !window.naver) return;
    if (minimapInstance.current) return; // 이미 초기화됨
    
    const pos = new window.naver.maps.LatLng(center.lat, center.lng);
    
    minimapInstance.current = new window.naver.maps.Map(minimapRef.current, {
      center: pos,
      zoom: 17,
      draggable: true,
      scrollWheel: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false
    });

    minimapMarkerRef.current = new window.naver.maps.Marker({
      position: pos,
      map: minimapInstance.current,
      icon: {
        content: `<div style="transform: rotate(0deg); transform-origin: center;">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#03c75a" stroke="white" stroke-width="2"/>
            <polygon points="12,2 16,10 12,8 8,10" fill="white"/>
          </svg>
        </div>`,
        anchor: new window.naver.maps.Point(12, 12)
      }
    });

    // 미니맵 클릭 시 해당 위치로 로드뷰 이동
    window.naver.maps.Event.addListener(minimapInstance.current, 'click', function(e) {
      if (panoInstance.current) {
        panoInstance.current.setPosition(e.coord);
      }
    });
  }, [showRoadview]);

  // 중심 이동 및 줌 레벨 변경
  useEffect(() => {
    if (mapInstance.current && window.naver) {
      const moveLatLng = new window.naver.maps.LatLng(center.lat, center.lng);
      mapInstance.current.morph(moveLatLng, zoom, { duration: 500, easing: 'easeOutCubic' });
    }
  }, [center.lat, center.lng, zoom]);

  // 뷰포트 내 마커 필터링
  const updateVisibleMarkers = useCallback(() => {
    if (!mapInstance.current || !window.naver || !useViewportRendering) return;
    
    const bounds = mapInstance.current.getBounds();
    const filtered = allMarkersDataRef.current.filter(m => 
      bounds.hasLatLng(new window.naver.maps.LatLng(m.lat, m.lng))
    );
    setVisibleMarkers(filtered);
  }, [useViewportRendering]);

  // 뷰포트 렌더링: 지도 이동/줌 이벤트 리스너
  useEffect(() => {
    if (!mapInstance.current || !window.naver || !useViewportRendering) return;

    const idleListener = window.naver.maps.Event.addListener(mapInstance.current, 'idle', updateVisibleMarkers);
    
    // 초기 실행
    updateVisibleMarkers();

    return () => {
      window.naver.maps.Event.removeListener(idleListener);
    };
  }, [useViewportRendering, updateVisibleMarkers]);

  // markers prop 변경 시 저장
  useEffect(() => {
    allMarkersDataRef.current = markers;
    if (useViewportRendering) {
      updateVisibleMarkers();
    }
  }, [markers, useViewportRendering, updateVisibleMarkers]);

  // 실제 렌더링할 마커 결정
  const markersToRender = useViewportRendering ? visibleMarkers : markers;

  // 마커 업데이트 (클러스터링 적용)
  useEffect(() => {
    if (!mapInstance.current || !window.naver) return;

    // 기존 클러스터러 제거
    if (clustererRef.current) {
      clustererRef.current.setMap(null);
      clustererRef.current = null;
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 기존 라벨 제거
    labelsRef.current.forEach(label => label.setMap(null));
    labelsRef.current = [];

    // 새 마커 추가
    markersToRender.forEach((markerData, index) => {
      const position = new window.naver.maps.LatLng(markerData.lat, markerData.lng);

      const marker = new window.naver.maps.Marker({
        position: position,
        title: markerData.title || `마커 ${index + 1}`,
        zIndex: 100
      });

      // 상시 라벨 (CustomOverlay) - 줌 레벨 12 이상(확대)에서만 표시
      if (showPermanentLabels && markerData.title && currentZoom >= 12) {
        const labelOverlay = new window.naver.maps.OverlayView();
        
        labelOverlay.onAdd = function() {
          const div = document.createElement('div');
          div.innerHTML = markerData.title;
          div.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            pointer-events: none;
          `;
          this.div = div;
          this.getPanes().overlayLayer.appendChild(div);
        };

        labelOverlay.draw = function() {
          const proj = mapInstance.current.getProjection();
          const pos = proj.fromCoordToOffset(marker.getPosition());
          this.div.style.position = 'absolute';
          this.div.style.left = (pos.x - this.div.offsetWidth / 2) + 'px';
          this.div.style.top = (pos.y - 60) + 'px';
        };

        labelOverlay.onRemove = function() {
          if (this.div) {
            this.div.remove();
            this.div = null;
          }
        };

        labelOverlay.setMap(mapInstance.current);
        labelsRef.current.push(labelOverlay);
      }

      // 인포윈도우 추가
      if (markerData.content) {
        const infowindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:15px; min-width:200px; max-width:300px; background:white; border-radius:8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ${markerData.content}
          </div>`,
          borderWidth: 0,
          backgroundColor: 'transparent',
          anchorSize: new window.naver.maps.Size(0, 0),
          pixelOffset: new window.naver.maps.Point(20, -150)
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

    // 네이버 MarkerClustering 적용
    if (window.MarkerClustering && markersRef.current.length > 0) {
      const clusterIconHtml = (size, count) =>
        `<div style="width:${size}px;height:${size}px;line-height:${size}px;font-size:14px;font-weight:bold;text-align:center;border-radius:50%;background:rgba(37,99,235,0.85);color:#fff;cursor:pointer;">${count}</div>`;

      clustererRef.current = new window.MarkerClustering({
        minClusterSize: 2,
        maxZoom: 16,
        map: mapInstance.current,
        markers: markersRef.current,
        disableClickZoom: false,
        gridSize: 120,
        icons: [
          { content: '<div></div>', size: new window.naver.maps.Size(40, 40), anchor: new window.naver.maps.Point(20, 20) },
          { content: '<div></div>', size: new window.naver.maps.Size(50, 50), anchor: new window.naver.maps.Point(25, 25) },
          { content: '<div></div>', size: new window.naver.maps.Size(60, 60), anchor: new window.naver.maps.Point(30, 30) }
        ],
        indexGenerator: [10, 100, 200, 500, 1000],
        stylingFunction: function(clusterMarker, count) {
          const el = clusterMarker.getElement();
          if (el) {
            const size = count < 100 ? 40 : count < 500 ? 50 : 60;
            const bg = count < 100 ? 'rgba(37,99,235,0.85)' : count < 500 ? 'rgba(37,99,235,0.9)' : 'rgba(220,53,69,0.85)';
            el.innerHTML = `<div style="width:${size}px;height:${size}px;line-height:${size}px;font-size:14px;font-weight:bold;text-align:center;border-radius:50%;background:${bg};color:#fff;cursor:pointer;">${count}</div>`;
          }
        }
      });
    } else {
      // MarkerClustering 없으면 직접 지도에 표시
      markersRef.current.forEach(marker => marker.setMap(mapInstance.current));
    }

    // 마커가 있으면 범위에 맞게 조정 (autoFitBounds가 true이고 뷰포트 렌더링이 아닐 때만)
    if (autoFitBounds && markers.length > 0 && window.naver && !useViewportRendering) {
      const bounds = new window.naver.maps.LatLngBounds();
      markers.forEach(markerData => {
        bounds.extend(new window.naver.maps.LatLng(markerData.lat, markerData.lng));
      });
      mapInstance.current.fitBounds(bounds, { padding: { top: 50, right: 50, bottom: 50, left: 50 } });
    }
  }, [markersToRender, autoFitBounds, showPermanentLabels, currentZoom]);

  // 지도 전환 시에만 roadviewTarget 위치로 이동 (초기 마운트 시)
  useEffect(() => {
    if (mapInstance.current && window.naver && roadviewTarget) {
      const targetLatLng = new window.naver.maps.LatLng(roadviewTarget.lat, roadviewTarget.lng);
      mapInstance.current.setCenter(targetLatLng);
      mapInstance.current.setZoom(16);
    }
  }, []); // 빈 의존성 배열로 초기 마운트 시에만 실행

  // 로드뷰 토글
  const toggleRoadview = () => {
    if (!panoInstance.current) {
      alert('로드뷰를 사용할 수 없습니다.');
      return;
    }

    if (roadviewMode === 'selector') {
      // Selector 모드: 길 선택 모드 토글
      const newSelectingState = !isSelectingRoadview;
      setIsSelectingRoadview(newSelectingState);

      if (newSelectingState) {
        // 로드뷰 선택 모드 활성화 - PanoramaLayer 표시
        if (panoLayerRef.current) {
          panoLayerRef.current.setMap(mapInstance.current);
        }
      } else {
        // 로드뷰 선택 모드 비활성화
        if (panoLayerRef.current) {
          panoLayerRef.current.setMap(null);
        }
        // 로드뷰가 열려있으면 닫기
        if (isRoadviewOpen) {
          panoInstance.current.setVisible(false);
          setIsRoadviewOpen(false);
        }
      }
    } else {
      // Toggle 모드: 즉시 로드뷰 열기/닫기
      const newState = !isRoadviewOpen;
      setIsRoadviewOpen(newState);

      if (newState) {
        // 로드뷰 열기 - roadviewTarget이 있으면 그 위치, 없으면 지도 중심
        const targetPosition = roadviewTarget 
          ? new window.naver.maps.LatLng(roadviewTarget.lat, roadviewTarget.lng)
          : mapInstance.current.getCenter();
        panoInstance.current.setPosition(targetPosition);
        panoInstance.current.setVisible(true);
      } else {
        // 로드뷰 닫기
        panoInstance.current.setVisible(false);
      }
    }
  };

  // Selector 모드에서 지도 클릭 시 로드뷰 열기
  useEffect(() => {
    if (!mapInstance.current || roadviewMode !== 'selector') return;

    const clickListener = window.naver.maps.Event.addListener(mapInstance.current, 'click', function(e) {
      if (isSelectingRoadview && panoInstance.current) {
        const clickedPosition = e.coord;

        // 로드뷰 열기
        panoInstance.current.setPosition(clickedPosition);
        panoInstance.current.setVisible(true);
        setIsRoadviewOpen(true);
      }
    });

    return () => {
      if (clickListener) {
        window.naver.maps.Event.removeListener(clickListener);
      }
    };
  }, [isSelectingRoadview, roadviewMode]);

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
    <div ref={containerRef} style={{ position: 'relative', ...style, overflow: 'hidden' }}>
      {/* 지도 */}
      <div
        ref={mapRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
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
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: isRoadviewOpen ? 'block' : 'none'
          }}
        ></div>
      )}

      {/* 미니맵 (로드뷰 열릴 때만 표시) */}
      {showRoadview && (
        <div
          ref={minimapRef}
          style={{
            position: 'absolute',
            top: '60px',
            right: '10px',
            width: '180px',
            height: '140px',
            border: '3px solid white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            zIndex: 10000,
            display: isRoadviewOpen ? 'block' : 'none'
          }}
        ></div>
      )}

      {/* 로드뷰 토글 버튼 */}
      {showRoadview && (
        <button
          type="button"
          onClick={toggleRoadview}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10001,
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
          {roadviewMode === 'selector'
            ? (isSelectingRoadview
                ? (isRoadviewOpen ? '🗺️ 지도 보기' : '🚫 선택 취소')
                : '👁️ 로드뷰 선택')
            : (isRoadviewOpen ? '🗺️ 지도 보기' : '👁️ 로드뷰')
          }
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

    </div>
  );
}

export default NaverMap;
