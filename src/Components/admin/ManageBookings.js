import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser, FaPhone, FaMoneyBillWave, FaEdit, FaUpload, FaSpinner, FaGoogle } from 'react-icons/fa';
import api from '../services/api';

import { getRooms } from '../services/roomService';
import { approveCancellation, rejectCancellation } from '../services/bookingService';

const API_BASE_URL = (process.env.REACT_APP_BACKEND_BASE_URL || "").replace('/_b_a_c_k_e_n_d/travellerinwebsite/', '');

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  border-radius: 24px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.2);
    border-radius: 3px;
  }
`;

const BookingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 900px;

  th, td {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  th {
    background: #15202b;
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  tr:hover {
    background: rgba(212, 175, 55, 0.05);
  }
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
        switch (props.$color) {
            case 'success': return 'background: rgba(16, 185, 129, 0.1); color: #10b981;';
            case 'warning': return 'background: rgba(212, 175, 55, 0.1); color: #d4af37;';
            case 'info': return 'background: rgba(59, 130, 246, 0.1); color: #3b82f6;';
            case 'error': return 'background: rgba(239, 68, 68, 0.1); color: #ef4444;';
            default: return 'background: rgba(255, 255, 255, 0.05); color: rgba(255,255,255,0.6);';
        }
    }}
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: ${props => props.$color};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  transition: transform 0.2s;

  &:hover { transform: scale(1.2); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  width: 100%;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
  display: block;
`;

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState({ show: false, booking: null, amount: '', paymentType: 'cash' });
    const [createModal, setCreateModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newBooking, setNewBooking] = useState({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        number_of_guests: 1,
        id_proof_type: 'Aadhar Card',
        id_proof_file: 'manual_verified',
        room_numbers: [],
        check_in: '',
        check_out: '',
        amount: '',
        amount_paid: ''
    });
    const [showRoomModal, setShowRoomModal] = useState(false);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Available Rooms State
    const [availableRooms, setAvailableRooms] = useState([]);

    useEffect(() => {
        fetchBookings();
        fetchRooms();
    }, [startDate, endDate]);

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            setAvailableRooms(data);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get(`/bookings/?start_date=${startDate}&end_date=${endDate}`);
            setBookings(response.data);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus, extraData = {}) => {
        try {
            const updates = { booking_status: newStatus, ...extraData };
            const response = await api.patch(`/admin/booking/${bookingId}/`, updates);

            if (newStatus === 'confirmed' || updates.amount_paid) {
                // Check if payment was recorded (amount_paid in updates)
                if (updates.amount_paid) {
                    const latestBill = response.data.booking.payment_details.latest_billing_no;
                    const pType = updates.payment_type || 'cash';
                    if (latestBill) {
                        if (window.confirm("Payment Recorded! Do you want to print the bill?")) {
                            printBill(response.data.booking, latestBill, updates.amount_paid, pType);
                        }
                    }
                } else if (newStatus === 'confirmed') {
                    alert("Booking Confirmed & WhatsApp Sent!");
                } else {
                    alert("Status Updated Successfully!");
                }
            } else {
                alert("Status Updated Successfully!");
            }

            fetchBookings();
            setPaymentModal({ show: false, booking: null, amount: '', paymentType: 'cash' });
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleApproveCancel = async (bookingId) => {
        if (!window.confirm("Approve this cancellation request?")) return;
        try {
            await approveCancellation(bookingId);
            fetchBookings();
        } catch (err) {
            alert("Failed to approve cancellation");
        }
    };

    const handleRejectCancel = async (bookingId) => {
        if (!window.confirm("Reject this cancellation request?")) return;
        try {
            await rejectCancellation(bookingId);
            fetchBookings();
        } catch (err) {
            alert("Failed to reject cancellation");
        }
    };

    const printBill = (booking, billNo, amountPaid, paymentType) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Popup blocked! Please allow popups for this site to print the bill.");
            return;
        }
        printWindow.document.write(`
            <html>
            <head>
                <title>Bill - ${billNo}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    p { margin: 5px 0; font-size: 14px; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 16px; margin-top: 10px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <h2>Traveller's Inn</h2>
                <p style="text-align:center">Booking Receipt</p>
                <div class="line"></div>
                <p><strong>Bill No:</strong> ${billNo}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Guest:</strong> ${booking.guest_name}</p>
                <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                <p><strong>Room(s):</strong> ${Array.isArray(booking.room_numbers) ? booking.room_numbers.join(', ') : booking.room_numbers}</p>
                <div class="line"></div>
                <p><strong>Payment Type:</strong> ${paymentType.toUpperCase()}</p>
                <p class="total">Amount Paid: ₹${amountPaid}</p>
                <div class="line"></div>
                <p class="footer">Thank you for staying with us!</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await api.post('/upload/room-image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewBooking(prev => ({ ...prev, id_proof_file: response.data.url }));
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleEditBooking = (booking) => {
        setEditingBooking(booking);
        setNewBooking({
            guest_name: booking.guest_name || '',
            guest_phone: booking.guest_phone || '',
            guest_email: booking.guest_email || '',
            number_of_guests: booking.number_of_guests || 1,
            id_proof_type: booking.id_proof_type || 'Aadhar Card',
            id_proof_file: booking.id_proof_file || '',
            room_numbers: Array.isArray(booking.room_numbers) ? booking.room_numbers : (booking.room_numbers ? booking.room_numbers.split(',').filter(r => r) : []),
            check_in: booking.check_in ? booking.check_in.slice(0, 16) : '', // format for datetime-local
            check_out: booking.check_out ? booking.check_out.slice(0, 16) : '',
            amount: booking.payment_details?.amount || '',
            amount_paid: booking.payment_details?.amount_paid || ''
        });
        setCreateModal(true);
    };

    const handleSaveBooking = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                guest_name: newBooking.guest_name,
                guest_phone: newBooking.guest_phone,
                guest_email: newBooking.guest_email || null,
                number_of_guests: parseInt(newBooking.number_of_guests),
                id_proof_type: newBooking.id_proof_type,
                id_proof_file: newBooking.id_proof_file || 'manual_entry',
                // Handle room_numbers: backend expects comma-separated string
                room_numbers: Array.isArray(newBooking.room_numbers) ? newBooking.room_numbers.join(',') : newBooking.room_numbers,
                check_in: newBooking.check_in,
                check_out: newBooking.check_out,
                payment_details: {
                    amount: parseFloat(newBooking.amount),
                    amount_paid: parseFloat(newBooking.amount_paid || 0),
                    status: parseFloat(newBooking.amount_paid) >= parseFloat(newBooking.amount) ? 'paid' : (parseFloat(newBooking.amount_paid) > 0 ? 'partially_paid' : 'pending'),
                    method: 'cash' // Default to cash for manual
                },
                booking_status: editingBooking ? editingBooking.booking_status : 'confirmed',
                booking_source: 'manual',
                extra_addons: []
            };

            if (editingBooking) {
                await api.patch(`/bookings/${editingBooking.booking_id}/`, payload);
                alert("Booking updated successfully!");
            } else {
                await api.post('/bookings/', payload);
                alert("Booking created successfully!");
            }

            fetchBookings();
            setCreateModal(false);
            setEditingBooking(null);
            setNewBooking({
                guest_name: '', guest_phone: '', guest_email: '',
                number_of_guests: 1, id_proof_type: 'Aadhar Card', id_proof_file: '',
                room_numbers: [], check_in: '', check_out: '', amount: '', amount_paid: ''
            });
        } catch (err) {
            alert("Failed to save booking: " + (err.response?.data?.error || err.message));
        }
    };

    const getStatusColor = (status) => {
        if (['confirmed', 'paid'].includes(status)) return 'success';
        if (['pending', 'partially_paid', 'cancellation_requested'].includes(status)) return 'warning';
        if (['cancelled'].includes(status)) return 'error';
        return 'default';
    };

    if (loading) return <div>Loading Bookings...</div>;

    // Filter now handled by backend
    const filteredBookings = bookings;

    return (
        <Container>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>From:</span>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={{ width: 'auto', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>To:</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={{ width: 'auto', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <ActionBtn
                        $color="#fff"
                        style={{ background: '#1E6F5C', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => {
                            setEditingBooking(null);
                            setNewBooking({
                                guest_name: '', guest_phone: '', guest_email: '',
                                number_of_guests: 1, id_proof_type: 'Aadhar Card', id_proof_file: '',
                                room_numbers: [], check_in: '', check_out: '', amount: '', amount_paid: ''
                            });
                            setCreateModal(true);
                        }}
                    >
                        + Add Booking
                    </ActionBtn>
                </div>
            </div>

            <TableWrapper>
                <BookingsTable>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest</th>
                            <th>Dates & Rooms</th>
                            <th>Payment Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking.booking_id}>
                                <td>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{booking.booking_id}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(booking.created_at).toLocaleDateString()}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaUser size={12} color="#d4af37" />
                                            {booking.guest_name || 'Guest'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                            <FaPhone size={10} />
                                            {booking.guest_phone || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <FaCalendarAlt size={12} color="rgba(255,255,255,0.4)" />
                                            {booking.check_in.split('T')[0]} - {booking.check_out.split('T')[0]}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: '500' }}>
                                            Rooms: {typeof booking.room_numbers === 'string'
                                                ? booking.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                                                : (Array.isArray(booking.room_numbers) ? booking.room_numbers.join(', ') : booking.room_numbers)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>₹{booking.payment_details?.amount || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Paid: ₹{booking.payment_details?.amount_paid || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#ff4d4d' }}>Bal: ₹{(booking.payment_details?.amount || 0) - (booking.payment_details?.amount_paid || 0)}</div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <StatusBadge $color={getStatusColor(booking.booking_status)}>
                                            {booking.booking_status}
                                        </StatusBadge>
                                        <StatusBadge $color={getStatusColor(booking.payment_details?.status)}>
                                            {booking.payment_details?.status?.replace('_', ' ')}
                                        </StatusBadge>
                                        {booking.cancellation_reason && (
                                            <div style={{ fontSize: '0.7rem', color: '#ff4d4d', maxWidth: '150px', fontStyle: 'italic' }}>
                                                Reason: {booking.cancellation_reason}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {booking.booking_status === 'cancellation_requested' ? (
                                            <>
                                                <ActionBtn
                                                    $color="#10b981"
                                                    title="Approve Cancellation"
                                                    onClick={() => handleApproveCancel(booking.booking_id)}
                                                >
                                                    <FaCheck />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $color="#ff4d4d"
                                                    title="Reject Cancellation"
                                                    onClick={() => handleRejectCancel(booking.booking_id)}
                                                >
                                                    <FaTimes />
                                                </ActionBtn>
                                            </>
                                        ) : (
                                            <>
                                                <ActionBtn
                                                    $color="#3b82f6"
                                                    title="Edit Booking"
                                                    onClick={() => handleEditBooking(booking)}
                                                >
                                                    <FaEdit />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $color="#10b981"
                                                    title="Confirm"
                                                    disabled={booking.booking_status === 'confirmed'}
                                                    onClick={() => handleUpdateStatus(booking.booking_id, 'confirmed')}
                                                >
                                                    <FaCheck />
                                                </ActionBtn>
                                                {booking.payment_details?.method === 'cash' && booking.payment_details?.status !== 'paid' && (
                                                    <ActionBtn
                                                        $color="#d4af37"
                                                        title="Record Payment"
                                                        onClick={() => setPaymentModal({ show: true, booking, amount: '', paymentType: 'cash' })}
                                                    >
                                                        <FaMoneyBillWave />
                                                    </ActionBtn>
                                                )}
                                                <ActionBtn
                                                    $color="#ff4d4d"
                                                    title="Cancel"
                                                    disabled={booking.booking_status === 'cancelled'}
                                                    onClick={() => {
                                                        const reason = window.prompt("Enter cancellation reason:");
                                                        if (reason !== null) {
                                                            handleUpdateStatus(booking.booking_id, 'cancelled', { cancellation_reason: reason });
                                                        }
                                                    }}
                                                >
                                                    <FaTimes />
                                                </ActionBtn>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </BookingsTable>
            </TableWrapper >

            {
                paymentModal.show && (
                    <ModalOverlay onClick={() => setPaymentModal({ show: false, booking: null, amount: '' })}>
                        <ModalContent onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', fontFamily: 'Playfair Display' }}>Record Cash Payment</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                Record payment for Booking: {paymentModal.booking.booking_id}
                            </p>

                            <div>
                                <Label>Amount Paid (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={paymentModal.amount}
                                    onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Payment Type</Label>
                                <select
                                    value={paymentModal.paymentType}
                                    onChange={e => setPaymentModal({ ...paymentModal, paymentType: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="cash">Cash</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="upi">UPI</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="card">Card</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="online">Online</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <ActionBtn
                                    $color="#10b981"
                                    style={{ background: 'rgba(16,185,129,0.1)', flex: 1, borderRadius: '8px' }}
                                    onClick={() => handleUpdateStatus(paymentModal.booking.booking_id, paymentModal.booking.booking_status, { amount_paid: paymentModal.amount, payment_type: paymentModal.paymentType })}
                                >
                                    Record
                                </ActionBtn>
                                <ActionBtn
                                    $color="#ff4d4d"
                                    style={{ background: 'rgba(255,77,77,0.1)', flex: 1, borderRadius: '8px' }}
                                    onClick={() => setPaymentModal({ show: false, booking: null, amount: '' })}
                                >
                                    Cancel
                                </ActionBtn>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )
            }

            {
                createModal && (
                    <ModalOverlay onClick={() => setCreateModal(false)}>
                        <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <h3 style={{ color: '#fff', fontFamily: 'Playfair Display', margin: 0 }}>{editingBooking ? 'Edit Booking' : 'Create Manual Booking'}</h3>
                                <button onClick={() => setCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSaveBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <Label>Guest Name</Label>
                                    <Input required value={newBooking.guest_name} onChange={e => setNewBooking({ ...newBooking, guest_name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div>
                                    <Label>Guest Phone</Label>
                                    <Input required value={newBooking.guest_phone} onChange={e => setNewBooking({ ...newBooking, guest_phone: e.target.value })} placeholder="+91..." />
                                </div>
                                <div>
                                    <Label>Guest Email (Optional)</Label>
                                    <Input type="email" value={newBooking.guest_email} onChange={e => setNewBooking({ ...newBooking, guest_email: e.target.value })} placeholder="email@example.com" />
                                </div>
                                <div>
                                    <Label>Number of Guests</Label>
                                    <Input required type="number" min="1" value={newBooking.number_of_guests} onChange={e => setNewBooking({ ...newBooking, number_of_guests: e.target.value })} />
                                </div>
                                <div>
                                    <Label>ID Proof Type</Label>
                                    <select
                                        value={newBooking.id_proof_type}
                                        onChange={e => setNewBooking({ ...newBooking, id_proof_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    >
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Aadhar Card">Aadhar Card</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Passport">Passport</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Driving License">Driving License</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Voter ID">Voter ID</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>ID Proof File</Label>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        {uploading ? <FaSpinner className="fa-spin" /> : <FaUpload />}
                                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                            {uploading ? 'Uploading...' : (newBooking.id_proof_file ? 'Change File' : 'Upload File')}
                                        </span>
                                        <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    {newBooking.id_proof_file && (
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaCheck /> File Uploaded
                                            <a href={`${API_BASE_URL}${newBooking.id_proof_file}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View</a>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Check In</Label>
                                    <Input required type="datetime-local" value={newBooking.check_in} onChange={e => setNewBooking({ ...newBooking, check_in: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Check Out</Label>
                                    <Input required type="datetime-local" value={newBooking.check_out} onChange={e => setNewBooking({ ...newBooking, check_out: e.target.value })} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Label>Rooms</Label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        {Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.map(r => (
                                            <span key={r} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {r} <FaTimes style={{ cursor: 'pointer' }} onClick={() => setNewBooking({ ...newBooking, room_numbers: newBooking.room_numbers.filter(n => n !== r) })} />
                                            </span>
                                        ))}
                                    </div>
                                    <ActionBtn type="button" $color="#d4af37" style={{ border: '1px solid #d4af37', width: '100%', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }} onClick={() => setShowRoomModal(true)}>
                                        Select Rooms
                                    </ActionBtn>
                                </div>
                                <div>
                                    <Label>Total Amount (₹)</Label>
                                    <Input required type="number" value={newBooking.amount} onChange={e => setNewBooking({ ...newBooking, amount: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Amount Paid (₹)</Label>
                                    <Input type="number" value={newBooking.amount_paid} onChange={e => setNewBooking({ ...newBooking, amount_paid: e.target.value })} placeholder="0" />
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <ActionBtn type="submit" $color="#fff" style={{ background: '#1E6F5C', flex: 1, borderRadius: '8px', padding: '0.8rem' }} disabled={uploading}>
                                        {editingBooking ? 'Update Booking' : 'Create Booking'}
                                    </ActionBtn>
                                </div>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )
            }
            {
                showRoomModal && (
                    <ModalOverlay onClick={() => setShowRoomModal(false)} style={{ zIndex: 2100 }}>
                        <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>Select Rooms</h3>
                                <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><FaTimes /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {availableRooms.map(room => (
                                    <div
                                        key={room.room_number}
                                        onClick={() => {
                                            const current = Array.isArray(newBooking.room_numbers) ? newBooking.room_numbers : [];
                                            const updated = current.includes(room.room_number)
                                                ? current.filter(r => r !== room.room_number)
                                                : [...current, room.room_number];
                                            setNewBooking({ ...newBooking, room_numbers: updated });
                                        }}
                                        style={{
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            border: Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.includes(room.room_number) ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                            background: Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.includes(room.room_number) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <span style={{ fontWeight: 'bold' }}>{room.room_number}</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{room.room_type}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#d4af37' }}>₹{room.price}</span>
                                    </div>
                                ))}
                            </div>
                            <ActionBtn $color="#fff" style={{ background: '#1E6F5C', marginTop: '1rem', padding: '0.8rem', borderRadius: '8px' }} onClick={() => setShowRoomModal(false)}>
                                Done
                            </ActionBtn>
                        </ModalContent>
                    </ModalOverlay>
                )
            }
        </Container >
    );
};

export default ManageBookings;
