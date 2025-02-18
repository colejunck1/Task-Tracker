// src/TaskData.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageTaskData from './ManageTaskData';
import BulkUploadTasks from './BulkUploadTasks';

function TaskData() {
  const [tasks, setTasks] = useState([]);
  const [modelsMapping, setModelsMapping] = useState({}); // mapping: model id -> model name
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [filterModel, setFilterModel] = useState('All');

  // Fetch tasks from the "task_data" table
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('task_data')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.error("Error fetching task data:", error);
      setErrorMsg(error.message);
      setTasks([]);
    } else {
      console.log("Fetched tasks:", data);
      setTasks(data);
    }
    setLoading(false);
  };

  // Fetch models mapping from the "models" table
  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('models')
      .select('id, model_name')
      .order('model_name', { ascending: true });
    if (error) {
      console.error("Error fetching models:", error);
    } else {
      const mapping = {};
      data.forEach(model => {
        mapping[model.id] = model.model_name;
      });
      setModelsMapping(mapping);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchModels();
  }, []);

  // Get distinct station and model values from tasks
  const stations = ["All", ...Array.from(new Set(tasks.map(task => task.station))).sort()];
  const models = ["All", ...Array.from(new Set(tasks.map(task => {
    const modelId = task.model;
    return modelsMapping[modelId] ? modelsMapping[modelId] : modelId.toString();
  }))).sort()];

  // Filter tasks based on search term, station, and model
  const filteredTasks = tasks.filter(task => {
    const taskName = task.task_name ? task.task_name.toLowerCase() : '';
    const stationVal = task.station ? task.station.toLowerCase() : '';
    const modelName = modelsMapping[task.model] ? modelsMapping[task.model].toLowerCase() : task.model.toString().toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = taskName.includes(search) || stationVal.includes(search) || modelName.includes(search);
    const matchesStation = filterStation === 'All' || task.station === filterStation;
    const matchesModel = filterModel === 'All' || modelName === filterModel.toLowerCase();
    return matchesSearch && matchesStation && matchesModel;
  });

  return (
    <div style={{ padding: '1rem' }}>
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
          <label style={{ marginRight: '0.5rem' }}>Filter by Model:</label>
          <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
            <option value="All">All</option>
            {models.map((model, idx) => (
              <option key={idx} value={model}>
                {model}
              </option>
            ))}
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
        <div>
          <button onClick={() => setShowBulkUpload(!showBulkUpload)}>
            {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload Tasks'}
          </button>
        </div>
        <div>
          <button onClick={() => setSelectedTask(null)}>+ Add New Task</button>
        </div>
      </div>

      {showBulkUpload && <BulkUploadTasks onUploadComplete={fetchTasks} />}

      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        // Container with fixed height and scrollable table with white background.
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
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Model</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Station</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Task Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Labor Hours</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Associated Options</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Schedule Group</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Duration (Days)</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
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
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.5rem' }}>
                    {modelsMapping[task.model] ? modelsMapping[task.model] : task.model}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{task.station}</td>
                  <td style={{ padding: '0.5rem' }}>{task.task_name}</td>
                  <td style={{ padding: '0.5rem' }}>{task.labor_hours}</td>
                  <td style={{ padding: '0.5rem' }}>{task.associated_options}</td>
                  <td style={{ padding: '0.5rem' }}>{task.schedule_group}</td>
                  <td style={{ padding: '0.5rem' }}>{task.duration_days}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <button onClick={() => setSelectedTask(task)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTask !== null && (
        <ManageTaskData
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

export default TaskData;
