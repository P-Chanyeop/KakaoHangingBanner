import React, { useState, useEffect } from 'react';
import { popupMessagesAPI } from '../services/api';
import './AdminPopupMessages.css';

/**
 * 팝업 메시지 관리 페이지
 */
function AdminPopupMessages() {
  const [webhardContent, setWebhardContent] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
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

  return (
    <div className="admin-popup-messages">
      <h1>팝업 메시지 관리</h1>

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
    </div>
  );
}

export default AdminPopupMessages;
