// src/ScheduleDateView.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AutoScheduleModal from './AutoScheduleModal';

function ScheduleDateView() {
  const [scheduleData, setScheduleData] = useState([]);
  const [modelsMapping, setModelsMapping] = useState({});
  const [modelsList, setModelsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnKey }
  const [editingValue, setEditingValue] = useState('');
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [currentScheduleRow, setCurrentScheduleRow] = useState(null);

  // Define columns (excluding the auto-schedule column)
  const columns = [
    { key: 'slot_number', label: 'Slot #', width: '80px' },
    { key: 'takt', label: 'TAKT' },
    { key: 'boat_model', label: 'Model' },
    { key: 'hull_number', label: 'Hull #', width: '80px' },
    { key: 'lam_grid', label: 'LAM Grid' },
    { key: 'lam_hull', label: 'LAM Hull' },
    { key: 'lam_deck', label: 'LAM Deck' },
    { key: 'trimandgrind_grid', label: 'T&G Grid' },
    { key: 'trimandgrind_hull', label: 'T&G Hull' },
    { key: 'trimandgrind_deck', label: 'T&G Deck' },
    { key: 'patchanddetail_hull', label: 'P&D Hull' },
    { key: 'patchanddetail_deck', label: 'P&D Deck' },
    { key: 'open_hull_1', label: 'Open Hull 1' },
    { key: 'open_deck_1', label: 'Open Deck 1' },
    { key: 'open_hull_2', label: 'Open Hull 2' },
    { key: 'open_deck_2', label: 'Open Deck 2' },
    { key: 'final_1', label: 'Final 1' },
    { key: 'final_2', label: 'Final 2' },
    { key: 'final_3', label: 'Final 3' },
    { key: 'commissioning', label: 'Comm.' },
    { key: 'shipment', label: 'Shipment' }
  ];

  const fetchScheduleData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('production_schedule')
      .select('*')
      .order('slot_number', { ascending: true });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setScheduleData(data);
    }
    setLoading(false);
  };

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('models')
      .select('id, name');
    if (error) {
      console.error("Error fetching models:", error);
    } else {
      const mapping = {};
      data.forEach(model => {
        mapping[model.id] = model.name;
      });
      setModelsMapping(mapping);
      setModelsList(data);
    }
  };

  useEffect(() => {
    fetchScheduleData();
    fetchModels();
  }, []);

  const handleDoubleClick = (row, columnKey) => {
    setEditingCell({ rowId: row.id, columnKey });
    if (columnKey === 'boat_model') {
      setEditingValue(row[columnKey] ? row[columnKey].toString() : '');
    } else {
      setEditingValue(row[columnKey] ? row[columnKey] : '');
    }
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    const { rowId, columnKey } = editingCell;
    const newValue = editingValue.trim() === '' ? null : editingValue;
    const { error } = await supabase
      .from('production_schedule')
      .update({ [columnKey]: newValue })
      .eq('id', rowId);
    if (error) {
      alert("Error updating cell: " + error.message);
    } else {
      setScheduleData(prevData =>
        prevData.map(row =>
          row.id === rowId ? { ...row, [columnKey]: newValue } : row
        )
      );
    }
    setEditingCell(null);
    setEditingValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditingValue('');
    }
  };

  const renderCell = (row, columnKey) => {
    if (editingCell && editingCell.rowId === row.id && editingCell.columnKey === columnKey) {
      if (columnKey === 'boat_model') {
        return (
          <select
            value={editingValue || ''}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ width: '100%', padding: '0.25rem' }}
          >
            <option value="">Select Model</option>
            {modelsList.map(model => (
              <option key={model.id} value={model.id.toString()}>
                {model.name}
              </option>
            ))}
          </select>
        );
      } else {
        return (
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ width: '100%', padding: '0.25rem' }}
          />
        );
      }
    }
    if (columnKey === 'boat_model') {
      const modelName = modelsMapping[row[columnKey]] || '-';
      return (
        <span onDoubleClick={() => handleDoubleClick(row, columnKey)}>
          {modelName}
        </span>
      );
    }
    const cellValue = row[columnKey];
    return (
      <span onDoubleClick={() => handleDoubleClick(row, columnKey)}>
        {cellValue !== null && cellValue !== undefined && cellValue !== '' ? cellValue : '-'}
      </span>
    );
  };

  // Handler for Auto-Schedule button
  const handleAutoSchedule = (row) => {
    setCurrentScheduleRow(row);
    setShowAutoScheduleModal(true);
  };

  return (
    <div style={{ padding: '1rem' }}>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {loading ? (
        <p>Loading schedule data...</p>
      ) : scheduleData.length === 0 ? (
        <p>No schedule data found.</p>
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
                {/* Auto-Schedule button column */}
                <th style={{ padding: '0.5rem', textAlign: 'left', width: '120px' }}>
                  Auto-Schedule
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      width: col.width ? col.width : 'auto'
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Auto-Schedule button cell */}
                  <td style={{ padding: '0.5rem', width: '120px' }}>
                    <button
                      onClick={() => handleAutoSchedule(row)}
                      style={{
                        backgroundColor: 'lightgreen',
                        color: 'darkgreen',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Auto-Schedule
                    </button>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '0.5rem',
                        width: col.width ? col.width : 'auto'
                      }}
                    >
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAutoScheduleModal && currentScheduleRow && (
        <AutoScheduleModal
          scheduleRow={currentScheduleRow}
          onClose={() => {
            setShowAutoScheduleModal(false);
            setCurrentScheduleRow(null);
          }}
          onSave={(updatedData) => {
            console.log("Auto-Schedule data to save:", updatedData);
            setShowAutoScheduleModal(false);
            setCurrentScheduleRow(null);
          }}
          modelsList={modelsList}
        />
      )}
    </div>
  );
}

export default ScheduleDateView;
