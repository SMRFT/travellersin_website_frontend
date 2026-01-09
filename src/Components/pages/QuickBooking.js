import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaHotel, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaUsers, FaBed, FaWifi, FaCoffee, FaPlus, FaClock, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { getRooms, checkRoomAvailability } from '../services/roomService';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MultiStepCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  width: 100%;
  max-width: 1000px;
  padding: 3rem;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const Step = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#0f0f1a' : 'rgba(255, 255, 255, 0.5)'};
  font-weight: 700;
  border: 2px solid ${props => props.$completed ? '#d4af37' : 'transparent'};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  color: #d4af37;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem;
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
`;

const Select = styled.select`
  width: 100%;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoomCard = styled(motion.div)`
  padding: 1.5rem;
  background: ${props => props.$selected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$selected ? '#d4af37' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #d4af37;
    transform: translateY(-5px);
  }
`;

const AddonCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: ${props => props.$selected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$selected ? '#d4af37' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  .icon { color: ${props => props.$selected ? '#d4af37' : 'rgba(255, 255, 255, 0.4)'}; font-size: 1.2rem; }
  .info {
    flex: 1;
    .name { color: #fff; font-size: 0.95rem; font-weight: 500; }
    .price { color: rgba(255, 255, 255, 0.4); font-size: 0.8rem; }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
`;

const Button = styled(motion.button)`
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
    color: #0f0f1a;
    border: none;
    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
  ` : `
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const addonsList = [
    { id: 'breakfast', name: 'Breakfast', price: 500, icon: <FaCoffee />, perGuest: true },
    { id: 'wifi', name: 'Premium WiFi', price: 200, icon: <FaWifi />, perGuest: false },
    { id: 'extrabed', name: 'Extra Bed', price: 1000, icon: <FaPlus />, perGuest: false },
    { id: 'latecheckout', name: 'Late Checkout', price: 500, icon: <FaClock />, perGuest: false },
];

const QuickBooking = () => {
    const navigate = useNavigate();
    const { user, openLoginModal } = useAuth();
    const [step, setStep] = useState(1);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        checkInTime: '12:00',
        checkOutTime: '10:00',
        selectedRooms: [],
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        idProofType: 'Aadhar Card',
        idProofNumber: '',
        selectedAddons: []
    });

    const [availability, setAvailability] = useState({
        loading: false,
        conflicts: [],
        checked: false
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleNext = async () => {
        if (step === 1) {
            setAvailability(prev => ({ ...prev, loading: true }));
            try {
                const roomNumbers = rooms.map(r => r.room_number).join(',');
                const res = await checkRoomAvailability(
                    roomNumbers,
                    `${formData.checkIn}T${formData.checkInTime}:00Z`,
                    `${formData.checkOut}T${formData.checkOutTime}:00Z`
                );
                setAvailability({
                    loading: false,
                    conflicts: res.conflicts || [],
                    checked: true
                });
                setStep(prev => prev + 1);
            } catch (err) {
                console.error("Availability check failed:", err);
                setAvailability(prev => ({ ...prev, loading: false }));
                alert("Could not verify availability. Please try again.");
            }
        } else {
            setStep(prev => prev + 1);
        }
    };
    const handleBack = () => setStep(prev => prev - 1);

    const toggleRoom = (roomNumber) => {
        setFormData(prev => ({
            ...prev,
            selectedRooms: prev.selectedRooms.includes(roomNumber)
                ? prev.selectedRooms.filter(r => r !== roomNumber)
                : [...prev.selectedRooms, roomNumber]
        }));
    };

    const toggleAddon = (id) => {
        setFormData(prev => ({
            ...prev,
            selectedAddons: prev.selectedAddons.includes(id)
                ? prev.selectedAddons.filter(a => a !== id)
                : [...prev.selectedAddons, id]
        }));
    };

    const calculateTotalPrice = () => {
        const selectedRoomsData = rooms.filter(r => formData.selectedRooms.includes(r.room_number));
        const roomTotal = selectedRoomsData.reduce((acc, curr) => acc + parseFloat(curr.price), 0);

        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));

        let total = roomTotal * nights;

        // Addons
        const addonsTotal = formData.selectedAddons.reduce((acc, addonId) => {
            const addon = addonsList.find(a => a.id === addonId);
            if (addon.perGuest) {
                return acc + (addon.price * formData.guests * nights);
            }
            return acc + (addon.price * nights); // Apply per night if applicable
        }, 0);

        return total + addonsTotal;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalBookingDetails = {
            ...formData,
            fullName: user ? user.name : formData.guestName,
            email: user ? user.email : formData.guestEmail,
            phone: user ? user.phone : formData.guestPhone,
            customerId: user ? user.customer_id : null,
            roomNumbers: formData.selectedRooms,
            extra_addons: formData.selectedAddons.map(id => {
                const addon = addonsList.find(a => a.id === id);
                return { id: addon.id, name: addon.name, price: addon.price };
            })
        };

        if (!user && (!formData.guestName || !formData.guestPhone)) {
            alert("Please fill in your name and phone number to continue.");
            return;
        }

        navigate('/payment', {
            state: {
                bookingDetails: finalBookingDetails,
                totalAmount: calculateTotalPrice()
            }
        });
    };

    if (loading) return <PageWrapper><div style={{ color: '#fff' }}>Loading luxury options...</div></PageWrapper>;

    return (
        <PageWrapper>
            <MultiStepCard
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Title>Quick Booking</Title>
                <StepIndicator>
                    {[1, 2, 3, 4].map(i => (
                        <Step key={i} $active={step === i} $completed={step > i}>{i}</Step>
                    ))}
                </StepIndicator>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <Grid>
                                <FormGroup>
                                    <Label>Check-in Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.checkIn}
                                        onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Check-in Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.checkInTime}
                                        onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Check-out Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.checkOut}
                                        onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Check-out Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.checkOutTime}
                                        onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                                    />
                                </FormGroup>
                            </Grid>
                            <ButtonGroup>
                                <div />
                                <Button $primary onClick={handleNext} disabled={!formData.checkIn || !formData.checkOut || availability.loading}>
                                    {availability.loading ? 'Searching Rooms...' : 'Select Rooms'} <FaArrowRight />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <Label>Select Your Rooms</Label>
                            <Grid>
                                {rooms.filter(r => !availability.conflicts.includes(r.room_number)).map(room => (
                                    <RoomCard
                                        key={room.room_number}
                                        $selected={formData.selectedRooms.includes(room.room_number)}
                                        onClick={() => toggleRoom(room.room_number)}
                                    >
                                        <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                            {room.room_type} - {room.room_number}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                            ₹{parseFloat(room.price).toLocaleString()} / Night
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                            <FaUsers /> {room.bed_details?.capacity || 2} Pax
                                        </div>
                                    </RoomCard>
                                ))}
                            </Grid>
                            <ButtonGroup>
                                <Button onClick={handleBack}>Back</Button>
                                <Button $primary onClick={handleNext} disabled={formData.selectedRooms.length === 0}>
                                    Add-ons <FaArrowRight />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <Label>Enhance Your Stay</Label>
                            <Grid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                {addonsList.map(addon => (
                                    <AddonCard
                                        key={addon.id}
                                        $selected={formData.selectedAddons.includes(addon.id)}
                                        onClick={() => toggleAddon(addon.id)}
                                    >
                                        <div className="icon">{addon.icon}</div>
                                        <div className="info">
                                            <div className="name">{addon.name}</div>
                                            <div className="price">₹{addon.price} {addon.perGuest ? '/ guest' : '/ stay'}</div>
                                        </div>
                                    </AddonCard>
                                ))}
                            </Grid>
                            <ButtonGroup>
                                <Button onClick={handleBack}>Back</Button>
                                <Button $primary onClick={handleNext}>
                                    Guest Details <FaArrowRight />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            {!user && (
                                <Grid>
                                    <FormGroup>
                                        <Label>Full Name</Label>
                                        <Input
                                            placeholder="Enter guest name"
                                            value={formData.guestName}
                                            onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Email</Label>
                                        <Input
                                            placeholder="Enter guest email"
                                            value={formData.guestEmail}
                                            onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Phone</Label>
                                        <Input
                                            placeholder="Enter guest phone"
                                            value={formData.guestPhone}
                                            onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                </Grid>
                            )}
                            <Grid>
                                <FormGroup>
                                    <Label>ID Proof Type</Label>
                                    <Select
                                        value={formData.idProofType}
                                        onChange={e => setFormData({ ...formData, idProofType: e.target.value })}
                                    >
                                        <option value="Aadhar Card">Aadhar Card</option>
                                        <option value="PAN Card">PAN Card</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Driving License">Driving License</option>
                                        <option value="Voter ID">Voter ID</option>
                                        <option value="Government ID">Government ID</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>ID Proof Number</Label>
                                    <Input
                                        placeholder="Enter ID Number"
                                        value={formData.idProofNumber}
                                        onChange={e => setFormData({ ...formData, idProofNumber: e.target.value })}
                                    />
                                </FormGroup>
                            </Grid>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '16px' }}>
                                <div style={{ color: '#d4af37', fontWeight: 600 }}>Final Summary:</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', color: '#fff' }}>
                                    <span>Selected Rooms:</span>
                                    <span>{formData.selectedRooms.join(', ')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#fff' }}>
                                    <span>Nights:</span>
                                    <span>{Math.max(1, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)))}</span>
                                </div>
                                <div style={{ color: '#d4af37', fontSize: '1.8rem', fontWeight: 700, marginTop: '1.5rem', textAlign: 'right' }}>
                                    Total: ₹{calculateTotalPrice().toLocaleString()}
                                </div>
                            </div>

                            <ButtonGroup>
                                <Button onClick={handleBack}>Back</Button>
                                <Button $primary onClick={handleSubmit}>
                                    Book Now <FaCheckCircle />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}
                </AnimatePresence>
            </MultiStepCard>
        </PageWrapper>
    );
};

export default QuickBooking;
