import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
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
            <li><Link to="/admin/buttons" className={isActive('/admin/buttons')}>관리자</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
