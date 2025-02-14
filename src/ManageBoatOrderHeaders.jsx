// src/ManageBoatOrderHeaders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import BulkUploadBoatOrderHeaders from './BulkUploadBoatOrderHeaders';

function ManageBoatOrderHeaders({ model, onClose }) {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newHeader, setNewHeader] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const [editingHeaderId, setEditingHeaderId] = useState(null);
  const [editingHeaderText, setEditingHeaderText] = useState('');
  const [rowDropdownOpen, setRowDropdownOpen] = useState(null);
  const [modelHeaders, setModelHeaders] = useState([]); // Fetched headers for the model

  // Fetch boat order headers for this model from the "boat_order_headers" table
  const fetchHeaders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('boat_order_headers')
      .select('*')
      .eq('model_id', model.id);
    if (error) {
      console.error('Error fetching headers:', error);
      setErrorMsg(error.message);
      setHeaders([]);
    } else {
      setHeaders(data);
    }
    setLoading(false);
  };

  // Fetch model headers for highlighting in the options view
  // (Assuming model headers are stored in the same table as "headers"; if different, adjust query)
  const fetchModelHeaders = async () => {
    // Here, we assume that the "model" prop has an id corresponding to the model
    const { data, error } = await supabase
      .from('boat_order_headers')
      .select('*')
      .eq('model_id', model.id);
    if (error) {
      console.error('Error fetching model headers:', error);
      setModelHeaders([]);
    } else {
      setModelHeaders(data);
    }
  };

  useEffect(() => {
    fetchHeaders();
    fetchModelHeaders();
  }, [model]);

  const handleAddHeader = async () => {
    if (!newHeader.trim()) return;
    const { error } = await supabase
      .from('boat_order_headers')
      .insert([{ model_id: model.id, header_text: newHeader.trim() }]);
    if (error) {
      console.error('Error adding header:', error);
      setErrorMsg(error.message);
    } else {
      setNewHeader('');
      fetchHeaders();
      fetchModelHeaders();
    }
  };

  const handleDeleteHeader = async (headerId) => {
    const { error } = await supabase
      .from('boat_order_headers')
      .delete()
      .eq('id', headerId);
    if (error) {
      console.error('Error deleting header:', error);
      setErrorMsg(error.message);
    } else {
      fetchHeaders();
      fetchModelHeaders();
    }
  };

  const handleEditHeader = (header) => {
    setEditingHeaderId(header.id);
    setEditingHeaderText(header.header_text);
    setRowDropdownOpen(null);
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('boat_order_headers')
      .update({ header_text: editingHeaderText })
      .eq('id', editingHeaderId);
    if (error) {
      console.error('Error updating header:', error);
      setErrorMsg(error.message);
    } else {
      setEditingHeaderId(null);
      setEditingHeaderText('');
      fetchHeaders();
      fetchModelHeaders();
    }
  };

  const handleCancelEdit = () => {
    setEditingHeaderId(null);
    setEditingHeaderText('');
  };

  // Toggle the header actions dropdown
  const toggleHeaderActions = () => {
    setShowHeaderActions(!showHeaderActions);
  };

  const handleAddNewHeaderHeader = () => {
    // For inline add, the input field at the bottom is used.
    setShowHeaderActions(false);
  };

  const handleBulkUploadHeaders = () => {
    setShowBulkUpload(!showBulkUpload);
    setShowHeaderActions(false);
  };

  const handleExportHeaders = () => {
    alert('Export headers functionality not implemented yet.');
    setShowHeaderActions(false);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-container"
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '1200px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Fixed Header */}
        <div
          className="modal-header"
          style={{
            padding: '1rem',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3>Manage Boat Order Headers for {model.name}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <button onClick={toggleHeaderActions} style={{ marginRight: '1rem' }}>
              Actions ▼
            </button>
            {showHeaderActions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '70px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 20,
                }}
              >
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleAddNewHeaderHeader}
                >
                  Add New Header
                </div>
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleBulkUploadHeaders}
                >
                  Bulk Upload Headers
                </div>
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleExportHeaders}
                >
                  Export Headers
                </div>
              </div>
            )}
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Optional Bulk Upload Section */}
        {showBulkUpload && (
          <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <BulkUploadBoatOrderHeaders modelId={model.id} onUploadComplete={fetchHeaders} />
          </div>
        )}

        {/* Scrollable Content */}
        <div
          className="modal-content"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '1rem',
            minHeight: 0,
            maxHeight: 'calc(80vh - 160px)', // adjust header/footer height if needed
          }}
        >
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          {loading ? (
            <p>Loading headers...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#fff',
                  zIndex: 5,
                }}
              >
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Header</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header) => (
                  <tr
                    key={header.id}
                    style={{
                      borderBottom: '1px solid #ddd',
                      position: 'relative',
                      // Highlight row if it matches one of the model headers (exact match, case-insensitive)
                      backgroundColor: modelHeaders.some(
                        (h) =>
                          h.header_text.trim().toLowerCase() ===
                          header.header_text.trim().toLowerCase()
                      )
                        ? '#f0f0f0'
                        : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.5rem' }}>
                      {editingHeaderId === header.id ? (
                        <input
                          type="text"
                          value={editingHeaderText}
                          onChange={(e) => setEditingHeaderText(e.target.value)}
                        />
                      ) : (
                        header.header_text
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editingHeaderId === header.id ? (
                        <>
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={handleCancelEdit} style={{ marginLeft: '0.5rem' }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setRowDropdownOpen(header.id)}>
                            ⋮
                          </button>
                          {rowDropdownOpen === header.id && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                zIndex: 20,
                              }}
                            >
                              <div
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                                onClick={() => handleEditHeader(header)}
                              >
                                Edit Header
                              </div>
                              <div
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                                onClick={() => {
                                  handleDeleteHeader(header.id);
                                  setRowDropdownOpen(null);
                                }}
                              >
                                Delete Header
                              </div>
                              <div
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                                onClick={() => setRowDropdownOpen(null)}
                              >
                                Cancel
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ marginTop: '1rem', display: 'flex' }}>
            <input
              type="text"
              placeholder="New header"
              value={newHeader}
              onChange={(e) => setNewHeader(e.target.value)}
              style={{ padding: '0.5rem', flex: '1' }}
            />
            <button onClick={handleAddHeader} style={{ marginLeft: '0.5rem' }}>
              Add Header
            </button>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          className="modal-footer"
          style={{
            flex: '0 0 auto',
            padding: '1rem',
            borderTop: '1px solid #ddd',
            textAlign: 'right',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#fff',
            zIndex: 10,
          }}
        >
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ManageBoatOrderHeaders;
