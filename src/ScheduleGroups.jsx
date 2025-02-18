// src/ScheduleGroups.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

function ScheduleGroups() {
  const [scheduleGroups, setScheduleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch schedule groups from Supabase
  const fetchScheduleGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schedule_groups')
      .select('*')
      .order('schedule_group', { ascending: true });
    if (error) {
      console.error("Error fetching schedule groups:", error);
      setErrorMsg(error.message);
    } else {
      setScheduleGroups(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScheduleGroups();
  }, []);

  // Bulk upload handler
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Assume header: ["schedule_group", "days_offset", "offset_type", "station"]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const rows = jsonData.slice(1).map(row => ({
        schedule_group: row[0],
        days_offset: row[1],
        offset_type: row[2],
        station: row[3]
      }));
      const { error } = await supabase
        .from('schedule_groups')
        .insert(rows);
      if (error) {
        alert("Error bulk uploading schedule groups: " + error.message);
      } else {
        fetchScheduleGroups();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export schedule groups to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(scheduleGroups);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ScheduleGroups");
    XLSX.writeFile(wb, "ScheduleGroups.xlsx");
  };

  // Download Excel Template with headers in new column order
  const handleDownloadTemplate = () => {
    const header = [["schedule_group", "days_offset", "offset_type", "station"]];
    const worksheet = XLSX.utils.aoa_to_sheet(header);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "ScheduleGroupsTemplate.xlsx");
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={fetchScheduleGroups} style={{ padding: '0.5rem 1rem' }}>
          Refresh
        </button>
        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          <label style={{ cursor: 'pointer' }}>
            Bulk Upload
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleBulkUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </button>
        <button onClick={handleExport} style={{ padding: '0.5rem 1rem' }}>
          Export
        </button>
        <button onClick={handleDownloadTemplate} style={{ padding: '0.5rem 1rem' }}>
          Download Template
        </button>
      </div>
      {loading ? (
        <p>Loading schedule groups...</p>
      ) : scheduleGroups.length === 0 ? (
        <p>No schedule groups found.</p>
      ) : (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Schedule Group</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Days Offset</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Offset Type</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station</th>
              </tr>
            </thead>
            <tbody>
              {scheduleGroups.map((group) => (
                <tr key={group.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{group.schedule_group}</td>
                  <td style={{ padding: '0.5rem' }}>{group.days_offset}</td>
                  <td style={{ padding: '0.5rem' }}>{group.offset_type}</td>
                  <td style={{ padding: '0.5rem' }}>{group.station}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  );
}

export default ScheduleGroups;
