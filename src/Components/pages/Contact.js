import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp,
  FaFacebookF, FaTwitter, FaInstagram, FaPaperPlane, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import queryService from '../services/queryService';

/* ================= KEYFRAME ANIMATIONS ================= */

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

/* ================= STYLED COMPONENTS ================= */

const PageWrapper = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
  padding-top: 90px;
`;

/* --- Hero Section --- */
const HeroSection = styled.section`
  position: relative;
  padding: 4rem 2rem 3rem;
  text-align: center;
`;

const PageLabel = styled(motion.span)`
  display: block;
  color: #C9A24D;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled(motion.h1)`
  color: #0F1E2E;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  margin-bottom: 1rem;
  
  span {
    color: #C9A24D;
    background: none;
    -webkit-text-fill-color: initial;
    background-clip: border-box;
  }
`;

const PageSubtitle = styled(motion.p)`
  color: #333333;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
`;

/* --- Main Content --- */
const ContentSection = styled.section`
  padding: 2rem 2rem 6rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem 6rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* --- Contact Info Card --- */
const ContactInfoCard = styled(motion.div)`
  background: #0F1E2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  border-radius: 24px;
  padding: 2.5rem;
  height: fit-content;

  @media (max-width: 600px) {
    padding: 1.5rem;
  }
`;

const CardTitle = styled.h2`
  color: #C9A24D;
  font-size: 1.5rem;
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(201, 162, 77, 0.3), transparent);
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(201, 162, 77, 0.05);
    border-color: rgba(201, 162, 77, 0.2);
  }
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(201, 162, 77, 0.2), rgba(201, 162, 77, 0.05));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A24D;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactLabel = styled.div`
  color: #C9A24D;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.3rem;
  font-weight: 600;
`;

const ContactText = styled.div`
  color: #f0f0f0;
  font-size: 1rem;
  line-height: 1.6;
`;

const ContactLink = styled.a`
  color: #f0f0f0;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #C9A24D;
  }
`;

/* --- Social Links --- */
const SocialSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const SocialTitle = styled.h3`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const SocialIcon = styled.a`
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(201, 162, 77, 0.15);
    border-color: rgba(201, 162, 77, 0.4);
    color: #C9A24D;
    transform: translateY(-3px);
  }
`;

/* --- Contact Form --- */
const ContactFormCard = styled(motion.div)`
  background: #0F1E2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  border-radius: 24px;
  padding: 2.5rem;

  @media (max-width: 600px) {
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div``;

const FormLabel = styled.label`
  display: block;
  color: #C9A24D;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: rgba(201, 162, 77, 0.5);
    background: #fff;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  color: #333;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: rgba(201, 162, 77, 0.5);
    background: #fff;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(201, 162, 77, 0.5);
  }

  option {
    background: #0F1E2E;
    color: #fff;
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 1.2rem 2.5rem;
  background: #1E6F5C;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 10px 40px rgba(30, 111, 92, 0.3);
  transition: all 0.3s ease;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 50px rgba(30, 111, 92, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10b981;
  font-size: 0.95rem;
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

/* --- Map Section --- */
const MapSection = styled.section`
  padding: 0 2rem 6rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const MapContainer = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
`;

const MapHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const MapTitle = styled.h3`
  color: #0F1E2E;
  font-size: 1.2rem;
  font-family: 'Playfair Display', Georgia, serif;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  svg {
    color: #C9A24D;
  }
`;

const DirectionsButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: #C9A24D;
  color: #0f0f1a;
  text-decoration: none;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(201, 162, 77, 0.3);
  }
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 450px;
  border: none;

  @media (max-width: 768px) {
    height: 350px;
  }
`;

/* ================= ANIMATION VARIANTS ================= */

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

/* ================= COMPONENT ================= */

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setIsSuccess(false);

    try {
      // Map 'phone' from form to 'phone_number' for backend
      const { phone, ...rest } = formData;
      const submitData = {
        ...rest,
        phone_number: phone
      };

      await queryService.submitQuery(submitData);

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting query:', err);
      const msg = err.response?.data?.error ||
        (err.response?.data && Object.values(err.response.data).flat()[0]) ||
        'Something went wrong. Please try again later.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Address for Google Maps
  const address = "60/37 Saradha College, Near Shanmugam Hospital, L R N Colony, Hasthampatti Salem, LRN Colony, Salem, India, 636007";
  const encodedAddress = encodeURIComponent(address);
  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <PageWrapper>
      {/* Hero */}
      <HeroSection>
        <PageLabel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Get In Touch
        </PageLabel>
        <PageTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Contact <span>Us</span>
        </PageTitle>
        <PageSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Have questions or need assistance? We're here to help make your stay unforgettable.
        </PageSubtitle>
      </HeroSection>

      {/* Main Content */}
      <ContentSection>
        <ContentGrid>
          {/* Contact Info */}
          <ContactInfoCard
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            <CardTitle>Contact Information</CardTitle>

            <ContactItem>
              <ContactIcon><FaMapMarkerAlt /></ContactIcon>
              <ContactDetails>
                <ContactLabel>Address</ContactLabel>
                <ContactText>
                  60/37 Saradha College,<br />
                  Near Shanmugam Hospital,<br />
                  L R N Colony, Hasthampatti,<br />
                  Salem, India - 636007
                </ContactText>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon><FaPhone /></ContactIcon>
              <ContactDetails>
                <ContactLabel>Phone</ContactLabel>
                <ContactText>
                  <ContactLink href="tel:+919876543210">+91 98765 43210</ContactLink><br />
                  <ContactLink href="tel:+914272345678">+91 427 234 5678</ContactLink>
                </ContactText>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon><FaWhatsapp /></ContactIcon>
              <ContactDetails>
                <ContactLabel>WhatsApp</ContactLabel>
                <ContactText>
                  <ContactLink href="https://wa.me/919876543210" target="_blank">
                    +91 98765 43210
                  </ContactLink>
                </ContactText>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon><FaEnvelope /></ContactIcon>
              <ContactDetails>
                <ContactLabel>Email</ContactLabel>
                <ContactText>
                  <ContactLink href="mailto:hoteltravellersinnslm@gmail.com">
                    hoteltravellersinnslm@gmail.com
                  </ContactLink><br />
                  {/* <ContactLink href="mailto:bookings@travellersinn.com">
                    bookings@travellersinn.com
                  </ContactLink> */}
                </ContactText>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon><FaClock /></ContactIcon>
              <ContactDetails>
                <ContactLabel>Working Hours</ContactLabel>
                <ContactText>
                  Reception: 24/7<br />
                  Check-in: 12:00 PM<br />
                  Check-out: 11:00 AM
                </ContactText>
              </ContactDetails>
            </ContactItem>

            <SocialSection>
              <SocialTitle>Follow Us</SocialTitle>
              <SocialLinks>
                <SocialIcon href="#" aria-label="Facebook"><FaFacebookF /></SocialIcon>
                <SocialIcon href="#" aria-label="Twitter"><FaTwitter /></SocialIcon>
                <SocialIcon href="#" aria-label="Instagram"><FaInstagram /></SocialIcon>
                <SocialIcon href="https://wa.me/919876543210" aria-label="WhatsApp"><FaWhatsapp /></SocialIcon>
              </SocialLinks>
            </SocialSection>
          </ContactInfoCard>

          {/* Contact Form */}
          <ContactFormCard
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            <CardTitle>Send Us a Message</CardTitle>

            {isSuccess && (
              <SuccessMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <FaCheck /> Thank you! Your message has been sent successfully.
              </SuccessMessage>
            )}

            {error && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FaExclamationTriangle /> {error}
              </ErrorMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <FormLabel>Full Name *</FormLabel>
                  <FormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <FormLabel>Phone Number</FormLabel>
                  <FormInput
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Subject</FormLabel>
                  <FormSelect
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="booking">Room Booking</option>
                    <option value="event">Event Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="complaint">Complaint</option>
                  </FormSelect>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <FormLabel>Message *</FormLabel>
                <FormTextarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    Send Message <FaPaperPlane />
                  </>
                )}
              </SubmitButton>
            </Form>
          </ContactFormCard>
        </ContentGrid>
      </ContentSection>

      {/* Map Section */}
      <MapSection>
        <MapContainer>
          <MapHeader>
            <MapTitle>
              <FaMapMarkerAlt /> Find Us on Map
            </MapTitle>
            <DirectionsButton href={directionsUrl} target="_blank" rel="noopener noreferrer">
              Get Directions
            </DirectionsButton>
          </MapHeader>
          <MapFrame
            src={mapsEmbedUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="TravellersInn Location"
          />
        </MapContainer>
      </MapSection>
    </PageWrapper>
  );
};

export default Contact;