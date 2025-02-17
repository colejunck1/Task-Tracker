// src/ManageDoNotShow.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function ManageDoNotShow({ option, onClose }) {
  const [optionText, setOptionText] = useState(option ? option.option_text : '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    if (!optionText.trim()) {
      setErrorMsg("Option text cannot be empty.");
      setIsProcessing(false);
      return;
    }
    if (option) {
      // Update existing option
      const { error } = await supabase
        .from('do_not_show_options')
        .update({ option_text: optionText.trim() })
        .eq('id', option.id);
      if (error) {
        setErrorMsg(error.message);
      }
    } else {
      // Insert new option
      const { error } = await supabase
        .from('do_not_show_options')
        .insert([{ option_text: optionText.trim() }]);
      if (error) {
        setErrorMsg(error.message);
      }
    }
    setIsProcessing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!option) return;
    setIsProcessing(true);
    const { error } = await supabase
      .from('do_not_show_options')
      .delete()
      .eq('id', option.id);
    if (error) {
      setErrorMsg(error.message);
    }
    setIsProcessing(false);
    onClose();
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
          maxWidth: '500px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3>{option ? "Manage Do Not Show Option" : "Add New Do Not Show Option"}</h3>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <input
          type="text"
          value={optionText}
          onChange={(e) => setOptionText(e.target.value)}
          placeholder="Option text"
          style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {option && (
            <button onClick={handleDelete} disabled={isProcessing} style={{ marginRight: '1rem' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} disabled={isProcessing} style={{ marginRight: '1rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageDoNotShow;
