// src/ChangeTaskStatus.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import ConfirmStatusChange from './ConfirmStatusChange';

function ChangeTaskStatus({ task, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(task.status);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStatusButtonClick = (status) => {
    setNewStatus(status);
    setShowConfirm(true);
  };

  const handleConfirm = async (employeeId) => {
    // Update the task status in tasks_per_hull, including logging the employee who confirmed it
    const { error } = await supabase
      .from('tasks_per_hull')
      .update({ status: newStatus, completed_by: employeeId })
      .eq('id', task.id);
    if (error) {
      console.error("Error updating task status:", error);
      alert("Error updating status: " + error.message);
    } else {
      onStatusChange(newStatus);
      onClose();
      alert("Status updated successfully!");
    }
  };

  return (
    <>
      <div
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
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '600px',  // Wider modal to fit long task names
            width: '90%',
            padding: '1rem',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>
            Change Status of Task:
            <br />
            <span style={{ fontWeight: 'normal' }}>
              {task.hull_number} - {task.station} - {task.task_name}
            </span>
          </h3>
          <hr style={{ margin: '0.5rem 0' }} />
          <p style={{ marginBottom: '1rem' }}>
            <strong>Start Date:</strong> {task.start_date || '-'}<br />
            <strong>End Date:</strong> {task.end_date || '-'}<br />
            <strong>Current Status:</strong> {task.status}
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => handleStatusButtonClick('In Progress')}
              style={{
                marginRight: '1rem',
                backgroundColor: '#d0e7ff', // light blue background
                color: '#004a99',           // dark blue text
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusButtonClick('Completed')}
              style={{
                backgroundColor: '#d0f0d0', // light green background
                color: '#006400',           // dark green text
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Completed
            </button>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      {showConfirm && (
        <ConfirmStatusChange
          task={task}
          newStatus={newStatus}
          onConfirm={(employeeId) => {
            setShowConfirm(false);
            handleConfirm(employeeId);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

export default ChangeTaskStatus;
