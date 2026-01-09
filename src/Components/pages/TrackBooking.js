import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaHotel, FaPhone, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaBed } from 'react-icons/fa';
import { trackBooking, cancelBooking, initiateBookingPayment, verifyPayment } from '../services/bookingService';
import { useNavigate } from 'react-router-dom';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const TrackingCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);

  @media (max-width: 600px) {
    padding: 2rem;
  }
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2.22rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(212, 175, 55, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 1.2rem;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 1rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0f0f1a;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const BookingDetails = styled(motion.div)`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }

  .label {
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.95rem;
  }

  .value {
    color: #fff;
    font-weight: 600;
    text-align: right;
  }
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
        switch (props.$status) {
            case 'confirmed': return 'rgba(16, 185, 129, 0.15)';
            case 'cancelled': return 'rgba(239, 68, 68, 0.15)';
            default: return 'rgba(245, 158, 11, 0.15)';
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'confirmed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#f59e1b';
        }
    }};
  border: 1px solid ${props => {
        switch (props.$status) {
            case 'confirmed': return 'rgba(16, 185, 129, 0.3)';
            case 'cancelled': return 'rgba(239, 68, 68, 0.3)';
            default: return 'rgba(245, 158, 11, 0.3)';
        }
    }};
`;

const ErrorMsg = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const TrackBooking = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [phone, setPhone] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBooking(null);

        try {
            const data = await trackBooking(bookingId, phone);
            setBooking(data);
        } catch (err) {
            setError(err.response?.data?.error || "Unable to find booking. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const reason = window.prompt("Please enter the reason for cancellation:");
        if (reason === null) return; // User cancelled the prompt

        if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await cancelBooking(booking.booking_id, reason);
            const updated = await trackBooking(bookingId, phone);
            setBooking(updated);
            alert("Booking cancelled successfully.");
        } catch (err) {
            setError(err.response?.data?.error || "Cancellation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { order, booking: bookingData } = await initiateBookingPayment(booking.booking_id);

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: "INR",
                name: "TravellersInn",
                description: `Payment for Booking ${bookingData.booking_id}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingData.booking_id
                        });
                        const updated = await trackBooking(bookingId, phone);
                        setBooking(updated);
                        alert("Payment successful! Your booking is now confirmed.");
                    } catch (err) {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: bookingData.guest_name,
                    email: bookingData.guest_email,
                    contact: bookingData.guest_phone,
                },
                theme: { color: "#d4af37" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const canCancel = () => {
        if (!booking) return false;
        if (booking.booking_status === 'cancelled') return false;
        const createdAt = new Date(booking.created_at);
        const now = new Date();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 24;
    };

    const needsPayment = () => {
        if (!booking) return false;
        if (booking.booking_status === 'cancelled') return false;
        return booking.payment_details?.status === 'unpaid';
    };

    return (
        <PageWrapper>
            <TrackingCard
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <motion.button
                        whileHover={{ x: -2 }}
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        <FaArrowLeft />
                    </motion.button>
                </div>

                <Title>Track Your Stay</Title>
                <Subtitle>Enter your details to view your reservation status</Subtitle>

                <AnimatePresence>
                    {error && (
                        <ErrorMsg
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <FaExclamationTriangle /> {error}
                        </ErrorMsg>
                    )}
                </AnimatePresence>

                {!booking && (
                    <Form onSubmit={handleSearch}>
                        <FormGroup>
                            <Label>Booking ID</Label>
                            <Input
                                type="text"
                                placeholder="e.g., BK-XXXXXXXX"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value.toUpperCase())}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Phone Number</Label>
                            <Input
                                type="tel"
                                placeholder="Enter registered phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <SubmitButton
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Searching..." : <><FaSearch /> Find Reservation</>}
                        </SubmitButton>
                    </Form>
                )}

                <AnimatePresence>
                    {booking && (
                        <BookingDetails
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <StatusBadge $status={booking.booking_status?.toLowerCase() || 'pending'}>
                                    {booking.booking_status === 'cancellation_requested' ? 'Cancellation Pending' : (booking.booking_status || 'Pending')}
                                </StatusBadge>
                            </div>

                            {booking.booking_status === 'cancelled' && booking.cancellation_reason && (
                                <ErrorMsg
                                    style={{ background: 'rgba(239, 68, 68, 0.05)', marginBottom: '2rem' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <FaExclamationTriangle /> <strong>Reason:</strong> {booking.cancellation_reason}
                                </ErrorMsg>
                            )}

                            <DetailItem>
                                <span className="label"><FaHotel /> Guest Name</span>
                                <span className="value">{booking.guest_name}</span>
                            </DetailItem>
                            <DetailItem>
                                <span className="label"><FaCalendarAlt /> Check-in</span>
                                <span className="value">{new Date(booking.check_in).toLocaleDateString()}</span>
                            </DetailItem>
                            <DetailItem>
                                <span className="label"><FaCalendarAlt /> Check-out</span>
                                <span className="value">{new Date(booking.check_out).toLocaleDateString()}</span>
                            </DetailItem>
                            <DetailItem>
                                <span className="label"><FaBed /> Rooms</span>
                                <span className="value">
                                    {booking.room_numbers
                                        ? booking.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                                        : 'N/A'}
                                </span>
                            </DetailItem>
                            <DetailItem>
                                <span className="label"><FaPhone /> Phone</span>
                                <span className="value">{booking.guest_phone}</span>
                            </DetailItem>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
                                {needsPayment() && (
                                    <SubmitButton
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePayment}
                                        disabled={loading}
                                    >
                                        Pay Advance Now
                                    </SubmitButton>
                                )}

                                {canCancel() && (
                                    <SubmitButton
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                        whileHover={booking.booking_status === 'cancellation_requested' ? {} : { background: 'rgba(239, 68, 68, 0.2)' }}
                                        onClick={handleCancel}
                                        disabled={loading || booking.booking_status === 'cancellation_requested'}
                                    >
                                        {booking.booking_status === 'cancellation_requested' ? 'Cancellation Requested' : 'Cancel Booking'}
                                    </SubmitButton>
                                )}

                                <SubmitButton
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => setBooking(null)}
                                >
                                    Search Another
                                </SubmitButton>
                            </div>
                        </BookingDetails>
                    )}
                </AnimatePresence>
            </TrackingCard>
        </PageWrapper>
    );
};

export default TrackBooking;
