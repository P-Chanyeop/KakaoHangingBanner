import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet 기본 아이콘 설정 (React에서 Leaflet 사용 시 필요)
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapMarker = ({ postStand, onSelect }) => {
  if (!postStand.latitude || !postStand.longitude) {
    return null;
  }

  return (
    <Marker
      position={[postStand.latitude, postStand.longitude]}
      icon={defaultIcon}
      eventHandlers={{
        click: () => {
          onSelect(postStand);
        }
      }}
    >
      <Popup>
        <div className="marker-popup">
          <h3>{postStand.name}</h3>
          <p>{postStand.address}</p>
          {postStand.imageUrl && (
            <img 
              src={postStand.imageUrl} 
              alt={postStand.name} 
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
            />
          )}
          <button onClick={() => onSelect(postStand)}>상세 보기</button>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
