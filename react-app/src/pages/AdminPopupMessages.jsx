import React, { useState, useEffect } from 'react';
import { popupMessagesAPI } from '../services/api';
import './AdminPopupMessages.css';

// 경북 지역
const GYEONGBUK_REGIONS = [
  '경산시', '경주시', '고령군', '구미시', '군위군', '김천시',
  '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군',
  '영양군', '영주시', '영천시', '예천군', '울진군', '의성군',
  '청도군', '청송군', '칠곡군', '포항시'
].sort();

// 경남 지역
const GYEONGNAM_REGIONS = [
  '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시',
  '부산시', '사천시', '산청군', '양산시', '울산시', '의령군',
  '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군',
  '함양군', '합천군'
].sort();

/**
 * 팝업 메시지 관리 페이지
 */
function AdminPopupMessages() {
  const [webhardContent, setWebhardContent] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [regionMessages, setRegionMessages] = useState({});
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionContent, setRegionContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'regions'

  useEffect(() => {
    loadMessages();
    loadAllRegionMessages();
  }, []);

  /**
   * 팝업 메시지 로드
   */
  const loadMessages = async () => {
    try {
      const webhard = await popupMessagesAPI.getByName('webhard');
      const notice = await popupMessagesAPI.getByName('notice');
      setWebhardContent(webhard.content || '');
      setNoticeContent(notice.content || '');
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  /**
   * 모든 지역 메시지 로드
   */
  const loadAllRegionMessages = async () => {
    const allRegions = [...GYEONGBUK_REGIONS, ...GYEONGNAM_REGIONS];
    const messages = {};

    for (const region of allRegions) {
      try {
        const message = await popupMessagesAPI.getByName(`region_${region}`);
        messages[region] = message.content || '';
      } catch (error) {
        messages[region] = '';
      }
    }

    setRegionMessages(messages);
  };

  /**
   * 지역 선택 핸들러
   */
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setRegionContent(regionMessages[region] || '');
  };

  /**
   * 웹하드 메시지 저장
   */
  const saveWebhard = async () => {
    setLoading(true);
    try {
      await popupMessagesAPI.save('webhard', webhardContent);
      alert('웹하드 정보가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 공지사항 메시지 저장
   */
  const saveNotice = async () => {
    setLoading(true);
    try {
      await popupMessagesAPI.save('notice', noticeContent);
      alert('공지사항이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 지역 메시지 저장
   */
  const saveRegionMessage = async () => {
    if (!selectedRegion) {
      alert('지역을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      await popupMessagesAPI.save(`region_${selectedRegion}`, regionContent);
      setRegionMessages(prev => ({
        ...prev,
        [selectedRegion]: regionContent
      }));
      alert(`${selectedRegion} 정보가 저장되었습니다.`);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-popup-messages">
      <h1>팝업 메시지 관리</h1>

      {/* 탭 메뉴 */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          일반 메시지
        </button>
        <button
          className={`tab ${activeTab === 'regions' ? 'active' : ''}`}
          onClick={() => setActiveTab('regions')}
        >
          지역별 메시지
        </button>
      </div>

      {/* 일반 메시지 탭 */}
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
            <button onClick={saveWebhard} disabled={loading}>
              저장
            </button>
          </div>

          <div className="message-section">
            <h2>공지사항</h2>
            <textarea
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="공지사항을 입력하세요"
              rows="5"
            />
            <button onClick={saveNotice} disabled={loading}>
              저장
            </button>
          </div>
        </>
      )}

      {/* 지역별 메시지 탭 */}
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
                  {regionMessages[region] && <span className="dot">●</span>}
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
                  {regionMessages[region] && <span className="dot">●</span>}
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
                <button onClick={saveRegionMessage} disabled={loading}>
                  저장
                </button>
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
