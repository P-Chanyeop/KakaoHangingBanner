import React, { useState, useEffect } from 'react';
import { popupMessagesAPI } from '../services/api';
import './AdminPopupMessages.css';

// 경북 지역
const GYEONGBUK_REGIONS = [
  '경산시', '경주시', '고령군', '구미시', '군위군', '김천시',
  '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군',
  '영양군', '영주시', '영천시', '예천군', '울산시', '울진군', '의성군',
  '청도군', '청송군', '칠곡군', '포항시', '대구광역시'
].sort();

// 경남 지역
const GYEONGNAM_REGIONS = [
  '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시',
  '부산시', '사천시', '산청군', '양산시', '울산시', '의령군',
  '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군',
  '함양군', '합천군'
].sort();

/**
 * 이미지 업로드 컴포넌트
 */
function ImageUploader({ imageUrl, onFileSelect, onDelete, label }) {
  return (
    <div className="image-upload-section">
      <label className="image-upload-label">{label || '이미지'}</label>
      {imageUrl && (
        <div className="image-preview">
          <img src={imageUrl} alt="미리보기" />
          <button type="button" className="image-delete-btn" onClick={onDelete}>
            <i className="fas fa-trash"></i> 이미지 삭제
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileSelect(e.target.files[0] || null)}
      />
    </div>
  );
}

/**
 * 팝업 메시지 관리 페이지
 */
function AdminPopupMessages() {
  const [webhardContent, setWebhardContent] = useState('');
  const [webhardImageUrl, setWebhardImageUrl] = useState('');
  const [webhardImageFile, setWebhardImageFile] = useState(null);
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeImageUrl, setNoticeImageUrl] = useState('');
  const [noticeImageFile, setNoticeImageFile] = useState(null);
  const [regionMessages, setRegionMessages] = useState({});
  const [regionImages, setRegionImages] = useState({});
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionContent, setRegionContent] = useState('');
  const [regionImageUrl, setRegionImageUrl] = useState('');
  const [regionImageFile, setRegionImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadMessages();
    loadAllRegionMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const webhard = await popupMessagesAPI.getByName('webhard');
      const notice = await popupMessagesAPI.getByName('notice');
      setWebhardContent(webhard.content || '');
      setWebhardImageUrl(webhard.imageUrl || '');
      setNoticeContent(notice.content || '');
      setNoticeImageUrl(notice.imageUrl || '');
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  const loadAllRegionMessages = async () => {
    const allRegions = [...GYEONGBUK_REGIONS, ...GYEONGNAM_REGIONS];
    const messages = {};
    const images = {};

    for (const region of allRegions) {
      try {
        const message = await popupMessagesAPI.getByName(`region_${region}`);
        messages[region] = message.content || '';
        images[region] = message.imageUrl || '';
      } catch (error) {
        messages[region] = '';
        images[region] = '';
      }
    }

    setRegionMessages(messages);
    setRegionImages(images);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setRegionContent(regionMessages[region] || '');
    setRegionImageUrl(regionImages[region] || '');
    setRegionImageFile(null);
  };

  const saveWebhard = async () => {
    setLoading(true);
    try {
      const result = await popupMessagesAPI.saveWithImage('webhard', webhardContent, webhardImageFile);
      setWebhardImageUrl(result.imageUrl || '');
      setWebhardImageFile(null);
      alert('웹하드 정보가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveNotice = async () => {
    setLoading(true);
    try {
      const result = await popupMessagesAPI.saveWithImage('notice', noticeContent, noticeImageFile);
      setNoticeImageUrl(result.imageUrl || '');
      setNoticeImageFile(null);
      alert('공지사항이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveRegionMessage = async () => {
    if (!selectedRegion) {
      alert('지역을 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await popupMessagesAPI.saveWithImage(`region_${selectedRegion}`, regionContent, regionImageFile);
      setRegionMessages(prev => ({ ...prev, [selectedRegion]: regionContent }));
      setRegionImages(prev => ({ ...prev, [selectedRegion]: result.imageUrl || '' }));
      setRegionImageUrl(result.imageUrl || '');
      setRegionImageFile(null);
      alert(`${selectedRegion} 정보가 저장되었습니다.`);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (name, setUrl) => {
    if (!window.confirm('이미지를 삭제하시겠습니까?')) return;
    try {
      await popupMessagesAPI.deleteImage(name);
      setUrl('');
      if (name.startsWith('region_')) {
        const region = name.replace('region_', '');
        setRegionImages(prev => ({ ...prev, [region]: '' }));
      }
      alert('이미지가 삭제되었습니다.');
    } catch (error) {
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="admin-popup-messages">
      <h1>팝업 메시지 관리</h1>

      <div className="tabs">
        <button className={`tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          일반 메시지
        </button>
        <button className={`tab ${activeTab === 'regions' ? 'active' : ''}`} onClick={() => setActiveTab('regions')}>
          지역별 메시지
        </button>
      </div>

      {activeTab === 'general' && (
        <>
          <div className="message-section">
            <h2>웹하드 아이디/비밀번호</h2>
            <textarea
              value={webhardContent}
              onChange={(e) => setWebhardContent(e.target.value)}
              placeholder="웹하드 정보를 입력하세요"
              rows="5"
            />
            <ImageUploader
              imageUrl={webhardImageUrl}
              onFileSelect={setWebhardImageFile}
              onDelete={() => handleDeleteImage('webhard', setWebhardImageUrl)}
              label="웹하드 이미지"
            />
            <button onClick={saveWebhard} disabled={loading}>저장</button>
          </div>

          <div className="message-section">
            <h2>공지사항</h2>
            <textarea
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="공지사항을 입력하세요"
              rows="5"
            />
            <ImageUploader
              imageUrl={noticeImageUrl}
              onFileSelect={setNoticeImageFile}
              onDelete={() => handleDeleteImage('notice', setNoticeImageUrl)}
              label="공지사항 이미지"
            />
            <button onClick={saveNotice} disabled={loading}>저장</button>
          </div>
        </>
      )}

      {activeTab === 'regions' && (
        <div className="regions-container">
          <div className="regions-sidebar">
            <h3>경상북도</h3>
            <div className="region-list">
              {GYEONGBUK_REGIONS.map(region => (
                <button
                  key={region}
                  className={`region-item ${selectedRegion === region ? 'selected' : ''} ${regionMessages[region] ? 'has-content' : ''}`}
                  onClick={() => handleRegionSelect(region)}
                >
                  {region}
                  {(regionMessages[region] || regionImages[region]) && <span className="dot">●</span>}
                </button>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>경상남도</h3>
            <div className="region-list">
              {GYEONGNAM_REGIONS.map(region => (
                <button
                  key={region}
                  className={`region-item ${selectedRegion === region ? 'selected' : ''} ${regionMessages[region] ? 'has-content' : ''}`}
                  onClick={() => handleRegionSelect(region)}
                >
                  {region}
                  {(regionMessages[region] || regionImages[region]) && <span className="dot">●</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="region-editor">
            {selectedRegion ? (
              <>
                <h2>{selectedRegion} 정보</h2>
                <textarea
                  value={regionContent}
                  onChange={(e) => setRegionContent(e.target.value)}
                  placeholder={`${selectedRegion}에 대한 정보를 입력하세요.\n예: 담당자, 연락처, 특이사항 등`}
                  rows="10"
                />
                <ImageUploader
                  imageUrl={regionImageUrl}
                  onFileSelect={setRegionImageFile}
                  onDelete={() => handleDeleteImage(`region_${selectedRegion}`, setRegionImageUrl)}
                  label={`${selectedRegion} 이미지`}
                />
                <button onClick={saveRegionMessage} disabled={loading}>저장</button>
              </>
            ) : (
              <div className="no-selection">
                <i className="fas fa-hand-point-left" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }}></i>
                <p>왼쪽에서 지역을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPopupMessages;
