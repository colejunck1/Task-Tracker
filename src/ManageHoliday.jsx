// src/ManageHoliday.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function ManageHoliday({ holiday, onClose, onSave }) {
  const [holidayName, setHolidayName] = useState(holiday ? holiday.holiday_name : '');
  const [holidayDate, setHolidayDate] = useState(holiday ? holiday.holiday_date : '');

  const handleSave = async () => {
    if (!holidayName.trim() || !holidayDate) {
      alert('Please fill in both the holiday name and date.');
      return;
    }
    if (holiday) {
      // Update existing holiday
      const { error } = await supabase
        .from('company_holidays')
        .update({ holiday_name: holidayName.trim(), holiday_date: holidayDate })
        .eq('id', holiday.id);
      if (error) {
        alert("Error updating holiday: " + error.message);
      }
    } else {
      // Insert new holiday
      const { error } = await supabase
        .from('company_holidays')
        .insert([{ holiday_name: holidayName.trim(), holiday_date: holidayDate }]);
      if (error) {
        alert("Error adding holiday: " + error.message);
      }
    }
    onSave();
    onClose();
  };

  return (
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
          maxWidth: '400px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3 style={{ marginBottom: '1rem' }}>{holiday ? 'Edit Holiday' : 'Add New Holiday'}</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Holiday Name:</label>
          <input
            type="text"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Enter holiday name"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Holiday Date:</label>
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1rem' }}>
            {holiday ? 'Save' : 'Add Holiday'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageHoliday;
