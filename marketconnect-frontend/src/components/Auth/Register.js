// Register.js
import React, { useState } from 'react';
import { post } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'vendor',
  address: '',
  pincode: ''
});

  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg('Please wait...');

    try {
      const res = await post('/auth/register', form);

      if (res && res.msg === 'Registered successfully') {
        setMsg('✔️ Registered! Redirecting...');
        setTimeout(() => {
          nav(form.role === 'vendor' ? '/login/vendor' : '/login/supplier');
        }, 800);
      } else {
        setMsg('❗ ' + (res.msg || JSON.stringify(res)));
      }

    } catch (err) {
      setMsg('❗ Network error: ' + (err.message || err));
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          <div className="mc-card p-4">
            <h2
              style={{
                textAlign: 'center',
                background: 'linear-gradient(90deg, var(--mc-primary), #38bdf8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 700,
                marginBottom: 20
              }}
            >
              Create Your Account
            </h2>

            {/* Role Switch */}
            <div className="d-flex gap-2 mb-3 justify-content-center">
              <button
                type="button"
                className={`btn ${form.role === 'vendor' ? 'mc-btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setForm({ ...form, role: 'vendor' })}
              >
                Vendor
              </button>

              <button
                type="button"
                className={`btn ${form.role === 'supplier' ? 'mc-btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setForm({ ...form, role: 'supplier' })}
              >
                Supplier
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit}>
              <input
                className="form-control mb-3"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />

              <input
                className="form-control mb-3"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />

              <textarea
                className="form-control mb-3"
                placeholder="Address"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Pincode"
                required
                value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })}
                pattern="[0-9]{6}"
                title="Enter 6 digit pincode"
              />

              <select
                className="form-select mb-3"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="vendor">Vendor</option>
                <option value="supplier">Supplier</option>
              </select>

              <div className="d-grid">
                <button type="submit" className="btn mc-btn-primary btn-lg">
                  Register
                </button>
              </div>

              <div
                className="mt-3"
                style={{
                  textAlign: 'center',
                  color: msg.includes('✔️') ? 'green' : 'crimson',
                  fontWeight: 500
                }}
              >
                {msg}
              </div>
            </form>

            <div className="text-center mt-3 text-muted">
              Already have an account?{' '}
              <a href="/login/vendor">Login</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
