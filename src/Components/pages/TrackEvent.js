import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaUsers, FaInfoCircle, FaMapMarkerAlt, FaClock, FaUser, FaPhone } from 'react-icons/fa';
import { trackEventBooking } from '../services/eventService';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  color: #fff;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #d4af37, #f5d76e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SearchCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  margin-bottom: 3rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
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
`;

const SubmitBtn = styled(motion.button)`
  padding: 1.2rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0f0f1a;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
`;

const ResultCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  
  background: ${props => {
        switch (props.$status) {
            case 'confirmed': return 'rgba(16, 185, 129, 0.1)';
            case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
            default: return 'rgba(212, 175, 55, 0.1)';
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'confirmed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#d4af37';
        }
    }};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const DetailIcon = styled.div`
  color: #d4af37;
  font-size: 1.2rem;
  margin-top: 0.2rem;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DetailValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
`;

const TrackEvent = () => {
    const [bookingId, setBookingId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await trackEventBooking(bookingId, phone);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not find your event booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Container>
                <Header>
                    <Title>Track Your Event</Title>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Check the status of your event inquiry or booking at TravellersInn</p>
                </Header>

                <SearchCard>
                    <Form onSubmit={handleSearch}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <InputGroup>
                                <Label>Event Booking ID</Label>
                                <Input
                                    required
                                    placeholder="e.g. EVT-XXXX"
                                    value={bookingId}
                                    onChange={e => setBookingId(e.target.value.toUpperCase())}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Registered Phone Number</Label>
                                <Input
                                    required
                                    type="tel"
                                    placeholder="Enter Phone Number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                        <SubmitBtn
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Searching...' : <><FaSearch /> Search Event</>}
                        </SubmitBtn>
                    </Form>

                    {error && (
                        <div style={{ marginTop: '1.5rem', color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>
                            <FaInfoCircle /> {error}
                        </div>
                    )}
                </SearchCard>

                <AnimatePresence>
                    {result && (
                        <ResultCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{result.event_type} Inquiry</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>ID: {result.booking_id}</p>
                                </div>
                                <StatusBadge $status={result.status}>{result.status}</StatusBadge>
                            </div>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2rem 0' }} />

                            <DetailGrid>
                                <DetailItem>
                                    <DetailIcon><FaCalendarAlt /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Event Date</DetailLabel>
                                        <DetailValue>{new Date(result.event_date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</DetailValue>
                                    </DetailContent>
                                </DetailItem>

                                <DetailItem>
                                    <DetailIcon><FaUsers /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Guest Capacity</DetailLabel>
                                        <DetailValue>{result.number_of_guests} Expected Guests</DetailValue>
                                    </DetailContent>
                                </DetailItem>

                                <DetailItem>
                                    <DetailIcon><FaUser /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Full Name</DetailLabel>
                                        <DetailValue>{result.name}</DetailValue>
                                    </DetailContent>
                                </DetailItem>

                                <DetailItem>
                                    <DetailIcon><FaPhone /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Contact Number</DetailLabel>
                                        <DetailValue>{result.phone}</DetailValue>
                                    </DetailContent>
                                </DetailItem>
                            </DetailGrid>

                            {result.message && (
                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <DetailLabel>Your message</DetailLabel>
                                    <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                        "{result.message}"
                                    </p>
                                </div>
                            )}

                            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                    Submitted on {new Date(result.created_at).toLocaleString()}
                                </p>
                            </div>
                        </ResultCard>
                    )}
                </AnimatePresence>
            </Container>
        </PageWrapper>
    );
};

export default TrackEvent;
