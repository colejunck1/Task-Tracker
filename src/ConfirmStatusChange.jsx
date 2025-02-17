// src/ConfirmStatusChange.jsx
import React, { useState } from 'react';

function ConfirmStatusChange({ task, newStatus, onConfirm, onCancel }) {
  const [employeeId, setEmployeeId] = useState('');

  const handleSubmit = () => {
    // You can add validation for employeeId if needed.
    onConfirm(employeeId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3 style={{ marginBottom: '0.5rem' }}>
          To change the status of<br />
          {task.hull_number} - {task.station} - {task.task_name}<br />
          to {newStatus}, scan employee ID:
        </h3>
        <input
          type="text"
          placeholder="Scan Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmStatusChange;
