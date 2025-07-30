import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
          <div className="navbar-logo">
            <span className="logo-icon"></span>
            <span className="logo-text">Agents Management System</span>
          </div>
        </Link>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <div className="navbar-user">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-email">{user?.email}</span>
                  <span className="user-role">Administrator</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
