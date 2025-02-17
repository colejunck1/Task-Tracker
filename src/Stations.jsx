// src/Stations.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageStation from './ManageStation';
import BulkUploadStations from './BulkUploadStations';

function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error("Error fetching stations:", error);
      setErrorMsg(error.message);
      setStations([]);
    } else {
      setStations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Stations</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowAddModal(true)}>+ Add New Station</button>
        <button onClick={() => setShowBulkUpload(!showBulkUpload)} style={{ marginLeft: '1rem' }}>
          {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload Stations'}
        </button>
      </div>
      {showBulkUpload && <BulkUploadStations onUploadComplete={fetchStations} />}
      {loading ? (
        <p>Loading stations...</p>
      ) : stations.length === 0 ? (
        <p>No stations found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Station Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>{station.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => setSelectedStation(station)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showAddModal && (
        <ManageStation
          station={null}
          onClose={() => {
            setShowAddModal(false);
            fetchStations();
          }}
        />
      )}
      {selectedStation && (
        <ManageStation
          station={selectedStation}
          onClose={() => {
            setSelectedStation(null);
            fetchStations();
          }}
        />
      )}
    </div>
  );
}

export default Stations;
