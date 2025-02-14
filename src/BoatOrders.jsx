// src/BoatOrders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function BoatOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderOptions, setOrderOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch boat orders from the database
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

  // Filter orders based on the search term
  const filteredOrders = orders.filter((order) => {
    // Convert fields to strings and lowercase for matching
    const hullStr = order.hull_number.toString().toLowerCase();
    const revisionStr = order.revision_date.toString().toLowerCase();
    const fileNameStr = order.file_name ? order.file_name.toLowerCase() : '';
    const term = searchTerm.toLowerCase();
    return hullStr.includes(term) || revisionStr.includes(term) || fileNameStr.includes(term);
  });

  // Open modal and fetch options for the selected order
  const openModal = async (order) => {
    setSelectedOrder(order);
    const { data, error } = await supabase
      .from('boat_order_options')
      .select('*')
      .eq('boat_order_id', order.id);
    if (error) {
      console.error('Error fetching order options:', error);
      setOrderOptions([]);
    } else {
      setOrderOptions(data);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOrderOptions([]);
  };

  // Handler for "View PDF" button in modal header
  const handleViewPDF = (order) => {
    // Use the stored file_name to retrieve the public URL
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
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                style={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => openModal(order)}
              >
                <td style={{ padding: '0.5rem' }}>{order.hull_number}</td>
                <td style={{ padding: '0.5rem' }}>{order.revision_date}</td>
              </tr>
            ))}
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
            {/* Fixed Header */}
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
              <h4>Options:</h4>
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
                      <tr key={option.id} style={{ borderBottom: '1px solid #ddd' }}>
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
