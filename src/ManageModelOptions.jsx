// src/ManageModelOptions.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import BulkUploadOptions from './BulkUploadOptions';

function ManageModelOptions({ model, onClose }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editingOptionText, setEditingOptionText] = useState('');
  const [rowDropdownOpen, setRowDropdownOpen] = useState(null);

  // Fetch options for this model from the "model_options" table
  const fetchOptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('model_options')
      .select('*')
      .eq('model_id', model.id);
    if (error) {
      console.error('Error fetching options:', error);
      setErrorMsg(error.message);
      setOptions([]);
    } else {
      setOptions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOptions();
  }, [model]);

  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    const { error } = await supabase
      .from('model_options')
      .insert([{ model_id: model.id, option_text: newOption.trim() }]);
    if (error) {
      console.error('Error adding option:', error);
      setErrorMsg(error.message);
    } else {
      setNewOption('');
      fetchOptions();
    }
  };

  const handleDeleteOption = async (optionId) => {
    const { error } = await supabase
      .from('model_options')
      .delete()
      .eq('id', optionId);
    if (error) {
      console.error('Error deleting option:', error);
      setErrorMsg(error.message);
    } else {
      fetchOptions();
    }
  };

  const handleEditOption = (option) => {
    setEditingOptionId(option.id);
    setEditingOptionText(option.option_text);
    setRowDropdownOpen(null);
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('model_options')
      .update({ option_text: editingOptionText })
      .eq('id', editingOptionId);
    if (error) {
      console.error('Error updating option:', error);
      setErrorMsg(error.message);
    } else {
      setEditingOptionId(null);
      setEditingOptionText('');
      fetchOptions();
    }
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
    setEditingOptionText('');
  };

  // Header actions dropdown toggle
  const toggleHeaderActions = () => {
    setShowHeaderActions(!showHeaderActions);
  };

  // Header actions handlers
  const handleAddNewOptionHeader = () => {
    // For now, we just close the dropdown so you can use the inline add field below.
    setShowHeaderActions(false);
  };

  const handleBulkUploadOptions = () => {
    setShowBulkUpload(!showBulkUpload);
    setShowHeaderActions(false);
  };

  const handleExportOptions = () => {
    alert('Export options functionality not implemented yet.');
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
          maxWidth: '1200px', // Twice as wide as before
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
            <h3>Manage Options for {model.name}</h3>
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
                  right: '70px', // position it near the Actions button
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 20,
                }}
              >
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleAddNewOptionHeader}
                >
                  Add New Option
                </div>
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleBulkUploadOptions}
                >
                  Bulk Upload Options
                </div>
                <div
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  onClick={handleExportOptions}
                >
                  Export Options
                </div>
              </div>
            )}
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Optional Bulk Upload Section */}
        {showBulkUpload && (
          <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <BulkUploadOptions modelId={model.id} onUploadComplete={fetchOptions} />
          </div>
        )}

        {/* Modal Content */}
        <div
          className="modal-content"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          {loading ? (
            <p>Loading options...</p>
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
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Option</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {options.map((option) => (
                  <tr
                    key={option.id}
                    style={{ borderBottom: '1px solid #ddd', position: 'relative' }}
                  >
                    <td style={{ padding: '0.5rem' }}>
                      {editingOptionId === option.id ? (
                        <input
                          type="text"
                          value={editingOptionText}
                          onChange={(e) => setEditingOptionText(e.target.value)}
                        />
                      ) : (
                        option.option_text
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editingOptionId === option.id ? (
                        <>
                          <button onClick={handleSaveEdit}>Save</button>
                          <button
                            onClick={handleCancelEdit}
                            style={{ marginLeft: '0.5rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setRowDropdownOpen(option.id)}>
                            ⋮
                          </button>
                          {rowDropdownOpen === option.id && (
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
                                style={{
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleEditOption(option)}
                              >
                                Edit Option
                              </div>
                              <div
                                style={{
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  handleDeleteOption(option.id);
                                  setRowDropdownOpen(null);
                                }}
                              >
                                Delete Option
                              </div>
                              <div
                                style={{
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                }}
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
              placeholder="New option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              style={{ padding: '0.5rem', flex: '1' }}
            />
            <button onClick={handleAddOption} style={{ marginLeft: '0.5rem' }}>
              Add Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageModelOptions;
