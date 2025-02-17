// src/BulkUploadStations.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';

function BulkUploadStations({ onUploadComplete }) {
  const [excelFile, setExcelFile] = useState(null);
  const [stationsList, setStationsList] = useState([]);
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
      // Convert sheet to JSON; assume the first row is a header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Remove header row and get station names from the first column
      const parsedStations = jsonData.slice(1)
        .map(row => row[0])
        .filter(value => value !== undefined && value !== null && value.toString().trim() !== '')
        .map(value => value.toString().trim());
      setStationsList(parsedStations);
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
      const rows = stationsList.map((name) => ({ name }));
      const { error } = await supabase
        .from('stations')
        .insert(rows);
      if (error) {
        console.error("Error uploading stations:", error);
        setErrorMsg(error.message);
      } else {
        if (onUploadComplete) {
          onUploadComplete();
        }
        setStationsList([]);
        setExcelFile(null);
      }
    } catch (error) {
      console.error("Unexpected error during bulk upload:", error);
      setErrorMsg("Unexpected error during bulk upload.");
    }
    setUploading(false);
  };

  const handleDownloadTemplate = () => {
    const header = ["name"];
    const worksheet = XLSX.utils.aoa_to_sheet([header]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Station Template");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Station_Template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Bulk Upload Stations</h3>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleDownloadTemplate}>Download Template</button>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {stationsList.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Preview of Stations:</h4>
          <ul>
            {stationsList.map((station, index) => (
              <li key={index}>{station}</li>
            ))}
          </ul>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Stations'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkUploadStations;
