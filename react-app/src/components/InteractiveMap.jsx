import React from 'react';
import gyeongnamSvg from '../assets/경상남도.svg';
import gyeongbukSvg from '../assets/경상북도.svg';
import './InteractiveMap.css';

// 경북 지역 좌표 (대략적인 위치, %)
const GYEONGBUK_COORDS = {
  '포항시': { top: 35, left: 75 },
  '경주시': { top: 50, left: 70 },
  '영천시': { top: 55, left: 60 },
  '경산시': { top: 65, left: 55 },
  '청도군': { top: 70, left: 50 },
  '대구광역시': { top: 70, left: 40 },
  '칠곡군': { top: 60, left: 35 },
  '구미시': { top: 50, left: 30 },
  '김천시': { top: 60, left: 20 },
  '성주군': { top: 70, left: 30 },
  '고령군': { top: 75, left: 35 },
  '상주시': { top: 45, left: 25 },
  '문경시': { top: 35, left: 20 },
  '예천군': { top: 30, left: 30 },
  '안동시': { top: 25, left: 45 },
  '의성군': { top: 40, left: 45 },
  '군위군': { top: 50, left: 45 },
  '영주시': { top: 20, left: 35 },
  '봉화군': { top: 15, left: 50 },
  '울진군': { top: 15, left: 70 },
  '영덕군': { top: 30, left: 70 },
  '청송군': { top: 35, left: 55 },
  '영양군': { top: 25, left: 60 }
};

// 경남 지역 좌표
const GYEONGNAM_COORDS = {
  '창원시': { top: 55, left: 45 },
  '김해시': { top: 45, left: 55 },
  '부산시': { top: 50, left: 70 },
  '양산시': { top: 40, left: 65 },
  '울산시': { top: 30, left: 75 },
  '밀양시': { top: 35, left: 55 },
  '거제시': { top: 75, left: 60 },
  '통영시': { top: 70, left: 45 },
  '고성군': { top: 65, left: 35 },
  '사천시': { top: 60, left: 35 },
  '진주시': { top: 50, left: 30 },
  '함안군': { top: 50, left: 40 },
  '의령군': { top: 45, left: 35 },
  '창녕군': { top: 40, left: 45 },
  '남해군': { top: 75, left: 30 },
  '하동군': { top: 65, left: 20 },
  '산청군': { top: 45, left: 25 },
  '함양군': { top: 35, left: 20 },
  '거창군': { top: 25, left: 25 },
  '합천군': { top: 30, left: 35 }
};

function InteractiveMap({ onRegionClick, region = 'gyeongbuk' }) {
  const coords = region === 'gyeongbuk' ? GYEONGBUK_COORDS : GYEONGNAM_COORDS;

  return (
    <div className="interactive-map-container">
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>
        {region === 'gyeongbuk' ? '경상북도' : '경상남도'}
      </h3>
      <div className="map-wrapper" style={{ position: 'relative' }}>
        <img
          src={region === 'gyeongbuk' ? gyeongbukSvg : gyeongnamSvg}
          alt={region === 'gyeongbuk' ? '경상북도 지도' : '경상남도 지도'}
          className="map-svg"
        />
        {Object.entries(coords).map(([regionName, pos]) => (
          <div
            key={regionName}
            onClick={() => onRegionClick && onRegionClick(regionName)}
            style={{
              position: 'absolute',
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              padding: '6px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#333',
              border: '1.5px solid #d1d5db',
              transition: 'all 0.2s',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fbbf24';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            }}
          >
            {regionName}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InteractiveMap;
