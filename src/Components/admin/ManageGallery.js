import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaImage, FaUpload, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Check if it's a GridFS ID (which we return as just the ID sometimes, or full URL)
    // The backend returns /media/gridfs/<id>/
    const baseUrl = (API_BASE_URL || '').replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
};

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
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
  background: ${props => props.$variant === 'danger' ? 'rgba(255, 77, 77, 0.1)' : '#1E6F5C'};
  color: ${props => props.$variant === 'danger' ? '#ff4d4d' : '#ffffff'};
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
    background: #15202b; // Slightly lighter/different blue for header
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const ManageGallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        order: 1,
        image_id: ''
    });
    const [newCategory, setNewCategory] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [galRes, catRes] = await Promise.all([
                api.get('gallery/'),
                api.get('gallery-categories/')
            ]);
            setGalleryItems(galRes.data);
            setCategories(catRes.data);

            // Set default category if any
            if (catRes.data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: catRes.data[0].id }));
            }
        } catch (err) {
            console.error("Failed to fetch gallery data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // For gallery, we might want to upload directly to get the ID, 
        // OR we can send the file with the form data when creating. 
        // The current backend view implementation checks for 'image_file' in POST request
        // and creates the gallery item + uploads image in one go if provided.
        // However, for better UX (preview), we might want separate upload or use the same 'upload_room_image' endpoint?
        // Actually, my backend 'gallery_list_create' handles 'image_file'. 
        // But to show preview BEFORE submit, I need a separate upload or just preview local file.
        // Let's implement local preview + upload on submit.

        // Wait, if I use the 'gallery_list_create' logic, it expects 'image_file' to create a NEW item with that image.
        // It doesn't return just an ID for a temporary image.

        // So I should use the standard media upload endpoint if I want to pre-upload.
        // 'upload_room_image' returns {url, filename, id}.

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await api.post('/upload/room-image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // The 'upload_room_image' returns the ID.
            // My Gallery model expects 'image_id' to be the GridFS ID.
            setFormData(prev => ({
                ...prev,
                image_id: response.data.id // Store the ID
            }));
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                category: item.category,
                order: item.order,
                image_id: item.image_id
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                category: categories.length > 0 ? categories[0].id : '',
                order: 1,
                image_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await api.post('gallery-categories/', { name: newCategory });
            fetchData();
            setNewCategory('');
            setIsCategoryModalOpen(false); // Close after add OR keep open? Keep open is better for bulk add.
            // But UI is modal, let's keep open.
        } catch (err) {
            alert('Error adding category: ' + err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Delete this category? Images in this category will be deleted!")) {
            try {
                await api.delete(`gallery-categories/${id}/`);
                fetchData();
            } catch (err) {
                alert('Error deleting category: ' + err.message);
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.patch(`gallery/${editingItem.id}/`, formData);
            } else {
                await api.post('gallery/', formData);
            }
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            alert('Error saving gallery item: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete this image?`)) {
            try {
                await api.delete(`gallery/${id}/`);
                fetchData();
            } catch (err) {
                alert('Error deleting item: ' + err.message);
            }
        }
    };

    const getImageUrl = (imageId) => {
        if (!imageId) return '';
        if (imageId.startsWith('http')) return imageId;
        return `${API_BASE_URL}media/gridfs/${imageId}/`;
    };

    if (loading) return <div>Loading Gallery...</div>;

    return (
        <Container>
            <Controls style={{ gap: '1rem' }}>
                <ActionButton onClick={() => setIsCategoryModalOpen(true)} style={{ background: '#C9A24D' }}>
                    Manage Categories
                </ActionButton>
                <ActionButton whileHover={{ scale: 1.05 }} onClick={() => handleOpenModal()}>
                    <FaPlus /> Add New Image
                </ActionButton>
            </Controls>

            <TableWrapper>
                <RoomsTable>
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {galleryItems.map((item) => {
                            const catName = item.category_name || "Uncategorized";

                            return (
                                <tr key={item.id}>
                                    <td>
                                        {item.image_id ? (
                                            <img
                                                src={getImageUrl(item.image_id)}
                                                alt={item.title}
                                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '80px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaImage style={{ opacity: 0.3 }} />
                                            </div>
                                        )}
                                    </td>
                                    <td>{item.title}</td>
                                    <td>{catName}</td>
                                    <td>{item.order}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer' }}><FaEdit /></button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </RoomsTable>
            </TableWrapper>

            <AnimatePresence>
                {/* Category Modal */}
                {isCategoryModalOpen && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'Playfair Display' }}>Manage Categories</h2>
                                <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <div style={{ marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {categories.map(cat => (
                                        <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span>{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem' }}>
                                <Input
                                    placeholder="New Category Name"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <ActionButton type="submit">Add</ActionButton>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )}

                {/* Add/Edit Image Modal */}
                {isModalOpen && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'Playfair Display' }}>{editingItem ? 'Edit Image' : 'Add New Image'}</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label>Title (Optional)</Label>
                                    <Input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Category</Label>
                                    <Input as="select" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Order</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Image</Label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {formData.image_id && (
                                            <img
                                                src={getImageUrl(formData.image_id)}
                                                alt="Preview"
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}
                                            />
                                        )}
                                        <label style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            border: '1px dashed rgba(255,255,255,0.2)'
                                        }}>
                                            {uploading ? <FaSpinner className="fa-spin" /> : <FaUpload />}
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </FormGroup>

                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    <ActionButton type="submit" style={{ flex: 1 }}>
                                        <FaSave /> {editingItem ? 'Update Image' : 'Save Image'}
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

export default ManageGallery;
