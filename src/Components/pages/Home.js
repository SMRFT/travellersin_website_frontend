import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getRoomImage } from '../../assets/imageMap';
import { getRooms } from '../services/roomService';
import { FaExpand, FaTimes } from 'react-icons/fa';

/* ================= KEYFRAME ANIMATIONS ================= */

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ================= STYLED COMPONENTS ================= */

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  overflow-x: hidden;
`;

// Floating Particles Background
const ParticlesContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: ${props => props.size || 4}px;
  height: ${props => props.size || 4}px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: ${float} ${props => props.duration || 6}s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
  left: ${props => props.left}%;
  top: ${props => props.top}%;
`;

// Hero Section
const HeroWrapper = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
`;

const HeroBg = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 120%;
  height: 120%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  z-index: -2;
  filter: saturate(1.2);
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(15, 15, 26, 0.7) 0%,
    rgba(26, 26, 46, 0.6) 50%,
    rgba(22, 33, 62, 0.8) 100%
  );
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to top, #0f0f1a, transparent);
  }
`;

const HeroContent = styled(motion.div)`
  z-index: 1;
  padding: 0 2rem;
  max-width: 900px;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(3.5rem, 8vw, 6rem);
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(
    135deg,
    #fff 0%,
    #d4af37 25%,
    #fff 50%,
    #d4af37 75%,
    #fff 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 4s linear infinite;
  text-shadow: none;
  filter: drop-shadow(0 4px 20px rgba(212, 175, 55, 0.3));
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  line-height: 1.9;
  opacity: 0.9;
  font-weight: 300;
  color: #e0e0e0;
  max-width: 650px;
  margin: 0 auto;
  letter-spacing: 1px;
`;

const CTAButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
  flex-wrap: wrap;
`;

const CTAButton = styled(motion(Link))`
  padding: 1.2rem 3rem;
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)'
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$primary
    ? 'transparent'
    : 'rgba(212, 175, 55, 0.5)'};
  color: ${props => props.$primary ? '#0f0f1a' : '#d4af37'};
  border-radius: 50px;
  font-size: 0.95rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: ${props => props.$primary
    ? '0 10px 40px rgba(212, 175, 55, 0.3)'
    : 'none'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 50px rgba(212, 175, 55, 0.4);
    background: ${props => props.$primary
    ? 'linear-gradient(135deg, #e5c158 0%, #d4af37 100%)'
    : 'rgba(212, 175, 55, 0.15)'};
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  letter-spacing: 3px;
  text-transform: uppercase;
`;

const ScrollLine = styled(motion.div)`
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, #d4af37, transparent);
`;

/* --- Section Styles --- */
const Section = styled.section`
  padding: 8rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 5rem 1.5rem;
  }
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 5rem;
`;

const SectionLabel = styled(motion.span)`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50px;
  color: #d4af37;
  font-size: 0.8rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled(motion.h2)`
  color: #fff;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
  margin-bottom: 1.5rem;
  
  span {
    background: linear-gradient(135deg, #d4af37, #f5d76e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
`;

/* --- Feature Cards --- */
const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const FeatureCard = styled(motion.div)`
  position: relative;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
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
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(212, 175, 55, 0.3);
    transform: translateY(-8px);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const FeatureTitle = styled.h3`
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', Georgia, serif;
`;

const FeatureText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  font-size: 0.95rem;
`;

/* --- Gallery Section --- */
const GalleryGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 280px);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 250px);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

const GalleryItem = styled(motion.div)`
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  cursor: pointer;

  ${props => props.$featured && css`
    grid-column: span 2;
    grid-row: span 2;
    
    @media (max-width: 1024px) {
      grid-column: span 2;
      grid-row: span 1;
    }
    
    @media (max-width: 600px) {
      grid-column: span 1;
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
    opacity: 0.8;
    transition: opacity 0.4s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const GalleryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const GalleryCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.4s ease;

  ${GalleryItem}:hover & {
    transform: translateY(0);
    opacity: 1;
  }
`;

const GalleryTitle = styled.h4`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', Georgia, serif;
`;

const GallerySubtitle = styled.p`
  color: #d4af37;
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

/* --- Stats Section --- */
const StatsSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 4rem 3rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  margin: 6rem 0;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
  padding: 1rem;
`;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  font-family: 'Playfair Display', Georgia, serif;
  background: linear-gradient(135deg, #d4af37, #f5d76e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

/* --- Testimonial Section --- */
const TestimonialCard = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem;
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.1) 0%,
    rgba(212, 175, 55, 0.02) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 30px;
  text-align: center;
  position: relative;

  &::before {
    content: '"';
    position: absolute;
    top: 20px;
    left: 40px;
    font-size: 8rem;
    font-family: Georgia, serif;
    color: rgba(212, 175, 55, 0.15);
    line-height: 1;
  }
`;

const TestimonialText = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.4rem;
  line-height: 1.9;
  font-style: italic;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const TestimonialAuthor = styled.div`
  color: #d4af37;
  font-weight: 600;
  font-size: 1.1rem;
`;

const TestimonialRole = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin-top: 0.3rem;
`;

/* --- CTA Banner --- */
const CTABanner = styled(motion.div)`
  padding: 5rem 3rem;
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.15) 0%,
    rgba(212, 175, 55, 0.05) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(212, 175, 55, 0.1) 0%,
      transparent 50%
    );
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const CTATitle = styled.h3`
  color: #fff;
  font-size: 2.5rem;
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const CTAText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

/* ================= ANIMATION VARIANTS ================= */

const bgPanVariants = {
  animate: {
    scale: [1, 1.1],
    x: ["0%", "-5%"],
    transition: {
      duration: 30,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "linear"
    }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const LightboxOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LightboxImage = styled.img`
  max-width: 90%;
  max-height: 85vh;
  border-radius: 10px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    transform: rotate(90deg) scale(1.1);
    color: #d4af37;
  }
`;

/* ================= COMPONENT ================= */

const Home = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: "✨",
      title: "Hygiene Excellence",
      text: "Daily sanitization protocols ensuring your safety with hospital-grade standards."
    },
    {
      icon: "🍽️",
      title: "Fine Dining",
      text: "Exquisite culinary experiences from our award-winning chefs and sommeliers."
    },
    {
      icon: "📶",
      title: "Premium Amenities",
      text: "High-speed WiFi, valet parking, 24/7 concierge, and services."
    },
    {
      icon: "📍",
      title: "Prime Location",
      text: "Steps away from Salem's finest attractions and cultural landmarks."
    }
  ];

  const [realRooms, setRealRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRealRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms for home:", err);
      }
    };
    fetchRooms();
  }, []);

  const spacesToDisplay = [
    { img: 'exterior_view', title: 'Hotel Exterior', subtitle: 'Cinematic Grandeur', featured: true },
    { img: 'venue_grand', title: 'The Grand Hall', subtitle: 'Majestic Event Space' },
    { img: 'dining_view', title: 'Signature Dining', subtitle: 'Exquisite Gastronomy' },
    { img: 'interior_2', title: 'Premium Suites', subtitle: 'Luxury Redefined' },
    { img: 'venue_setup', title: 'Event Perfection', subtitle: 'Seamless Execution' }
  ];

  const stats = [
    { number: realRooms.length > 0 ? `${realRooms.length}+` : "15+", label: "Luxury Rooms" },
    { number: "98%", label: "Guest Satisfaction" },
    { number: "25+", label: "Years of Excellence" },
    { number: "50k+", label: "Happy Guests" }
  ];

  // Generate random particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 4 + 4,
    delay: Math.random() * 2
  }));

  return (
    <PageWrapper>
      {/* Floating Particles */}
      <ParticlesContainer>
        {particles.map(p => (
          <Particle
            key={p.id}
            size={p.size}
            left={p.left}
            top={p.top}
            duration={p.duration}
            delay={p.delay}
          />
        ))}
      </ParticlesContainer>

      {/* Hero Section */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
        <HeroWrapper>
          <HeroBg variants={bgPanVariants} animate="animate" />
          <Overlay />

          <HeroContent
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <SectionLabel style={{ marginBottom: '2rem' }}>
                Welcome to Paradise
              </SectionLabel>
            </motion.div>

            <HeroTitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              Travellers Inn
            </HeroTitle>

            <HeroSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              A sanctuary of comfort in the heart of Salem. Experience luxury redefined
              through vibrant dining, serene stays, and unforgettable moments.
            </HeroSubtitle>

            <CTAButtonGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <CTAButton
                to="/rooms"
                $primary
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your Stay
              </CTAButton>
              <CTAButton
                to="/gallery"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Gallery
              </CTAButton>
            </CTAButtonGroup>
          </HeroContent>

          <ScrollIndicator
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <span>Scroll</span>
            <ScrollLine
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </ScrollIndicator>
        </HeroWrapper>
      </motion.div>

      {/* Features Section */}
      <Section>
        <SectionHeader>
          <SectionLabel
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            Curated Experiences
          </SectionLabel>
          <SectionTitle
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            <span>Amenities</span>
          </SectionTitle>
          <SectionDescription
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            Every detail crafted for your comfort. From wellness to gastronomy,
            experience hospitality at its finest.
          </SectionDescription>
        </SectionHeader>

        <FeaturesGrid
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} variants={itemVariants}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureText>{feature.text}</FeatureText>
            </FeatureCard>
          ))}
        </FeaturesGrid>

        {/* Stats */}
        <StatsSection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatItem key={index} variants={itemVariants}>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatItem>
          ))}
        </StatsSection>
      </Section>

      {/* Gallery Section */}
      <Section>
        <SectionHeader>
          <SectionLabel
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            Visual Journey
          </SectionLabel>
          <SectionTitle
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            Discover Our <span>Spaces</span>
          </SectionTitle>
        </SectionHeader>

        <GalleryGrid
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {spacesToDisplay.map((item, index) => (
            <GalleryItem
              key={index}
              variants={itemVariants}
              $featured={item.featured}
              onClick={() => setSelectedImage(item.img)}
            >
              <GalleryImg src={getRoomImage(item.img)} alt={item.title} />
              <GalleryCaption>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <GalleryTitle>{item.title}</GalleryTitle>
                    <GallerySubtitle>{item.subtitle}</GallerySubtitle>
                  </div>
                  <FaExpand style={{ color: '#d4af37', fontSize: '1.2rem', marginBottom: '0.5rem' }} />
                </div>
              </GalleryCaption>
            </GalleryItem>
          ))}
        </GalleryGrid>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <CTAButton
            to="/gallery"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Full Gallery
          </CTAButton>
        </div>
      </Section>

      {/* Testimonial Section */}
      <Section>
        <SectionHeader>
          <SectionLabel
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            Guest Stories
          </SectionLabel>
          <SectionTitle
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
          >
            What Our <span>Guests Say</span>
          </SectionTitle>
        </SectionHeader>

        <TestimonialCard
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <TestimonialText>
            "An absolutely magical experience. From the moment we arrived, every detail
            was perfect. The staff went above and beyond to make our anniversary
            celebration truly unforgettable. We'll cherish these memories forever."
          </TestimonialText>
          <TestimonialAuthor>Rajesh & Priya Sharma</TestimonialAuthor>
          <TestimonialRole>Celebrating 10 Years</TestimonialRole>
        </TestimonialCard>
      </Section>

      {/* CTA Banner */}
      <Section>
        <CTABanner
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariants}
        >
          <CTATitle>Ready for an Extraordinary Stay?</CTATitle>
          <CTAText>
            Book directly and receive exclusive perks including room upgrades and complimentary breakfast.
          </CTAText>
          <CTAButton
            to="/rooms"
            $primary
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reserve Now
          </CTAButton>
        </CTABanner>
      </Section>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <LightboxOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <CloseBtn onClick={() => setSelectedImage(null)}>
              <FaTimes />
            </CloseBtn>
            <LightboxImage
              src={getRoomImage(selectedImage)}
              alt="Gallery Preview"
              as={motion.img}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            />
          </LightboxOverlay>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Home;