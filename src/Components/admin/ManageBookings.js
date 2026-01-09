import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser, FaPhone, FaMoneyBillWave } from 'react-icons/fa';
import api from '../services/api';
import { approveCancellation, rejectCancellation } from '../services/bookingService';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
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
    background: rgba(255, 255, 255, 0.01);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.01);
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
    const [paymentModal, setPaymentModal] = useState({ show: false, booking: null, amount: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/');
            setBookings(response.data);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus, extraData = {}) => {
        try {
            const data = { booking_status: newStatus, ...extraData };
            await api.patch(`/admin/booking/${bookingId}/`, data);
            fetchBookings();
            setPaymentModal({ show: false, booking: null, amount: '' });
        } catch (err) {
            alert('Error updating booking');
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

    const getStatusColor = (status) => {
        if (['confirmed', 'paid'].includes(status)) return 'success';
        if (['pending', 'partially_paid', 'cancellation_requested'].includes(status)) return 'warning';
        if (['cancelled'].includes(status)) return 'error';
        return 'default';
    };

    if (loading) return <div>Loading Bookings...</div>;

    return (
        <Container>
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
                        {bookings.map((booking) => (
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
                                                        onClick={() => setPaymentModal({ show: true, booking, amount: '' })}
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
            </TableWrapper>

            {paymentModal.show && (
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

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <ActionBtn
                                $color="#10b981"
                                style={{ background: 'rgba(16,185,129,0.1)', flex: 1, borderRadius: '8px' }}
                                onClick={() => handleUpdateStatus(paymentModal.booking.booking_id, paymentModal.booking.booking_status, { amount_paid: paymentModal.amount })}
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
            )}
        </Container>
    );
};

export default ManageBookings;
