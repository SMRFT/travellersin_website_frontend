import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaCalendarAlt, FaUsers, FaInfoCircle,
    FaMapMarkerAlt, FaClock, FaUser, FaPhone,
    FaDownload, FaShareAlt, FaHotel, FaCheckCircle
} from 'react-icons/fa';
import { trackEventBooking } from '../services/eventService';
import html2pdf from 'html2pdf.js';

const PageWrapper = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  color: #333;
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
  color: #0F1E2E;
`;

const SearchCard = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
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
  color: #666;
  font-size: 0.85rem;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  background: #FAFAFA;
  border: 1px solid #ddd;
  border-radius: 12px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #C9A24D;
    background: #fff;
  }
`;

const SubmitBtn = styled(motion.button)`
  padding: 1.2rem;
  background: #1E6F5C;
  color: #ffffff;
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
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
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
            default: return 'rgba(201, 162, 77, 0.1)';
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'confirmed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#C9A24D';
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
  color: #C9A24D;
  font-size: 1.2rem;
  margin-top: 0.2rem;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DetailValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #0F1E2E;
`;

const ConfirmationCard = styled.div`
  background: white;
  color: #333;
  width: 100%;
  padding: 2.5rem;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-bottom: 2rem;
  display: block; /* Shown by default inside ResultCard, but can be hidden for normal view if preferred */
`;

const CardHeader = styled.div`
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const CardBrand = styled.div`
  color: #d4af37;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PrintableDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px dashed #eee;
  padding-bottom: 0.5rem;

  span:first-child { color: #666; font-weight: 500; }
  span:last-child { color: #000; font-weight: 600; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: 0.8rem 1.5rem;
  background: ${props => props.$primary ? '#1E6F5C' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#1E6F5C'};
  border: ${props => props.$primary ? 'none' : '1px solid #1E6F5C'};
  border-radius: 10px;
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
    ${props => !props.$primary && 'background: rgba(201, 162, 77, 0.1);'}
  }
`;

const TrackEvent = () => {
    const cardRef = useRef();
    const [bookingIdInput, setBookingIdInput] = useState('');
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
            const data = await trackEventBooking(bookingIdInput, phone);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not find your event booking.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        const element = cardRef.current;
        const opt = {
            margin: 10,
            filename: `EventConfirmation_${result.booking_id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const handleShare = async () => {
        const shareData = {
            title: 'TravellersInn Event Booking',
            text: `My event booking at TravellersInn (ID: ${result.booking_id}) is ${result.status}.`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert('Details copied to clipboard!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    return (
        <PageWrapper>
            <Container>
                <Header>
                    <Title>Track Your Event</Title>
                    <p style={{ color: '#666' }}>Check the status of your event inquiry or booking at TravellersInn</p>
                </Header>

                <SearchCard>
                    <Form onSubmit={handleSearch}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <InputGroup>
                                <Label>Event Booking ID</Label>
                                <Input
                                    required
                                    placeholder="e.g. EVT-XXXX"
                                    value={bookingIdInput}
                                    onChange={e => setBookingIdInput(e.target.value.toUpperCase())}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '0.5rem', color: '#0F1E2E' }}>{result.event_type} Inquiry</h2>
                                    <p style={{ color: '#666' }}>ID: {result.booking_id}</p>
                                </div>
                                <StatusBadge $status={result.status}>{result.status}</StatusBadge>
                            </div>

                            <div style={{ display: 'none' }}>
                                <ConfirmationCard ref={cardRef}>
                                    <CardHeader>
                                        <CardBrand><FaHotel /> TravellersInn</CardBrand>
                                        <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>EVENT BOOKING STATUS</h3>
                                    </CardHeader>
                                    <PrintableDetail><span>Booking ID</span><span>{result.booking_id}</span></PrintableDetail>
                                    <PrintableDetail><span>Event Type</span><span>{result.event_type}</span></PrintableDetail>
                                    <PrintableDetail><span>Status</span><span style={{ color: '#d4af37' }}>{result.status.toUpperCase()}</span></PrintableDetail>
                                    <PrintableDetail><span>Event Date</span><span>{new Date(result.event_date).toLocaleDateString()}</span></PrintableDetail>
                                    <PrintableDetail><span>Expected Guests</span><span>{result.number_of_guests}</span></PrintableDetail>
                                    <PrintableDetail><span>Guest Name</span><span>{result.name}</span></PrintableDetail>
                                    <PrintableDetail><span>Contact</span><span>{result.phone}</span></PrintableDetail>
                                    <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
                                        Thank you for choosing TravellersInn.
                                    </div>
                                </ConfirmationCard>
                            </div>

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
                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#FAFAFA', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <DetailLabel>Your message</DetailLabel>
                                    <p style={{ marginTop: '0.5rem', color: '#333', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                        "{result.message}"
                                    </p>
                                </div>
                            )}

                            <ActionButtons>
                                <ActionButton $primary onClick={handleDownloadPDF}>
                                    <FaDownload /> Download Receipt
                                </ActionButton>
                                <ActionButton onClick={handleShare}>
                                    <FaShareAlt /> Share Status
                                </ActionButton>
                            </ActionButtons>

                            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>
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
