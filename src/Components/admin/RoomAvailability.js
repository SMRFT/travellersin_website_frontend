import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaUser, FaIdCard, FaClock, FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  padding: 2rem;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const DateInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  input {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    outline: none;
    &::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const RoomCard = styled(motion.div)`
  background: #0f151a;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props =>
        props.$status === 'available' ? 'rgba(16, 185, 129, 0.2)' :
            props.$status === 'confirmed' ? 'rgba(239, 68, 68, 0.2)' :
                'rgba(245, 158, 11, 0.2)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props =>
        props.$status === 'available' ? '#10b981' :
            props.$status === 'confirmed' ? '#ef4444' :
                '#f59e0b'};
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RoomNumber = styled.h3`
  font-size: 1.2rem;
  color: #fff;
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  background: ${props =>
        props.$status === 'available' ? 'rgba(16, 185, 129, 0.1)' :
            props.$status === 'confirmed' ? 'rgba(239, 68, 68, 0.1)' :
                'rgba(245, 158, 11, 0.1)'};
  color: ${props =>
        props.$status === 'available' ? '#10b981' :
            props.$status === 'confirmed' ? '#ef4444' :
                '#f59e0b'};
`;

const BookingInfo = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    font-size: 0.8rem;
    color: #d4af37;
  }
`;

const EditButton = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  color: #d4af37;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    transform: translateY(-2px);
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #161625;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;

  &:focus { border-color: #d4af37; }

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;

  &:focus { border-color: #d4af37; }
  option { background: #161625; }
`;

const RoomAvailability = ({ onEditBooking }) => {
    // Current local time formatted for datetime-local input (YYYY-MM-DDTHH:mm)
    const getNowForInput = () => {
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [selectedDate, setSelectedDate] = useState(getNowForInput());
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchAvailability();
    }, [selectedDate]);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            // selectedDate is "YYYY-MM-DDTHH:mm" from input
            const isoDate = new Date(selectedDate).toISOString();
            const response = await api.get(`/admin/room-availability/?date=${isoDate}`);
            setRooms(response.data);
        } catch (err) {
            console.error("Error fetching availability:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (booking) => {
        // Format dates for datetime-local input using UTC to match stored data
        const formatForInput = (dateStr) => {
            const d = new Date(dateStr);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
        };

        setEditingBooking({
            ...booking,
            check_in: formatForInput(booking.check_in),
            check_out: formatForInput(booking.check_out),
            status: booking.status || 'confirmed'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        setSaveLoading(true);
        try {
            // Append 'Z' to treat as UTC when saving
            const checkInISO = new Date(editingBooking.check_in).toISOString();
            const checkOutISO = new Date(editingBooking.check_out).toISOString();

            await api.patch(`/admin/booking/${editingBooking.booking_id}/`, {
                check_in: checkInISO,
                check_out: checkOutISO,
                booking_status: editingBooking.status
            });
            setIsEditModalOpen(false);
            fetchAvailability();
        } catch (err) {
            alert("Failed to update booking: " + (err.response?.data?.error || err.message));
        } finally {
            setSaveLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

    return (
        <Container>
            <ControlBar>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaCalendarAlt style={{ color: '#d4af37', fontSize: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem' }}>Room Availability</h2>
                </div>

                <DateInputWrapper>
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </DateInputWrapper>
            </ControlBar>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
                    Loading availability data...
                </div>
            ) : (
                <Grid>
                    <AnimatePresence>
                        {rooms.map((room, index) => (
                            <RoomCard
                                key={room.room_number}
                                $status={room.status}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RoomHeader>
                                    <RoomNumber>Room {room.room_number}</RoomNumber>
                                    <StatusBadge $status={room.status}>
                                        {room.status === 'available' ? <FaCheckCircle style={{ marginRight: '4px' }} /> : <FaTimesCircle style={{ marginRight: '4px' }} />}
                                        {room.status}
                                    </StatusBadge>
                                </RoomHeader>

                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {room.room_type}
                                </div>

                                {room.booking_details ? (
                                    <BookingInfo>
                                        <InfoItem>
                                            <FaUser /> {room.booking_details.guest_name}
                                        </InfoItem>
                                        <InfoItem>
                                            <FaIdCard /> {room.booking_details.booking_id}
                                        </InfoItem>
                                        <InfoItem>
                                            <FaClock /> {formatDate(room.booking_details.check_in)} - {formatDate(room.booking_details.check_out)}
                                        </InfoItem>
                                        <EditButton onClick={() => handleEditClick({ ...room.booking_details, status: room.status })}>
                                            <FaEdit /> Change Booking
                                        </EditButton>
                                    </BookingInfo>
                                ) : (
                                    <div style={{ color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                                        Ready for check-in
                                    </div>
                                )}
                            </RoomCard>
                        ))}
                    </AnimatePresence>
                </Grid>
            )}

            {!loading && rooms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
                    No rooms found in the system.
                </div>
            )}

            <AnimatePresence>
                {isEditModalOpen && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontFamily: 'Playfair Display', color: '#d4af37' }}>Edit Booking</h2>
                                <FaTimes style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsEditModalOpen(false)} />
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Booking ID: {editingBooking.booking_id}</div>
                                <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{editingBooking.guest_name}</div>
                            </div>

                            <FormField>
                                <Label>Check-in Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={editingBooking.check_in}
                                    onChange={e => setEditingBooking({ ...editingBooking, check_in: e.target.value })}
                                />
                            </FormField>

                            <FormField>
                                <Label>Check-out Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={editingBooking.check_out}
                                    onChange={e => setEditingBooking({ ...editingBooking, check_out: e.target.value })}
                                />
                            </FormField>

                            <FormField>
                                <Label>Status</Label>
                                <Select
                                    value={editingBooking.status}
                                    onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormField>

                            <EditButton
                                onClick={handleSaveEdit}
                                disabled={saveLoading}
                                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', color: '#0a0a12', fontWeight: '700', marginTop: '1rem' }}
                            >
                                {saveLoading ? <FaSpinner className="fa-spin" /> : <><FaSave /> Save Changes</>}
                            </EditButton>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default RoomAvailability;
