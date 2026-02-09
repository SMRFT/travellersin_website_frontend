import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaPlus, FaTrash, FaUser, FaPhone, FaEnvelope, FaLock, FaCheck, FaTimes, FaShieldAlt } from 'react-icons/fa';
import api from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const AdminCard = styled(motion.div)`
  background: #0f151a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Badge = styled.span`
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => props.$super ? 'rgba(212, 175, 55, 0.1)' : 'rgba(77, 148, 255, 0.1)'};
  color: ${props => props.$super ? '#d4af37' : '#4d94ff'};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;

  svg { color: #d4af37; font-size: 0.8rem; }
`;

const ActionBtn = styled.button`
  background: ${props => props.$variant === 'danger' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(212, 175, 55, 0.1)'};
  color: ${props => props.$variant === 'danger' ? '#ff4d4d' : '#d4af37'};
  border: 1px solid ${props => props.$variant === 'danger' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(212, 175, 55, 0.2)'};
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  font-size: 0.85rem;

  &:hover {
    background: ${props => props.$variant === 'danger' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(212, 175, 55, 0.2)'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #11111a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const Input = styled.input`
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  transition: all 0.3s;
  &:focus { border-color: #d4af37; background: rgba(255, 255, 255, 0.08); outline: none; }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 1rem 0;

  input { cursor: pointer; width: 16px; height: 16px; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1E6F5C;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(30, 111, 92, 0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', password: '', is_superadmin: false
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await api.get('/admin/');
            setAdmins(response.data);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/admin/', formData);
            fetchAdmins();
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', email: '', password: '', is_superadmin: false });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create admin");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeactivate = async (adminId) => {
        if (!window.confirm("Are you sure you want to deactivate this admin account?")) return;
        try {
            await api.patch(`/admin/${adminId}/delete/`);
            fetchAdmins();
        } catch (err) {
            alert("Failed to deactivate admin");
        }
    };

    if (loading) return <div>Loading Admins...</div>;

    return (
        <Container>
            <Header>
                <div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Admin Accounts</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Manage administrative access and permissions</p>
                </div>
                <SubmitBtn
                    style={{ width: 'auto', padding: '0.8rem 1.5rem', marginTop: 0 }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus style={{ marginRight: '8px' }} /> Add New Admin
                </SubmitBtn>
            </Header>

            <Grid>
                <AnimatePresence>
                    {admins.map((admin) => (
                        <AdminCard
                            key={admin.admin_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.8rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px' }}>
                                        <FaUserShield color="#d4af37" size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{admin.name}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{admin.admin_id}</span>
                                    </div>
                                </div>
                                <Badge $super={admin.is_superadmin}>
                                    <FaShieldAlt size={10} />
                                    {admin.is_superadmin ? 'Super Admin' : 'Admin'}
                                </Badge>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                <InfoRow><FaPhone /> {admin.phone}</InfoRow>
                                {admin.email && <InfoRow><FaEnvelope /> {admin.email}</InfoRow>}
                            </div>

                            <ActionBtn
                                $variant="danger"
                                onClick={() => handleDeactivate(admin.admin_id)}
                            // Prevent self-deactivation if possible or just warn
                            >
                                <FaTrash size={12} /> Deactivate Account
                            </ActionBtn>
                        </AdminCard>
                    ))}
                </AnimatePresence>
            </Grid>

            <AnimatePresence>
                {isModalOpen && (
                    <ModalOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ModalContent
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'Playfair Display' }}>Create New Admin</h2>
                                <FaTimes style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsModalOpen(false)} />
                            </div>

                            <form onSubmit={handleCreateAdmin}>
                                <FormGroup>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Full Name</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter admin name"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Phone Number</label>
                                    <Input
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Email (Optional)</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="admin@example.com"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Secure Password</label>
                                    <Input
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </FormGroup>

                                <CheckboxLabel>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_superadmin}
                                        onChange={e => setFormData({ ...formData, is_superadmin: e.target.checked })}
                                    />
                                    Grant Super Admin Privileges
                                </CheckboxLabel>

                                <SubmitBtn type="submit" disabled={actionLoading}>
                                    {actionLoading ? 'Creating...' : 'Create Admin Account'}
                                </SubmitBtn>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default ManageAdmins;
