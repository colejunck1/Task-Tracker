// src/BoatOrderHeaders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageBoatOrderHeaders from './ManageBoatOrderHeaders';

function BoatOrderHeaders() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);

  const fetchModels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Error fetching models:', error);
      setErrorMsg(error.message);
      setModels([]);
    } else {
      setModels(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Boat Order Headers - Models</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {loading ? (
        <p>Loading models...</p>
      ) : models.length === 0 ? (
        <p>No models found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Model Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>{model.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => setSelectedModel(model)}>
                    Manage Headers
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedModel && (
        <ManageBoatOrderHeaders
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}

export default BoatOrderHeaders;
