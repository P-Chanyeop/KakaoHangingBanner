import React from 'react';
import './PostStandList.css';

const PostStandList = ({ postStands, onSelectPostStand }) => {
  return (
    <div className="post-stand-list">
      <h2>게시대 목록</h2>
      {postStands.length === 0 ? (
        <p>표시할 게시대가 없습니다.</p>
      ) : (
        <ul>
          {postStands.map(postStand => (
            <li 
              key={postStand.id} 
              className="post-stand-item"
              onClick={() => onSelectPostStand(postStand)}
            >
              <div className="post-stand-item-content">
                <h3>{postStand.name}</h3>
                <p className="post-stand-address">{postStand.address}</p>
                <p className="post-stand-region">{postStand.region}</p>
              </div>
              {postStand.imageUrl && (
                <div className="post-stand-thumbnail">
                  <img src={postStand.imageUrl} alt={postStand.name} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PostStandList;
