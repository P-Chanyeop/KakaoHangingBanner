import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <i className="fas fa-map-marked-alt"></i> 참신한 게시대
        </Link>
        <nav>
          <ul className="nav-menu">
            <li><Link to="/" className={isActive('/')}>홈</Link></li>
            <li><Link to="/map" className={isActive('/map')}>지도 검색</Link></li>
            <li><Link to="/stands/new" className={isActive('/stands/new')}>게시대 등록</Link></li>
            {isAdmin && (
              <li><Link to="/admin/buttons" className={isActive('/admin/buttons')}>관리자</Link></li>
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
              <li><Link to="/login" className={isActive('/login')}>로그인</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
