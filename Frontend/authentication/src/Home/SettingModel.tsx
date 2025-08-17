import React, { useEffect, useState } from 'react';
import './Modal.css';
import { FiX } from 'react-icons/fi';

interface SettingsModalProps {
  onClose: () => void;
  userId: string;
  onSave?: (apiKey: string) => void;
  initialError?: string; // NEW - to preload error from parent
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userId, onSave, initialError }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!userId) {
      setError('User ID missing');
      setFetching(false);
      return;
    }

    const fetchApiKey = async () => {
      setFetching(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/get-key/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch API key');
          setApiKey('');
        } else {
          setApiKey(data.apiKey || '');
        }
      } catch {
        setError('Network error while fetching API key');
        setApiKey('');
      } finally {
        setFetching(false);
      }
    };

    fetchApiKey();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) {
      setError('User ID missing');
      return;
    }
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/save-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Specific INVALID API KEY handling
        if (data.error?.includes('INVALID_API_KEY')) {
          setError('❌ The API key you entered is invalid. Please check and try again.');
        } else {
          setError(data.error || 'Failed to save API key');
        }
        setLoading(false);
        return;
      }

      if (onSave) onSave(apiKey);
      setLoading(false);
      onClose();
    } catch {
      setError('Network error while saving API key');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
        <h2>API Key</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div className="modal-body">
          {fetching ? (
            <p>Loading API key...</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
                style={{ borderColor: error ? 'red' : undefined }}
              />
              <button
                type="button"
                className="save-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
