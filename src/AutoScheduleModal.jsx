// src/AutoScheduleModal.jsx
import React, { useState, useEffect } from 'react';

function AutoScheduleModal({ scheduleRow, onClose, onSave, modelsList = [] }) {
  // Fixed dropdown options for station selection and direction
  const stationOptions = [
    "LAM Grid",
    "LAM Hull",
    "LAM Deck",
    "T&G Grid",
    "T&G Hull",
    "T&G Deck",
    "P&D Hull",
    "P&D Deck",
    "Open Hull 1",
    "Open Deck 1",
    "Open Hull 2",
    "Open Deck 2",
    "Final 1",
    "Final 2",
    "Final 3",
    "Comm.",
    "Shipment"
  ];
  const directionOptions = ["Forward", "Backwards"];

  // Initialize modelId: if scheduleRow.boat_model exists, use it; otherwise default to empty.
  const initialModelId = scheduleRow.boat_model ? scheduleRow.boat_model.toString() : '';

  // Local state for the first 4 fields.
  const [slotNumber, setSlotNumber] = useState(scheduleRow.slot_number || '');
  const [takt, setTakt] = useState(scheduleRow.takt || '');
  const [modelId, setModelId] = useState(initialModelId);
  const [hullNumber, setHullNumber] = useState(scheduleRow.hull_number || '');

  // State for auto-schedule fields.
  const [scheduleFrom, setScheduleFrom] = useState(stationOptions[0]);
  const [direction, setDirection] = useState(directionOptions[0]);
  const [startDate, setStartDate] = useState('');

  // Mapping from station option to corresponding date column in scheduleRow.
  const stationDateMapping = {
    "LAM Grid": scheduleRow.lam_grid,
    "LAM Hull": scheduleRow.lam_hull,
    "LAM Deck": scheduleRow.lam_deck,
    "T&G Grid": scheduleRow.trimandgrind_grid,
    "T&G Hull": scheduleRow.trimandgrind_hull,
    "T&G Deck": scheduleRow.trimandgrind_deck,
    "P&D Hull": scheduleRow.patchanddetail_hull,
    "P&D Deck": scheduleRow.patchanddetail_deck,
    "Open Hull 1": scheduleRow.open_hull_1,
    "Open Deck 1": scheduleRow.open_deck_1,
    "Open Hull 2": scheduleRow.open_hull_2,
    "Open Deck 2": scheduleRow.open_deck_2,
    "Final 1": scheduleRow.final_1,
    "Final 2": scheduleRow.final_2,
    "Final 3": scheduleRow.final_3,
    "Comm.": scheduleRow.commissioning,
    "Shipment": scheduleRow.shipment,
  };

  // Update startDate when scheduleFrom changes.
  useEffect(() => {
    const dateValue = stationDateMapping[scheduleFrom] || '';
    setStartDate(dateValue ? dateValue : '');
  }, [scheduleFrom, scheduleRow]);

  const handleSave = () => {
    const updatedData = {
      slot_number: slotNumber,
      takt,
      boat_model: modelId,
      hull_number: hullNumber,
      schedule_from: scheduleFrom,
      schedule_direction: direction,
      start_date: startDate,
    };
    onSave(updatedData);
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        padding: '1rem',
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Auto-Schedule</h3>
        {/* Two-column layout for Slot #, TAKT */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Slot #:</label>
            <input
              type="text"
              value={slotNumber}
              onChange={(e) => setSlotNumber(e.target.value)}
              placeholder="e.g., FY24-1"
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>TAKT:</label>
            <input
              type="number"
              value={takt}
              onChange={(e) => setTakt(e.target.value)}
              placeholder="e.g., 10"
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
        {/* Two-column layout for Model and Hull # */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Model:</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem'
              }}
            >
              {modelsList.length === 0 ? (
                <option value="">No models available</option>
              ) : (
                <>
                  {modelId === '' && <option value="">Select Model</option>}
                  {modelsList.map(model => (
                    <option key={model.id} value={model.id.toString()}>
                      {model.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Hull #:</label>
            <input
              type="text"
              value={hullNumber}
              onChange={(e) => setHullNumber(e.target.value)}
              placeholder="e.g., 39154"
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
        {/* Separator */}
        <hr style={{ margin: '1rem 0' }} />
        {/* Auto-Schedule from Section */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>
            Auto-Schedule from:
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              value={scheduleFrom}
              onChange={(e) => setScheduleFrom(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem',
                flex: 1
              }}
            >
              {stationOptions.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.9rem',
                flex: 1
              }}
            >
              {directionOptions.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <p style={{
            fontStyle: 'italic',
            color: 'grey',
            fontSize: '0.85rem',
            marginTop: '0.5rem'
          }}>
            This will auto-populate the station start dates based on a {takt || '___'} day TAKT and excluding Company Holidays.
          </p>
        </div>
        {/* Start Date Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Start Date:</label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1rem' }}>Auto-Schedule</button>
        </div>
      </div>
    </div>
  );
}

export default AutoScheduleModal;
