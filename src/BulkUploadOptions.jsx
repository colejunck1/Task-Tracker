// src/BulkUploadOptions.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';

function BulkUploadOptions({ modelId, onUploadComplete }) {
  const [excelFile, setExcelFile] = useState(null);
  const [options, setOptions] = useState([]);
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
      // Assume the first sheet contains the options
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert the sheet to JSON, using header row (assumed in row 1)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Assuming row 1 is the header and the option text is in the first column,
      // extract the option text from subsequent rows.
      const parsedOptions = jsonData.slice(1)
        .map((row) => row[0])
        .filter((value) => value !== undefined && value !== null && value.toString().trim() !== '')
        .map((value) => value.toString().trim());
      setOptions(parsedOptions);
    };
    reader.onerror = (error) => {
      console.error("Error reading excel file:", error);
      setErrorMsg("Error reading excel file.");
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle the bulk upload of options to the model_options table
  const handleUpload = async () => {
    setUploading(true);
    setErrorMsg('');
    try {
      const rows = options.map((option_text) => ({
        model_id: modelId,
        option_text,
      }));
      const { error } = await supabase
        .from('model_options')
        .insert(rows);
      if (error) {
        console.error("Error uploading options:", error);
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
      <h3>Bulk Upload Options</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {options.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Preview of Options:</h4>
          <ul>
            {options.map((option, index) => (
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

export default BulkUploadOptions;
