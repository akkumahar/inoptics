import React, { useState, useEffect } from 'react';
import './AdminBadgesList.css';

const AdminBadgesList = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('https://inoptics.in/api/get-all-badges.php');
      const data = await response.json();
      
      if (data.success) {
        setBadges(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch badges');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading badges...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Exhibitor Badges List</h1>
      <div className="total-count">Total Badges: {badges.length}</div>
      
      <div className="badges-grid">
        {badges.length === 0 ? (
          <div className="no-badges">No badges found</div>
        ) : (
          badges.map((badge) => (
            <div key={badge.id} className="badge-card">
              <div className="badge-photo">
                <img 
                  src={`https://inoptics.in/${badge.candidate_photo}`} 
                  alt={badge.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/250x250?text=No+Image';
                  }}
                />
              </div>
              <div className="badge-details">
                <h3>{badge.name}</h3>
                <div className="detail-row">
                  <span className="label">Company:</span>
                  <span className="value">{badge.exhibitor_company_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Stall No:</span>
                  <span className="value">{badge.stall_no}</span>
                </div>
                <div className="detail-row">
                  <span className="label">City:</span>
                  <span className="value">{badge.city}</span>
                </div>
                <div className="detail-row">
                  <span className="label">State:</span>
                  <span className="value">{badge.state}</span>
                </div>
                <div className="qr-section">
                  <img 
                    src={`https://inoptics.in/${badge.qr_code}`} 
                    alt="QR Code"
                    className="qr-code"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x120?text=QR';
                    }}
                  />
                </div>
                <div className="timestamp">
                  Created: {new Date(badge.created_at).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBadgesList;
