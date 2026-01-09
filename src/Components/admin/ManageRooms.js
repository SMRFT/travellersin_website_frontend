import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getRooms } from '../services/roomService';
import api from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaImage, FaUpload, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL.replace('/_b_a_c_k_e_n_d/travellerinwebsite/', '');

const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
};

const Container = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 3px; }
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 2rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: ${props => props.$variant === 'danger' ? 'rgba(255, 77, 77, 0.1)' : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)'};
  color: ${props => props.$variant === 'danger' ? '#ff4d4d' : '#0f0f1a'};
  border: ${props => props.$variant === 'danger' ? '1px solid rgba(255, 77, 77, 0.2)' : 'none'};
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const RoomsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;

  th, td {
    padding: 1.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  th {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.01);
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
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #161625;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  .full { grid-column: span 2; }
`;

const FormGroup = styled.div`
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

  &:focus { outline: none; border-color: #d4af37; }

  option {
    background-color: #1a1a2e;
    color: #fff;
  }
`;

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_number: '',
        room_type: 'Deluxe',
        price: '',
        size: '',
        is_available: true,
        amenities_str: '',
        about: '',
        bed_capacity: 2,
        bed_type: 'King Bed',
        images_str: ''
    });
    const [uploading, setUploading] = useState(false);

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

            const newUrl = response.data.url;
            setFormData(prev => ({
                ...prev,
                images_str: prev.images_str ? `${prev.images_str}, ${newUrl}` : newUrl
            }));
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (urlToRemove) => {
        const currentImages = formData.images_str.split(',').map(s => s.trim()).filter(s => s);
        const filtered = currentImages.filter(url => url !== urlToRemove);
        setFormData({ ...formData, images_str: filtered.join(', ') });
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data);
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                ...room,
                amenities_str: room.amenities?.join(', ') || '',
                images_str: room.images?.join(', ') || '',
                bed_capacity: room.bed_details?.capacity || 2,
                bed_type: room.bed_details?.type || 'King Bed'
            });
        } else {
            setEditingRoom(null);
            setFormData({
                room_number: '',
                room_type: 'Deluxe',
                price: '',
                size: '',
                is_available: true,
                amenities_str: '',
                about: '',
                bed_capacity: 2,
                bed_type: 'King Bed',
                images_str: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amenities: formData.amenities_str.split(',').map(s => s.trim()).filter(s => s),
            images: formData.images_str.split(',').map(s => s.trim()).filter(s => s),
            price: parseFloat(formData.price),
            bed_details: {
                capacity: parseInt(formData.bed_capacity),
                type: formData.bed_type
            }
        };

        try {
            if (editingRoom) {
                // Use room_number as the unique key for lookups
                await api.patch(`/rooms/${editingRoom.room_number}/`, payload);
            } else {
                await api.post('/rooms/', payload);
            }
            fetchRooms();
            setIsModalOpen(false);
        } catch (err) {
            alert('Error saving room: ' + err.message);
        }
    };

    const handleDelete = async (roomNumber) => {
        if (window.confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
            try {
                await api.delete(`/rooms/${roomNumber}/`);
                fetchRooms();
            } catch (err) {
                alert('Error deleting room: ' + err.message);
            }
        }
    };

    if (loading) return <div>Loading Rooms...</div>;

    return (
        <Container>
            <Controls>
                <ActionButton whileHover={{ scale: 1.05 }} onClick={() => handleOpenModal()}>
                    <FaPlus /> Add New Room
                </ActionButton>
            </Controls>

            <TableWrapper>
                <RoomsTable>
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Room No.</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Size</th>
                            <th>Capacity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id}>
                                <td>
                                    {room.images?.[0] ? (
                                        <img src={formatImageUrl(room.images[0])} alt="Room" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaImage style={{ opacity: 0.3 }} />
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontWeight: '600' }}>{room.room_number}</td>
                                <td>{room.room_type}</td>
                                <td>₹{parseFloat(room.price).toLocaleString()}</td>
                                <td>{room.size}</td>
                                <td>{room.bed_details?.capacity || 2} Adults</td>
                                <td>
                                    <span style={{ color: room.is_available ? '#10b981' : '#ff4d4d' }}>
                                        {room.is_available ? 'Available' : 'Occupied'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleOpenModal(room)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(room.room_number)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </RoomsTable>
            </TableWrapper>

            <AnimatePresence>
                {isModalOpen && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'Playfair Display' }}>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label>Room Number</Label>
                                    <Input required type="text" value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Room Type</Label>
                                    <Input as="select" value={formData.room_type} onChange={e => setFormData({ ...formData, room_type: e.target.value })}>
                                        <option value="Standard">Standard</option>
                                        <option value="Classic">Classic</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Suite">Suite</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Price (₹)</Label>
                                    <Input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Size (m²)</Label>
                                    <Input type="text" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Max Adults</Label>
                                    <Input type="number" value={formData.bed_capacity} onChange={e => setFormData({ ...formData, bed_capacity: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Bed Type</Label>
                                    <Input type="text" placeholder="King Bed, Twin Bed..." value={formData.bed_type} onChange={e => setFormData({ ...formData, bed_type: e.target.value })} />
                                </FormGroup>
                                <FormGroup className="full">
                                    <Label>About Room</Label>
                                    <Input as="textarea" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} />
                                </FormGroup>
                                <FormGroup className="full">
                                    <Label>Amenities (comma separated)</Label>
                                    <Input type="text" placeholder="WiFi, AC, TV..." value={formData.amenities_str} onChange={e => setFormData({ ...formData, amenities_str: e.target.value })} />
                                </FormGroup>
                                <FormGroup className="full">
                                    <Label>Room Photos</Label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                        {formData.images_str.split(',').map(s => s.trim()).filter(s => s).map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <img src={formatImageUrl(url)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
                                                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                        <label style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'not-allowed' : 'pointer', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', gap: '0.3rem' }}>
                                            {uploading ? <FaSpinner className="fa-spin" /> : <FaUpload />}
                                            {uploading ? 'Uploading...' : 'Upload'}
                                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <Label style={{ fontSize: '0.75rem' }}>Or paste URLs (comma separated)</Label>
                                    <Input type="text" placeholder="https://images.com/room1.jpg..." value={formData.images_str} onChange={e => setFormData({ ...formData, images_str: e.target.value })} />
                                </FormGroup>

                                <div className="full" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    <ActionButton type="submit" style={{ flex: 1 }}>
                                        <FaSave /> {editingRoom ? 'Update Room' : 'Create Room'}
                                    </ActionButton>
                                </div>
                            </Form>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default ManageRooms;
