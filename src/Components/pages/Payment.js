import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { createBooking, createRazorpayOrder, verifyPayment, confirmCashBooking } from '../services/bookingService';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
`;

const Container = styled(motion.div)`
  width: 100%;
  max-width: 600px;
`;

const PaymentCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SummaryBox = styled.div`
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;

  &:last-child {
    margin-bottom: 0;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: #fff;
    font-weight: 700;
    font-size: 1.2rem;
  }
`;

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const MethodCard = styled.div`
  padding: 1.5rem;
  background: ${props => props.$active ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  position: relative;

  svg {
    font-size: 2rem;
    color: ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.4)'};
  }

  span {
    color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.5)'};
    font-weight: 500;
    font-size: 0.9rem;
  }

  ${props => props.$active && css`
    &::after {
      content: '';
      position: absolute;
      top: 12px;
      right: 12px;
      width: 18px;
      height: 18px;
      background: #d4af37;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }
  `}

  &:hover {
    border-color: ${props => props.$active ? '#d4af37' : 'rgba(212, 175, 55, 0.3)'};
    transform: translateY(-2px);
  }
`;

const PayButton = styled(motion.button)`
  width: 100%;
  padding: 1.2rem;
  background: #1E6F5C;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 15px 30px rgba(30, 111, 92, 0.3);
  margin-bottom: 1.5rem;

  &:hover {
    background: #165e4d;
    box-shadow: 0 20px 40px rgba(30, 111, 92, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
`;

const ErrorMsg = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingDetails, roomId, totalAmount } = location.state || {};

  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay Script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        room_numbers: bookingDetails.room_numbers || [roomId],
        customer_id: bookingDetails.customerId,
        guest_name: bookingDetails.fullName,
        guest_phone: bookingDetails.phone,
        guest_email: bookingDetails.email,
        number_of_guests: bookingDetails.guests,
        check_in: `${bookingDetails.checkIn}T${bookingDetails.checkInTime || '12:00'}:00Z`,
        check_out: `${bookingDetails.checkOut}T${bookingDetails.checkOutTime || '10:00'}:00Z`,
        payment_details: {
          amount: totalAmount,
          method: method === 'online' ? 'razorpay' : 'cash',
          status: method === 'online' ? 'paid' : 'pending' // if online, we only create if paid
        },
        id_proof_type: bookingDetails.idProofType,
        id_proof_file: "uploaded_id_placeholder",
        extra_addons: bookingDetails.extra_addons || []
      };

      if (method === 'online') {
        // 1. Initialize Razorpay Options DIRECTLY (Frontend Approach)
        const options = {
          key: "rzp_test_YooSlpOnNDsCoN",
          amount: totalAmount * 100, // Amount in paise
          currency: "INR",
          name: "TravellersInn",
          description: `Booking for Room ${roomId}`,
          // order_id: null, // No Order ID created on backend
          handler: async function (response) {
            console.log("Payment Success! Details:", response);

            try {
              // 2. Create Booking NOW (after payment success)
              const booking = await createBooking(bookingData);

              // 3. Verify/Link Payment (Just record it)
              await verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || "N/A",
                razorpay_signature: response.razorpay_signature || "SKIPPED",
                booking_id: booking.booking_id
              });

              navigate('/confirmation', {
                state: {
                  bookingId: booking.booking_id,
                  success: true,
                  method: 'online',
                  room_numbers: bookingData.room_numbers,
                  check_in: bookingData.check_in,
                  check_out: bookingData.check_out,
                  checkInTime: bookingDetails.checkInTime || '12:00 PM',
                  checkOutTime: bookingDetails.checkOutTime || '10:00 AM'
                }
              });
            } catch (err) {
              console.error(err);
              setError("Payment successful but booking creation failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
            }
          },
          prefill: {
            name: bookingDetails.fullName,
            email: bookingDetails.email,
            contact: bookingDetails.phone,
          },
          theme: {
            color: "#d4af37",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        // Loading stays true until either success handler or ondismiss
      } else {
        // Cash Flow - Create booking immediately
        const booking = await createBooking(bookingData);
        await confirmCashBooking(booking.booking_id);

        navigate('/confirmation', {
          state: {
            bookingId: booking.booking_id,
            success: true,
            method: 'cash',
            room_numbers: bookingData.room_numbers,
            check_in: bookingData.check_in,
            check_out: bookingData.check_out,
            checkInTime: bookingDetails.checkInTime || '12:00 PM',
            checkOutTime: bookingDetails.checkOutTime || '10:00 AM'
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to initiate booking. Please try again.");
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <PageWrapper>
        <Container>
          <ErrorMsg>Session expired. Please start the booking process again.</ErrorMsg>
          <PayButton onClick={() => navigate('/rooms')}>Back to Rooms</PayButton>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PaymentCard>
          <Title><FaCreditCard /> Payment Method</Title>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SummaryBox>
            <SummaryLine>
              <span>Room Type</span>
              <span>Premium Suite</span>
            </SummaryLine>
            <SummaryLine>
              <span>Duration</span>
              <span>1 Night</span>
            </SummaryLine>
            <SummaryLine>
              <span>Guests</span>
              <span>{bookingDetails.guests} person(s)</span>
            </SummaryLine>
            <SummaryLine>
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </SummaryLine>
          </SummaryBox>

          <MethodGrid>
            <MethodCard
              $active={method === 'online'}
              onClick={() => setMethod('online')}
            >
              <FaCreditCard />
              <span>Online Payment</span>
            </MethodCard>
            <MethodCard
              $active={method === 'cash'}
              onClick={() => setMethod('cash')}
            >
              <FaMoneyBillWave />
              <span>Pay at Hotel</span>
            </MethodCard>
          </MethodGrid>

          <PayButton
            disabled={loading}
            onClick={handleBooking}
            whileHover={{ scale: method === 'online' ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (
              method === 'online' ? 'Pay Now with Razorpay' : 'Confirm Cash Booking'
            )}
          </PayButton>

          <SecurityInfo>
            <FaShieldAlt />
            <span>Secure 256-bit SSL Encrypted Payment</span>
          </SecurityInfo>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <FaArrowLeft /> Edit Details
            </button>
          </div>
        </PaymentCard>
      </Container>
    </PageWrapper>
  );
};

export default Payment;