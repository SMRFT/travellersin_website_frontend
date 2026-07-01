import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaHotel, FaPhone, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaBed, FaFileInvoiceDollar } from 'react-icons/fa';
import { trackBooking, cancelBooking, initiateBookingPayment, verifyPayment } from '../services/bookingService';
import { useNavigate, useLocation } from 'react-router-dom';

const PageWrapper = styled.div`
  background: #F3EEF1;
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const TrackingCard = styled(motion.div)`
  background: #5a3078;
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);

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
  color: #ffffff;
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
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 1rem 1.2rem;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 1rem;
  background: #ffffff;
  color: #5a3078;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  
  &:last-child {
    border-bottom: none;
  }

  .label {
    color: rgba(255, 255, 255, 0.9);
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
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ErrorMsg = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
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
    const location = useLocation();

    // Auto-fill and search from URL params
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlId = params.get('id');
        const urlPhone = params.get('phone');

        if (urlId && urlPhone) {
            setBookingId(urlId);
            setPhone(urlPhone);
            // We need to call trackBooking directly here or trigger search
            fetchBookingAuto(urlId, urlPhone);
        }
    }, [location]);

    const fetchBookingAuto = async (bid, bphone) => {
        setLoading(true);
        setError('');
        setBooking(null);
        try {
            const data = await trackBooking(bid, bphone);
            setBooking(data);
        } catch (err) {
            setError(err.response?.data?.error || "Unable to find booking. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

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

    const getBalance = () => {
        if (!booking) return 0;
        const total = parseFloat(booking.payment_details?.amount || 0);
        const paid = parseFloat(booking.payment_details?.amount_paid || 0);
        return Math.max(0, total - paid);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Frontend Approach: Directly Initialize Razorpay for Balance Amount
            const balanceToPay = getBalance();
            if (balanceToPay <= 0) {
                alert("No balance to pay!");
                setLoading(false);
                return;
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_YooSlpOnNDsCoN", // Direct Key usage
                amount: balanceToPay * 100, // Amount in paise
                currency: "INR",
                name: "TravellersInn",
                description: `Balance Payment for Booking ${booking.booking_id}`,
                // order_id: null, // No Order ID created on backend
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id || "N/A",
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature || "SKIPPED",
                            booking_id: booking.booking_id
                        });
                        const updated = await trackBooking(bookingId, phone);
                        setBooking(updated);
                        alert("Payment successful! Your balance has been updated.");
                    } catch (err) {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: booking.guest_name,
                    email: booking.guest_email,
                    contact: booking.guest_phone,
                },
                theme: { color: "#5a3078" },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            setError("Failed to initiate payment. Please try again.");
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
        return getBalance() > 0;
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
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem' }}
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
                                    style={{ background: 'rgba(255, 255, 255, 0.15)', marginBottom: '2rem' }}
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
                                <span className="value">{booking.guest_phone}</span>
                            </DetailItem>

                            {/* Payment & Billing Details */}
                            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaFileInvoiceDollar /> Payment Details
                                </h4>
                                <DetailItem>
                                    <span className="label">Status</span>
                                    <span className="value" style={{ textTransform: 'capitalize', color: '#ffffff' }}>
                                        {booking.payment_details?.status || 'Unpaid'}
                                    </span>
                                </DetailItem>
                                <DetailItem>
                                    <span className="label">Total Amount</span>
                                    <span className="value">₹{booking.payment_details?.amount || 0}</span>
                                </DetailItem>
                                <DetailItem>
                                    <span className="label">Amount Paid</span>
                                    <span className="value">₹{booking.payment_details?.amount_paid || 0}</span>
                                </DetailItem>
                                {booking.payment_details?.billing_numbers && booking.payment_details.billing_numbers.length > 0 && (
                                    <DetailItem>
                                        <span className="label">Bill Reference(s)</span>
                                        <span className="value" style={{ fontSize: '0.9rem' }}>
                                            {booking.payment_details.billing_numbers.join(', ')}
                                        </span>
                                    </DetailItem>
                                )}
                            </div>

                            {/* Payment History Table */}
                            {booking.bills && booking.bills.length > 0 && (
                                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaFileInvoiceDollar /> Payment History
                                    </h4>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                                    <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Date</th>
                                                    <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Details</th>
                                                    <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)', textAlign: 'right' }}>Amount</th>
                                                    <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)', textAlign: 'right' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {booking.bills.map((bill, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '0.5rem' }}>
                                                            {new Date(bill.date).toLocaleDateString()}
                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                                                {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.5rem' }}>
                                                            <div style={{ fontWeight: 'bold' }}>{bill.payment_type.toUpperCase()}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                                                                {bill.transaction_id || bill.billing_no}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                            ₹{bill.amount_paid}
                                                        </td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                            <span style={{
                                                                color: '#ffffff',
                                                                textTransform: 'capitalize',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                {bill.status || 'Success'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
                                {needsPayment() && (
                                    <SubmitButton
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePayment}
                                        disabled={loading}
                                        style={{ background: '#ffffff', color: '#5a3078' }}
                                    >
                                        Pay Balance (₹{getBalance()})
                                    </SubmitButton>
                                )}

                                {canCancel() && (
                                    <SubmitButton
                                        style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                                        whileHover={booking.booking_status === 'cancellation_requested' ? {} : { background: 'rgba(255, 255, 255, 0.25)' }}
                                        onClick={handleCancel}
                                        disabled={loading || booking.booking_status === 'cancellation_requested'}
                                    >
                                        {booking.booking_status === 'cancellation_requested' ? 'Cancellation Requested' : 'Cancel Booking'}
                                    </SubmitButton>
                                )}

                                <SubmitButton
                                    style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
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
