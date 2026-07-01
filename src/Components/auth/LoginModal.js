import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPhone, FaLock, FaUser, FaEnvelope } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #5a3078;
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 45px rgba(193, 128, 210, 0.15);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`;

const Content = styled.div`
  padding: 3rem 2rem;
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 1rem;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  color: #5a3078;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-1px);
  }
`;

const ToggleText = styled.p`
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;

  span {
    color: #ffffff;
    cursor: pointer;
    font-weight: 600;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 2rem;
  margin-top: -1rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#ffffff' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const BookNowContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const BookNowIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
`;

const BookNowText = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  line-height: 1.6;
`;

const BrandName = styled.h3`
  color: #ffffff;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #e0e0e0 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'booknow'
  const [isLogin, setIsLogin] = useState(true);
  const [phoneInputMode, setPhoneInputMode] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        setPhoneInputMode(false);
        setGoogleToken(null);
        toggleLoginModal();
      } else if (result.requiresPhone) {
        setGoogleToken(credentialResponse.credential);
        setPhoneInputMode(true);
        setFormData(prev => ({
          ...prev,
          email: result.email || '',
          name: result.name || ''
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (phoneInputMode) {
        result = await googleLogin(googleToken, formData.phone);
      } else if (isLogin) {
        result = await login(formData.phone, formData.password);
      } else {
        result = await signup(formData);
      }

      if (result.success) {
        setPhoneInputMode(false);
        setGoogleToken(null);
        toggleLoginModal();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleLoginModal}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={toggleLoginModal}>
            <FaTimes />
          </CloseButton>

          <Content>
            <BrandName>Travellers Inn</BrandName>
            {!phoneInputMode && (
              <TabContainer>
                <Tab $active={activeTab === 'signin'} onClick={() => setActiveTab('signin')}>Sign In</Tab>
                <Tab $active={activeTab === 'booknow'} onClick={() => setActiveTab('booknow')}>Book Now</Tab>
              </TabContainer>
            )}

            {phoneInputMode ? (
              <>
                <Title>Complete Profile</Title>
                <Subtitle>Please confirm your phone number to continue</Subtitle>

                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {error}
                  </ErrorMessage>
                )}

                <Form onSubmit={handleSubmit}>
                  <InputGroup>
                    <IconWrapper><FaPhone /></IconWrapper>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                  <SubmitButton
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Phone'}
                  </SubmitButton>
                </Form>
              </>
            ) : activeTab === 'signin' ? (
              <>
                <Title>{isLogin ? 'Welcome Back' : 'Join Us'}</Title>
                <Subtitle>
                  {isLogin
                    ? 'Experience luxury at its finest'
                    : 'Create an account to start your journey'}
                </Subtitle>

                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {error}
                  </ErrorMessage>
                )}

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <InputGroup>
                        <IconWrapper><FaUser /></IconWrapper>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </InputGroup>
                      <InputGroup>
                        <IconWrapper><FaEnvelope /></IconWrapper>
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email Address (Optional)"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!!formData.email && !isLogin && googleToken} // disable if prefilled from google
                        />
                      </InputGroup>
                    </>
                  )}

                  <InputGroup>
                    <IconWrapper><FaPhone /></IconWrapper>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>

                  <InputGroup>
                    <IconWrapper><FaLock /></IconWrapper>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>

                  <SubmitButton
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </SubmitButton>
                </Form>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>OR</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>

                <ToggleText>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </span>
                </ToggleText>
              </>
            ) : (
              <BookNowContent>
                <BookNowIcon>🏨</BookNowIcon>
                <Title>Book Your Stay</Title>
                <BookNowText>
                  Start your journey today. Experience premium amenities, 
                  personalized hospitality, and stunning accommodations.
                </BookNowText>
                <SubmitButton
                  style={{ width: '100%' }}
                  onClick={() => {
                    toggleLoginModal();
                    navigate('/quick-booking');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Now
                </SubmitButton>
              </BookNowContent>
            )}
          </Content>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default LoginModal;