import React, { useState, useEffect } from 'react';
import { buttonsAPI } from '../services/api';
import './AdminButtons.css';

function AdminButtons() {
  const [buttons, setButtons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'orange',
    iconClass: '',
    orderIndex: 1,
    active: true
  });

  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    try {
      const data = await buttonsAPI.getAll();
      setButtons(data);
    } catch (error) {
      console.error('버튼 로드 실패:', error);
    }
  };

  const openModal = (button = null) => {
    if (button) {
      setEditingId(button.id);
      setFormData({
        name: button.name,
        url: button.url,
        type: button.type,
        iconClass: button.iconClass,
        orderIndex: button.orderIndex,
        active: button.active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        url: '',
        type: 'orange',
        iconClass: '',
        orderIndex: 1,
        active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      url: '',
      type: 'orange',
      iconClass: '',
      orderIndex: 1,
      active: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await buttonsAPI.update(editingId, formData);
        alert('수정되었습니다.');
      } else {
        await buttonsAPI.create(formData);
        alert('저장되었습니다.');
      }
      closeModal();
      loadButtons();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await buttonsAPI.delete(id);
      alert('삭제되었습니다.');
      loadButtons();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <main className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">버튼 링크 관리</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="fas fa-plus btn-icon"></i>새 버튼 추가
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>아이콘</th>
              <th>이름</th>
              <th>URL</th>
              <th>타입</th>
              <th>순서</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {buttons.map(button => (
              <tr key={button.id}>
                <td>{button.id}</td>
                <td>
                  <i className={`${button.iconClass} icon-preview`}></i>
                </td>
                <td>{button.name}</td>
                <td>
                  <a href={button.url} target="_blank" rel="noopener noreferrer">
                    {button.url}
                  </a>
                </td>
                <td>
                  <span className={button.type === 'orange' ? 'badge badge-orange' : 'badge badge-green'}>
                    {button.type === 'orange' ? '경북협회' : '경남협회'}
                  </span>
                </td>
                <td>{button.orderIndex}</td>
                <td>
                  <span className={button.active ? 'badge badge-active' : 'badge badge-inactive'}>
                    {button.active ? '활성' : '비활성'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-primary" onClick={() => openModal(button)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => handleDelete(button.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={(e) => e.target.className === 'modal active' && closeModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? '버튼 수정' : '새 버튼 추가'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">버튼 이름 *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="url" className="form-label">링크 URL *</label>
                <input
                  type="url"
                  className="form-control"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">타입 *</label>
                <select
                  className="form-control"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="orange">경북협회 (주황색)</option>
                  <option value="green">경남협회 (초록색)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="iconClass" className="form-label">아이콘 클래스 *</label>
                <input
                  type="text"
                  className="form-control"
                  id="iconClass"
                  name="iconClass"
                  value={formData.iconClass}
                  onChange={handleInputChange}
                  placeholder="fas fa-clipboard-list"
                  required
                />
                <small style={{ color: 'var(--text-gray)', marginTop: '0.5rem', display: 'block' }}>
                  Font Awesome 아이콘 클래스 (<a href="https://fontawesome.com/icons" target="_blank" rel="noopener noreferrer">아이콘 검색</a>)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="orderIndex" className="form-label">정렬 순서 *</label>
                <input
                  type="number"
                  className="form-control"
                  id="orderIndex"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  {' '}활성화
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminButtons;
