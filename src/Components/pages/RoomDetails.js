import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoomImage } from '../../assets/imageMap';
import { getRoomById } from '../services/roomService';
import {
  FaWifi, FaSnowflake, FaTv, FaConciergeBell, FaCoffee, FaParking,
  FaUsers, FaBed, FaRulerCombined, FaStar, FaCheck, FaArrowLeft,
  FaShower, FaBath, FaGlassMartini, FaCouch, FaTimes, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL.replace('/_b_a_c_k_e_n_d/travellerinwebsite/', '');

const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

/* ================= STYLED COMPONENTS ================= */

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  padding-top: 90px;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

/* --- Back Button --- */
const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.3);
    color: #d4af37;
  }
`;

/* --- Gallery Section --- */
const GallerySection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 3rem;
  border-radius: 24px;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainImage = styled.div`
  position: relative;
  height: 500px;
  cursor: pointer;
  overflow: hidden;

  @media (max-width: 900px) {
    height: 350px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 150px;
  }
`;

const Thumbnail = styled.div`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }

  ${props => props.$overlay && css`
    &::after {
      content: '+${props.$count} Photos';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 600;
    }
  `}
`;

/* --- Content Grid --- */
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const RoomInfo = styled.div``;

const RoomBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: #0f0f1a;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 50px;
  margin-bottom: 1rem;
`;

const RoomName = styled.h1`
  color: #fff;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #d4af37;
  font-weight: 600;
`;

const ReviewCount = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

/* --- Specs Grid --- */
const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SpecIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-size: 1.2rem;
`;

const SpecDetails = styled.div``;

const SpecLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SpecValue = styled.div`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
`;

/* --- Description --- */
const SectionTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(212, 175, 55, 0.3), transparent);
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  line-height: 1.9;
  margin-bottom: 3rem;
`;

/* --- Amenities --- */
const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`;

const AmenityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  svg {
    color: #d4af37;
    font-size: 1.1rem;
  }

  &:hover {
    background: rgba(212, 175, 55, 0.05);
    border-color: rgba(212, 175, 55, 0.2);
  }
`;

/* --- Booking Card --- */
const BookingCard = styled.div`
  position: sticky;
  top: 110px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  height: fit-content;
`;

const PriceSection = styled.div`
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const PriceLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const PriceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4af37;
  font-family: 'Playfair Display', Georgia, serif;

  span {
    font-size: 1rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const BookingForm = styled.div`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: rgba(212, 175, 55, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(212, 175, 55, 0.5);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const BookButton = styled(motion.button)`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0f0f1a;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 50px rgba(212, 175, 55, 0.4);
  }
`;

const BookingNote = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
`;

const FeatureList = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;

  svg {
    color: #d4af37;
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

const LightboxContent = styled.div`
  position: relative;
  max-width: 1200px;
  width: 100%;
`;

const LightboxImage = styled(motion.img)`
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
`;

const LightboxNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
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
  font-size: 1.2rem;
  transition: all 0.3s ease;
  ${props => props.$left ? 'left: -70px;' : 'right: -70px;'}

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    border-color: rgba(212, 175, 55, 0.5);
  }

  @media (max-width: 1300px) {
    ${props => props.$left ? 'left: 1rem;' : 'right: 1rem;'}
  }
`;

const LightboxClose = styled.button`
  position: fixed;
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
  z-index: 10;

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    border-color: rgba(212, 175, 55, 0.5);
  }
`;

const LightboxCounter = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

/* ================= COMPONENT ================= */

const RoomDetails = () => {
  const { roomId } = useParams(); // This is now room_number
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await getRoomById(roomId);
        if (isMounted) {
          setRoom(data);
        }
      } catch (err) {
        console.error("Failed to fetch room:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (roomId) fetchRoom();
    return () => { isMounted = false; };
  }, [roomId]);

  const images = room?.images?.length > 0
    ? room.images
    : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1200'];

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (loading) return (
    <PageWrapper>
      <Container>
        <div style={{ color: '#fff', textAlign: 'center', padding: '10rem 5rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <FaSnowflake style={{ fontSize: '3rem', color: '#d4af37' }} />
          </motion.div>
          <h2 style={{ fontFamily: 'Playfair Display', marginTop: '2rem' }}>Loading luxury details...</h2>
        </div>
      </Container>
    </PageWrapper>
  );

  if (!room) return (
    <PageWrapper>
      <Container>
        <div style={{ color: '#fff', textAlign: 'center', padding: '5rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display' }}>Room not found</h2>
          <BackButton to="/rooms" style={{ marginTop: '2rem' }}>Back to Rooms</BackButton>
        </div>
      </Container>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <Container>
        <BackButton to="/rooms">
          <FaArrowLeft /> Back to Rooms
        </BackButton>

        <GallerySection>
          <MainImage onClick={() => openLightbox(0)}>
            <img src={formatImageUrl(images[0])} alt={room.name} />
          </MainImage>
          <ThumbnailGrid>
            {images.slice(1, 3).map((img, idx) => (
              <Thumbnail
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                $overlay={idx === 1 && images.length > 3}
                $count={images.length - 3}
              >
                <img src={formatImageUrl(img)} alt={`${room.name} view ${idx + 2}`} />
              </Thumbnail>
            ))}
          </ThumbnailGrid>
        </GallerySection>

        <ContentGrid>
          <RoomInfo>
            {room.offers?.discount_percent && <RoomBadge>{room.offers.discount_percent}% OFF</RoomBadge>}
            <RoomName>{room.room_type} - {room.room_number}</RoomName>

            <RatingRow>
              <RatingBadge>
                <FaStar /> {room.rating}
              </RatingBadge>
              <ReviewCount>{room.reviews} reviews</ReviewCount>
            </RatingRow>

            <SpecsGrid>
              <SpecItem>
                <SpecIcon><FaRulerCombined /></SpecIcon>
                <SpecDetails>
                  <SpecLabel>Room Size</SpecLabel>
                  <SpecValue>{room.size}</SpecValue>
                </SpecDetails>
              </SpecItem>
              <SpecItem>
                <SpecIcon><FaUsers /></SpecIcon>
                <SpecDetails>
                  <SpecLabel>Max Guests</SpecLabel>
                  <SpecValue>{room.bed_details?.capacity || 2} Adults</SpecValue>
                </SpecDetails>
              </SpecItem>
              <SpecItem>
                <SpecIcon><FaBed /></SpecIcon>
                <SpecDetails>
                  <SpecLabel>Bed Type</SpecLabel>
                  <SpecValue>{room.bed_details?.type || 'King Bed'}</SpecValue>
                </SpecDetails>
              </SpecItem>
            </SpecsGrid>

            <SectionTitle>About This Room</SectionTitle>
            <Description>{room.about || 'A luxurious room designed for your comfort.'}</Description>

            <SectionTitle>Amenities</SectionTitle>
            <AmenitiesGrid>
              {room.amenities?.map((amenity, idx) => (
                <AmenityItem key={idx}>
                  <FaCheck />
                  {amenity}
                </AmenityItem>
              ))}
            </AmenitiesGrid>
          </RoomInfo>

          <BookingCard>
            <PriceSection>
              <PriceLabel>Starting from</PriceLabel>
              <PriceAmount>
                ₹{parseFloat(room.price).toLocaleString()} <span>/ night</span>
              </PriceAmount>
            </PriceSection>

            <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
              <div style={{ fontSize: '0.9rem', color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>Select your dates & guests</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Complete your reservation details on the next page.</div>
            </div>

            <BookButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/booking/${room.room_number}`)}
            >
              Reserve Now
            </BookButton>

            <BookingNote>Free cancellation up to 24 hours before check-in</BookingNote>

            <FeatureList>
              <FeatureItem>
                <FaCheck /> Instant confirmation
              </FeatureItem>
              <FeatureItem>
                <FaCheck /> We price match
              </FeatureItem>
              <FeatureItem>
                <FaCheck /> No hidden fees
              </FeatureItem>
              <FeatureItem>
                <FaCheck /> Secure payment
              </FeatureItem>
            </FeatureList>
          </BookingCard>
        </ContentGrid>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <LightboxOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <LightboxClose onClick={() => setLightboxOpen(false)}>
              <FaTimes />
            </LightboxClose>
            <LightboxContent onClick={(e) => e.stopPropagation()}>
              <LightboxNav $left onClick={prevImage}>
                <FaChevronLeft />
              </LightboxNav>
              <LightboxImage
                key={currentImageIndex}
                src={formatImageUrl(images[currentImageIndex])}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              />
              <LightboxNav onClick={nextImage}>
                <FaChevronRight />
              </LightboxNav>
            </LightboxContent>
            <LightboxCounter>
              {currentImageIndex + 1} / {images.length}
            </LightboxCounter>
          </LightboxOverlay>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default RoomDetails;