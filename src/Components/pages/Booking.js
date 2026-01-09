import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUserFriends, FaHotel, FaArrowRight, FaCheckCircle, FaIdCard, FaCoffee, FaWifi, FaPlus, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { getRoomById, checkRoomAvailability } from '../services/roomService';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BookingCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  padding: 3rem;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const FormSection = styled.div`
  padding: 3rem;
`;

const Badge = styled.span`
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  display: inline-block;
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: #d4af37;
    font-size: 1.2rem;
  }
`;

const PriceTag = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
  }

  .amount {
    color: #fff;
    font-size: 2.2rem;
    font-weight: 700;
    font-family: 'Playfair Display', serif;
    margin-top: 0.5rem;
    span {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.4);
      margin-left: 0.5rem;
    }
  }
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  padding-left: 0.5rem;
`;

const Input = styled.input`
  padding: 1.1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  option {
    background-color: #1a1a2e;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0f0f1a;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
`;

const AddonsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AddonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const AddonCard = styled.div`
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  svg {
    color: ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.3)'};
  }

  .info {
    display: flex;
    flex-direction: column;
    .name { color: #fff; font-size: 0.85rem; font-weight: 500; }
    .price { color: rgba(255, 255, 255, 0.4); font-size: 0.75rem; }
  }
`;

const AvailabilityBanner = styled(motion.div)`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  background: ${props => props.$available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.$available ? '#10b981' : '#ef4444'};
  border: 1px solid ${props => props.$available ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const addonsList = [
  { id: 'breakfast', name: 'Breakfast', price: 500, icon: <FaCoffee />, perGuest: true },
  { id: 'wifi', name: 'Premium WiFi', price: 200, icon: <FaWifi />, perGuest: false },
  { id: 'extrabed', name: 'Extra Bed', price: 1000, icon: <FaPlus />, perGuest: false },
  { id: 'latecheckout', name: 'Late Checkout', price: 500, icon: <FaClock />, perGuest: false },
];

const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const [formData, setFormData] = useState({
    checkIn: '',
    checkInTime: '12:00',
    checkOut: '',
    checkOutTime: '10:00',
    guests: 1,
    idProofType: 'Aadhar Card',
    idProofNumber: '',
    numberOfRooms: 1,
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    selectedAddons: []
  });

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({ checked: false, available: true, loading: false });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await getRoomById(roomId);
        setRoom(data);
      } catch (err) {
        console.error("Failed to fetch room:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (!room) return;

    let base = room.price * (formData.numberOfRooms || 1);

    // Calculate Stay Duration
    let nights = 1;
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }

    base *= nights;

    // Calculate Addons
    const addonsTotal = formData.selectedAddons.reduce((acc, addonId) => {
      const addon = addonsList.find(a => a.id === addonId);
      if (addon.perGuest) {
        return acc + (addon.price * formData.guests * nights);
      }
      return acc + addon.price;
    }, 0);

    setTotalPrice(base + addonsTotal);
  }, [formData, room]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && room) {
      const timer = setTimeout(async () => {
        setAvailability(prev => ({ ...prev, loading: true }));
        try {
          const res = await checkRoomAvailability(
            room.room_number,
            `${formData.checkIn}T${formData.checkInTime}:00Z`,
            `${formData.checkOut}T${formData.checkOutTime}:00Z`
          );
          setAvailability({ checked: true, available: res.is_available, loading: false });
        } catch (err) {
          console.error("Availability check failed:", err);
          setAvailability({ checked: false, available: true, loading: false });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.checkIn, formData.checkOut, formData.checkInTime, formData.checkOutTime, room]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAddon = (id) => {
    setFormData(prev => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(id)
        ? prev.selectedAddons.filter(a => a !== id)
        : [...prev.selectedAddons, id]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!room) return;

    const finalBookingDetails = {
      ...formData,
      fullName: user ? user.name : formData.guestName,
      email: user ? user.email : formData.guestEmail,
      phone: user ? user.phone : formData.guestPhone,
      customerId: user ? user.customer_id : null,
      room_numbers: [room.room_number],
      idProofFile: formData.idProofNumber // Using number as representative for now
    };

    // Pass data to Payment page
    navigate('/payment', {
      state: {
        bookingDetails: {
          ...finalBookingDetails,
          extra_addons: formData.selectedAddons.map(id => {
            const addon = addonsList.find(a => a.id === id);
            return { id: addon.id, name: addon.name, price: addon.price };
          })
        },
        roomId: room.room_number,
        totalAmount: totalPrice
      }
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ color: '#fff', fontSize: '1.5rem', fontFamily: 'Playfair Display' }}>
          Loading your luxury space...
        </div>
      </PageWrapper>
    );
  }

  if (!room) {
    return (
      <PageWrapper>
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Room Not Found</h2>
          <SubmitButton onClick={() => navigate('/rooms')}>Back to Rooms</SubmitButton>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BookingCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <InfoSection>
          <Badge>Reservation</Badge>
          <Title>Secure Your Luxury Escape</Title>

          <RoomDetails>
            <DetailItem>
              <FaHotel />
              <span>{room.room_type} - Room {room.room_number}</span>
            </DetailItem>
            <DetailItem>
              <FaUserFriends />
              <span>Up to {room.bed_details?.capacity || formData.guests * 2} Guests</span>
            </DetailItem>
            <DetailItem>
              <FaCheckCircle />
              <span>{room.amenities?.slice(0, 3).join(', ') || 'Complimentary Breakfast Included'}</span>
            </DetailItem>
          </RoomDetails>

          <PriceTag>
            <div className="label">Total Price</div>
            <div className="amount">₹{totalPrice.toLocaleString()}<span>/ stay</span></div>
          </PriceTag>
        </InfoSection>

        <FormSection>
          <Form onSubmit={handleSubmit}>
            {availability.checked && (
              <AvailabilityBanner $available={availability.available}>
                {availability.available ? (
                  <>
                    <FaCheckCircle />
                    <span>Room is available for your dates!</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle />
                    <span>Room is already booked for these dates.</span>
                  </>
                )}
              </AvailabilityBanner>
            )}
            {!user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <FormGroup>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </FormGroup>
                <Grid>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      name="guestPhone"
                      value={formData.guestPhone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      name="guestEmail"
                      value={formData.guestEmail}
                      onChange={handleChange}
                      placeholder="Email address"
                    />
                  </FormGroup>
                </Grid>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
              </motion.div>
            )}
            <Grid>
              <FormGroup>
                <Label>Check-In Date</Label>
                <Input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Check-In Time</Label>
                <Input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Grid>

            <Grid>
              <FormGroup>
                <Label>Check-Out Date</Label>
                <Input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Check-Out Time</Label>
                <Input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Grid>

            <Grid>
              <FormGroup>
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  name="guests"
                  min="1"
                  max="4"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Number of Rooms</Label>
                <Input
                  type="number"
                  name="numberOfRooms"
                  min="1"
                  max="2"
                  value={formData.numberOfRooms}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Grid>

            <FormGroup>
              <Label>ID Proof Type</Label>
              <Input
                as="select"
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                style={{ appearance: 'none' }}
              >
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Government ID">Government ID</option>
              </Input>
            </FormGroup>

            <FormGroup>
              <Label>ID Proof Number</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  name="idProofNumber"
                  placeholder="Enter your ID number"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%' }}
                />
                <FaIdCard style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(212, 175, 55, 0.5)'
                }} />
              </div>
            </FormGroup>

            <AddonsSection>
              <Label>Enhance Your Stay (Optional)</Label>
              <AddonGrid>
                {addonsList.map(addon => (
                  <AddonCard
                    key={addon.id}
                    $active={formData.selectedAddons.includes(addon.id)}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    {addon.icon}
                    <div className="info">
                      <span className="name">{addon.name}</span>
                      <span className="price">₹{addon.price} {addon.perGuest ? '/ guest' : ''}</span>
                    </div>
                  </AddonCard>
                ))}
              </AddonGrid>
            </AddonsSection>

            <SubmitButton
              type="submit"
              disabled={availability.loading || (availability.checked && !availability.available)}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ opacity: (availability.loading || (availability.checked && !availability.available)) ? 0.5 : 1 }}
            >
              {availability.loading ? 'Checking Availability...' : 'Confirm Details'} <FaArrowRight />
            </SubmitButton>
          </Form>
        </FormSection>
      </BookingCard>
    </PageWrapper>
  );
};

export default Booking;