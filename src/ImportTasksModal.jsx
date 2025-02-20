// src/ImportTasksModal.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function ImportTasksModal({ validStations = [], validModels = [], modelsMapping = {}, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState({}); // { rowIndex: { columnKey: "Error message" } }
  const [importing, setImporting] = useState(false);

  // Log validStations, validModels, and modelsMapping for debugging.
  useEffect(() => {
    console.log("Valid Stations from DB:", validStations);
    console.log("Valid Models from DB:", validModels);
    console.log("Models Mapping:", modelsMapping);
  }, [validStations, validModels, modelsMapping]);

  // Prettier column headers
  const columnLabels = {
    model: "Model",
    station: "Station",
    task_name: "Task Name",
    labor_hours: "Labor Hours",
    associated_options: "Associated Options",
    schedule_group: "Schedule Group",
    duration_days: "Duration (Days)"
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ["model", "station", "task_name", "labor_hours", "associated_options", "schedule_group", "duration_days"];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle file selection and generate preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewData([]);
    setErrors({});
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        setPreviewData(jsonData);
        validateData(jsonData);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  // Normalize strings by trimming and replacing multiple spaces.
  const normalizeString = (s) => s.replace(/\s+/g, ' ').trim();

  // Validate rows: check station and model (without modifying case).
  const validateData = (data) => {
    const newErrors = {};
    console.log("Validating imported data...");
    data.forEach((row, index) => {
      const rowErrors = {};
      if (!validStations.some(s => s.trim() === String(row.station).trim())) {
        rowErrors.station = `Station "${row.station}" not found.`;
      }
      if (!validModels.some(m => m.trim() === String(row.model).trim())) {
        rowErrors.model = `Model "${row.model}" not found.`;
      }
      if (Object.keys(rowErrors).length > 0) {
        newErrors[index] = rowErrors;
      }
    });
    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
  };

  // Expose handleAddNewRecord so inline onclick works.
  const handleAddNewRecord = async (rowIndex, columnKey) => {
    alert(`Add new record for ${columnKey} at row ${rowIndex}`);
    validateData(previewData);
  };

  useEffect(() => {
    window.handleAddNewRecordWrapper = handleAddNewRecord;
  }, [previewData]);

  // Determine if any errors exist
  const hasErrors = () => {
    return Object.keys(errors).some(rowIndex => Object.keys(errors[rowIndex]).length > 0);
  };

  // Transform data and call onImport if no errors.
  const handleImport = async () => {
    if (hasErrors()) {
      alert("Please resolve all errors before importing.");
      return;
    }
    // Build reverse mapping: model name (trimmed) -> model id.
    const reverseModelsMapping = {};
    Object.keys(modelsMapping).forEach(id => {
      const name = modelsMapping[id];
      reverseModelsMapping[normalizeString(name)] = parseInt(id, 10);
    });

    const transformedData = previewData.map(row => {
      const transformedRow = { ...row };
      // Transform model: use reverse mapping.
      const modelName = normalizeString(String(row.model));
      const modelId = reverseModelsMapping[modelName];
      transformedRow.model = modelId !== undefined ? modelId : null;
      
      // For numeric fields: labor_hours, schedule_group, duration_days, associated_options
      const numericFields = ["labor_hours", "schedule_group", "duration_days", "associated_options"];
      numericFields.forEach(field => {
        const val = String(transformedRow[field]).trim();
        if (val === "") {
          transformedRow[field] = null;
        } else {
          const num = parseInt(val, 10);
          transformedRow[field] = isNaN(num) ? null : num;
        }
      });
      return transformedRow;
    });

    console.log("Transformed data for import:", transformedData);
    setImporting(true);
    try {
      const { error } = await onImport(transformedData);
      if (error) {
        console.error("Error importing tasks:", error);
        alert("Error importing tasks: " + error.message);
      } else {
        console.log("Data imported successfully.");
        onClose();
      }
    } catch (err) {
      console.error("Error importing tasks:", err);
      alert("Error importing tasks: " + err.message);
    }
    setImporting(false);
  };

  // Generate HTML for preview table.
  const generateTableHTML = () => {
    if (previewData.length === 0) return '';
    let headerHTML = '<tr>';
    Object.keys(previewData[0]).forEach(col => {
      const label = columnLabels[col] || col;
      headerHTML += `<th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">${label}</th>`;
    });
    headerHTML += '<th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Errors</th></tr>';

    let rowsHTML = '';
    previewData.forEach((row, rowIndex) => {
      let rowHTML = '<tr>';
      Object.keys(row).forEach(col => {
        rowHTML += `<td style="padding: 0.5rem; border-bottom: 1px solid #ddd;">${row[col] || '-'}</td>`;
      });
      const rowErr = errors[rowIndex]
        ? Object.entries(errors[rowIndex])
            .map(([colKey, msg]) => `<div style="color: red;">${msg} <button style="font-size: 0.75rem;" onclick="window.handleAddNewRecordWrapper(${rowIndex}, '${colKey}')">Add New</button></div>`)
            .join("")
        : '-';
      rowHTML += `<td style="padding: 0.5rem; border-bottom: 1px solid #ddd; color: red;">${rowErr}</td></tr>`;
      rowsHTML += rowHTML;
    });

    return `<table style="width:100%; border-collapse: collapse;">
              <thead>${headerHTML}</thead>
              <tbody>${rowsHTML}</tbody>
            </table>`;
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
        <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Import Tasks</h2>
        </div>
        {/* Controls */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button onClick={downloadTemplate} style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Download Template
          </button>
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            onChange={handleFileChange} 
          />
        </div>
        {/* Preview Area */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {previewData.length === 0 ? (
            <p>No file uploaded yet.</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: generateTableHTML() }} />
          )}
        </div>
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
          <button onClick={handleImport} disabled={importing} style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer'
          }}>
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportTasksModal;
