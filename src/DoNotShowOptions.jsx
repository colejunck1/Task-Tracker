// src/DoNotShowOptions.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageDoNotShow from './ManageDoNotShow';
import BulkUploadDoNotShow from './BulkUploadDoNotShow'; // Import the bulk upload component

function DoNotShowOptions() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('do_not_show_options')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.error('Error fetching Do Not Show options:', error);
      setErrorMsg(error.message);
      setOptions([]);
    } else {
      setOptions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Do Not Show Options</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowAddModal(true)}>+ Add New Option</button>
        <button onClick={() => setShowBulkUpload(!showBulkUpload)} style={{ marginLeft: '1rem' }}>
          {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload Options'}
        </button>
      </div>
      {showBulkUpload && (
        <BulkUploadDoNotShow onUploadComplete={fetchOptions} />
      )}
      {loading ? (
        <p>Loading options...</p>
      ) : options.length === 0 ? (
        <p>No Do Not Show options found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Option</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => (
              <tr key={option.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>{option.option_text}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => setSelectedOption(option)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showAddModal && (
        <ManageDoNotShow
          option={null}
          onClose={() => {
            setShowAddModal(false);
            fetchOptions();
          }}
        />
      )}
      {selectedOption && (
        <ManageDoNotShow
          option={selectedOption}
          onClose={() => {
            setSelectedOption(null);
            fetchOptions();
          }}
        />
      )}
    </div>
  );
}

export default DoNotShowOptions;
