// src/BulkUploadTasks.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';

function BulkUploadTasks({ onUploadComplete }) {
  const [excelFile, setExcelFile] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    setErrorMsg('');
    readExcel(file);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert sheet to JSON using header row; assumes first row is header.
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Remove header row and map each row to a task object.
      // Expected columns: model, station, task_name, labor_hours, associated_options, schedule_group, duration_days
      const parsedTasks = jsonData.slice(1).map((row) => ({
        model: row[0] ? row[0].toString().trim() : '',
        station: row[1] ? row[1].toString().trim() : '',
        task_name: row[2] ? row[2].toString().trim() : '',
        labor_hours: row[3] && row[3].toString().trim() !== '' ? Number(row[3]) : 0,
        associated_options: row[4] ? row[4].toString().trim() : '',
        schedule_group: row[5] ? row[5].toString().trim() : '',
        duration_days: row[6] && row[6].toString().trim() !== '' ? Number(row[6]) : 0,
      })).filter(task => task.task_name !== '');
      setTasksList(parsedTasks);
    };
    reader.onerror = (error) => {
      console.error("Error reading Excel file:", error);
      setErrorMsg("Error reading Excel file.");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    setErrorMsg('');
    try {
      // Insert rows into the "task_data" table.
      const { error } = await supabase
        .from('task_data')
        .insert(tasksList);
      if (error) {
        console.error("Error uploading tasks:", error);
        setErrorMsg(error.message);
      } else {
        // Clear out the preview after a successful upload
        setTasksList([]);
        setExcelFile(null);
        if (onUploadComplete) {
          onUploadComplete();
        }
      }
    } catch (error) {
      console.error("Unexpected error during bulk upload:", error);
      setErrorMsg("Unexpected error during bulk upload.");
    }
    setUploading(false);
  };

  const handleDownloadTemplate = () => {
    // Define the template headers (excluding the id column)
    const header = [
      "model",
      "station",
      "task_name",
      "labor_hours",
      "associated_options",
      "schedule_group",
      "duration_days"
    ];
    // Create a worksheet with just the header row
    const worksheet = XLSX.utils.aoa_to_sheet([header]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Task Template");
    // Write the workbook as a binary array
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Task_Template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Bulk Upload Task Data</h3>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {tasksList.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Preview of Tasks:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Model</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Station</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Task Name</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Labor Hours</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Associated Options</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Schedule Group</th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Duration (Days)</th>
              </tr>
            </thead>
            <tbody>
              {tasksList.map((task, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{task.model}</td>
                  <td style={{ padding: '0.5rem' }}>{task.station}</td>
                  <td style={{ padding: '0.5rem' }}>{task.task_name}</td>
                  <td style={{ padding: '0.5rem' }}>{task.labor_hours !== null ? task.labor_hours : '-'}</td>
                  <td style={{ padding: '0.5rem' }}>{task.associated_options}</td>
                  <td style={{ padding: '0.5rem' }}>{task.schedule_group}</td>
                  <td style={{ padding: '0.5rem' }}>{task.duration_days !== null ? task.duration_days : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Tasks'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkUploadTasks;
