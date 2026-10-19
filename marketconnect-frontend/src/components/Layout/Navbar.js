// src/components/Layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getUser } from '../../utils/auth'; // keep your existing auth util
import logo from '../../assets/logo2.png'; // import from src/assets (bundled)

export default function Navbar() {
  const navigate = useNavigate();

  // Read user safely (util -> fallback localStorage)
  let user = null;
  try {
    user = typeof getUser === 'function' ? getUser() : null;
  } catch (e) {
    user = null;
  }

  if (!user) {
    try {
      const raw = localStorage.getItem('user') || 'null';
      user = JSON.parse(raw);
    } catch (e) {
      user = null;
    }
  }

  function normalizeRole(u) {
    if (!u) return null;
    if (u.role) return String(u.role).toLowerCase();
    if (Array.isArray(u.roles) && u.roles.length) return String(u.roles[0]).toLowerCase();
    return null;
  }

  const role = normalizeRole(user);
  // Dashboard path selection: vendor -> /vendor/dashboard, supplier -> /supplier/dashboard, fallback -> /dashboard
  const dashboardPath = role === 'vendor' ? '/vendor/dashboard' : (role === 'supplier' ? '/supplier/dashboard' : '/dashboard');

  // Debug (enable temporarily if needed)
  // console.debug('Navbar user:', user, 'role:', role, 'dashboardPath:', dashboardPath);

  function logout() {
    try {
      if (typeof clearToken === 'function') clearToken();
    } catch (e) {}
    try { localStorage.removeItem('token'); } catch(e){}
    try { localStorage.removeItem('user'); } catch(e){}
    // navigate home then reload to clear any in-memory auth state
    try { navigate('/'); } catch(e){}
    try { window.location.reload(); } catch(e){}
  }

  const avatarLetter = String((user?.name || user?.username || 'A')).charAt(0).toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" aria-label="MarketConnect home">
          <img
            src={logo}
            alt="MarketConnect+ logo"
            className="mc-logo"
            width="40"
            height="40"
            style={{ display: 'inline-block' }}
          />
          <div className="mc-brand-text" aria-hidden="true">
            <div style={{ fontWeight: 700, lineHeight: 1 }}>MarketConnect+</div>
          </div>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mcNav"
          aria-controls="mcNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mcNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item me-2">
              <Link className="nav-link" to="/">Home</Link>
            </li>

           

            {!user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#/"
                  id="loginDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Login
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="loginDropdown">
                  {/* Dashboard for guests: use a button that navigates to avoid link interference */}
                  <li><Link className="dropdown-item" to="/login/vendor">Vendor</Link></li>
                  <li><Link className="dropdown-item" to="/login/supplier">Supplier</Link></li>
                </ul>
              </li>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#/"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--pastel-mint, #C6FFE3)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', color: '#0F1724', fontWeight: 700
                  }} aria-hidden="true">
                    {avatarLetter}
                  </div>
                  <span>{user?.name || 'You'}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  {/* role-aware dashboard button (use button + navigate to avoid bootstrap dropdown interfering with Link) */}
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        // small safety: if dashboardPath is root fallback, prefer /dashboard
                        const target = dashboardPath || '/dashboard';
                        try { navigate(target); } catch (err) { window.location.href = target; }
                      }}
                    >
                      Dashboard
                    </button>
                  </li>

                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
