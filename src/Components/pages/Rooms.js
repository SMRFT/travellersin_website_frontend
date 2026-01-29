import React, { useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRoomImage } from '../../assets/imageMap';
import { FaWifi, FaSnowflake, FaTv, FaConciergeBell, FaCoffee, FaParking, FaUsers, FaBed, FaRulerCombined, FaStar, FaCheck } from 'react-icons/fa';
import { getRooms } from '../services/roomService';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL.replace('/_b_a_c_k_e_n_d/travellerinwebsite/', '');

const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

/* ================= STYLED COMPONENTS ================= */

const PageWrapper = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
  padding-top: 90px;
`;

/* --- Hero Section --- */
const HeroSection = styled.section`
  position: relative;
  padding: 4rem 2rem;
  text-align: center;
  background: #0F1E2E;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
`;

/* --- Filter Section --- */
const FilterSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0 2rem;
  margin-bottom: 3rem;
`;

const FilterButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${props => props.$active ? '#C9A24D' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.$active ? '#0f0f1a' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#C9A24D' : 'rgba(255, 255, 255, 0.2)'};
    color: ${props => props.$active ? '#0f0f1a' : '#fff'};
  }
`;

/* --- Stats Bar --- */
const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 2rem;
  padding: 2rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #C9A24D;
  font-family: 'Playfair Display', Georgia, serif;
`;

const StatLabel = styled.div`
  color: #333333;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/* --- Rooms Grid --- */
const RoomsSection = styled.section`
  padding: 0 2rem 6rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RoomCard = styled(motion.div)`
  background: #0F1E2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.4s ease;

  &:hover {
    border-color: rgba(201, 162, 77, 0.2);
    transform: translateY(-8px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
  }
`;

const RoomImageContainer = styled.div`
  position: relative;
  height: 250px;
  overflow: hidden;
`;

const RoomImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;

  ${RoomCard}:hover & {
    transform: scale(1.1);
  }
`;

const RoomBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: #C9A24D;
  color: #0f0f1a;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 50px;
`;

const RoomContent = styled.div`
  padding: 1.5rem;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RoomName = styled.h3`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  font-family: 'Playfair Display', Georgia, serif;
  margin: 0;
`;

const RoomRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #C9A24D;
  font-size: 0.9rem;
  font-weight: 600;
`;

const RoomSpecs = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;

  svg {
    color: #C9A24D;
  }
`;

const RoomAmenities = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const AmenityTag = styled.span`
  padding: 0.4rem 0.8rem;
  background: rgba(201, 162, 77, 0.1);
  border: 1px solid rgba(201, 162, 77, 0.2);
  border-radius: 20px;
  border-radius: 20px;
  color: #ddd;
  font-size: 0.75rem;
`;

const RoomFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const RoomPrice = styled.div`
  color: #fff;
`;

const PriceAmount = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: #d4af37;
  font-family: 'Playfair Display', Georgia, serif;
`;

const PriceLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const ViewButton = styled(Link)`
  padding: 0.9rem 2rem;
  background: #1E6F5C;
  color: #ffffff;
  text-decoration: none;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(30, 111, 92, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(30, 111, 92, 0.4);
  }
`;

/* ================= ANIMATION VARIANTS ================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

/* ================= COMPONENT ================= */

const Rooms = () => {
  const [filter, setFilter] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getRooms();
        if (isMounted) {
          console.log("Rooms fetched:", data);
          setRooms(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRooms();
    return () => { isMounted = false; };
  }, []);

  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];

    const typed = filter === 'all'
      ? rooms
      : rooms.filter(room => room.room_type?.toLowerCase().includes(filter.toLowerCase()));

    // De-duplicate by room_number, prioritizing rooms with images
    const uniqueMap = new Map();
    typed.forEach(room => {
      const existing = uniqueMap.get(room.room_number);
      if (!existing || (room.images?.length > (existing.images?.length || 0))) {
        uniqueMap.set(room.room_number, room);
      }
    });

    return Array.from(uniqueMap.values());
  }, [rooms, filter]);

  return (
    <PageWrapper>
      <HeroSection>
        <PageLabel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Select Your Room
        </PageLabel>
        <PageTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Luxury <span>Accommodations</span>
        </PageTitle>
        <PageSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Choose from our carefully curated selection of rooms, each designed for your comfort and relaxation.
        </PageSubtitle>

        <FilterSection>
          <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
            All Rooms
          </FilterButton>
          <FilterButton $active={filter === 'standard'} onClick={() => setFilter('standard')}>
            Standard
          </FilterButton>
          <FilterButton $active={filter === 'classic'} onClick={() => setFilter('classic')}>
            Classic
          </FilterButton>
          <FilterButton $active={filter === 'deluxe'} onClick={() => setFilter('deluxe')}>
            Deluxe
          </FilterButton>
        </FilterSection>
      </HeroSection>

      <StatsBar>
        <StatItem>
          <StatValue>6.1</StatValue>
          <StatLabel>Value for Money</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>6.1</StatValue>
          <StatLabel>Location Rating</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>8+</StatValue>
          <StatLabel>Room Types</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>
            <FaCheck style={{ fontSize: '1.5rem' }} />
          </StatValue>
          <StatLabel>We Price Match</StatLabel>
        </StatItem>
      </StatsBar>

      <RoomsSection>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#1E6F5C' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <FaSnowflake style={{ fontSize: '3rem' }} />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#666' }}>Searching for luxury...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ff4d4d' }}>
            <h3>Oops! We hit a snag.</h3>
            <p>{error}</p>
            <FilterButton onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Try Again</FilterButton>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            <h3>No rooms found matching your criteria.</h3>
            <FilterButton onClick={() => setFilter('all')} style={{ marginTop: '1rem' }}>Show All Rooms</FilterButton>
          </div>
        ) : (
          <RoomsGrid
            as={motion.div}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {filteredRooms.map((room) => (
              <RoomCard key={room.room_number || room.id} variants={itemVariants}>
                <RoomImageContainer>
                  <RoomImage
                    src={formatImageUrl(room.images?.[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'}
                    alt={room.room_type}
                  />
                  {room.offers?.discount_percent && (
                    <RoomBadge>{room.offers.discount_percent}% OFF</RoomBadge>
                  )}
                </RoomImageContainer>
                <RoomContent>
                  <RoomHeader>
                    <RoomName>{room.room_type} - {room.room_number}</RoomName>
                    <RoomRating>
                      <FaStar />
                      {room.rating || '8.5'}
                    </RoomRating>
                  </RoomHeader>
                  <RoomSpecs>
                    <SpecItem>
                      <FaRulerCombined />
                      {room.size}
                    </SpecItem>
                    <SpecItem>
                      <FaUsers />
                      Max {room.bed_details?.capacity || 2} adults
                    </SpecItem>
                    <SpecItem>
                      <FaBed />
                      {room.bed_details?.type || 'King Bed'}
                    </SpecItem>
                  </RoomSpecs>
                  <RoomAmenities>
                    {room.amenities?.slice(0, 4).map((amenity, idx) => (
                      <AmenityTag key={idx}>{amenity}</AmenityTag>
                    ))}
                  </RoomAmenities>
                  <RoomFooter>
                    <RoomPrice>
                      <PriceAmount>₹{parseFloat(room.price || 0).toLocaleString()}</PriceAmount>
                      <PriceLabel> / night</PriceLabel>
                    </RoomPrice>
                    <ViewButton to={`/rooms/${room.room_number}`}>
                      View Details
                    </ViewButton>
                  </RoomFooter>
                </RoomContent>
              </RoomCard>
            ))}
          </RoomsGrid>
        )}
      </RoomsSection>
    </PageWrapper>
  );
};

export default Rooms;