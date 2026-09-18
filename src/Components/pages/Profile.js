import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
  FaCog, FaBell, FaLock, FaSignOutAlt, FaEdit, FaCamera,
  FaHotel, FaClock, FaCreditCard, FaStar, FaCheck, FaTimes,
  FaHistory, FaHeart, FaGift, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { trackBooking, getUserBookings, cancelBooking, initiateBookingPayment, verifyPayment } from '../services/bookingService';
import { updateUserProfile } from '../services/authService';

/* ================= STYLED COMPONENTS ================= */

const PageWrapper = styled.div`
  background: #f9fafb;
  min-height: 100vh;
  padding-top: 90px;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TopSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

/* --- Profile Header --- */
const ProfileHeader = styled.section`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 3rem;
  background: #5a3078;
  border-radius: 24px;
  flex: 2;
  margin-bottom: 0;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;
  }
`;

const AvatarSection = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: #ffffff;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const AvatarEdit = styled.button`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: 3px solid #5a3078;
  border-radius: 10px;
  color: #5a3078;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ProfileBadges = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ActionButton = styled(motion.button)`
  padding: 0.9rem 2rem;
  background: ${props => props.$primary ? '#ffffff' : 'transparent'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#ffffff'};
  color: ${props => props.$primary ? '#5a3078' : '#ffffff'};
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

/* --- Stats Grid --- */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr; // Vertical stack
  gap: 1rem;
  flex: 1;
  min-width: 250px;
`;

const StatCard = styled(motion.div)`
  padding: 1.5rem;
  background: #5a3078;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.3rem;
  margin: 0 auto 1rem;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'Playfair Display', Georgia, serif;
  color: #fff;
  margin-bottom: 0.3rem;
`;

const StatLabel = styled.div`
  color: #ffffff;
  font-size: 0.85rem;
`;

/* --- Content Grid --- */
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* --- Sidebar Navigation --- */
const Sidebar = styled.div`
  background: #5a3078;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);
  border-radius: 20px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 110px;

  @media (max-width: 1024px) {
    position: static;
  }
`;

const SidebarTitle = styled.h3`
  color: #ffffff;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  padding: 0 1rem;
`;

const NavItem = styled.button`
  width: 100%;
  padding: 1rem 1.2rem;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  margin-bottom: 0.3rem;
  position: relative;

  ${props => props.$active && css`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: #ffffff;
      border-radius: 3px;
    }
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const LogoutButton = styled(NavItem)`
  color: #ffffff;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const NavLogoutButton = styled(LogoutButton)`
  margin-top: 1rem;
`;

/* --- Main Content --- */
const MainContent = styled.div``;

const ContentCard = styled(motion.div)`
  background: #5a3078;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CardTitle = styled.h2`
  color: #fff;
  font-size: 1.3rem;
  font-family: 'Playfair Display', Georgia, serif;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  svg {
    color: #ffffff;
  }
`;

/* --- Personal Info Form --- */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div``;

const FormLabel = styled.label`
  display: block;
  color: #ffffff;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* --- Booking History --- */
const BookingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BookingCard = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const BookingImage = styled.div`
  width: 120px;
  height: 90px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 2rem;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    height: 100px;
  }
`;

const BookingInfo = styled.div`
  flex: 1;
`;

const BookingTitle = styled.h4`
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const BookingMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: #ffffff;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    svg {
      color: #ffffff;
    }
  }
`;

const BookingStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const BookingActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const SmallButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${props => props.$primary ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'};
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  color: ${props => props.$primary ? '#5a3078' : '#ffffff'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

/* --- Empty State --- */
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.9);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h3`
  color: #ffffff;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

const EmptyButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 2rem;
  background: #ffffff;
  color: #5a3078;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

/* ================= COMPONENT ================= */

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #5a3078;
  border-radius: 32px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 3rem;
  box-shadow: 0 15px 40px rgba(193, 128, 210, 0.15);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    transform: rotate(90deg);
  }
`;

const DetailGroup = styled.div`
  margin-bottom: 2rem;
`;

const DetailLabel = styled.h4`
  color: #ffffff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const DetailValue = styled.div`
  color: #fff;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 1.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
`;

const Profile = () => {
  const { user, logout, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  // Initial user state from Context
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    dob: '',
    customer_id: user?.customer_id || ''
  });

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone,
        customer_id: user.customer_id
      }));
    }
  }, [user, loading, navigate]);

  // Real booking history from backend
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    if (!user || (!user.customer_id && !user.id)) return;

    // Fallback: create ID if missing? No, user must be valid.
    const customerId = user.customer_id || user.id;

    setBookingsLoading(true);
    try {
      const data = await getUserBookings(customerId);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt("Please enter the reason for cancellation:");
    if (reason === null) return;

    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId, reason);
      await fetchBookings();
      alert("Booking cancelled successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Cancellation failed.");
    }
  };

  const handlePayNow = async (booking) => {
    // Redirect to Track Booking page for payment
    navigate(`/track-booking?id=${booking.booking_id}&phone=${booking.guest_phone}`);
  };

  const canCancel = (booking) => {
    if (!booking || ['cancelled', 'cancellation_requested'].includes(booking.booking_status)) return false;
    const createdAt = new Date(booking.created_at);
    const now = new Date();
    // Allow cancellation if within 24 hours of booking creation
    return (now - createdAt) / (1000 * 60 * 60) <= 24;
  };

  const needsPayment = (booking) => {
    if (!booking || booking.booking_status === 'cancelled') return false;
    return booking.payment_details?.status === 'unpaid';
  };

  const navItems = [
    { id: 'personal', label: 'Personal Info', icon: <FaUser /> },
    { id: 'bookings', label: 'My Bookings', icon: <FaHotel /> },
    // { id: 'favorites', label: 'Favorites', icon: <FaHeart /> },
    // { id: 'rewards', label: 'Rewards', icon: <FaGift /> },
    // { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    // { id: 'security', label: 'Security', icon: <FaLock /> },
    // { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      // Basic validation
      if (!userData.name || !userData.phone) {
        alert("Name and Phone Number are required.");
        return;
      }

      const res = await updateUserProfile(userData);
      if (res && res.user) {
        updateUser(res.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update profile.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          // ... rest of the component
          // We need to inject handleSaveChanges into the button onClick
          // Since we are replacing a chunk, we look for the CardHeader and ActionButton
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <CardTitle><FaUser /> Personal Information</CardTitle>
              <ActionButton
                $primary={isEditing}
                onClick={() => {
                  if (isEditing) {
                    handleSaveChanges();
                  } else {
                    setIsEditing(true);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isEditing ? <><FaCheck /> Save Changes</> : <><FaEdit /> Edit Profile</>}
              </ActionButton>
            </CardHeader>

            <FormGrid>
              <FormGroup>
                <FormLabel>Full Name</FormLabel>
                <FormInput
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Email Address</FormLabel>
                <FormInput
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Phone Number</FormLabel>
                <FormInput
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Date of Birth</FormLabel>
                <FormInput
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </FormGroup>
              <FormGroup style={{ gridColumn: '1 / -1' }}>
                <FormLabel>Address</FormLabel>
                <FormInput
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </FormGroup>
            </FormGrid>
          </ContentCard>
        );

      case 'bookings':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <CardTitle><FaHistory /> Booking History</CardTitle>
            </CardHeader>

            <BookingList>
              {bookingsLoading ? (
                <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>Loading your bookings...</div>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <BookingCard key={booking.booking_id}>
                    <BookingImage>
                      <FaHotel />
                    </BookingImage>
                    <BookingInfo>
                      <BookingTitle>
                        Room(s): {
                          booking.room_numbers
                            ? (Array.isArray(booking.room_numbers)
                              ? booking.room_numbers.join(', ')
                              : booking.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', '))
                            : 'N/A'
                        }
                      </BookingTitle>
                      <BookingMeta>
                        <span><FaCalendarAlt /> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                        <span><FaUser /> {booking.number_of_guests} Guests</span>
                        <span>
                          <FaCreditCard />
                          {booking.discount_amount > 0 ? (
                            <>
                              <span style={{ textDecoration: 'line-through', opacity: 0.7, marginRight: '5px' }}>₹{booking.payment_details?.amount}</span>
                              <span style={{ color: '#ffffff' }}>₹{(booking.payment_details?.amount - booking.discount_amount).toLocaleString()}</span>
                            </>
                          ) : (
                            `₹${booking.payment_details?.amount?.toLocaleString()}`
                          )}
                          ({booking.payment_details?.method})
                        </span>
                      </BookingMeta>
                      <BookingStatus $status={booking.booking_status}>
                        {booking.booking_status === 'confirmed' && <FaCheck />}
                        {['pending', 'cancellation_requested'].includes(booking.booking_status) && <FaClock />}
                        {booking.booking_status === 'completed' && <FaStar />}
                        {booking.booking_status === 'cancelled' && <FaTimes />}
                        {booking.booking_status === 'cancellation_requested' ? 'Pending Cancel' : (booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1))}
                      </BookingStatus>
                    </BookingInfo>
                    <BookingActions>
                      {needsPayment(booking) && (
                        <SmallButton
                          $primary
                          onClick={() => handlePayNow(booking)}
                          style={{ background: '#ffffff', color: '#5a3078' }}
                        >
                          Pay Now
                        </SmallButton>
                      )}
                      {canCancel(booking) && (
                        <SmallButton
                          onClick={() => handleCancelBooking(booking.booking_id)}
                          style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        >
                          Cancel
                        </SmallButton>
                      )}
                      <SmallButton onClick={() => setSelectedBooking(booking)}>Details</SmallButton>
                    </BookingActions>
                  </BookingCard>
                ))
              ) : (
                <EmptyState>
                  <EmptyIcon><FaHotel /></EmptyIcon>
                  <EmptyTitle>No bookings yet</EmptyTitle>
                  <EmptyText>You haven't made any reservations yet.</EmptyText>
                  <EmptyButton as={Link} to="/rooms">Book Now</EmptyButton>
                </EmptyState>
              )}
            </BookingList>
          </ContentCard>
        );

      case 'favorites':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <CardTitle><FaHeart /> Favorite Rooms</CardTitle>
            </CardHeader>

            <EmptyState>
              <EmptyIcon><FaHeart /></EmptyIcon>
              <EmptyTitle>No favorites yet</EmptyTitle>
              <EmptyText>Start exploring our rooms and save your favorites!</EmptyText>
              <EmptyButton to="/rooms">
                Browse Rooms
              </EmptyButton>
            </EmptyState>
          </ContentCard>
        );

      case 'rewards':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <CardTitle><FaGift /> My Rewards</CardTitle>
            </CardHeader>

            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                fontSize: '4rem',
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                1,250
              </div>
              <div style={{ color: '#ffffff', marginBottom: '2rem' }}>
                Reward Points
              </div>
              <Badge $gold>Gold Member</Badge>
            </div>
          </ContentCard>
        );

      default:
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <CardTitle><FaCog /> {navItems.find(n => n.id === activeTab)?.label}</CardTitle>
            </CardHeader>
            <EmptyState>
              <EmptyIcon><FaCog /></EmptyIcon>
              <EmptyTitle>Coming Soon</EmptyTitle>
              <EmptyText>This feature is under development.</EmptyText>
            </EmptyState>
          </ContentCard>
        );
    }
  };

  return (
    <PageWrapper>
      <Container>
        <TopSection>
          {/* Profile Header */}
          <ProfileHeader>
            <AvatarSection>
              <Avatar>
                <FaUser />
              </Avatar>
              <AvatarEdit>
                <FaCamera />
              </AvatarEdit>
            </AvatarSection>

            <ProfileInfo>
              <ProfileName>{userData.name}</ProfileName>
              <ProfileEmail>{userData.email}</ProfileEmail>
              <ProfileBadges>
                <Badge><FaCheck /> Verified</Badge>
              </ProfileBadges>
            </ProfileInfo>

            <ProfileActions>
              <ActionButton
                $primary
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                as={Link}
                to="/rooms"
              >
                <FaHotel /> Book a Room
              </ActionButton>
            </ProfileActions>
          </ProfileHeader>

          {/* Stats Grid */}
          <StatsGrid>
            <StatCard whileHover={{ scale: 1.02 }}>
              <StatIcon><FaHotel /></StatIcon>
              <StatValue>12</StatValue>
              <StatLabel>Total Stays</StatLabel>
            </StatCard>
            <StatCard whileHover={{ scale: 1.02 }}>
              <StatIcon><FaClock /></StatIcon>
              <StatValue>24</StatValue>
              <StatLabel>Nights Stayed</StatLabel>
            </StatCard>
          </StatsGrid>
        </TopSection>

        {/* Content Grid */}
        <ContentGrid>
          {/* Sidebar */}
          <Sidebar>
            <SidebarTitle>Account</SidebarTitle>
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                $active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {item.label}
              </NavItem>
            ))}
            <LogoutButton>
              <FaSignOutAlt />
              Sign Out
            </LogoutButton>
          </Sidebar>

          {/* Main Content */}
          <MainContent>
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </MainContent>
        </ContentGrid>
        {/* Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
            >
              <ModalContent
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <CloseButton onClick={() => setSelectedBooking(null)}>
                  <FaTimes />
                </CloseButton>

                <h2 style={{ fontFamily: 'Playfair Display', color: '#fff', marginBottom: '2.5rem' }}>Reservation Details</h2>

                <DetailGroup>
                  <DetailLabel><FaHistory /> Booking ID</DetailLabel>
                  <DetailValue>{selectedBooking.booking_id}</DetailValue>
                </DetailGroup>

                <DetailGroup>
                  <DetailLabel><FaHotel /> Assigned Rooms</DetailLabel>
                  <DetailValue>
                    {selectedBooking.room_numbers
                      ? selectedBooking.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                      : `Room ${selectedBooking.room_number}`}
                  </DetailValue>
                </DetailGroup>

                <DetailGroup>
                  <DetailLabel><FaCalendarAlt /> Stay Duration</DetailLabel>
                  <DetailValue>
                    {new Date(selectedBooking.check_in).toLocaleDateString()} - {new Date(selectedBooking.check_out).toLocaleDateString()}
                  </DetailValue>
                </DetailGroup>

                <DetailGroup>
                  <DetailLabel><FaCreditCard /> Payment Information</DetailLabel>
                  <DetailValue>
                    <div>Total Amount: ₹{selectedBooking.payment_details?.amount?.toLocaleString()}</div>
                    <div style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '0.5rem' }}>
                      Method: {selectedBooking.payment_details?.method?.toUpperCase()} | Status: {selectedBooking.payment_details?.status?.toUpperCase()}
                    </div>
                  </DetailValue>
                </DetailGroup>

                {selectedBooking.booking_status === 'cancelled' && selectedBooking.cancellation_reason && (
                  <DetailGroup>
                    <DetailLabel style={{ color: '#ffffff' }}><FaExclamationTriangle /> Cancellation Reason</DetailLabel>
                    <DetailValue style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#ffffff' }}>
                      {selectedBooking.cancellation_reason}
                    </DetailValue>
                  </DetailGroup>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {needsPayment(selectedBooking) && (
                    <ActionButton $primary style={{ flex: 1 }} onClick={() => { handlePayNow(selectedBooking); setSelectedBooking(null); }}>
                      Pay Online Now
                    </ActionButton>
                  )}
                  {canCancel(selectedBooking) && (
                    <ActionButton style={{ flex: 1, color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }} onClick={() => { handleCancelBooking(selectedBooking.booking_id); setSelectedBooking(null); }}>
                      Cancel Trip
                    </ActionButton>
                  )}
                </div>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </Container>
    </PageWrapper>
  );
};

export default Profile;