import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaArrowUp
} from 'react-icons/fa';

/* ================= KEYFRAME ANIMATIONS ================= */

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ================= STYLED COMPONENTS ================= */

const FooterWrapper = styled.footer`
  background: #0F1E2E;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #C9A24D, transparent);
  }
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 4rem;
  padding: 5rem 4rem 4rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding: 4rem 2rem 3rem;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
`;

const FooterColumn = styled.div``;

const BrandSection = styled.div``;

const Logo = styled(Link)`
  font-size: 2rem;
  font-weight: 700;
  text-decoration: none;
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #fff 0%, #C9A24D 50%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  margin-bottom: 1.5rem;

  &:hover {
    animation: ${shimmer} 2s linear infinite;
  }
`;

const LogoAccent = styled.span`
  -webkit-text-fill-color: #C9A24D;
`;

const BrandDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  max-width: 350px;

  @media (max-width: 600px) {
    max-width: 100%;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.8rem;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const SocialIcon = styled.a`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(201, 162, 77, 0.15);
    border-color: rgba(201, 162, 77, 0.4);
    color: #C9A24D;
    transform: translateY(-3px);
  }
`;

const ColumnTitle = styled.h4`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', Georgia, serif;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #C9A24D, transparent);

    @media (max-width: 600px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.8rem;

  a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      color: #C9A24D;
      transform: translateX(5px);

      @media (max-width: 600px) {
        transform: none;
      }
    }
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;

  @media (max-width: 600px) {
    justify-content: center;
    text-align: left;
  }

  svg {
    color: #C9A24D;
    font-size: 1rem;
    margin-top: 4px;
    flex-shrink: 0;
  }
`;

const ContactText = styled.div`
  line-height: 1.6;
`;

const NewsletterSection = styled.div`
  margin-top: 1rem;
`;

const NewsletterText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: rgba(201, 162, 77, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const NewsletterButton = styled(motion.button)`
  padding: 0.9rem 1.5rem;
  background: #1E6F5C;
  border: none;
  border-radius: 10px;
  color: #0f0f1a;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    box-shadow: 0 5px 20px rgba(30, 111, 92, 0.3);
  }
`;

const FooterMiddle = styled.div`
  padding: 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
    text-align: center;
  }
`;

const Awards = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const AwardBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
`;

const AwardIcon = styled.div`
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, rgba(201, 162, 77, 0.2), rgba(201, 162, 77, 0.05));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A24D;
  font-size: 1rem;
`;

const AwardText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;

  span {
    display: block;
    color: #C9A24D;
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

const FooterBottom = styled.div`
  padding: 1.5rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem 2rem;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 2rem;

  a {
    color: rgba(255, 255, 255, 0.4);
    text-decoration: none;
    font-size: 0.85rem;
    transition: color 0.3s ease;

    &:hover {
      color: #C9A24D;
    }
  }
`;

const BackToTop = styled(motion.button)`
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: #1E6F5C;
  border: none;
  border-radius: 12px;
  color: #0f0f1a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 5px 25px rgba(30, 111, 92, 0.3);
  z-index: 100;

  @media (max-width: 768px) {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 45px;
    height: 45px;
  }
`;

/* ================= COMPONENT ================= */

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Events', path: '/events' },
    { name: 'Track Booking', path: '/track-booking' },
    { name: 'Track Event', path: '/track-event' },
    { name: 'Contact', path: '/contact' }
  ];

  const services = [
    { name: 'Room Service', path: '#' },
    { name: 'Fine Dining', path: '#' },
    { name: 'Event Hosting', path: '/events' },
  ];

  return (
    <FooterWrapper>
      <FooterTop>
        {/* Brand Column */}
        <FooterColumn>
          <BrandSection>
            <Logo to="/">
              Travellers<LogoAccent>Inn</LogoAccent>
            </Logo>
            <BrandDescription>
              A sanctuary of comfort in the heart of Salem. Experience luxury redefined
              through vibrant dining, serene stays, and unforgettable moments.
            </BrandDescription>
            <SocialLinks>
              <SocialIcon href="#" aria-label="Facebook"><FaFacebookF /></SocialIcon>
              <SocialIcon href="#" aria-label="Twitter"><FaTwitter /></SocialIcon>
              <SocialIcon href="#" aria-label="Instagram"><FaInstagram /></SocialIcon>
              <SocialIcon href="#" aria-label="LinkedIn"><FaLinkedinIn /></SocialIcon>
              <SocialIcon href="#" aria-label="YouTube"><FaYoutube /></SocialIcon>
            </SocialLinks>
          </BrandSection>
        </FooterColumn>

        {/* Quick Links */}
        <FooterColumn>
          <ColumnTitle>Quick Links</ColumnTitle>
          <FooterLinks>
            {quickLinks.map((link) => (
              <FooterLink key={link.name}>
                <Link to={link.path}>{link.name}</Link>
              </FooterLink>
            ))}
          </FooterLinks>
        </FooterColumn>

        {/* Services */}
        <FooterColumn>
          <ColumnTitle>Services</ColumnTitle>
          <FooterLinks>
            {services.map((service) => (
              <FooterLink key={service.name}>
                <a href={service.path}>{service.name}</a>
              </FooterLink>
            ))}
          </FooterLinks>
        </FooterColumn>

        {/* Contact Info */}
        <FooterColumn>
          <ColumnTitle>Contact Us</ColumnTitle>
          <ContactItem>
            <FaMapMarkerAlt />
            <ContactText>
              123 Hotel Street, Salem<br />
              Tamil Nadu, India - 636001
            </ContactText>
          </ContactItem>
          <ContactItem>
            <FaPhone />
            <ContactText>+91 98765 43210</ContactText>
          </ContactItem>
          <ContactItem>
            <FaEnvelope />
            <ContactText>info@travellersinn.com</ContactText>
          </ContactItem>
          <ContactItem>
            <FaClock />
            <ContactText>24/7 Available</ContactText>
          </ContactItem>
        </FooterColumn>
      </FooterTop>

      <FooterMiddle>
        <Awards>
          <AwardBadge>
            <AwardIcon>⭐</AwardIcon>
            <AwardText>
              Rated
              <span>4.5/5 Stars</span>
            </AwardText>
          </AwardBadge>
          <AwardBadge>
            <AwardIcon>🏆</AwardIcon>
            <AwardText>
              Best Hotel
              <span>Salem 2024</span>
            </AwardText>
          </AwardBadge>
          <AwardBadge>
            <AwardIcon>✓</AwardIcon>
            <AwardText>
              Verified
              <span>OYO Partner</span>
            </AwardText>
          </AwardBadge>
        </Awards>
        <NewsletterSection>
          <NewsletterForm onSubmit={(e) => e.preventDefault()}>
            <NewsletterInput type="email" placeholder="Subscribe to newsletter" />
            <NewsletterButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Subscribe
            </NewsletterButton>
          </NewsletterForm>
        </NewsletterSection>
      </FooterMiddle>

      <FooterBottom>
        <Copyright>
          © {new Date().getFullYear()} TravellersInn. All rights reserved.
        </Copyright>
        <LegalLinks>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </LegalLinks>
      </FooterBottom>

      <BackToTop
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FaArrowUp />
      </BackToTop>
    </FooterWrapper>
  );
};

export default Footer;