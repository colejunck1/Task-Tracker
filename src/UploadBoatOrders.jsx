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

  // Extract text from PDF using pdfjs-lib
  const extractDataFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items;
        try {
          items.sort((a, b) => b.transform[5] - a.transform[5]);
          let lines = [];
          let currentLine = [];
          let currentY = null;
          const threshold = 5; // adjust as needed
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

  // Parse filename to extract hull number and revision date.
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
          Jan: '01', Feb: '02', Mar: '03', Apr: '04',
          May: '05', Jun: '06', Jul: '07', Aug: '08',
          Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        const month = monthMapping[monthAbbr];
        if (!month) {
          console.error("Unrecognized month abbreviation:", monthAbbr);
          return { hullNumber: null, revisionDate: null };
        }
        const revisionDate = `${year}-${month}-${day}`;
        return { hullNumber, revisionDate };
      }
    }
    return { hullNumber: null, revisionDate: null };
  };

  // Handle the upload process and generate tasks_per_hull rows.
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    // Upload file to Supabase Storage
    const filePath = file.name;
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

    // (Optional) Extract text from the PDF if needed for additional logic
    const extractedText = await extractDataFromPDF(file);
    if (!extractedText) {
      setUploadError("Failed to extract data from PDF.");
      setIsUploading(false);
      return;
    }

    // Parse filename for hull number and revision date
    const { hullNumber, revisionDate } = parseFileName(file.name);
    if (!hullNumber || !revisionDate) {
      setUploadError("Failed to parse Hull # or Revision Date from file name.");
      setIsUploading(false);
      return;
    }

    // Insert a new row into the boat_orders table.
    // Ensure your boat_orders table now includes a model column.
    const { data: boatOrderData, error: boatOrderError } = await supabase
      .from('boat_orders')
      .insert([
        {
          hull_number: hullNumber,
          revision_date: revisionDate,
          file_name: file.name,
          model: '1'  // Example: set the model value here ('1' for 39CC, etc.)
        }
      ])
      .select();
    if (boatOrderError || !boatOrderData || boatOrderData.length === 0) {
      console.error("Database insert error (boat_orders):", boatOrderError);
      setUploadError(boatOrderError ? boatOrderError.message : "Failed to insert boat order data.");
      setIsUploading(false);
      return;
    }
    const boatOrder = boatOrderData[0];
    console.log("Inserted boat order:", boatOrder);

    // Fetch master tasks from task_data for the boat order's model.
    const { data: masterTasks, error: masterTasksError } = await supabase
      .from('task_data')
      .select('*')
      .eq('model', boatOrder.model);
    if (masterTasksError) {
      console.error("Error fetching master tasks:", masterTasksError);
      setUploadError(masterTasksError.message);
      setIsUploading(false);
      return;
    }
    console.log("Fetched master tasks:", masterTasks);

    // Generate tasks_per_hull rows for each master task.
    const tasksPerHullRows = masterTasks.map(task => ({
      hull_number: boatOrder.hull_number,
      model: boatOrder.model,
      station: task.station,
      task_name: task.task_name,
      start_date: null,      // Set default start_date if desired.
      end_date: null,        // Set default end_date.
      status: 'Upcoming',    // Default status.
      completed_by: null,
      applicable: true,
      schedule_group: task.schedule_group,
      task_data_id: task.id  // Link to the master task
    }));

    // Insert generated rows into tasks_per_hull table.
    const { error: tasksInsertError } = await supabase
      .from('tasks_per_hull')
      .insert(tasksPerHullRows);
    if (tasksInsertError) {
      console.error("Error inserting tasks into tasks_per_hull:", tasksInsertError);
      setUploadError(tasksInsertError.message);
    } else {
      setUploadSuccess("Boat order and corresponding tasks uploaded successfully!");
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
