import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPhone, FaLock, FaUser, FaEnvelope } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #1a1a2e;
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
    background: rgba(212, 175, 55, 0.2);
    color: #d4af37;
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
  color: rgba(255, 255, 255, 0.6);
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
  color: #d4af37;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 1rem;
  background: #1E6F5C;
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(30, 111, 92, 0.3);

  &:hover {
    background: #165e4d;
    box-shadow: 0 15px 40px rgba(30, 111, 92, 0.4);
  }
`;

const ToggleText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;

  span {
    color: #d4af37;
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

const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.phone, formData.password);
      } else {
        result = await signup(formData);
      }

      if (result.success) {
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

            <ToggleText>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </ToggleText>
          </Content>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default LoginModal;