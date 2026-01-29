import React, { useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCalendarAlt, FaHotel, FaArrowRight, FaPrint, FaShareAlt, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const GlobalPrintStyle = createGlobalStyle`
  @media print {
    body, html {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    nav, footer, .no-print, [class*="Navbar"], [class*="Footer"] {
      display: none !important;
      height: 0 !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    #root {
      padding: 0 !important;
      margin: 0 !important;
    }
    * {
      color: #000 !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }
  }
`;

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;

  @media print {
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    height: auto !important;
    min-height: auto !important;
    display: block !important;
  }
`;

const ConfirmationCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);

  @media print {
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    max-width: 100%;
    padding: 0;
    text-align: left;
    display: block;
  }

  &.exporting-pdf {
    background: #fff !important;
    color: #000 !important;
    border: none !important;
    box-shadow: none !important;
    padding: 2rem !important;
    text-align: left !important;
    
    * {
      color: #000 !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;

const PrintHeader = styled.div`
  display: none;
  @media print {
    display: block;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #d4af37;
    
    h1 {
      font-family: 'Playfair Display', serif;
      color: #d4af37 !important;
      margin: 0;
      font-size: 2.2rem;
    }
    p {
      color: #666 !important;
      margin: 5px 0 0 0;
      font-size: 0.9rem;
    }
  }

  /* Show header during PDF export capture */
  .exporting-pdf & {
    display: block;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #d4af37;
    text-align: left;
    
    h1 {
      font-family: 'Playfair Display', serif;
      color: #d4af37 !important;
      margin: 0;
      font-size: 2.2rem;
    }
    p {
      color: #666 !important;
      margin: 5px 0 0 0;
      font-size: 0.9rem;
    }
  }
`;

const SuccessIcon = styled(motion.div)`
  font-size: 5rem;
  color: #d4af37;
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.3));
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
`;

const BookingDetails = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  text-align: left;
`;

const DetailLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .label {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .value {
    color: #fff;
    font-weight: 600;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled(motion.button)`
  padding: 1rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? `
    background: #1E6F5C;
    color: #ffffff;
    border: none;
    box-shadow: 0 10px 30px rgba(30, 111, 92, 0.3);

    &:hover {
      background: #165e4d;
      box-shadow: 0 15px 40px rgba(30, 111, 92, 0.4);
      transform: translateY(-2px);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
`;

const HomeLink = styled(Link)`
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #d4af37;
  }
`;

const PolicySection = styled.div`
  margin: 1.5rem 0;
  padding: 1.2rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px dashed rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  text-align: left;

  h4 {
    color: #d4af37;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    line-height: 1.4;
  }
`;

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();
  const { bookingId, method, success } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = receiptRef.current;
    const opt = {
      margin: [0.5, 0.5],
      filename: `Booking_Receipt_${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // Temporarily add a class for clean export
    element.classList.add('exporting-pdf');
    html2pdf().from(element).set(opt).save().then(() => {
      element.classList.remove('exporting-pdf');
    });
  };

  const handleSharePDF = async () => {
    const element = receiptRef.current;
    const opt = {
      margin: [0.5, 0.5],
      filename: `Receipt_${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      element.classList.add('exporting-pdf');
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      element.classList.remove('exporting-pdf');

      const file = new File([pdfBlob], `Receipt_${bookingId}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Booking Receipt',
          text: 'My TravellersInn Booking Receipt'
        });
      } else {
        // Fallback to link share + download
        const shareText = `My TravellersInn Booking ID: ${bookingId}`;
        if (navigator.share) {
          await navigator.share({ title: 'Booking Receipt', text: shareText, url: window.location.href });
        } else {
          navigator.clipboard.writeText(shareText);
          alert('Booking ID copied. Downloading PDF...');
        }
        html2pdf().from(element).set(opt).save();
      }
    } catch (err) {
      console.error('Error sharing PDF:', err);
      html2pdf().from(element).set(opt).save(); // Fallback to download
    }
  };

  // If accessed directly without booking state
  if (!success) {
    return (
      <PageWrapper>
        <ConfirmationCard>
          <Title>Oops!</Title>
          <Subtitle>Something went wrong or the session expired.</Subtitle>
          <Button $primary onClick={() => navigate('/rooms')}>Return to Rooms</Button>
        </ConfirmationCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <GlobalPrintStyle />
      <ConfirmationCard
        ref={receiptRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PrintHeader>
          <h1>TravellersInn</h1>
          <p>Booking Receipt & Confirmation</p>
        </PrintHeader>

        <div className="no-print">
          <SuccessIcon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
          >
            <FaCheckCircle />
          </SuccessIcon>
        </div>

        <Title>Reservation Confirmed!</Title>
        <Subtitle>
          {method === 'cash'
            ? "Your request has been received. Please pay at the front desk upon arrival."
            : "Your payment was successful. We've sent the confirmation to your email."
          }
        </Subtitle>

        <BookingDetails>
          <DetailLine>
            <span className="label"><FaHotel /> Booking ID</span>
            <span className="value">{bookingId}</span>
          </DetailLine>
          <DetailLine>
            <span className="label"><FaCalendarAlt /> Status</span>
            <span className="value" style={{ color: '#10b981' }}>Confirmed</span>
          </DetailLine>
          {location.state?.check_in && (
            <DetailLine>
              <span className="label"><FaCalendarAlt /> Check-in</span>
              <span className="value">
                {new Date(location.state.check_in).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                  ({location.state?.checkInTime || '12:00 PM'})
                </span>
              </span>
            </DetailLine>
          )}
          {location.state?.check_out && (
            <DetailLine>
              <span className="label"><FaCalendarAlt /> Check-out</span>
              <span className="value">
                {new Date(location.state.check_out).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                  ({location.state?.checkOutTime || '10:00 AM'})
                </span>
              </span>
            </DetailLine>
          )}
          <DetailLine>
            <span className="label"><FaArrowRight /> Payment Method</span>
            <span className="value">{method === 'cash' ? 'Pay at Hotel' : 'Razorpay Online'}</span>
          </DetailLine>
          {location.state?.room_numbers && (
            <DetailLine>
              <span className="label"><FaHotel /> Rooms Booked</span>
              <span className="value">
                {typeof location.state.room_numbers === 'string'
                  ? location.state.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                  : (Array.isArray(location.state.room_numbers) ? location.state.room_numbers.join(', ') : location.state.room_numbers)}
              </span>
            </DetailLine>
          )}
        </BookingDetails>

        <PolicySection className="no-print">
          <h4><FaExclamationTriangle /> Cancellation Policy</h4>
          <p>
            Free cancellation is available for <strong>24 hours</strong> from the time of booking.
            You can cancel your reservation through your profile or by using the <strong>Track Stay</strong> feature
            with your Booking ID: <strong>{bookingId}</strong>.
          </p>
        </PolicySection>

        <ActionGrid className="no-print">
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
          >
            <FaDownload /> Download PDF
          </Button>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSharePDF}
          >
            <FaShareAlt /> Share PDF
          </Button>
        </ActionGrid>

        <Button
          $primary
          className="no-print"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          onClick={() => navigate('/profile')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Go to My Bookings
        </Button>

        <HomeLink to="/" className="no-print">
          Back to Homepage
        </HomeLink>
      </ConfirmationCard>
    </PageWrapper>
  );
};

export default Confirmation;