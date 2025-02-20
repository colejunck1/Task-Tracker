// src/PrintTaskDataModal.jsx
import React, { useState, useEffect } from 'react';

function PrintTaskDataModal({ tasks, stations = [], modelsMapping = {}, onClose }) {
  // Debug logging
  console.log("PrintTaskDataModal - modelsMapping:", modelsMapping);
  console.log("PrintTaskDataModal - tasks:", tasks);

  // Define columns for task_data table.
  const allColumns = [
    { key: 'model', label: 'Model' },
    { key: 'station', label: 'Station' },
    { key: 'task_name', label: 'Task Name' },
    { key: 'labor_hours', label: 'Labor Hours' },
    { key: 'associated_options', label: 'Associated Options' },
    { key: 'schedule_group', label: 'Schedule Group' },
    { key: 'duration_days', label: 'Duration (Days)' },
  ];

  // State for selected columns.
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map(col => col.key));
  
  // Multi-select filters.
  const statusOptions = ["Upcoming", "In Progress", "Completed"];
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Sorting state.
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtered tasks.
  const [filteredTasks, setFilteredTasks] = useState(tasks || []);

  useEffect(() => {
    let filtered = tasks || [];
    if (selectedStations.length > 0) {
      filtered = filtered.filter(task => selectedStations.includes(task.station));
    }
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(task => selectedStatuses.includes(task.status));
    }
    setFilteredTasks(filtered);
  }, [selectedStations, selectedStatuses, tasks]);

  // Sorting the filtered tasks.
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortingColumn) return 0;
    let valueA, valueB;
    if (sortingColumn === 'model') {
      valueA = getModelName(a.model);
      valueB = getModelName(b.model);
    } else {
      valueA = a[sortingColumn] || '';
      valueB = b[sortingColumn] || '';
    }
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    } else {
      const compareA = valueA.toString().toLowerCase();
      const compareB = valueB.toString().toLowerCase();
      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  const toggleColumn = (key) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
  };

  // Helper function matching TaskData.jsx: returns the model name using the mapping.
  const getModelName = (modelId) => {
    // If modelId exists directly in mapping, return it.
    if (modelsMapping[modelId]) return modelsMapping[modelId];
    // Try converting to string.
    if (modelsMapping[String(modelId)]) return modelsMapping[String(modelId)];
    // Otherwise, return the original modelId.
    return modelId;
  };

  const generateTableHTML = () => {
    let headerHTML = '<tr>';
    allColumns.forEach(col => {
      if (selectedColumns.includes(col.key)) {
        headerHTML += `<th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">${col.label}</th>`;
      }
    });
    headerHTML += '</tr>';

    let rowsHTML = '';
    sortedTasks.forEach(task => {
      let rowHTML = '<tr>';
      allColumns.forEach(col => {
        if (selectedColumns.includes(col.key)) {
          let cellValue = '';
          if (col.key === 'model') {
            cellValue = getModelName(task.model);
          } else {
            cellValue = task[col.key] || '-';
          }
          rowHTML += `<td style="padding: 0.5rem; border-bottom: 1px solid #ddd;">${cellValue}</td>`;
        }
      });
      rowHTML += '</tr>';
      rowsHTML += rowHTML;
    });

    return `<table style="width:100%; border-collapse: collapse;">
              <thead style="border-bottom: 1px solid #000;">${headerHTML}</thead>
              <tbody>${rowsHTML}</tbody>
            </table>`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableHTML = generateTableHTML();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Task Data</title>
          <style>
            @media print {
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 0.5rem; text-align: left; }
            }
            body { margin: 1rem; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <h2>Task Data</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '4px',
        width: '80%',
        maxHeight: '90%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Print Task Data Preview</h2>
          {/* Sorting Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem' }}><strong>Sort by:</strong></label>
              <select
                value={sortingColumn || ''}
                onChange={(e) => setSortingColumn(e.target.value || null)}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">None</option>
                {allColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ fontSize: '0.85rem' }}><strong>Order:</strong></label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          {/* Multi-select Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem' }}><strong>Filter by Station:</strong></label>
              <select multiple
                value={selectedStations}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedStations(selected);
                }}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {stations.map((station, idx) => (
                  <option key={idx} value={station}>{station}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem' }}><strong>Filter by Status:</strong></label>
              <select multiple
                value={selectedStatuses}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedStatuses(selected);
                }}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {statusOptions.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem' }}><strong>Select Columns:</strong></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allColumns.map(col => (
                  <label key={col.key} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      style={{ marginRight: '0.25rem' }}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Preview Table Container */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}
          dangerouslySetInnerHTML={{ __html: generateTableHTML() }}
        />
        {/* Fixed Footer */}
        <div style={{
          borderTop: '1px solid #ddd',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fff'
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1rem',
            border: '1px solid #aaa',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button onClick={handlePrint} style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer'
          }}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrintTaskDataModal;
