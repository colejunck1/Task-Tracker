// src/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ChangeTaskStatus from './ChangeTaskStatus';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [stations, setStations] = useState([]);
  const [hullNumbers, setHullNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [filterHull, setFilterHull] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks from the tasks_per_hull table
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks_per_hull')
      .select('*')
      .order('start_date', { ascending: true });
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

  // Get distinct hull numbers from tasks_per_hull
  const extractHullNumbers = (tasksData) => {
    const hullSet = Array.from(new Set(tasksData.map(task => task.hull_number)));
    return ["All", ...hullSet.filter(h => h !== "All").sort()];
  };

  useEffect(() => {
    fetchTasks();
    fetchStations();
  }, []);

  useEffect(() => {
    setHullNumbers(extractHullNumbers(tasks));
  }, [tasks]);

  // Filter tasks based on search term, station, hull, and status
  const filteredTasks = tasks.filter(task => {
    const taskName = task.task_name ? task.task_name.toLowerCase() : '';
    const stationVal = task.station ? task.station.toLowerCase() : '';
    const hullVal = task.hull_number ? task.hull_number.toString().toLowerCase() : '';
    const statusVal = task.status ? task.status.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = taskName.includes(search) || stationVal.includes(search) || hullVal.includes(search);
    const matchesStation = filterStation === 'All' || task.station === filterStation;
    const matchesHull = filterHull === 'All' || task.hull_number.toString() === filterHull;
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesStation && matchesHull && matchesStatus;
  });

  // Returns style object based on task status
  const getStatusStyle = (status) => {
    switch(status) {
      case "Upcoming":
        return {
          backgroundColor: '#ffffe0', // light yellow
          color: '#b8860b',           // dark yellow
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case "In Progress":
        return {
          backgroundColor: '#d0e7ff', // light blue
          color: '#004a99',           // dark blue
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case "Completed":
        return {
          backgroundColor: '#d0f0d0', // light green
          color: '#006400',           // dark green
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: 'inline-block'
        };
      default:
        return {};
    }
  };

  // Update task status when changed via the modal
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
      
      {/* Filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
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
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter by Hull #:</label>
          <select value={filterHull} onChange={(e) => setFilterHull(e.target.value)}>
            <option value="All">All</option>
            {hullNumbers.map((hull, idx) => (
              <option key={idx} value={hull}>
                {hull}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div style={{ width: '33%' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
      </div>
      
      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        // Container with fixed height and scrollable table.
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
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Hull #</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Task Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Start Date</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>End Date</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr
                  key={task.id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedTask(task)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.5rem' }}>{task.hull_number}</td>
                  <td style={{ padding: '0.5rem' }}>{task.task_name}</td>
                  <td style={{ padding: '0.5rem' }}>{task.station}</td>
                  <td style={{ padding: '0.5rem' }}>{task.start_date || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>{task.end_date || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={getStatusStyle(task.status)}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedTask && (
        <ChangeTaskStatus
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(newStatus) => {
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

export default Tasks;
