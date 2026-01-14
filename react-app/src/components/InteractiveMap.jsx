import React, { useEffect, useRef, useState } from 'react';
import './InteractiveMap.css';

/**
 * 인터랙티브 지도 컴포넌트
 * - 각 시군구를 클릭할 수 있는 SVG 지도
 * - 호버 시 하이라이트 효과
 */
function InteractiveMap({ onRegionClick, region = 'gyeongbuk' }) {
  const svgContainerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    // SVG 파일 로드
    const svgFile = region === 'gyeongbuk'
      ? '/static/경상북도_시군구.svg'
      : '/static/경상남도_시군구.svg';

    fetch(svgFile)
      .then(response => response.text())
      .then(text => setSvgContent(text))
      .catch(error => console.error('SVG 로드 실패:', error));
  }, [region]);

  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    // SVG 내의 모든 path 요소 찾기
    const paths = svgContainerRef.current.querySelectorAll('path[id]');

    paths.forEach(path => {
      const regionName = path.id;

      // 기본 스타일 설정
      path.style.fill = '#f0f0f0';
      path.style.stroke = '#666';
      path.style.strokeWidth = '0.5';
      path.style.cursor = 'pointer';
      path.style.transition = 'all 0.2s';

      // 마우스 오버 이벤트
      const handleMouseEnter = () => {
        path.style.fill = '#fbbf24';
        path.style.stroke = '#f59e0b';
        path.style.strokeWidth = '1.5';
      };

      // 마우스 아웃 이벤트
      const handleMouseLeave = () => {
        path.style.fill = '#f0f0f0';
        path.style.stroke = '#666';
        path.style.strokeWidth = '0.5';
      };

      // 클릭 이벤트
      const handleClick = () => {
        if (onRegionClick) {
          onRegionClick(regionName);
        }
      };

      path.addEventListener('mouseenter', handleMouseEnter);
      path.addEventListener('mouseleave', handleMouseLeave);
      path.addEventListener('click', handleClick);

      // 이벤트 리스너 저장 (클린업용)
      path._listeners = { handleMouseEnter, handleMouseLeave, handleClick };
    });

    // 클린업
    return () => {
      const paths = svgContainerRef.current?.querySelectorAll('path[id]');
      paths?.forEach(path => {
        if (path._listeners) {
          path.removeEventListener('mouseenter', path._listeners.handleMouseEnter);
          path.removeEventListener('mouseleave', path._listeners.handleMouseLeave);
          path.removeEventListener('click', path._listeners.handleClick);
        }
      });
    };
  }, [svgContent, onRegionClick]);

  return (
    <div className="interactive-map-container">
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', color: '#333' }}>
        {region === 'gyeongbuk' ? '경상북도' : '경상남도'}
      </h3>
      <div
        ref={svgContainerRef}
        className="map-wrapper"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
      />
    </div>
  );
}

export default InteractiveMap;
