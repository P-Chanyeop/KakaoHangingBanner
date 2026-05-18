// 한국 영역 경계 (lat 33.0~38.9, lng 124.5~132.0)
export const KOREA_BOUNDS = {
  minLat: 33.0,
  maxLat: 38.9,
  minLng: 124.5,
  maxLng: 132.0
};

export const isInKorea = ({ lat, lng }) =>
  lat >= KOREA_BOUNDS.minLat &&
  lat <= KOREA_BOUNDS.maxLat &&
  lng >= KOREA_BOUNDS.minLng &&
  lng <= KOREA_BOUNDS.maxLng;

// 현재 위치를 가져온다. 성공 시 { lat, lng } 반환,
// 실패 시 { type, message } 형태의 객체로 reject.
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject({
        type: 'unavailable',
        message: '이 브라우저에서는 위치 서비스를 사용할 수 없습니다.'
      });
      return;
    }

    if (window.isSecureContext === false) {
      reject({
        type: 'insecure',
        message: '위치 서비스는 HTTPS 환경에서만 사용할 수 있습니다.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let type, message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            type = 'denied';
            message = '위치 권한이 거부되어 현재 위치를 사용할 수 없습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            type = 'unavailable';
            message = '현재 위치 정보를 가져올 수 없습니다.';
            break;
          case error.TIMEOUT:
            type = 'timeout';
            message = '위치 확인 시간이 초과되었습니다.';
            break;
          default:
            type = 'error';
            message = '위치를 가져오는 중 오류가 발생했습니다.';
        }
        reject({ type, message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
