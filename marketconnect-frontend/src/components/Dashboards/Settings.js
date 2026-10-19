import React, { useState } from "react";
import { put, post } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../../utils/auth";

export default function Settings() {

  const nav = useNavigate();

  const [dark, setDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [issue, setIssue] = useState("");
  const [feedback, setFeedback] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🎨 Theme
  function toggleTheme() {
    setDark(!dark);
    document.body.classList.toggle("dark-mode");
  }

  // 🔐 Change Password
  async function handleChangePassword() {
    try {
      await put("/user/change-password", {
        oldPassword,
        newPassword
      });

      alert("Password updated successfully ✅");
      setOldPassword("");
      setNewPassword("");

    } catch (err) {
      alert(err.message || "Error");
    }
  }

  // 🐞 Report Issue
async function submitIssue() {

  if (!issue.trim()) {
    alert("Please enter issue");
    return;
  }

  try {
    await post("/user/support", {
      message: issue
    });

    alert("Issue submitted ✅");
    setIssue("");

  } catch (err) {
    console.log(err);
    alert(err.message || "Error submitting issue");
  }
}

  // 💬 Feedback
async function submitFeedback() {

  if (!feedback.trim()) {
    alert("Please enter feedback");
    return;
  }

  try {
    await post("/user/feedback", {
      message: feedback
    });

    alert("Thanks for feedback 💬");
    setFeedback("");

  } catch (err) {
    console.log(err);
    alert(err.message || "Error submitting feedback");
  }
}

  // ❗ YOUR ORIGINAL DELETE FUNCTION (UNCHANGED)
  async function handleDelete() {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();

      alert(data.msg || "Account deleted");

      clearToken();
      localStorage.clear();

      nav("/");
      window.location.reload();

    } catch (err) {
      alert("Error deleting account ❌");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>⚙️ Settings</h2>

      {/* 🎨 THEME */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4>Appearance</h4>
        <button className="mc-btn-primary" onClick={toggleTheme}>
          Toggle Theme
        </button>
      </div>

      {/* 🔐 PASSWORD */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4>Security</h4>
        <button
          className="mc-btn-primary"
          onClick={() => setShowPassword(!showPassword)}
        >
          Change Password
        </button>

        {showPassword && (
          <div style={{ marginTop: 12 }}>
            <input
              className="form-control"
              placeholder="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              className="form-control"
              placeholder="New Password"
              type="password"
              style={{ marginTop: 8 }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              className="mc-btn-primary"
              style={{ marginTop: 8 }}
              onClick={handleChangePassword}
            >
              Update Password
            </button>
          </div>
        )}
      </div>

      {/* ❓ SUPPORT */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4> Help & Support</h4>

        <button
          className="mc-btn-primary"
          onClick={() => setShowSupport(!showSupport)}
        >
          View Help
        </button>

        {showSupport && (
          <div style={{ marginTop: 10 }}>
            <p>📧 Email: support@marketconnect.com</p>
          </div>
        )}
      </div>

      {/* 🐞 REPORT ISSUE */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4>Report Issue</h4>

        <button
          className="mc-btn-primary"
          onClick={() => setShowIssue(!showIssue)}
        >
          Report Problem
        </button>

        {showIssue && (
          <div style={{ marginTop: 10 }}>
            <textarea
              className="form-control"
              placeholder="Describe your issue..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />

            <button
              className="mc-btn-primary"
              style={{ marginTop: 8 }}
              onClick={submitIssue}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* 💬 FEEDBACK */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4>Feedback</h4>

        <button
          className="mc-btn-primary"
          onClick={() => setShowFeedback(!showFeedback)}
        >
          Give Feedback
        </button>

        {showFeedback && (
          <div style={{ marginTop: 10 }}>
            <textarea
              className="form-control"
              placeholder="Your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              className="mc-btn-primary"
              style={{ marginTop: 8 }}
              onClick={submitFeedback}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* ⚠️ DELETE */}
      <div className="mc-card" style={{ marginTop: 20 }}>
        <h4>Account Delete</h4>

        <button
          className="btn btn-danger"
          onClick={handleDelete}
        >
          Delete My Account
        </button>
      </div>

    </div>
  );
}