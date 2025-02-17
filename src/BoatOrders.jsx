// src/BoatOrders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function BoatOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderOptions, setOrderOptions] = useState([]);
  const [orderHeaders, setOrderHeaders] = useState([]); // Not used for matching here
  const [searchTerm, setSearchTerm] = useState('');

  // Define station arrays for the modal header
  const leftStations = [
    "LAM Grid",
    "LAM Hull/Deck",
    "T&G Grid",
    "T&G Hull/Deck",
    "P&D Hull/Deck",
    "Open Hull/Deck 1"
  ];
  const rightStations = [
    "Open Hull/Deck 2",
    "Final 1",
    "Final 2",
    "Final 3",
    "Commissioning",
    "Shipment"
  ];

  // Fetch boat orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('boat_orders')
      .select('*')
      .order('revision_date', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
      setErrorMsg(error.message);
      setOrders([]);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const hullStr = order.hull_number.toString().toLowerCase();
    const revisionStr = order.revision_date.toString().toLowerCase();
    const fileNameStr = order.file_name ? order.file_name.toLowerCase() : '';
    const modelStr = order.hull_number.toString().slice(0, 2).toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      hullStr.includes(term) ||
      revisionStr.includes(term) ||
      fileNameStr.includes(term) ||
      modelStr.includes(term)
    );
  });

  // When an order is selected, fetch its options and headers (if needed)
  const openModal = async (order) => {
    console.log("Opening modal for order id:", order.id);
    setSelectedOrder(order);

    // Fetch options for this order
    const { data: optionsData, error: optionsError } = await supabase
      .from('boat_order_options')
      .select('*')
      .eq('boat_order_id', order.id);
    if (optionsError) {
      console.error('Error fetching order options:', optionsError);
      setOrderOptions([]);
    } else {
      console.log("Fetched order options:", optionsData);
      setOrderOptions(optionsData);
    }

    // Derive model from hull number (first two digits)
    const modelCode = order.hull_number.toString().slice(0, 2);
    const modelId = parseInt(modelCode, 10);
    console.log("Derived modelId:", modelId);

    // Fetch headers for this model from boat_order_headers (if needed)
    const { data: headersData, error: headersError } = await supabase
      .from('boat_order_headers')
      .select('*')
      .eq('model_id', modelId);
    if (headersError) {
      console.error('Error fetching headers:', headersError);
      setOrderHeaders([]);
    } else {
      console.log("Fetched headers:", headersData);
      setOrderHeaders(headersData);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOrderOptions([]);
    setOrderHeaders([]);
  };

  // Handler for "View PDF" button
  const handleViewPDF = (order) => {
    const { data } = supabase.storage
      .from('boat-orders')
      .getPublicUrl(order.file_name);
    window.open(data.publicUrl, '_blank');
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', color: '#000' }}>
      <h2>Boat Orders</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            width: '100%',
            maxWidth: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </div>
      
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No boat orders found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Hull #</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Revision Date</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Model</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const model = order.hull_number.toString().slice(0, 2);
              return (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                  onClick={() => openModal(order)}
                >
                  <td style={{ padding: '0.5rem' }}>{order.hull_number}</td>
                  <td style={{ padding: '0.5rem' }}>{order.revision_date}</td>
                  <td style={{ padding: '0.5rem' }}>{model}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
      {selectedOrder && (
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
              maxWidth: '1000px',
              width: '90%',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Fixed Header with Stations */}
            <div
              className="modal-header"
              style={{
                flex: '0 0 auto',
                padding: '1rem',
                borderBottom: '1px solid #ddd',
                position: 'sticky',
                top: 0,
                backgroundColor: '#fff',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleViewPDF(selectedOrder)}
                  style={{ marginBottom: '1rem' }}
                >
                  View PDF
                </button>
              </div>
              <h3>Boat Order Details</h3>
              <p>
                <strong>Hull #:</strong> {selectedOrder.hull_number}
              </p>
              <p>
                <strong>Revision Date:</strong> {selectedOrder.revision_date}
              </p>
              {/* Stations Section as 4 columns */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          width: '20ch',
                          textAlign: 'right',
                          padding: '0.25rem',
                          color: '#555'
                        }}
                      >
                        {leftStations[i]}:
                      </td>
                      <td
                        style={{
                          textAlign: 'left',
                          padding: '0.25rem',
                          color: '#555'
                        }}
                      >
                        {/* Placeholder for date */}
                      </td>
                      <td
                        style={{
                          width: '20ch',
                          textAlign: 'right',
                          padding: '0.25rem',
                          color: '#555'
                        }}
                      >
                        {rightStations[i]}:
                      </td>
                      <td
                        style={{
                          textAlign: 'left',
                          padding: '0.25rem',
                          color: '#555'
                        }}
                      >
                        {/* Placeholder for date */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Scrollable Content */}
            <div
              className="modal-content"
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                padding: '1rem',
              }}
            >
              {orderOptions.length === 0 ? (
                <p>No options found for this order.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Option
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderOptions.map((option) => (
                      <tr
                        key={option.id}
                        style={{
                          borderBottom: '1px solid #ddd',
                          backgroundColor:
                            option.is_header === true || option.is_header === 'true'
                              ? '#f0f0f0'
                              : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.5rem' }}>{option.option_line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Fixed Footer */}
            <div
              className="modal-footer"
              style={{
                flex: '0 0 auto',
                padding: '1rem',
                borderTop: '1px solid #ddd',
                textAlign: 'right',
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#fff',
                zIndex: 10,
              }}
            >
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoatOrders;
