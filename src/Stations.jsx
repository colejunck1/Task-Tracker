// src/Stations.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageStation from './ManageStation';
import BulkUploadStations from './BulkUploadStations';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
      .order('station_sequence', { ascending: true });
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

  // Drag and drop handler
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(stations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setStations(items);
    // Optionally: update the new order in the database.
  };

  // Row hover styling
  const handleMouseOver = (e) => {
    e.currentTarget.style.backgroundColor = '#f5f5f5';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <div style={{ padding: '1rem' }}>
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
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="stations">
              {(provided) => (
                <table
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <thead style={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left', width: '40px' }}>
                        Station Sequence #
                      </th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station Name</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((station, index) => (
                      <Draggable key={station.id} draggableId={station.id.toString()} index={index}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onMouseOver={handleMouseOver}
                            onMouseOut={handleMouseOut}
                            onDoubleClick={() => setSelectedStation(station)}
                            style={{
                              ...provided.draggableProps.style,
                              borderBottom: '1px solid #ddd',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '0.5rem', width: '40px' }}>
                              {station.station_sequence}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{station.name}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <button onClick={() => setSelectedStation(station)}>Edit</button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
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
