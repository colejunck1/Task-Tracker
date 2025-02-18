// src/ManageStation.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function ManageStation({ station, onClose }) {
  const [name, setName] = useState(station ? station.name : '');
  const [stationSequence, setStationSequence] = useState(
    station && station.station_sequence ? station.station_sequence : ''
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg("Station name cannot be empty.");
      setIsProcessing(false);
      return;
    }
    // Validate stationSequence if needed (e.g., ensure it's a number)
    if (!stationSequence.toString().trim()) {
      setErrorMsg("Station sequence cannot be empty.");
      setIsProcessing(false);
      return;
    }

    if (station) {
      // Update existing station
      const { error } = await supabase
        .from('stations')
        .update({ 
          name: name.trim(),
          station_sequence: stationSequence
        })
        .eq('id', station.id);
      if (error) {
        setErrorMsg(error.message);
      }
    } else {
      // Insert new station
      const { error } = await supabase
        .from('stations')
        .insert([{ 
          name: name.trim(),
          station_sequence: stationSequence
        }]);
      if (error) {
        setErrorMsg(error.message);
      }
    }
    setIsProcessing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!station) return;
    setIsProcessing(true);
    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('id', station.id);
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
          maxWidth: '400px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3>{station ? "Edit Station" : "Add New Station"}</h3>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Station name"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <input
          type="number"
          value={stationSequence}
          onChange={(e) => setStationSequence(e.target.value)}
          placeholder="Station Sequence #"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {station && (
            <button onClick={handleDelete} disabled={isProcessing} style={{ marginRight: '1rem' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} disabled={isProcessing} style={{ marginRight: '1rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageStation;
