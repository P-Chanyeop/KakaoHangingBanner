import React, { useState, useEffect } from 'react';
import MapView from './components/Map/MapView';
import PostStandList from './components/PostStand/PostStandList';
import PostStandDetail from './components/PostStand/PostStandDetail';
import PostStandForm from './components/PostStand/PostStandForm';
import api from './services/api';
import './App.css';

function App() {
  const [postStands, setPostStands] = useState([]);
  const [selectedPostStand, setSelectedPostStand] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostStand, setEditingPostStand] = useState(null);
  
  // 모든 게시대 로드
  const loadPostStands = async () => {
    try {
      const data = await api.getAllPostStands();
      setPostStands(data);
    } catch (error) {
      console.error('Failed to load post stands:', error);
    }
  };
  
  // 컴포넌트 마운트 시 게시대 로드
  useEffect(() => {
    loadPostStands();
  }, []);
  
  // 게시대 선택 핸들러
  const handleSelectPostStand = (postStand) => {
    setSelectedPostStand(postStand);
  };
  
  // 게시대 상세 모달 닫기
  const handleCloseDetail = () => {
    setSelectedPostStand(null);
  };
  
  // 게시대 수정 모드 열기
  const handleEditPostStand = (postStand) => {
    setEditingPostStand(postStand);
    setIsFormOpen(true);
    setSelectedPostStand(null);
  };
  
  // 새 게시대 등록 모드 열기
  const handleAddPostStand = () => {
    setEditingPostStand(null);
    setIsFormOpen(true);
  };
  
  // 폼 닫기
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPostStand(null);
  };
  
  // 게시대 저장 (등록/수정)
  const handleSavePostStand = async (postStandData) => {
    try {
      if (editingPostStand) {
        // 기존 게시대 수정
        await api.updatePostStand(editingPostStand.id, postStandData);
      } else {
        // 새 게시대 등록
        await api.createPostStand(postStandData);
      }
      
      // 폼 닫고 게시대 목록 새로고침
      setIsFormOpen(false);
      setEditingPostStand(null);
      loadPostStands();
    } catch (error) {
      console.error('Failed to save post stand:', error);
      alert('게시대 저장 중 오류가 발생했습니다.');
    }
  };
  
  // 게시대 삭제
  const handleDeletePostStand = async (id) => {
    try {
      await api.deletePostStand(id);
      setSelectedPostStand(null);
      loadPostStands();
    } catch (error) {
      console.error('Failed to delete post stand:', error);
      alert('게시대 삭제 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>지역별 게시대 지도</h1>
        <button className="add-button" onClick={handleAddPostStand}>
          새 게시대 등록
        </button>
      </header>
      
      <main className="app-content">
        <div className="map-section">
          <MapView onSelectPostStand={handleSelectPostStand} />
        </div>
        
        <div className="list-section">
          <PostStandList 
            postStands={postStands} 
            onSelectPostStand={handleSelectPostStand} 
          />
        </div>
      </main>
      
      {selectedPostStand && (
        <PostStandDetail 
          postStand={selectedPostStand}
          onClose={handleCloseDetail}
          onEdit={handleEditPostStand}
          onDelete={handleDeletePostStand}
        />
      )}
      
      {isFormOpen && (
        <PostStandForm 
          postStand={editingPostStand}
          onSubmit={handleSavePostStand}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
