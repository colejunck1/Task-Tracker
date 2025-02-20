// src/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ChangeTaskStatus from './ChangeTaskStatus';
import PrintTasksModal from './PrintTasksModal';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';

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
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // New state for sorting
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Extract distinct hull numbers from tasks_per_hull
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

  // Filter tasks based on search term and filters
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

  // Apply sorting to filteredTasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortingColumn) return 0;
    const valueA = a[sortingColumn] || '';
    const valueB = b[sortingColumn] || '';
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    } else {
      const compareA = valueA.toString().toLowerCase();
      const compareB = valueB.toString().toLowerCase();
      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  // Returns style object based on task status
  const getStatusStyle = (status) => {
    switch(status) {
      case "Upcoming":
        return {
          backgroundColor: '#ffffe0',
          color: '#b8860b',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case "In Progress":
        return {
          backgroundColor: '#d0e7ff',
          color: '#004a99',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case "Completed":
        return {
          backgroundColor: '#d0f0d0',
          color: '#006400',
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

  // Handle header click for sorting
  const handleSort = (columnKey) => {
    if (sortingColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortingColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Open print modal
  const openPrintModal = () => {
    setPrintModalOpen(true);
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Filter/Search and Title Container */}
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem',
          borderBottom: '1px solid #ddd'
        }}>
          <h2 style={{ margin: 0, marginRight: '1.5rem', fontSize: '1.25rem' }}>Tasks</h2>
          <div style={{ position: 'relative', flex: '0 0 25%' }}>
            <FiSearch style={{
              position: 'absolute',
              top: '50%',
              left: '0.5rem',
              transform: 'translateY(-50%)',
              color: '#888'
            }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.25rem 0.5rem 0.25rem 2rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
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
            <button onClick={openPrintModal} style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff'
            }}>
              Print
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div
          className="print-table-container"
          style={{
            backgroundColor: '#fff',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('hull_number')}>
                  Hull #
                  {sortingColumn === 'hull_number' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('task_name')}>
                  Task Name
                  {sortingColumn === 'task_name' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('station')}>
                  Station
                  {sortingColumn === 'station' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('start_date')}>
                  Start Date
                  {sortingColumn === 'start_date' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('end_date')}>
                  End Date
                  {sortingColumn === 'end_date' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('status')}>
                  Status
                  {sortingColumn === 'status' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }} onClick={() => handleSort('schedule_group')}>
                  Schedule Group
                  {sortingColumn === 'schedule_group' && (
                    sortDirection === 'asc' ? <FiChevronUp style={{ marginLeft: '0.25rem', color: '#007bff' }} /> : <FiChevronDown style={{ marginLeft: '0.25rem', color: '#007bff' }} />
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
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
                  <td style={{ padding: '0.5rem' }}>{task.schedule_group || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <ChangeTaskStatus
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(newStatus) => {
            fetchTasks();
          }}
        />
      )}

      {printModalOpen && (
        <PrintTasksModal
          tasks={filteredTasks}
          stations={stations}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Tasks;
