// src/UploadBoatOrders.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Point to the local worker file in the public folder.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function UploadBoatOrders() {
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
    setUploadSuccess('');
  };

  // Updated extraction function with fallback
  const extractDataFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items;
        
        // Try grouping by y-coordinate
        try {
          items.sort((a, b) => b.transform[5] - a.transform[5]);
          let lines = [];
          let currentLine = [];
          let currentY = null;
          const threshold = 5; // tweak as needed
          for (const item of items) {
            const y = item.transform[5];
            if (currentY === null) {
              currentY = y;
              currentLine.push(item.str);
            } else if (Math.abs(currentY - y) < threshold) {
              currentLine.push(item.str);
            } else {
              lines.push(currentLine.join(" "));
              currentLine = [item.str];
              currentY = y;
            }
          }
          if (currentLine.length > 0) {
            lines.push(currentLine.join(" "));
          }
          fullText += lines.join("\n") + "\n";
        } catch (groupError) {
          console.error(`Error grouping text on page ${i}:`, groupError);
          // Fallback: join all items for this page.
          const pageText = items.map(item => item.str).join(" ");
          fullText += pageText + "\n";
        }
      }
      
      console.log("Extracted PDF text:", fullText);
      return fullText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      return null;
    }
  };

  // Parse file name to extract Hull # and Revision Date.
  // Expected format: "Production Order 39154 - Feb. 13, 25.pdf"
  const parseFileName = (fileName) => {
    const regex = /Production Order\s+(\d+)\s*-\s*(.+)\.pdf/i;
    const match = fileName.match(regex);
    if (match) {
      const hullNumber = match[1]; // e.g., "39154"
      const revisionStr = match[2]; // e.g., "Feb. 13, 25"
      const cleanedRevisionStr = revisionStr.replace(/\./g, '').trim(); // "Feb 13, 25"
      const parts = cleanedRevisionStr.split(' ');
      if (parts.length >= 3) {
        let monthAbbr = parts[0];
        let day = parts[1].replace(',', '').trim();
        let year = parts[2].trim();
        if (year.length === 2) {
          year = '20' + year;
        }
        if (day.length === 1) {
          day = '0' + day;
        }
        const monthMapping = {
          Jan: '01',
          Feb: '02',
          Mar: '03',
          Apr: '04',
          May: '05',
          Jun: '06',
          Jul: '07',
          Aug: '08',
          Sep: '09',
          Oct: '10',
          Nov: '11',
          Dec: '12'
        };
        const month = monthMapping[monthAbbr];
        if (!month) {
          console.error("Unrecognized month abbreviation:", monthAbbr);
          return { hullNumber: null, revisionDate: null };
        }
        // Construct revision date string in ISO format (YYYY-MM-DD)
        const revisionDate = `${year}-${month}-${day}`;
        return { hullNumber, revisionDate };
      }
    }
    return { hullNumber: null, revisionDate: null };
  };

  // Handle the upload process
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    // Upload the file to Supabase Storage (bucket: "boat-orders")
    const filePath = file.name; // Use the original file name
    const { error: storageError } = await supabase
      .storage
      .from('boat-orders')
      .upload(filePath, file);
      
    if (storageError) {
      console.error('Upload error:', storageError);
      setUploadError(storageError.message);
      setIsUploading(false);
      return;
    }
    
    // Extract text from the PDF
    const extractedText = await extractDataFromPDF(file);
    if (!extractedText) {
      setUploadError("Failed to extract data from PDF.");
      setIsUploading(false);
      return;
    }
    
    // Parse file name for Hull # and Revision Date
    const { hullNumber, revisionDate } = parseFileName(file.name);
    if (!hullNumber || !revisionDate) {
      setUploadError("Failed to parse Hull # or Revision Date from file name.");
      setIsUploading(false);
      return;
    }
    
    // Split extracted text into individual lines (each line is an option)
    const optionLines = extractedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
      
    console.log("Number of option lines extracted:", optionLines.length);
    
    // Insert a row into the "boat_orders" table (store file_name as well)
    const { data: boatOrderData, error: boatOrderError } = await supabase
      .from('boat_orders')
      .insert([
        {
          hull_number: hullNumber,
          revision_date: revisionDate,
          file_name: file.name  // Store the file name for later retrieval
        }
      ])
      .select(); // Return the inserted row(s)
      
    if (boatOrderError || !boatOrderData || boatOrderData.length === 0) {
      console.error("Database insert error (boat_orders):", boatOrderError);
      setUploadError(boatOrderError ? boatOrderError.message : "Failed to insert boat order data.");
      setIsUploading(false);
      return;
    }
    
    // Get the boat order id from the inserted record
    const boatOrderId = boatOrderData[0].id;
    
    // Prepare rows for the boat_order_options table: one row per option line.
    const optionsRows = optionLines.map(line => ({
      boat_order_id: boatOrderId,
      option_line: line
    }));
    
    // Insert the options rows in batch
    const { error: optionsError } = await supabase
      .from('boat_order_options')
      .insert(optionsRows);
      
    if (optionsError) {
      console.error("Database insert error (boat_order_options):", optionsError);
      setUploadError(optionsError.message || "Error inserting boat order options.");
    } else {
      setUploadSuccess("Boat order uploaded and options extracted successfully!");
    }
    
    setIsUploading(false);
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', color: '#000' }}>
      <h2>Upload Boat Orders</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit" disabled={isUploading} style={{ marginLeft: '1rem' }}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {uploadError && <p style={{ color: 'red', marginTop: '1rem' }}>{uploadError}</p>}
      {uploadSuccess && <p style={{ color: 'green', marginTop: '1rem' }}>{uploadSuccess}</p>}
    </div>
  );
}

export default UploadBoatOrders;
