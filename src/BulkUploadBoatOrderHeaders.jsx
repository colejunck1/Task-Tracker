// src/BulkUploadBoatOrderHeaders.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';

function BulkUploadBoatOrderHeaders({ modelId, onUploadComplete }) {
  const [excelFile, setExcelFile] = useState(null);
  const [headersList, setHeadersList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  // Handle file selection and parse the Excel file
  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      readExcel(file);
    }
  };

  // Read and parse the Excel file using xlsx
  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const parsedHeaders = jsonData.slice(1)
        .map((row) => row[0])
        .filter((value) => value !== undefined && value !== null && value.toString().trim() !== '')
        .map((value) => value.toString().trim());
      setHeadersList(parsedHeaders);
    };
    reader.onerror = (error) => {
      console.error("Error reading excel file:", error);
      setErrorMsg("Error reading excel file.");
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle the bulk upload of headers to the boat_order_headers table
  const handleUpload = async () => {
    setUploading(true);
    setErrorMsg('');
    try {
      const rows = headersList.map((header_text) => ({
        model_id: modelId,
        header_text,
      }));
      const { error } = await supabase
        .from('boat_order_headers')
        .insert(rows);
      if (error) {
        console.error("Error uploading headers:", error);
        setErrorMsg(error.message);
      } else {
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

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Bulk Upload Boat Order Headers</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {headersList.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Preview of Headers:</h4>
          <ul>
            {headersList.map((header, index) => (
              <li key={index}>{header}</li>
            ))}
          </ul>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Headers'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkUploadBoatOrderHeaders;
