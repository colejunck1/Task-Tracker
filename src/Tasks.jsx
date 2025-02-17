// src/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterStation, setFilterStation] = useState('All');

  // Fetch tasks from the tasks_per_hull table
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks_per_hull')
      .select('*')
      .order('start_date', { ascending: true }); // Order by start_date
    if (error) {
      console.error("Error fetching tasks:", error);
      setErrorMsg(error.message);
      setTasks([]);
    } else {
      console.log("Fetched tasks:", data);
      setTasks(data);
    }
    setLoading(false);
  };

  // Fetch stations from the stations table
  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('stations')
      .select('name')
      .order('name', { ascending: true });
    if (error) {
      console.error("Error fetching stations:", error);
    } else {
      setStations(data.map(s => s.name));
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStations();
  }, []);

  // Filter tasks by station if a filter is applied
  const filteredTasks = tasks.filter(task => {
    if (filterStation === 'All') return true;
    return task.station === filterStation;
  });

  // Update task status when changed by employee
  const updateTaskStatus = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks_per_hull')
      .update({ status: newStatus })
      .eq('id', taskId);
    if (error) {
      console.error("Error updating task status:", error);
      setErrorMsg(error.message);
    } else {
      fetchTasks();
    }
  };

  const handleStatusChange = (e, taskId) => {
    const newStatus = e.target.value;
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Tasks</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Filter by Station:</label>
        <select value={filterStation} onChange={(e) => setFilterStation(e.target.value)}>
          <option value="All">All</option>
          {stations.map((station, idx) => (
            <option key={idx} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Hull #</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Task Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Start Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>End Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Schedule Group</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>{task.hull_number}</td>
                <td style={{ padding: '0.5rem' }}>{task.task_name}</td>
                <td style={{ padding: '0.5rem' }}>{task.station}</td>
                <td style={{ padding: '0.5rem' }}>{task.start_date || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{task.end_date || '-'}</td>
                <td style={{ padding: '0.5rem' }}>
                  <select value={task.status} onChange={(e) => handleStatusChange(e, task.id)}>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td style={{ padding: '0.5rem' }}>{task.schedule_group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Tasks;
