import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={handleLinkClick}>
          <i className="fas fa-map-marked-alt"></i> 참신한 게시대
        </Link>

        {/* 햄버거 버튼 (모바일) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 토글"
        >
          <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
        </button>

        <nav className={`nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-menu">
            <li><Link to="/" className={isActive('/')} onClick={handleLinkClick}>홈</Link></li>
            <li><Link to="/map" className={isActive('/map')} onClick={handleLinkClick}>지도 검색</Link></li>
            <li><Link to="/stands/new" className={isActive('/stands/new')} onClick={handleLinkClick}>게시대 등록</Link></li>
            {isAdmin && (
              <li><Link to="/admin/buttons" className={isActive('/admin/buttons')} onClick={handleLinkClick}>관리자</Link></li>
            )}
            {isAuthenticated ? (
              <>
                <li className="user-info">
                  <i className="fas fa-user-circle"></i> {user?.username}
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i> 로그아웃
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login" className={isActive('/login')} onClick={handleLinkClick}>로그인</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
