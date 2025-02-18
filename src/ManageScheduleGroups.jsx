// src/ManageScheduleGroups.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function ScheduleGroupModal({ scheduleGroup, onClose, onSave }) {
  const [formData, setFormData] = useState({
    schedule_group: scheduleGroup ? scheduleGroup.schedule_group : '',
    days_offset: scheduleGroup ? scheduleGroup.days_offset : '',
    offset_type: scheduleGroup ? scheduleGroup.offset_type : '',
    station: scheduleGroup ? scheduleGroup.station : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3>{scheduleGroup ? 'Edit Schedule Group' : 'Add New Schedule Group'}</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Schedule Group:</label>
          <input
            type="text"
            name="schedule_group"
            value={formData.schedule_group}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Days Offset:</label>
          <input
            type="number"
            name="days_offset"
            value={formData.days_offset}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Offset Type:</label>
          <input
            type="text"
            name="offset_type"
            value={formData.offset_type}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Station:</label>
          <input
            type="text"
            name="station"
            value={formData.station}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageScheduleGroups() {
  const [scheduleGroups, setScheduleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  // Handle checkbox selection for bulk delete
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk delete selected rows
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm("Are you sure you want to delete the selected schedule groups?")) {
      const { error } = await supabase
        .from('schedule_groups')
        .delete()
        .in('id', selectedIds);
      if (error) {
        alert("Error deleting schedule groups: " + error.message);
      } else {
        setSelectedIds([]);
        fetchScheduleGroups();
      }
    }
  };

  // Drag and drop handler using react-beautiful-dnd
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(scheduleGroups);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setScheduleGroups(items);
    // To persist the new order, you would need to update the order in your database.
  };

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
      // Header: ["schedule_group", "days_offset", "offset_type", "station"]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const rows = jsonData.slice(1).map((row) => ({
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

  // Download Excel Template button
  const handleDownloadTemplate = () => {
    const header = [["schedule_group", "days_offset", "offset_type", "station"]];
    const worksheet = XLSX.utils.aoa_to_sheet(header);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "ScheduleGroupsTemplate.xlsx");
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Schedule Groups</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => {
            setCurrentGroup(null);
            setShowModal(true);
          }}
          style={{ padding: '0.5rem 1rem' }}
        >
          Add New Schedule Group
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
        <button onClick={handleBulkDelete} style={{ padding: '0.5rem 1rem' }}>
          Bulk Delete
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
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="scheduleGroups">
              {(provided) => (
                <table
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <thead style={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Select</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Schedule Group</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Days Offset</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Offset Type</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleGroups.map((group, index) => (
                      <Draggable key={group.id} draggableId={group.id.toString()} index={index}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              borderBottom: '1px solid #ddd',
                              cursor: 'pointer',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <td style={{ padding: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(group.id)}
                                onChange={() => handleCheckboxChange(group.id)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>{group.schedule_group}</td>
                            <td style={{ padding: '0.5rem' }}>{group.days_offset}</td>
                            <td style={{ padding: '0.5rem' }}>{group.offset_type}</td>
                            <td style={{ padding: '0.5rem' }}>{group.station}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <button onClick={() => setCurrentGroup(group)} style={{ marginRight: '0.5rem' }}>
                                Edit
                              </button>
                              <button onClick={() => handleDelete(group.id)}>Delete</button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {showModal && (
        <ScheduleGroupModal
          scheduleGroup={currentGroup}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ManageScheduleGroups;
