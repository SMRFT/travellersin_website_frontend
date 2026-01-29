import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCalendarAlt, FaCheck, FaPhone, FaUser, FaEnvelope, FaUsers, FaInfoCircle } from 'react-icons/fa';
import api from '../services/api';
import { getAllEventBookings, updateEventBookingStatus } from '../services/eventService';

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const TabGroup = styled.div`
  display: flex;
  gap: 1rem;
  padding: 2rem 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.$active ? 'rgba(212, 175, 55, 0.1)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#d4af37' : 'transparent'};
  color: ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.4)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #d4af37;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: ${props => props.$variant === 'secondary' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)'};
  color: ${props => props.$variant === 'secondary' ? '#fff' : '#0f0f1a'};
  border: ${props => props.$variant === 'secondary' ? '1px solid rgba(255,255,255,0.1)' : 'none'};
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: #0F1E2E;
  border-radius: 20px;
  border: none;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 1.2rem;
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
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
        switch (props.$status) {
            case 'confirmed': return 'rgba(16, 185, 129, 0.1)';
            case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
            default: return 'rgba(212, 175, 55, 0.1)';
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'confirmed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#d4af37';
        }
    }};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EventCard = styled(motion.div)`
  background: #0f151a; // Very dark blue/black for cards
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
`;

const IconBtn = styled.button`
  background: rgba(255,255,255,0.05);
  border: none;
  color: ${props => props.$color || '#fff'};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
  display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #161625; border: 1px solid rgba(255,255,255,0.1); border-radius: 32px;
  width: 100%; max-width: 500px; padding: 3rem;
`;

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({ event_name: '', about: '', size: '', price: '' });

    // Date Filter State (Default 3 days)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchEvents();
        fetchBookings();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            setEvents(response.data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const data = await getAllEventBookings();
            setBookings(data);
        } catch (err) { console.error(err); }
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                event_name: event.event_name,
                about: event.about,
                size: event.size,
                price: event.price
            });
        } else {
            setEditingEvent(null);
            setFormData({ event_name: '', about: '', size: '', price: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await api.patch(`/events/${editingEvent.id}/`, formData);
            } else {
                await api.post('/events/', formData);
            }
            fetchEvents();
            setIsModalOpen(false);
        } catch (err) { alert('Save failed'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this event hall?')) {
            await api.delete(`/events/${id}/`);
            fetchEvents();
        }
    };

    const handleUpdateStatus = async (bookingId, status) => {
        try {
            await updateEventBookingStatus(bookingId, status);
            fetchBookings();
        } catch (err) { alert('Status update failed'); }
    };

    return (
        <Container>
            <TabGroup>
                <Tab $active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>Inquiries & Bookings</Tab>
                <Tab $active={activeTab === 'halls'} onClick={() => setActiveTab('halls')}>Event Halls</Tab>
            </TabGroup>

            <Content>
                <AnimatePresence mode="wait">
                    {activeTab === 'bookings' ? (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>From:</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>To:</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <TableWrapper>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>Guest</th>
                                            <th>Event Details</th>
                                            <th>Guests</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking.booking_id}>
                                                <td style={{ fontWeight: '600', color: '#d4af37' }}>{booking.booking_id}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '500' }}>{booking.name}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{booking.phone}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '500' }}>{booking.event_type}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                                            {new Date(booking.event_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>{booking.number_of_guests}</td>
                                                <td><StatusBadge $status={booking.status}>{booking.status}</StatusBadge></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <IconBtn
                                                            $color="#10b981"
                                                            title="Confirm"
                                                            disabled={booking.status === 'confirmed'}
                                                            onClick={() => handleUpdateStatus(booking.booking_id, 'confirmed')}
                                                        >
                                                            <FaCheck />
                                                        </IconBtn>
                                                        <IconBtn
                                                            $color="#ef4444"
                                                            title="Cancel"
                                                            disabled={booking.status === 'cancelled'}
                                                            onClick={() => handleUpdateStatus(booking.booking_id, 'cancelled')}
                                                        >
                                                            <FaTimes />
                                                        </IconBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                                                    <FaInfoCircle size={30} style={{ marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
                                                    No event inquiries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </TableWrapper>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="halls"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Controls>
                                <ActionButton onClick={() => handleOpenModal()}><FaPlus /> Add Hall</ActionButton>
                            </Controls>
                            <EventsGrid>
                                {events.map(event => (
                                    <EventCard key={event.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ fontFamily: 'Playfair Display' }}>{event.event_name}</h3>
                                            <div>
                                                <IconBtn $color="#d4af37" onClick={() => handleOpenModal(event)}><FaEdit /></IconBtn>
                                                <IconBtn $color="#ff4d4d" onClick={() => handleDelete(event.id)}><FaTrash /></IconBtn>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>{event.about}</p>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#d4af37' }}>
                                            <span>Capacity: {event.size}</span>
                                            <span>Starting: ₹{parseFloat(event.price).toLocaleString()}</span>
                                        </div>
                                    </EventCard>
                                ))}
                            </EventsGrid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Content>

            <AnimatePresence>
                {isModalOpen && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <h2 style={{ marginBottom: '2rem', fontFamily: 'Playfair Display' }}>{editingEvent ? 'Edit Hall' : 'New Hall'}</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Hall Name" value={formData.event_name} onChange={e => setFormData({ ...formData, event_name: e.target.value })} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }} />
                                <textarea placeholder="About" value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', minHeight: '100px' }} />
                                <input placeholder="Capacity (e.g. 500 guests)" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }} />
                                <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }} />
                                <ActionButton type="submit" style={{ marginTop: '1rem' }}><FaSave /> Save Hall</ActionButton>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Cancel</button>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default ManageEvents;
