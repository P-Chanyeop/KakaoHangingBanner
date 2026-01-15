import React, { useEffect, useRef, useState } from 'react';
import './InteractiveMap.css';

// 경북 지역 (MapSearch.jsx와 동일)
const GYEONGBUK_REGIONS = [
  '경산시', '경주시', '고령군', '구미시', '군위군', '김천시',
  '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군',
  '영양군', '영주시', '영천시', '예천군', '울진군', '의성군',
  '청도군', '청송군', '칠곡군', '포항시', '대구광역시'
];

// SVG 지역명 매핑 (SVG의 지역명 → 실제 지역명)
const REGION_NAME_MAP = {
  '포항시 남구': '포항시',
  '포항시 북구': '포항시'
};

// 경남 지역 (MapSearch.jsx와 동일)
const GYEONGNAM_REGIONS = [
  '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시',
  '부산시', '사천시', '산청군', '양산시', '울산시', '의령군',
  '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군',
  '함양군', '합천군'
];

/**
 * 인터랙티브 지도 컴포넌트
 * - 각 시군구를 클릭할 수 있는 SVG 지도
 * - 호버 시 하이라이트 효과
 * - 지역명 라벨 표시
 */
function InteractiveMap({ onRegionClick, region = 'gyeongbuk' }) {
  const svgContainerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    // SVG 파일 로드
    const loadSVG = async () => {
      try {
        const svgFile = region === 'gyeongbuk'
          ? '/static/경상북도_시군구.svg'
          : '/static/경상남도_시군구.svg';

        const response = await fetch(svgFile);
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error('SVG 로드 실패:', error);
      }
    };

    loadSVG();
  }, [region]);

  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    // 허용된 지역 목록
    const allowedRegions = region === 'gyeongbuk' ? GYEONGBUK_REGIONS : GYEONGNAM_REGIONS;

    // SVG 내의 모든 path 요소 찾기
    const paths = svgContainerRef.current.querySelectorAll('path[id]');
    const svgElement = svgContainerRef.current.querySelector('svg');

    // 기존 라벨 제거
    const existingLabels = svgContainerRef.current.querySelectorAll('.region-label');
    existingLabels.forEach(label => label.remove());

    // 허용된 지역들의 전체 경계 박스 계산
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // 이미 라벨이 추가된 지역명 추적
    const addedLabels = new Set();

    // 대구 위치 계산을 위한 주변 지역 좌표 수집
    let gyeongsanCenter = null;
    let chilgokCenter = null;

    paths.forEach(path => {
      const svgRegionName = path.id;

      // 울릉군은 숨김 처리
      if (svgRegionName === '울릉군') {
        path.style.display = 'none';
        return;
      }

      // SVG 지역명을 실제 지역명으로 매핑
      const regionName = REGION_NAME_MAP[svgRegionName] || svgRegionName;

      // 허용된 지역인지 확인
      const isAllowed = allowedRegions.includes(regionName);

      // 허용된 지역의 경계 박스 계산 (viewBox 조정용)
      if (isAllowed) {
        try {
          const bbox = path.getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);

          // 대구 위치 계산을 위한 주변 지역 중심점 저장
          if (svgRegionName === '경산시') {
            gyeongsanCenter = {
              x: bbox.x + bbox.width / 2,
              y: bbox.y + bbox.height / 2
            };
          } else if (svgRegionName === '칠곡군') {
            chilgokCenter = {
              x: bbox.x + bbox.width / 2,
              y: bbox.y + bbox.height / 2
            };
          }
        } catch (error) {
          // getBBox 실패 시 무시
        }
      }

      // 기본 스타일 설정
      if (isAllowed) {
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

        // 라벨 추가 (허용된 지역만, 중복 방지)
        if (!addedLabels.has(regionName)) {
          try {
            const bbox = path.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', centerX);
            label.setAttribute('y', centerY);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('class', 'region-label');
            label.setAttribute('pointer-events', 'none');
            label.style.fontSize = '12px';
            label.style.fontWeight = 'bold';
            label.style.fill = '#333';
            label.style.userSelect = 'none';
            label.textContent = regionName;

            svgElement.appendChild(label);
            addedLabels.add(regionName);
          } catch (error) {
            console.error(`라벨 추가 실패 (${regionName}):`, error);
          }
        }
      } else {
        // 허용되지 않은 지역은 회색으로 표시하고 클릭 불가
        path.style.fill = '#e0e0e0';
        path.style.stroke = '#999';
        path.style.strokeWidth = '0.5';
        path.style.cursor = 'not-allowed';
        path.style.opacity = '0.5';
      }
    });

    // 경상북도인 경우 대구광역시를 수동으로 추가
    if (region === 'gyeongbuk' && gyeongsanCenter && chilgokCenter) {
      try {
        // 대구 위치: 경산시와 칠곡군 사이 (약간 서쪽)
        const daeguX = (gyeongsanCenter.x + chilgokCenter.x) / 2 - 20;
        const daeguY = (gyeongsanCenter.y + chilgokCenter.y) / 2;
        const daeguRadius = 25;

        // 대구를 표현하는 원형 path 생성
        const daeguPath = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        daeguPath.setAttribute('id', '대구광역시');
        daeguPath.setAttribute('cx', daeguX);
        daeguPath.setAttribute('cy', daeguY);
        daeguPath.setAttribute('r', daeguRadius);
        daeguPath.style.fill = '#f0f0f0';
        daeguPath.style.stroke = '#666';
        daeguPath.style.strokeWidth = '1';
        daeguPath.style.cursor = 'pointer';
        daeguPath.style.transition = 'all 0.2s';

        // 마우스 이벤트
        const handleDaeguMouseEnter = () => {
          daeguPath.style.fill = '#fbbf24';
          daeguPath.style.stroke = '#f59e0b';
          daeguPath.style.strokeWidth = '2';
        };

        const handleDaeguMouseLeave = () => {
          daeguPath.style.fill = '#f0f0f0';
          daeguPath.style.stroke = '#666';
          daeguPath.style.strokeWidth = '1';
        };

        const handleDaeguClick = () => {
          if (onRegionClick) {
            onRegionClick('대구광역시');
          }
        };

        daeguPath.addEventListener('mouseenter', handleDaeguMouseEnter);
        daeguPath.addEventListener('mouseleave', handleDaeguMouseLeave);
        daeguPath.addEventListener('click', handleDaeguClick);
        daeguPath._listeners = { handleDaeguMouseEnter, handleDaeguMouseLeave, handleDaeguClick };

        svgElement.appendChild(daeguPath);

        // 대구광역시 라벨 추가
        const daeguLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        daeguLabel.setAttribute('x', daeguX);
        daeguLabel.setAttribute('y', daeguY);
        daeguLabel.setAttribute('text-anchor', 'middle');
        daeguLabel.setAttribute('dominant-baseline', 'middle');
        daeguLabel.setAttribute('class', 'region-label');
        daeguLabel.setAttribute('pointer-events', 'none');
        daeguLabel.style.fontSize = '11px';
        daeguLabel.style.fontWeight = 'bold';
        daeguLabel.style.fill = '#333';
        daeguLabel.style.userSelect = 'none';
        daeguLabel.textContent = '대구';

        svgElement.appendChild(daeguLabel);
      } catch (error) {
        console.error('대구광역시 추가 실패:', error);
      }
    }

    // 허용된 지역들만 보이도록 viewBox 조정
    if (svgElement && minX !== Infinity) {
      const padding = 20; // 여백
      const width = maxX - minX;
      const height = maxY - minY;
      svgElement.setAttribute('viewBox',
        `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`
      );
    }

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

      // 대구 circle 클린업
      const daeguCircle = svgContainerRef.current?.querySelector('circle#대구광역시');
      if (daeguCircle && daeguCircle._listeners) {
        daeguCircle.removeEventListener('mouseenter', daeguCircle._listeners.handleDaeguMouseEnter);
        daeguCircle.removeEventListener('mouseleave', daeguCircle._listeners.handleDaeguMouseLeave);
        daeguCircle.removeEventListener('click', daeguCircle._listeners.handleDaeguClick);
      }
    };
  }, [svgContent, onRegionClick, region]);

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
