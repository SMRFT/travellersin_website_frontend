import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FaLock, FaPhone, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const PageWrapper = styled.div`
  background: #F3EEF1;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoginCard = styled(motion.div)`
  background: #5a3078;
  border-radius: 32px;
  width: 100%;
  max-width: 450px;
  padding: 3rem;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #ffffff;
  font-size: 2.5rem;
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #ffffff;
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
    color: rgba(255, 255, 255, 0.6);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.1rem 1.1rem 3.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 1.2rem;
  background: #ffffff;
  color: #5a3078;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const ErrorMessage = styled.div`
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 77, 77, 0.2);
`;

const AdminLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await adminLogin(phone, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error || 'Access Denied. Please check your credentials.');
        }
        setLoading(false);
    };

    return (
        <PageWrapper>
            <LoginCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <IconWrapper>
                    <FaShieldAlt />
                </IconWrapper>
                <Title>Admin Access</Title>
                <Subtitle>Secure management portal for TravellersInn staff.</Subtitle>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Phone Number</Label>
                        <InputWrapper>
                            <FaPhone />
                            <Input
                                type="tel"
                                placeholder="Registered phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </InputWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Security Password</Label>
                        <InputWrapper>
                            <FaLock />
                            <Input
                                type="password"
                                placeholder="Admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? 'Authenticating...' : 'Enter Dashboard'} <FaArrowRight />
                    </SubmitButton>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        Need a new account? <span onClick={() => navigate('/admin/signup')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>Create Admin</span>
                    </div>
                </Form>
            </LoginCard>
        </PageWrapper>
    );
};

export default AdminLogin;
