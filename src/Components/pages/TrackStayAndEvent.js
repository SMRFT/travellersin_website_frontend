import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaCalendarAlt, FaHotel, FaPhone, FaCheckCircle,
    FaExclamationTriangle, FaArrowLeft, FaBed, FaFileInvoiceDollar,
    FaUsers, FaInfoCircle, FaUser, FaDownload, FaShareAlt
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { trackBooking, cancelBooking, verifyPayment } from '../services/bookingService';
import { trackEventBooking } from '../services/eventService';

const PageWrapper = styled.div`
  background: #F3EEF1;
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Inter', sans-serif;
`;

const Container = styled.div`
  width: 100%;
  max-width: 700px;
`;

const BackButton = styled(motion.button)`
  background: none;
  border: none;
  color: #5a3078;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const TrackingCard = styled(motion.div)`
  background: #5a3078;
  border-radius: 32px;
  width: 100%;
  padding: 3rem;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);
  color: #fff;

  @media (max-width: 600px) {
    padding: 2rem;
  }
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2.4rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

// Tab System
const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.35rem;
  margin-bottom: 2.5rem;
  position: relative;
`;

const TabButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  color: ${props => props.$active ? '#5a3078' : '#ffffff'};
  padding: 0.9rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 2;
  border-radius: 12px;
  transition: opacity 0.3s ease;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActiveSlide = styled(motion.div)`
  position: absolute;
  top: 0.35rem;
  bottom: 0.35rem;
  left: 0.35rem;
  width: calc(50% - 0.35rem);
  background: #ffffff;
  border-radius: 12px;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 1.1rem;
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
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    /* No color change on hover, keeping it clean white/purple */
  }
`;

const DetailsWrapper = styled(motion.div)`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.1rem 0;
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
  padding: 0.4rem 1rem;
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
  padding: 0.9rem 1.5rem;
  background: ${props => props.$primary ? '#ffffff' : 'transparent'};
  color: ${props => props.$primary ? '#5a3078' : '#ffffff'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#ffffff'};
  border-radius: 12px;
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
  }
`;

// Printable confirmation card styled purely for PDF export
const ConfirmationCard = styled.div`
  background: white;
  color: #333;
  width: 100%;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: block;
`;

const CardHeader = styled.div`
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const CardBrand = styled.div`
  color: #5a3078;
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
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
  font-size: 0.95rem;
  border-bottom: 1px dashed #eee;
  padding-bottom: 0.5rem;

  span:first-child { color: #666; font-weight: 500; }
  span:last-child { color: #000; font-weight: 600; }
`;

const TrackStayAndEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventPdfRef = useRef();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('stay'); // 'stay' or 'event'

  // Stay tracking states
  const [stayId, setStayId] = useState('');
  const [stayPhone, setStayPhone] = useState('');
  const [stayData, setStayData] = useState(null);
  const [stayLoading, setStayLoading] = useState(false);
  const [stayError, setStayError] = useState('');

  // Event tracking states
  const [eventId, setEventId] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [eventData, setEventData] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    const idParam = params.get('id');
    const phoneParam = params.get('phone');

    if (typeParam === 'event' || location.pathname.includes('trackevent')) {
      setActiveTab('event');
      if (idParam && phoneParam) {
        setEventId(idParam);
        setEventPhone(phoneParam);
        fetchEventAuto(idParam, phoneParam);
      }
    } else {
      setActiveTab('stay');
      if (idParam && phoneParam) {
        setStayId(idParam);
        setStayPhone(phoneParam);
        fetchStayAuto(idParam, phoneParam);
      }
    }
  }, [location]);

  const fetchStayAuto = async (id, phone) => {
    setStayLoading(true);
    setStayError('');
    setStayData(null);
    try {
      const data = await trackBooking(id, phone);
      setStayData(data);
    } catch (err) {
      setStayError(err.response?.data?.error || "Unable to find booking. Please check details.");
    } finally {
      setStayLoading(false);
    }
  };

  const fetchEventAuto = async (id, phone) => {
    setEventLoading(true);
    setEventError('');
    setEventData(null);
    try {
      const data = await trackEventBooking(id, phone);
      setEventData(data);
    } catch (err) {
      setEventError(err.response?.data?.error || "Could not find event booking.");
    } finally {
      setEventLoading(false);
    }
  };

  // Search Handlers
  const handleStaySearch = async (e) => {
    e.preventDefault();
    setStayLoading(true);
    setStayError('');
    setStayData(null);
    try {
      const data = await trackBooking(stayId, stayPhone);
      setStayData(data);
    } catch (err) {
      setStayError(err.response?.data?.error || "Unable to find booking. Please check details.");
    } finally {
      setStayLoading(false);
    }
  };

  const handleEventSearch = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    setEventError('');
    setEventData(null);
    try {
      const data = await trackEventBooking(eventId, eventPhone);
      setEventData(data);
    } catch (err) {
      setEventError(err.response?.data?.error || "Could not find event booking.");
    } finally {
      setEventLoading(false);
    }
  };

  // Booking Cancel Handler
  const handleStayCancel = async () => {
    const reason = window.prompt("Please enter the reason for cancellation:");
    if (reason === null) return;
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    setStayLoading(true);
    try {
      await cancelBooking(stayData.booking_id, reason);
      const updated = await trackBooking(stayId, stayPhone);
      setStayData(updated);
      alert("Booking cancelled successfully.");
    } catch (err) {
      setStayError(err.response?.data?.error || "Cancellation failed.");
    } finally {
      setStayLoading(false);
    }
  };

  const getStayBalance = () => {
    if (!stayData) return 0;
    const total = parseFloat(stayData.payment_details?.amount || 0);
    const paid = parseFloat(stayData.payment_details?.amount_paid || 0);
    return Math.max(0, total - paid);
  };

  const handleStayPayment = async () => {
    setStayLoading(true);
    try {
      const balanceToPay = getStayBalance();
      if (balanceToPay <= 0) {
        alert("No balance to pay!");
        setStayLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_YooSlpOnNDsCoN",
        amount: balanceToPay * 100,
        currency: "INR",
        name: "TravellersInn",
        description: `Balance Payment for Booking ${stayData.booking_id}`,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id || "N/A",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || "SKIPPED",
              booking_id: stayData.booking_id
            });
            const updated = await trackBooking(stayId, stayPhone);
            setStayData(updated);
            alert("Payment successful! Your balance has been updated.");
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: stayData.guest_name,
          email: stayData.guest_email,
          contact: stayData.guest_phone,
        },
        theme: { color: "#5a3078" },
        modal: {
          ondismiss: function () {
            setStayLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setStayError("Failed to initiate payment. Please try again.");
      setStayLoading(false);
    }
  };

  const canCancelStay = () => {
    if (!stayData) return false;
    if (stayData.booking_status === 'cancelled') return false;
    const createdAt = new Date(stayData.created_at);
    const now = new Date();
    const diffHours = (now - createdAt) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const stayNeedsPayment = () => {
    if (!stayData) return false;
    if (stayData.booking_status === 'cancelled') return false;
    return getStayBalance() > 0;
  };

  // Event actions
  const handleDownloadEventPDF = () => {
    const element = eventPdfRef.current;
    const opt = {
      margin: 10,
      filename: `EventConfirmation_${eventData.booking_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: 'TravellersInn Event Booking',
      text: `My event booking at TravellersInn (ID: ${eventData.booking_id}) is ${eventData.status}.`,
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
        <BackButton
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
        >
          <FaArrowLeft /> Back to Home
        </BackButton>

        <TrackingCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Title>Track Stay & Event</Title>
          <Subtitle>Manage reservations and check inquiry status</Subtitle>

          <TabContainer>
            <TabButton
              $active={activeTab === 'stay'}
              onClick={() => { setActiveTab('stay'); navigate('/track?type=stay'); }}
            >
              Track Stay
            </TabButton>
            <TabButton
              $active={activeTab === 'event'}
              onClick={() => { setActiveTab('event'); navigate('/track?type=event'); }}
            >
              Track Event
            </TabButton>
            <ActiveSlide
              layoutId="activeTabIndicator"
              animate={{ x: activeTab === 'stay' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </TabContainer>

          {/* STAY TRACKING FLOW */}
          {activeTab === 'stay' && (
            <div>
              <AnimatePresence mode="wait">
                {stayError && (
                  <ErrorMsg
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FaExclamationTriangle /> {stayError}
                  </ErrorMsg>
                )}
              </AnimatePresence>

              {!stayData ? (
                <Form onSubmit={handleStaySearch}>
                  <FormGroup>
                    <Label>Booking ID</Label>
                    <Input
                      type="text"
                      placeholder="e.g., BK-XXXXXXXX"
                      value={stayId}
                      onChange={(e) => setStayId(e.target.value.toUpperCase())}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="Enter registered phone"
                      value={stayPhone}
                      onChange={(e) => setStayPhone(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <SubmitButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={stayLoading}
                  >
                    {stayLoading ? "Searching..." : <><FaSearch /> Find Stay Booking</>}
                  </SubmitButton>
                </Form>
              ) : (
                <DetailsWrapper
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem' }}>Stay Details</h3>
                    <StatusBadge $status={stayData.booking_status?.toLowerCase() || 'pending'}>
                      {stayData.booking_status === 'cancellation_requested' ? 'Cancellation Pending' : (stayData.booking_status || 'Pending')}
                    </StatusBadge>
                  </div>

                  {stayData.booking_status === 'cancelled' && stayData.cancellation_reason && (
                    <ErrorMsg style={{ background: 'rgba(239, 68, 68, 0.05)', marginBottom: '2rem' }}>
                      <FaExclamationTriangle /> <strong>Reason:</strong> {stayData.cancellation_reason}
                    </ErrorMsg>
                  )}

                  <DetailItem>
                    <span className="label"><FaUser /> Guest Name</span>
                    <span className="value">{stayData.guest_name}</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaCalendarAlt /> Check-in</span>
                    <span className="value">{new Date(stayData.check_in).toLocaleDateString()}</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaCalendarAlt /> Check-out</span>
                    <span className="value">{new Date(stayData.check_out).toLocaleDateString()}</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaBed /> Rooms</span>
                    <span className="value">
                      {stayData.room_numbers
                        ? stayData.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                        : 'N/A'}
                    </span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaPhone /> Contact</span>
                    <span className="value">{stayData.guest_phone}</span>
                  </DetailItem>

                  <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Playfair Display', fontSize: '1.2rem' }}>
                      <FaFileInvoiceDollar /> Billing & Payments
                    </h4>
                    <DetailItem>
                      <span className="label">Payment Status</span>
                      <span className="value" style={{ textTransform: 'capitalize', color: '#ffffff' }}>
                        {stayData.payment_details?.status || 'Unpaid'}
                      </span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Total Rent</span>
                      <span className="value">₹{stayData.payment_details?.amount || 0}</span>
                    </DetailItem>
                    <DetailItem>
                      <span className="label">Amount Paid</span>
                      <span className="value">₹{stayData.payment_details?.amount_paid || 0}</span>
                    </DetailItem>
                    {stayData.payment_details?.billing_numbers && stayData.payment_details.billing_numbers.length > 0 && (
                      <DetailItem>
                        <span className="label">Bills</span>
                        <span className="value" style={{ fontSize: '0.9rem' }}>
                          {stayData.payment_details.billing_numbers.join(', ')}
                        </span>
                      </DetailItem>
                    )}
                  </div>

                  {/* Payment History */}
                  {stayData.bills && stayData.bills.length > 0 && (
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <h4 style={{ color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Playfair Display', fontSize: '1.2rem' }}>
                        <FaFileInvoiceDollar /> Transactions
                      </h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                              <th style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.5)' }}>Date</th>
                              <th style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.5)' }}>Method / ID</th>
                              <th style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stayData.bills.map((bill, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem 0' }}>
                                  {new Date(bill.date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '0.75rem 0' }}>
                                  <div style={{ fontWeight: 'bold' }}>{bill.payment_type?.toUpperCase()}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{bill.transaction_id || bill.billing_no}</div>
                                </td>
                                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 'bold', color: '#ffffff' }}>
                                  ₹{bill.amount_paid}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
                    {stayNeedsPayment() && (
                      <SubmitButton
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStayPayment}
                        disabled={stayLoading}
                      >
                        Pay Balance (₹{getStayBalance()})
                      </SubmitButton>
                    )}

                    {canCancelStay() && (
                      <ActionButton
                        style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleStayCancel}
                        disabled={stayLoading || stayData.booking_status === 'cancellation_requested'}
                      >
                        {stayData.booking_status === 'cancellation_requested' ? 'Cancellation Pending' : 'Cancel Stay Booking'}
                      </ActionButton>
                    )}

                    <ActionButton
                      onClick={() => setStayData(null)}
                    >
                      Search Another Booking
                    </ActionButton>
                  </div>
                </DetailsWrapper>
              )}
            </div>
          )}

          {/* EVENT TRACKING FLOW */}
          {activeTab === 'event' && (
            <div>
              <AnimatePresence mode="wait">
                {eventError && (
                  <ErrorMsg
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FaInfoCircle /> {eventError}
                  </ErrorMsg>
                )}
              </AnimatePresence>

              {!eventData ? (
                <Form onSubmit={handleEventSearch}>
                  <FormGroup>
                    <Label>Event Booking ID</Label>
                    <Input
                      type="text"
                      placeholder="e.g. EVT-XXXX"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value.toUpperCase())}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Registered Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={eventPhone}
                      onChange={(e) => setEventPhone(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <SubmitButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={eventLoading}
                  >
                    {eventLoading ? "Searching..." : <><FaSearch /> Find Event Booking</>}
                  </SubmitButton>
                </Form>
              ) : (
                <DetailsWrapper
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem' }}>Event Details</h3>
                    <StatusBadge $status={eventData.status?.toLowerCase() || 'pending'}>
                      {eventData.status}
                    </StatusBadge>
                  </div>

                  <DetailItem>
                    <span className="label"><FaHotel /> Event Type</span>
                    <span className="value">{eventData.event_type}</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaCalendarAlt /> Event Date</span>
                    <span className="value">
                      {new Date(eventData.event_date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaUsers /> Guest Capacity</span>
                    <span className="value">{eventData.number_of_guests} Guests</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaUser /> Contact Person</span>
                    <span className="value">{eventData.name}</span>
                  </DetailItem>
                  <DetailItem>
                    <span className="label"><FaPhone /> Phone</span>
                    <span className="value">{eventData.phone}</span>
                  </DetailItem>

                  {eventData.message && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffffff', fontWeight: 'bold' }}>Additional Details</span>
                      <p style={{ marginTop: '0.5rem', color: '#fff', opacity: 0.9, fontSize: '0.95rem', fontStyle: 'italic' }}>
                        "{eventData.message}"
                      </p>
                    </div>
                  )}

                  {/* Hidden Confirmation Card for PDF Export */}
                  <div style={{ display: 'none' }}>
                    <ConfirmationCard ref={eventPdfRef}>
                      <CardHeader>
                        <CardBrand><FaHotel /> TravellersInn</CardBrand>
                        <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>EVENT BOOKING STATUS</h3>
                      </CardHeader>
                      <PrintableDetail><span>Booking ID</span><span>{eventData.booking_id}</span></PrintableDetail>
                      <PrintableDetail><span>Event Type</span><span>{eventData.event_type}</span></PrintableDetail>
                      <PrintableDetail><span>Status</span><span style={{ color: '#5a3078' }}>{eventData.status?.toUpperCase()}</span></PrintableDetail>
                      <PrintableDetail><span>Event Date</span><span>{new Date(eventData.event_date).toLocaleDateString()}</span></PrintableDetail>
                      <PrintableDetail><span>Expected Guests</span><span>{eventData.number_of_guests}</span></PrintableDetail>
                      <PrintableDetail><span>Guest Name</span><span>{eventData.name}</span></PrintableDetail>
                      <PrintableDetail><span>Contact</span><span>{eventData.phone}</span></PrintableDetail>
                      <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
                        Thank you for choosing TravellersInn.
                      </div>
                    </ConfirmationCard>
                  </div>

                  <ActionButtons>
                    <ActionButton $primary onClick={handleDownloadEventPDF}>
                      <FaDownload /> Download PDF
                    </ActionButton>
                    <ActionButton onClick={handleShareEvent}>
                      <FaShareAlt /> Share Status
                    </ActionButton>
                  </ActionButtons>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <ActionButton onClick={() => setEventData(null)}>
                      Search Another Event
                    </ActionButton>
                  </div>
                </DetailsWrapper>
              )}
            </div>
          )}
        </TrackingCard>
      </Container>
    </PageWrapper>
  );
};

export default TrackStayAndEvent;
