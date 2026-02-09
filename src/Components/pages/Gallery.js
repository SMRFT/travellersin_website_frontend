import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpand } from 'react-icons/fa';
import { getRoomImage } from '../../assets/imageMap';

const GalleryContainer = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
  padding: 8rem 2rem 4rem;
  color: #333;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1rem;
  color: #0F1E2E;
`;

const FilterGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  background: ${props => props.$active ? '#C9A24D' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#C9A24D' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.$active ? '#fff' : '#0F1E2E'};
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover {
    border-color: #C9A24D;
    color: #C9A24D;
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const ImageCard = styled(motion.div)`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 300px;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${ImageCard}:hover & {
    transform: scale(1.1);
  }
`;

const HoverInfo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  text-align: center;

  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

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
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(90deg) scale(1.1);
  }
`;

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    { key: 'exterior_view', category: 'Exterior', title: 'Hotel Exterior' },
    { key: 'art_view', category: 'Interior', title: 'Artistic Lounge' },
    { key: 'signage_view', category: 'Exterior', title: 'Welcome Portal' },
    { key: 'interior_1', category: 'Rooms', title: 'Luxury Double' },
    { key: 'interior_2', category: 'Rooms', title: 'Deluxe Suite' },
    { key: 'interior_3', category: 'Rooms', title: 'Classic Comfort' },
    { key: 'interior_4', category: 'Rooms', title: 'Premium Living' },
    { key: 'interior_5', category: 'Rooms', title: 'Executive Retreat' },
    { key: 'venue_grand', category: 'Events', title: 'Grand Hall' },
    { key: 'venue_setup', category: 'Events', title: 'Event Setup' },
    { key: 'event_wide', category: 'Events', title: 'Celebration Venue' },
    { key: 'event_detail', category: 'Events', title: 'Table Setup' },
    { key: 'dining_view', category: 'Dining', title: 'Signature Restaurant' },
    { key: 'garden_view', category: 'Exterior', title: 'Lush Gardens' },
  ];

  const categories = ['All', 'Exterior', 'Lobby', 'Rooms', 'Dining', 'Events'];

  const filteredImages = filter === 'All'
    ? images
    : images.filter(img => img.category === filter);

  return (
    <GalleryContainer>
      <Header>
        <Title>Our Visual Journey</Title>
        <FilterGroup>
          {categories.map(cat => (
            <FilterBtn
              key={cat}
              $active={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </FilterBtn>
          ))}
        </FilterGroup>
      </Header>

      <Grid layout>
        <AnimatePresence>
          {filteredImages.map((img, index) => (
            <ImageCard
              key={img.key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedImage(img)}
            >
              <StyledImage src={getRoomImage(img.key)} alt={img.title} />
              <HoverInfo>
                <FaExpand size={24} />
                <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{img.title}</p>
              </HoverInfo>
            </ImageCard>
          ))}
        </AnimatePresence>
      </Grid>

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
              src={getRoomImage(selectedImage.key)}
              alt={selectedImage.title}
              as={motion.img}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            />
          </LightboxOverlay>
        )}
      </AnimatePresence>
    </GalleryContainer>
  );
};

export default Gallery;
