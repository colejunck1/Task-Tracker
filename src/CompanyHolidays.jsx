// src/CompanyHolidays.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageHoliday from './ManageHoliday';

function CompanyHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);

  const fetchHolidays = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('company_holidays')
      .select('*')
      .order('holiday_date', { ascending: true });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setHolidays(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = async (holidayId) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      const { error } = await supabase
        .from('company_holidays')
        .delete()
        .eq('id', holidayId);
      if (error) {
        alert("Error deleting holiday: " + error.message);
      } else {
        fetchHolidays();
      }
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => { setCurrentHoliday(null); setShowModal(true); }} 
          style={{ padding: '0.5rem 1rem' }}
        >
          Add New Holiday
        </button>
      </div>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {loading ? (
        <p>Loading company holidays...</p>
      ) : holidays.length === 0 ? (
        <p>No company holidays found.</p>
      ) : (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Holiday Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Holiday Date</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(holiday => (
                <tr key={holiday.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{holiday.holiday_name}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(holiday.holiday_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setCurrentHoliday(holiday);
                        setShowModal(true);
                      }}
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id)}
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <ManageHoliday
          holiday={currentHoliday}
          onClose={() => {
            setShowModal(false);
            setCurrentHoliday(null);
          }}
          onSave={fetchHolidays}
        />
      )}
    </div>
  );
}

export default CompanyHolidays;
