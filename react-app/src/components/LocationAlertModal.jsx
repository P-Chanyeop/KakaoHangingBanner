import React from 'react';

const ALERT_PRESETS = {
  denied: {
    icon: 'fa-location-crosshairs',
    iconColor: '#ef4444',
    title: '위치 권한이 필요합니다',
    description: '브라우저에서 위치 권한을 허용해야 현재 위치로 이동할 수 있습니다.',
    hint: (
      <>
        <strong>권한을 허용하는 방법</strong>
        <ul style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.6 }}>
          <li>주소창 왼쪽 자물쇠(또는 정보) 아이콘 클릭</li>
          <li>"위치" 또는 "Location" 항목을 <strong>허용</strong>으로 변경</li>
          <li>페이지를 새로고침한 뒤 다시 시도</li>
        </ul>
      </>
    )
  },
  'outside-korea': {
    icon: 'fa-triangle-exclamation',
    iconColor: '#f59e0b',
    title: '한국 외 지역입니다',
    description: '현재 위치가 한국 영역을 벗어나 지도가 이동하지 않습니다.',
    hint: '본 서비스는 대한민국 내 게시대 정보를 제공합니다.'
  },
  unavailable: {
    icon: 'fa-circle-exclamation',
    iconColor: '#ef4444',
    title: '위치를 확인할 수 없습니다',
    description: '현재 위치 정보를 가져올 수 없습니다. 잠시 후 다시 시도해 주세요.',
    hint: 'GPS 또는 네트워크 위치 서비스가 꺼져 있을 수 있습니다.'
  },
  timeout: {
    icon: 'fa-clock',
    iconColor: '#f59e0b',
    title: '위치 확인 시간 초과',
    description: '현재 위치를 확인하는 데 시간이 너무 오래 걸렸습니다.',
    hint: '네트워크 상태를 확인하고 다시 시도해 주세요.'
  },
  insecure: {
    icon: 'fa-lock',
    iconColor: '#ef4444',
    title: 'HTTPS 환경이 필요합니다',
    description: '위치 서비스는 보안 연결(HTTPS)에서만 사용할 수 있습니다.',
    hint: null
  },
  error: {
    icon: 'fa-circle-exclamation',
    iconColor: '#ef4444',
    title: '오류가 발생했습니다',
    description: '위치를 가져오는 중 오류가 발생했습니다.',
    hint: null
  }
};

function LocationAlertModal({ alert, onClose }) {
  if (!alert) return null;

  const preset = ALERT_PRESETS[alert.type] || ALERT_PRESETS.error;
  const description = alert.message || preset.description;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '420px',
          width: '100%',
          padding: '28px 24px 24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: `${preset.iconColor}1a`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <i
            className={`fas ${preset.icon}`}
            style={{ fontSize: '28px', color: preset.iconColor }}
          ></i>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#111' }}>
          {preset.title}
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
          {description}
        </p>

        {preset.hint && (
          <div
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#374151',
              textAlign: 'left',
              marginBottom: '20px'
            }}
          >
            {preset.hint}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default LocationAlertModal;
