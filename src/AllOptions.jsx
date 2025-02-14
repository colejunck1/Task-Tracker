// src/AllOptions.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageModelOptions from './ManageModelOptions';

function AllOptions() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [addingModel, setAddingModel] = useState(false);

  // Fetch models from Supabase
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

  // Handler to add a new model
  const handleAddModel = async () => {
    if (!newModelName.trim()) return;
    setAddingModel(true);
    const { error } = await supabase
      .from('models')
      .insert([{ name: newModelName.trim() }]);
    if (error) {
      console.error('Error adding model:', error);
      setErrorMsg(error.message);
    } else {
      setNewModelName('');
      setShowAddModelModal(false);
      fetchModels();
    }
    setAddingModel(false);
  };

  // Render the modal for adding a new model
  const renderAddModelModal = () => (
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
          padding: '1rem',
          width: '300px',
        }}
      >
        <h3>Add New Model</h3>
        <input
          type="text"
          placeholder="Model Name"
          value={newModelName}
          onChange={(e) => setNewModelName(e.target.value)}
          style={{
            padding: '0.5rem',
            width: '100%',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowAddModelModal(false)} style={{ marginRight: '0.5rem' }}>
            Cancel
          </button>
          <button onClick={handleAddModel} disabled={addingModel}>
            {addingModel ? 'Adding...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h2>All Options - Models</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {/* Button to open the add model modal */}
      <button onClick={() => setShowAddModelModal(true)} style={{ marginBottom: '1rem' }}>
        + Add New Model
      </button>
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
                  <button onClick={() => setSelectedModel(model)}>Manage Options</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedModel && (
        <ManageModelOptions model={selectedModel} onClose={() => setSelectedModel(null)} />
      )}
      {showAddModelModal && renderAddModelModal()}
    </div>
  );
}

export default AllOptions;
