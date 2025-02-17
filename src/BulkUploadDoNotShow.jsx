// src/BulkUploadDoNotShow.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';

function BulkUploadDoNotShow({ onUploadComplete }) {
  const [excelFile, setExcelFile] = useState(null);
  const [optionsList, setOptionsList] = useState([]);
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
      // Convert sheet to JSON with header row; assuming the first row is the header.
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Remove header row and get the first column of each remaining row
      const parsedOptions = jsonData.slice(1)
        .map(row => row[0])
        .filter((value) => value !== undefined && value !== null && value.toString().trim() !== '')
        .map((value) => value.toString().trim());
      setOptionsList(parsedOptions);
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
      const rows = optionsList.map((option_text) => ({
        option_text: option_text
      }));
      const { error } = await supabase
        .from('do_not_show_options')
        .insert(rows);
      if (error) {
        console.error("Error uploading Do Not Show options:", error);
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
      <h3>Bulk Upload Do Not Show Options</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {optionsList.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Preview of Options:</h4>
          <ul>
            {optionsList.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Options'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkUploadDoNotShow;
