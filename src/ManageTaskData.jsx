// src/ManageTaskData.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function ManageTaskData({ task, onClose }) {
  const [model, setModel] = useState(task ? task.model : '');
  const [station, setStation] = useState(task ? task.station : '');
  const [taskName, setTaskName] = useState(task ? task.task_name : '');
  const [laborHours, setLaborHours] = useState(task ? task.labor_hours : '');
  const [associatedOptions, setAssociatedOptions] = useState(task ? task.associated_options : '');
  const [scheduleGroup, setScheduleGroup] = useState(task ? task.schedule_group : '');
  const [durationDays, setDurationDays] = useState(task ? task.duration_days : '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stations, setStations] = useState([]);

  // Fetch stations from Supabase's "stations" table
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name', { ascending: true });
      if (error) {
        console.error("Error fetching stations:", error);
      } else {
        setStations(data);
      }
    };
    fetchStations();
  }, []);

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    if (!model.trim() || !station) {
      setErrorMsg('Model and Station are required.');
      setIsProcessing(false);
      return;
    }
    if (!taskName.trim()) {
      setErrorMsg('Task Name is required.');
      setIsProcessing(false);
      return;
    }
    if (task) {
      // Update existing task
      const { error } = await supabase
        .from('task_data')
        .update({
          model: model.trim(),
          station: station, // station selected from dropdown
          task_name: taskName.trim(),
          labor_hours: laborHours,
          associated_options: associatedOptions,
          schedule_group: scheduleGroup,
          duration_days: durationDays,
        })
        .eq('id', task.id);
      if (error) {
        setErrorMsg(error.message);
      }
    } else {
      // Insert new task
      const { error } = await supabase
        .from('task_data')
        .insert([
          {
            model: model.trim(),
            station: station, // station selected from dropdown
            task_name: taskName.trim(),
            labor_hours: laborHours,
            associated_options: associatedOptions,
            schedule_group: scheduleGroup,
            duration_days: durationDays,
          },
        ]);
      if (error) {
        setErrorMsg(error.message);
      }
    }
    setIsProcessing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsProcessing(true);
    const { error } = await supabase
      .from('task_data')
      .delete()
      .eq('id', task.id);
    if (error) {
      setErrorMsg(error.message);
    }
    setIsProcessing(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
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
        className="modal-container"
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          padding: '1rem',
        }}
      >
        <h3>{task ? 'Edit Task Data' : 'Add New Task Data'}</h3>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Model:</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Station:</label>
          <select
            value={station}
            onChange={(e) => setStation(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select Station</option>
            {stations.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Task Name:</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Labor Hours:</label>
          <input
            type="number"
            value={laborHours}
            onChange={(e) => setLaborHours(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Associated Options:</label>
          <input
            type="text"
            value={associatedOptions}
            onChange={(e) => setAssociatedOptions(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Schedule Group:</label>
          <input
            type="text"
            value={scheduleGroup}
            onChange={(e) => setScheduleGroup(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Duration (Days):</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          {task && (
            <button onClick={handleDelete} disabled={isProcessing} style={{ marginRight: '1rem' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} disabled={isProcessing} style={{ marginRight: '1rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageTaskData;
