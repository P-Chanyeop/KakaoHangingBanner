import React, { useRef, useEffect, useState } from 'react';
import './MapTabs.css';

const MAP_PROVIDERS = [
  { id: 'kakao', name: '카카오맵', icon: 'fa-comment' },
  { id: 'naver', name: '네이버지도', icon: 'fa-n' },
  { id: 'leaflet', name: 'OpenStreetMap', icon: 'fa-map' }
];

function MapTabs({ activeProvider, onProviderChange }) {
  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeTab = tabsRef.current[activeProvider];
    if (activeTab) {
      setIndicatorStyle({
        left: `${activeTab.offsetLeft}px`,
        width: `${activeTab.offsetWidth}px`
      });
    }
  }, [activeProvider]);

  return (
    <div className="map-tabs-container">
      <div className="map-tab-indicator" style={indicatorStyle}></div>
      {MAP_PROVIDERS.map(provider => (
        <button
          key={provider.id}
          type="button"
          ref={el => tabsRef.current[provider.id] = el}
          className={`map-tab-button ${activeProvider === provider.id ? 'active' : ''}`}
          onClick={() => onProviderChange(provider.id)}
        >
          <i className={`fas ${provider.icon} map-tab-icon`}></i>
          {provider.name}
        </button>
      ))}
    </div>
  );
}

export default MapTabs;
