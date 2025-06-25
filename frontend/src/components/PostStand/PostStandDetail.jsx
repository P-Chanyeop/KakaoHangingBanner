import React from 'react';
import './PostStandDetail.css';

const PostStandDetail = ({ postStand, onClose, onEdit, onDelete }) => {
  if (!postStand) return null;

  return (
    <div className="post-stand-detail-overlay">
      <div className="post-stand-detail">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="post-stand-header">
          <h2>{postStand.name}</h2>
          <div className="post-stand-actions">
            <button className="edit-button" onClick={() => onEdit(postStand)}>수정</button>
            <button className="delete-button" onClick={() => {
              if (window.confirm('정말로 이 게시대를 삭제하시겠습니까?')) {
                onDelete(postStand.id);
              }
            }}>삭제</button>
          </div>
        </div>
        
        <div className="post-stand-info">
          <p><strong>주소:</strong> {postStand.address}</p>
          <p><strong>지역:</strong> {postStand.region}</p>
          <p><strong>좌표:</strong> {postStand.latitude}, {postStand.longitude}</p>
        </div>
        
        {postStand.imageUrl && (
          <div className="post-stand-image">
            <img src={postStand.imageUrl} alt={postStand.name} />
          </div>
        )}
        
        {postStand.description && (
          <div className="post-stand-description">
            <h3>설명</h3>
            <p>{postStand.description}</p>
          </div>
        )}
        
        <div className="post-stand-footer">
          <p className="post-stand-timestamp">
            <small>
              생성: {new Date(postStand.createdAt).toLocaleString()}
              {postStand.updatedAt && postStand.updatedAt !== postStand.createdAt && (
                <span> | 수정: {new Date(postStand.updatedAt).toLocaleString()}</span>
              )}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostStandDetail;
