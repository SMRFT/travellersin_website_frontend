import React, { useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoomImage } from '../../assets/imageMap';
import {
  FaCalendarAlt, FaUsers, FaGlassCheers, FaBriefcase,
  FaHeart, FaMusic, FaTimes, FaUser, FaEnvelope,
  FaPhone, FaPaperPlane, FaClock, FaCheckCircle,
  FaDownload, FaShareAlt, FaHotel
} from 'react-icons/fa';
import { submitEventInquiry } from '../services/eventService';
import html2pdf from 'html2pdf.js';

/* ================= KEYFRAME ANIMATIONS ================= */

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
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
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HeroBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(15, 15, 26, 0.5) 0%,
    rgba(15, 15, 26, 0.8) 100%
  );
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 2rem;
  max-width: 800px;
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
  color: #fff;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  margin-bottom: 1.5rem;
  
  span {
    color: #C9A24D;
    background: none;
    -webkit-text-fill-color: initial;
    background-clip: border-box;
  }
`;

const PageSubtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
`;

/* --- Section Styles --- */
const Section = styled.section`
  padding: 6rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionLabel = styled.span`
  display: block;
  color: #C9A24D;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  color: #0F1E2E;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
  margin-bottom: 1rem;
  
  span {
    color: #C9A24D;
    background: none;
    -webkit-text-fill-color: initial;
    background-clip: border-box;
  }
`;

const SectionDescription = styled.p`
  color: #333333;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
`;

/* --- Event Types Grid --- */
const EventTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const EventTypeCard = styled(motion.div)`
  position: relative;
  padding: 2.5rem;
  background: #0F1E2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border-radius: 24px;
  text-align: center;
  overflow: hidden;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #d4af37, transparent);
    opacity: 0.5;
  }
`;

const EventIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(201, 162, 77, 0.2), rgba(201, 162, 77, 0.05));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #C9A24D;
  margin: 0 auto 1.5rem;
`;

const EventTypeTitle = styled.h3`
  color: #C9A24D;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', Georgia, serif;
`;

const EventTypeText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  font-size: 0.95rem;
`;

/* --- Venue Gallery --- */
const VenueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 280px);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 250px);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

const VenueItem = styled(motion.div)`
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  cursor: pointer;

  ${props => props.$large && css`
    grid-row: span 2;
    
    @media (max-width: 1024px) {
      grid-row: span 1;
    }
  `}

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 40%,
      rgba(15, 15, 26, 0.9) 100%
    );
    opacity: 0.7;
    transition: opacity 0.4s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const VenueImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const VenueCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.4s ease;

  ${VenueItem}:hover & {
    transform: translateY(0);
    opacity: 1;
  }
`;

const VenueTitle = styled.h4`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', Georgia, serif;
`;

const VenueCapacity = styled.p`
  color: #C9A24D;
  font-size: 0.85rem;
  letter-spacing: 1px;
`;

/* --- Features Section --- */
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: #0F1E2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 20px rgba(0,0,0,0.02);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    border-color: rgba(201, 162, 77, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  min-width: 50px;
  background: linear-gradient(135deg, rgba(201, 162, 77, 0.2), rgba(201, 162, 77, 0.05));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A24D;
  font-size: 1.2rem;
`;

const FeatureContent = styled.div``;

const FeatureTitle = styled.h4`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
`;

/* --- CTA Section --- */
const CTASection = styled(motion.div)`
  padding: 5rem 3rem;
  background: #0F1E2E;
  border: 1px solid rgba(201, 162, 77, 0.2);
  border-radius: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-top: 4rem;
`;

const CTATitle = styled.h3`
  color: #fff;
  font-size: 2.2rem;
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 1rem;
`;

const CTAText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion.button)`
  padding: 1.2rem 3rem;
  background: #1E6F5C;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(30, 111, 92, 0.3);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 50px rgba(30, 111, 92, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

/* --- Inquiry Form --- */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`;

const Label = styled.label`
  color: #333333;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 14px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #C9A24D;
    background: #fff;
    box-shadow: 0 0 15px rgba(201, 162, 77, 0.1);
  }
`;

const Select = styled.select`
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 14px;
  color: #333;
  font-size: 1rem;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #C9A24D;
  }

  option {
    background-color: #fff;
    color: #333;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 14px;
  color: #333;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #d4af37;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 26, 0.98);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
  overflow-y: auto;
`;

const ConfirmationCard = styled.div`
  background: white;
  color: #333;
  width: 100%;
  max-width: 500px;
  padding: 3rem;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  text-align: left;
  font-family: 'Inter', sans-serif;

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const CardHeader = styled.div`
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const CardBrand = styled.div`
  color: #C9A24D;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px dashed #eee;
  padding-bottom: 0.5rem;

  span:first-child {
    color: #333333;
    font-weight: 500;
  }
  span:last-child {
    color: #000;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const CompactButton = styled(motion.button)`
  flex: 1;
  padding: 0.8rem 1.5rem;
  background: ${props => props.$outline ? 'transparent' : '#1E6F5C'};
  color: ${props => props.$outline ? '#C9A24D' : '#fff'};
  border: ${props => props.$outline ? '2px solid #C9A24D' : 'none'};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

/* --- Lightbox --- */
const LightboxOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LightboxImage = styled(motion.img)`
  max-width: 90%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
`;

const LightboxClose = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    border-color: rgba(212, 175, 55, 0.5);
  }
`;

/* ================= ANIMATION VARIANTS ================= */

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

/* ================= COMPONENT ================= */

const Events = () => {
  const cardRef = useRef();
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: 'Wedding',
    event_date: '',
    number_of_guests: '',
    message: ''
  });

  const eventTypes = [
    {
      icon: <FaHeart />,
      title: "Weddings",
      text: "Create your dream wedding in our elegant venues with personalized service and stunning backdrops."
    },
    {
      icon: <FaBriefcase />,
      title: "Corporate Events",
      text: "Professional meeting spaces equipped with modern technology for successful business gatherings."
    },
    {
      icon: <FaGlassCheers />,
      title: "Celebrations",
      text: "From birthdays to anniversaries, celebrate life's special moments in style."
    },
    {
      icon: <FaMusic />,
      title: "Social Gatherings",
      text: "Host memorable parties and social events in our versatile event spaces."
    }
  ];

  const venues = [
    { img: 'venue_5', title: 'Rooftop Venue', capacity: 'Up to 150 guests' },
    { img: 'venue_setup', title: 'Garden Terrace', capacity: 'Up to 200 guests' },
    { img: 'venue_3', title: 'Conference Hall', capacity: 'Up to 100 guests' },
    { img: 'venue_6', title: 'Intimate Lounge', capacity: 'Up to 50 guests' },
    { img: 'exterior_view', title: 'Hotel Exterior', capacity: 'Grand Entry View' },
    { img: 'dining_view', title: 'Lounge & Drinks', capacity: 'Cocktail Parties' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Format date to ISO Datetime for backend validation
      const submissionData = {
        ...formData,
        event_date: `${formData.event_date}T12:00:00Z`
      };
      const res = await submitEventInquiry(submissionData);
      setBookingId(res.booking_id);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = cardRef.current;
    const opt = {
      margin: 10,
      filename: `EventInquiry_${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'TravellersInn Event Inquiry',
      text: `My event inquiry at TravellersInn is confirmed. ID: ${bookingId}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert('Confirmation details copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const features = [
    { icon: <FaUsers />, title: "Dedicated Event Team", text: "Personal coordinators to ensure flawless execution" },
    { icon: <FaCalendarAlt />, title: "Flexible Scheduling", text: "Customizable timing to suit your needs" },
    { icon: <FaGlassCheers />, title: "Catering Services", text: "Exquisite cuisine from our expert chefs" },
    { icon: <FaMusic />, title: "Audio & Visual", text: "State-of-the-art equipment for presentations" }
  ];

  return (
    <PageWrapper>
      {/* Hero */}
      <HeroSection>
        <HeroBg $bgImage={getRoomImage('venue_1')} />
        <HeroOverlay />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <PageLabel>Celebrate With Us</PageLabel>
          <PageTitle>
            Unforgettable <span>Events</span>
          </PageTitle>
          <PageSubtitle>
            From intimate gatherings to grand celebrations, our versatile venues
            and dedicated team create extraordinary experiences.
          </PageSubtitle>
        </HeroContent>
      </HeroSection>

      {/* Event Types */}
      <Section>
        <SectionHeader
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <SectionLabel>What We Offer</SectionLabel>
          <SectionTitle>
            Events We <span>Specialize In</span>
          </SectionTitle>
          <SectionDescription>
            Whatever the occasion, we have the perfect venue and expertise to make it memorable.
          </SectionDescription>
        </SectionHeader>

        <EventTypesGrid
          as={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {eventTypes.map((event, index) => (
            <EventTypeCard key={index} variants={itemVariants}>
              <EventIcon>{event.icon}</EventIcon>
              <EventTypeTitle>{event.title}</EventTypeTitle>
              <EventTypeText>{event.text}</EventTypeText>
            </EventTypeCard>
          ))}
        </EventTypesGrid>
      </Section>

      {/* Venue Gallery */}
      <Section>
        <SectionHeader
          as={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <SectionLabel>Our Spaces</SectionLabel>
          <SectionTitle>
            Stunning <span>Venues</span>
          </SectionTitle>
          <SectionDescription>
            Explore our collection of elegant spaces designed for every type of event.
          </SectionDescription>
        </SectionHeader>

        <VenueGrid
          as={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {venues.map((venue, index) => (
            <VenueItem
              key={index}
              variants={itemVariants}
              $large={venue.large}
              onClick={() => setLightboxImage(getRoomImage(venue.img))}
            >
              <VenueImg src={getRoomImage(venue.img)} alt={venue.title} />
              <VenueCaption>
                <VenueTitle>{venue.title}</VenueTitle>
                <VenueCapacity>{venue.capacity}</VenueCapacity>
              </VenueCaption>
            </VenueItem>
          ))}
        </VenueGrid>
      </Section>

      {/* Features */}
      <Section>
        <SectionHeader
          as={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <SectionLabel>Why Choose Us</SectionLabel>
          <SectionTitle>
            Premium <span>Services</span>
          </SectionTitle>
        </SectionHeader>

        <FeaturesGrid
          as={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <FeatureItem key={index} variants={itemVariants}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureContent>
            </FeatureItem>
          ))}
        </FeaturesGrid>

        <CTASection
          id="inquiry-form"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <AnimatePresence>
            {submitted && (
              <SuccessOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ transform: 'scale(0.9)', originY: 0 }}>
                  <ConfirmationCard ref={cardRef}>
                    <CardHeader>
                      <CardBrand>
                        <FaHotel /> TravellersInn
                      </CardBrand>
                      <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>EVENT INQUIRY CONFIRMATION</h3>
                    </CardHeader>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                      <FaCheckCircle size={40} color="#10b981" />
                    </div>

                    <DetailRow>
                      <span>Booking ID</span>
                      <span style={{ color: '#d4af37' }}>{bookingId}</span>
                    </DetailRow>
                    <DetailRow>
                      <span>Full Name</span>
                      <span>{formData.name}</span>
                    </DetailRow>
                    <DetailRow>
                      <span>Event Type</span>
                      <span>{formData.event_type}</span>
                    </DetailRow>
                    <DetailRow>
                      <span>Event Date</span>
                      <span>{formData.event_date}</span>
                    </DetailRow>
                    <DetailRow>
                      <span>Guests</span>
                      <span>{formData.number_of_guests}</span>
                    </DetailRow>
                    <DetailRow>
                      <span>Phone</span>
                      <span>{formData.phone}</span>
                    </DetailRow>

                    <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem', textAlign: 'center' }}>
                      Our events team will contact you shortly to finalize the details.
                    </div>
                  </ConfirmationCard>

                  <ActionButtons>
                    <CompactButton onClick={handleDownloadPDF}>
                      <FaDownload /> Download PDF
                    </CompactButton>
                    <CompactButton $outline onClick={handleShare}>
                      <FaShareAlt /> Share
                    </CompactButton>
                    <CompactButton $outline onClick={() => { setSubmitted(false); setShowForm(false); }}>
                      Close
                    </CompactButton>
                  </ActionButtons>
                </div>
              </SuccessOverlay>
            )}
          </AnimatePresence>

          {!showForm ? (
            <>
              <CTATitle>Ready to Plan Your Event?</CTATitle>
              <CTAText>
                Contact our events team to discuss your requirements and get a personalized quote.
              </CTAText>
              <CTAButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
              >
                Get in Touch
              </CTAButton>
            </>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <CTATitle style={{ margin: 0, fontSize: '1.8rem' }}>Event Inquiry</CTATitle>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      required
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Event Type</Label>
                    <Select
                      value={formData.event_type}
                      onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                    >
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Corporate Meeting">Corporate Meeting</option>
                      <option value="Conference / Seminar">Conference / Seminar</option>
                      <option value="Anniversary Celebration">Anniversary Celebration</option>
                      <option value="Engagement Ceremony">Engagement Ceremony</option>
                      <option value="Social Gathering">Social Gathering</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Event Date</Label>
                    <Input
                      required
                      type="date"
                      value={formData.event_date}
                      onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Expected Guests</Label>
                    <Input
                      required
                      type="number"
                      placeholder="e.g. 200"
                      value={formData.number_of_guests}
                      onChange={e => setFormData({ ...formData, number_of_guests: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>
                <FormGroup style={{ marginTop: '1.5rem' }}>
                  <Label>Additional Message</Label>
                  <TextArea
                    placeholder="Tell us more about your event..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </FormGroup>
                <CTAButton
                  type="submit"
                  style={{ marginTop: '2.5rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </CTAButton>
              </form>
            </div>
          )}
        </CTASection>
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <LightboxOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <LightboxClose onClick={() => setLightboxImage(null)}>
              <FaTimes />
            </LightboxClose>
            <LightboxImage
              src={lightboxImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </LightboxOverlay>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Events;
