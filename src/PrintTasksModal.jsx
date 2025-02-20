// src/PrintTasksModal.jsx
import React, { useState, useEffect } from 'react';

function PrintTasksModal({ tasks, stations = [], onClose }) {
  // Define the columns available for printing.
  const allColumns = [
    { key: 'hull_number', label: 'Hull #' },
    { key: 'task_name', label: 'Task Name' },
    { key: 'station', label: 'Station' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'status', label: 'Status' },
    { key: 'schedule_group', label: 'Schedule Group' },
  ];

  // State for selected columns; default is all columns.
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map(col => col.key));

  // Multi-select dropdown filters for station and status.
  const statusOptions = ["Upcoming", "In Progress", "Completed"];
  const [selectedStations, setSelectedStations] = useState([]); // empty means all
  const [selectedStatuses, setSelectedStatuses] = useState([]);   // empty means all

  // Sorting state for the print preview.
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtered tasks based on multi-select filters.
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Update filtered tasks when filters change.
  useEffect(() => {
    let filtered = tasks;
    if (selectedStations.length > 0) {
      filtered = filtered.filter(task => selectedStations.includes(task.station));
    }
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(task => selectedStatuses.includes(task.status));
    }
    setFilteredTasks(filtered);
  }, [selectedStations, selectedStatuses, tasks]);

  // Compute sorted tasks based on sorting state.
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortingColumn) return 0;
    const valueA = a[sortingColumn] || '';
    const valueB = b[sortingColumn] || '';
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

  // Generate HTML for the preview table with left-aligned headers.
  const generateTableHTML = () => {
    let headerHTML = '<tr>';
    allColumns.forEach(col => {
      if (selectedColumns.includes(col.key)) {
        headerHTML += `<th style="text-align: left;">${col.label}</th>`;
      }
    });
    headerHTML += '</tr>';

    let rowsHTML = '';
    sortedTasks.forEach(task => {
      let rowHTML = '<tr>';
      allColumns.forEach(col => {
        if (selectedColumns.includes(col.key)) {
          rowHTML += `<td>${task[col.key] || '-'}</td>`;
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

  // When "Print" is clicked, open a new window with the generated table HTML, then print.
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableHTML = generateTableHTML();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Tasks</title>
          <style>
            @media print {
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 0.5rem; text-align: left; }
            }
            body { margin: 1rem; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <h2>Tasks</h2>
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
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Print Preview</h2>
          {/* Sorting Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label><strong>Sort by:</strong></label>
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
              <label><strong>Order:</strong></label>
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
              <label><strong>Filter by Station:</strong></label>
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
              <label><strong>Filter by Status:</strong></label>
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
              <label><strong>Select Columns:</strong></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allColumns.map(col => (
                  <label key={col.key} style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
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
        {/* Fixed Footer with action buttons */}
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

export default PrintTasksModal;
