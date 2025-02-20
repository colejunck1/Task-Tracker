// src/TaskData.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ManageTaskData from './ManageTaskData';
import BulkUploadTasks from './BulkUploadTasks';
import ImportTasksModal from './ImportTasksModal';
import PrintTaskDataModal from './PrintTaskDataModal';
import { FiSearch } from 'react-icons/fi';
import { BsFileEarmarkSpreadsheet, BsPrinter, BsPlus } from 'react-icons/bs';

const TaskData = () => {
  const [tasks, setTasks] = useState([]);
  const [modelsMapping, setModelsMapping] = useState({}); // { model id: model name }
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [filterModel, setFilterModel] = useState('All');
  const [stations, setStations] = useState([]); // station names
  const [modelsList, setModelsList] = useState([]); // model names
  const [validScheduleGroups, setValidScheduleGroups] = useState([]); // valid schedule_group IDs
  const [validModelOptions, setValidModelOptions] = useState([]); // valid associated_options IDs

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
      setTasks(data);
    }
    setLoading(false);
  };

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('models')
      .select('id, name')
      .order('name', { ascending: true });
    if (error) {
      console.error("Error fetching models:", error);
    } else if (data) {
      const mapping = {};
      const modelNames = [];
      data.forEach(model => {
        mapping[model.id] = model.name;
        modelNames.push(model.name);
      });
      setModelsMapping(mapping);
      setModelsList(modelNames);
    }
  };

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('stations')
      .select('name')
      .order('name', { ascending: true });
    if (error) {
      console.error("Error fetching stations:", error);
    } else if (data) {
      const stationNames = data.map(s => s.name);
      setStations(stationNames);
    }
  };

  const fetchScheduleGroups = async () => {
    const { data, error } = await supabase
      .from('schedule_groups')
      .select('id');
    if (error) {
      console.error("Error fetching schedule groups:", error);
    } else if (data) {
      const groupIds = data.map(sg => sg.id);
      setValidScheduleGroups(groupIds);
    }
  };

  const fetchModelOptions = async () => {
    const { data, error } = await supabase
      .from('model_options')
      .select('id');
    if (error) {
      console.error("Error fetching model options:", error);
    } else if (data) {
      const optionIds = data.map(opt => opt.id);
      setValidModelOptions(optionIds);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchModels();
    fetchStations();
    fetchScheduleGroups();
    fetchModelOptions();
  }, []);

  const stationOptions = ["All", ...Array.from(new Set(stations)).sort()];
  const modelOptions = ["All", ...Array.from(new Set(modelsList)).sort()];

  const filteredTasks = tasks.filter(task => {
    const taskName = task.task_name ? task.task_name.toLowerCase() : '';
    const stationVal = task.station ? task.station.toLowerCase() : '';
    const modelName = modelsMapping[task.model]
      ? modelsMapping[task.model].toLowerCase()
      : task.model.toString().toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = taskName.includes(search) || stationVal.includes(search) || modelName.includes(search);
    const matchesStation = filterStation === 'All' || task.station === filterStation;
    const matchesModel = filterModel === 'All' || modelName === filterModel.toLowerCase();
    return matchesSearch && matchesStation && matchesModel;
  });

  const exportTasks = () => {
    const csvHeader = ["Model", "Station", "Task Name", "Labor Hours", "Associated Options", "Schedule Group", "Duration (Days)"];
    const csvRows = filteredTasks.map(task => {
      const model = modelsMapping[task.model] ? modelsMapping[task.model] : task.model;
      return [
        model,
        task.station,
        task.task_name,
        task.labor_hours,
        task.associated_options,
        task.schedule_group,
        task.duration_days
      ];
    });
    const csvContent = [csvHeader, ...csvRows]
      .map(row => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_data_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // onImport: transform imported data.
  const handleImportTasks = async (importData) => {
    // Build reverse mapping: model name -> model id
    const reverseModelsMapping = {};
    Object.keys(modelsMapping).forEach(id => {
      const name = modelsMapping[id];
      reverseModelsMapping[name.trim()] = parseInt(id, 10);
    });
    const transformedData = importData.map(row => {
      const transformedRow = { ...row };
      const modelName = String(row.model).trim();
      const modelId = reverseModelsMapping[modelName];
      if (modelId === undefined) {
        console.warn(`Model name "${modelName}" not found in mapping.`);
      }
      transformedRow.model = modelId;
      const numericFields = ["labor_hours", "schedule_group", "duration_days", "associated_options"];
      numericFields.forEach(field => {
        const val = String(transformedRow[field]).trim();
        if (val === "") {
          transformedRow[field] = null;
        } else {
          if (field === "schedule_group" || field === "associated_options") {
            const num = parseInt(val, 10);
            if (field === "schedule_group") {
              transformedRow[field] = validScheduleGroups.includes(num) ? num : null;
            } else {
              transformedRow[field] = validModelOptions.includes(num) ? num : null;
            }
          } else {
            const num = parseFloat(val);
            transformedRow[field] = isNaN(num) ? null : num;
          }
        }
      });
      return transformedRow;
    });
    console.log("Transformed data for import:", transformedData);
    const { data, error } = await supabase
      .from('task_data')
      .insert(transformedData);
    if (error) {
      console.error("Error importing tasks:", error);
      throw error;
    } else {
      console.log("Imported tasks:", data);
    }
    await fetchTasks();
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Filter/Search and Title Container */}
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem',
          borderBottom: '1px solid #ddd'
        }}>
          <h2 style={{ margin: 0, marginRight: '1.5rem', fontSize: '1.25rem' }}>Task Data</h2>
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
                {stationOptions.map((station, idx) => (
                  <option key={idx} value={station}>{station}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ marginRight: '0.5rem' }}>Filter by Model:</label>
              <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
                {modelOptions.map((model, idx) => (
                  <option key={idx} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={() => setShowImportModal(true)} style={{
                backgroundColor: 'green',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <BsFileEarmarkSpreadsheet size={18} />
                Import
              </button>
            </div>
            <div>
              <button onClick={exportTasks} style={{
                backgroundColor: 'green',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <BsFileEarmarkSpreadsheet size={18} />
                Export
              </button>
            </div>
            <div>
              <button onClick={() => setSelectedTask(null)} style={{
                backgroundColor: '#007bff',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <BsPlus size={18} />
                Add New Task
              </button>
            </div>
            <div>
              <button onClick={() => setShowPrintModal(true)} style={{
                backgroundColor: '#007bff',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <BsPrinter size={18} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
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

      {selectedTask && (
        <ManageTaskData
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}

      {showBulkUpload && <BulkUploadTasks onUploadComplete={fetchTasks} />}

      {showImportModal && (
        <ImportTasksModal 
          validStations={stations.filter(s => s !== "All")}
          validModels={modelsList.filter(m => m !== "All")}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTasks}
        />
      )}

      {showPrintModal && (
        <PrintTaskDataModal 
          tasks={filteredTasks}
          stations={stations.filter(s => s !== "All")}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default TaskData;
