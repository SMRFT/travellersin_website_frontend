import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpand } from 'react-icons/fa';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const getImageUrl = (imageId) => {
  if (!imageId) return '';
  if (imageId.startsWith('http')) return imageId;
  const baseUrl = (API_BASE_URL || '').replace(/\/$/, '');
  const path = imageId.startsWith('/') ? imageId : `/${imageId}`;
  // Construct standard URL to serve gridfs file if it's just an ID
  if (!imageId.includes('/')) {
    return `${baseUrl}/media/gridfs/${imageId}/`;
  }
  return `${baseUrl}${path}`;
};


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
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galRes, catRes] = await Promise.all([
          api.get('gallery/'),
          api.get('gallery-categories/')
        ]);

        // Sort by order
        const sorted = galRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(sorted);
        setCategories(['All', ...catRes.data.map(c => c.name)]);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // const categories = ['All', 'Exterior', 'Lobby', 'Rooms', 'Dining', 'Events']; // Replaced by state

  const filteredImages = filter === 'All'
    ? items
    : items.filter(img => img.category_name === filter);

  if (loading) {
    return (
      <GalleryContainer>
        <Header>
          <Title>Loading Our Gallery...</Title>
        </Header>
      </GalleryContainer>
    );
  }

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
          {filteredImages.map((img) => (
            <ImageCard
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedImage(img)}
            >
              <StyledImage src={getImageUrl(img.image_id)} alt={img.title || img.category_name} />
              <HoverInfo>
                <FaExpand size={24} />
                <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{img.title || img.category_name}</p>
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
              src={getImageUrl(selectedImage.image_id)}
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
