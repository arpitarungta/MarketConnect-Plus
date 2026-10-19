// LoginSupplier.js
import React, { useState } from 'react';
import { post } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginSupplier() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg('Please wait...');
    try {
      const res = await post('/auth/login', { ...form});
      if (res && res.token) {
        try {
          localStorage.setItem('token', res.token);
          if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        } catch (e) { }
        setMsg('✔️ Logged in. Redirecting...');
        setTimeout(() => nav('/dashboard/supplier'), 600);
      } else {
        setMsg('❗ ' + (res.msg || JSON.stringify(res)));
      }
    } catch (err) {
      setMsg('❗ Network error: ' + (err.message || err));
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="auth-card" role="form" aria-label="Supplier login form">
          <h2>Supplier</h2>

          <form onSubmit={submit}>
            <label>Email or Phone</label>
            <input
              name="identifier"
              type="text"
              required
              className="form-control"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
            />


            <label htmlFor="supplier-password" style={{ marginTop: 8 }}>Password</label>
            <input
              id="supplier-password"
              name="password"
              type="password"
              required
              className="form-control"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              aria-required="true"
            />

            <div style={{ marginTop: 12 }} className="d-grid">
              <button className="auth-btn" type="submit">Login</button>
            </div>

            <div style={{ textAlign: 'center', color: msg.includes('✔️') ? 'green' : 'crimson', fontWeight: 500, marginTop: 10 }}>
              {msg}
            </div>
          </form>

          <div className="auth-footer" style={{ marginTop: 14 }}>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
