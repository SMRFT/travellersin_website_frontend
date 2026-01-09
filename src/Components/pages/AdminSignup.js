import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUser, FaPhone, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const SignupCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  width: 100%;
  max-width: 500px;
  padding: 3rem;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #d4af37;
  }
`;

const IconWrapper = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #0f0f1a;
  font-size: 2rem;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
  font-size: 0.9rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  padding-left: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1.2rem;
    color: rgba(212, 175, 55, 0.5);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0f0f1a;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled(motion.div)`
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.$success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 77, 77, 0.2)'};
  background: ${props => props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 77, 77, 0.1)'};
  color: ${props => props.$success ? '#10b981' : '#ff4d4d'};
`;

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        if (formData.password !== formData.confirmPassword) {
            return setStatus({ type: 'error', msg: 'Passwords do not match' });
        }

        setLoading(true);

        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await api.post('/admin/', submitData);

            if (response.status === 201) {
                setStatus({ type: 'success', msg: 'Admin account created successfully! Redirecting...' });
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error ||
                Object.values(err.response?.data || {}).flat()[0] ||
                'Failed to create account. Please try again.';
            setStatus({ type: 'error', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <SignupCard
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <BackButton onClick={() => navigate('/admin/login')} whileHover={{ x: -5 }}>
                    <FaArrowLeft /> Back to Login
                </BackButton>

                <IconWrapper>
                    <FaUserPlus />
                </IconWrapper>

                <Title>Create Administrator</Title>
                <Subtitle>Add a new staff member to the management portal.</Subtitle>

                {status.msg && (
                    <Message $success={status.type === 'success'}>
                        {status.msg}
                    </Message>
                )}

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Full Name</Label>
                        <InputWrapper>
                            <FaUser />
                            <Input
                                name="name"
                                placeholder="Staff member's name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Phone Number</Label>
                        <InputWrapper>
                            <FaPhone />
                            <Input
                                name="phone"
                                type="tel"
                                placeholder="Registered mobile number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Email Address (Optional)</Label>
                        <InputWrapper>
                            <FaEnvelope />
                            <Input
                                name="email"
                                type="email"
                                placeholder="staff@travellersinn.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Security Password</Label>
                        <InputWrapper>
                            <FaLock />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Create staff password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Confirm Password</Label>
                        <InputWrapper>
                            <FaLock />
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Verify security password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <SubmitButton
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Creating Account...' : 'Register Staff'}
                    </SubmitButton>
                </Form>
            </SignupCard>
        </PageWrapper>
    );
};

export default AdminSignup;
