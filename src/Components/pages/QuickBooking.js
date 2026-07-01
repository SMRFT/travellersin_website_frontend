import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaHotel, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaUsers, FaBed, FaWifi, FaCoffee, FaPlus, FaClock, FaIdCard, FaUpload, FaSpinner } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, isWithinInterval, parseISO, startOfToday, format } from 'date-fns';
import { useAuth } from '../auth/AuthContext';
import { getRooms, checkRoomAvailability, getRoomBookings } from '../services/roomService';
import api from '../services/api';

const PageWrapper = styled.div`
  background: #F3EEF1;
  min-height: 100vh;
  padding: 120px 2rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 100px 1rem 2rem;
  }
`;

const MultiStepCard = styled(motion.div)`
  background: #5a3078;
  border-radius: 32px;
  width: 100%;
  max-width: 1000px;
  padding: 3rem;
  box-shadow: 0 20px 50px rgba(193, 128, 210, 0.15);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
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
  background: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'};
  color: ${props => props.$active ? '#5a3078' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 700;
  border: 2px solid ${props => props.$completed ? '#ffffff' : 'transparent'};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
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
    border-color: #ffffff;
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
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  option {
    background: #5a3078;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoomCard = styled(motion.div)`
  padding: 1.5rem;
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$selected ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ffffff;
    transform: translateY(-5px);
  }
`;

const AddonCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$selected ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  .icon { color: ${props => props.$selected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}; font-size: 1.2rem; }
  .info {
    flex: 1;
    .name { color: #fff; font-size: 0.95rem; font-weight: 500; }
    .price { color: rgba(255, 255, 255, 0.85); font-size: 0.8rem; }
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
    background: #ffffff;
    color: #5a3078;
    border: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-2px);
    }
  ` : `
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DatePickerStyles = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    width: 100%;
  }
  
  .react-datepicker {
    background-color: #5a3078;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-family: inherit;
    color: #fff;
  }

  .react-datepicker__header {
    background-color: #5a3078;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .react-datepicker__current-month, .react-datepicker__day-name {
    color: #ffffff;
  }

  .react-datepicker__day {
    color: #fff;
    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }

  .react-datepicker__day--disabled {
    color: rgba(255, 255, 255, 0.2);
  }

  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
    background-color: #ffffff;
    color: #5a3078;
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
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
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
        idProofFile: '',
        selectedAddons: []
    });

    const [uploading, setUploading] = useState(false);

    const [availability, setAvailability] = useState({
        loading: false,
        conflicts: [],
        checked: false
    });

    const [bookedDates, setBookedDates] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                const activeRooms = data.filter(r => r.status !== 'inactive');
                setRooms(activeRooms);
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
            // Date Selection Step
            if (!formData.checkIn || !formData.checkOut) {
                showToast("Please select check-in and check-out dates.", "error");
                return;
            }

            setAvailability(prev => ({ ...prev, loading: true }));
            try {
                // Get all room numbers to check availability for all of them
                const allRoomNumbers = rooms.map(r => r.room_number).join(',');
                if (!allRoomNumbers) {
                    showToast("No rooms found.", "error");
                    setAvailability(prev => ({ ...prev, loading: false }));
                    return;
                }

                const res = await checkRoomAvailability(
                    allRoomNumbers,
                    `${formData.checkIn}T${formData.checkInTime}:00Z`,
                    `${formData.checkOut}T${formData.checkOutTime}:00Z`
                );

                // Update conflicts in state
                setAvailability({
                    loading: false,
                    conflicts: res.conflicts || [],
                    checked: true
                });

                // Clear any selected rooms that are no longer available under the newly checked dates
                setFormData(prev => ({
                    ...prev,
                    selectedRooms: prev.selectedRooms.filter(roomNum => !(res.conflicts || []).includes(roomNum))
                }));

                setStep(prev => prev + 1);
            } catch (err) {
                console.error("Availability check failed:", err);
                setAvailability(prev => ({ ...prev, loading: false }));
                showToast("Could not verify room availability. Please try again.", "error");
            }
        } else if (step === 2) {
            // Room Selection Step
            if (formData.selectedRooms.length === 0) {
                showToast("Please select at least one room.", "error");
                return;
            }
            setStep(prev => prev + 1);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const upData = new FormData();
        upData.append('image', file);

        try {
            setUploading(true);
            const response = await api.post('/upload/room-image/', upData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, idProofFile: response.data.url }));
            showToast('ID Proof uploaded successfully!');
        } catch (err) {
            showToast('Upload failed: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalBookingDetails = {
            ...formData,
            fullName: user ? user.name : formData.guestName,
            email: user ? user.email : formData.guestEmail,
            phone: user ? user.phone : formData.guestPhone,
            customerId: user ? user.customer_id : null,
            room_numbers: formData.selectedRooms,
            id_proof_file: formData.idProofFile || 'manual_entry',
            extra_addons: formData.selectedAddons.map(id => {
                const addon = addonsList.find(a => a.id === id);
                return { id: addon.id, name: addon.name, price: addon.price };
            })
        };

        if (!user && (!formData.guestName || !formData.guestPhone)) {
            showToast("Please fill in your name and phone number to continue.", "error");
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
                                    <DatePickerStyles>
                                        <DatePicker
                                            selected={formData.checkIn ? new Date(formData.checkIn) : null}
                                            onChange={(date) => setFormData(prev => ({ ...prev, checkIn: date ? format(date, 'yyyy-MM-dd') : '' }))}
                                            selectsStart
                                            startDate={formData.checkIn ? new Date(formData.checkIn) : null}
                                            endDate={formData.checkOut ? new Date(formData.checkOut) : null}
                                            minDate={startOfToday()}
                                            placeholderText="Select Check-In Date"
                                            customInput={<Input />}
                                            dateFormat="yyyy-MM-dd"
                                            required
                                        />
                                    </DatePickerStyles>
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
                                    <DatePickerStyles>
                                        <DatePicker
                                            selected={formData.checkOut ? new Date(formData.checkOut) : null}
                                            onChange={(date) => setFormData(prev => ({ ...prev, checkOut: date ? format(date, 'yyyy-MM-dd') : '' }))}
                                            selectsEnd
                                            startDate={formData.checkIn ? new Date(formData.checkIn) : null}
                                            endDate={formData.checkOut ? new Date(formData.checkOut) : null}
                                            minDate={formData.checkIn ? addDays(new Date(formData.checkIn), 1) : startOfToday()}
                                            placeholderText="Select Check-Out Date"
                                            customInput={<Input />}
                                            dateFormat="yyyy-MM-dd"
                                            required
                                        />
                                    </DatePickerStyles>
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
                                    {availability.loading ? 'Checking Availability...' : 'Select Rooms'} <FaArrowRight />
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
                                {rooms.filter(room => !availability.conflicts.includes(room.room_number)).map(room => (
                                    <RoomCard
                                        key={room.room_number}
                                        $selected={formData.selectedRooms.includes(room.room_number)}
                                        onClick={() => toggleRoom(room.room_number)}
                                    >
                                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                            {room.room_type} - {room.room_number}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                            ₹{parseFloat(room.price).toLocaleString()} / Night
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                                            <FaUsers /> {room.bed_details?.capacity || 2} Pax
                                        </div>
                                    </RoomCard>
                                ))}
                            </Grid>
                            {rooms.filter(room => !availability.conflicts.includes(room.room_number)).length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    color: '#ffffff',
                                    padding: '3rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '24px',
                                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                                    marginBottom: '2rem'
                                }}>
                                    <FaExclamationTriangle style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f59e0b' }} />
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Playfair Display' }}>No Rooms Available</h3>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        All rooms are fully booked for the selected dates. Please go back and choose different dates.
                                    </p>
                                </div>
                            )}
                            <ButtonGroup>
                                <Button onClick={handleBack}>Back</Button>
                                <Button 
                                    $primary 
                                    onClick={handleNext} 
                                    disabled={formData.selectedRooms.length === 0 || rooms.filter(room => !availability.conflicts.includes(room.room_number)).length === 0}
                                >
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

                            <FormGroup>
                                <Label>Upload ID Proof (Image or PDF)</Label>
                                <div style={{ position: 'relative' }}>
                                    <Input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                        style={{ width: '100%', padding: '0.8rem 1.2rem' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        right: '1.2rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {uploading ? <FaSpinner className="fa-spin" style={{ color: '#ffffff' }} /> : (formData.idProofFile ? <FaCheckCircle style={{ color: '#ffffff' }} /> : <FaUpload style={{ color: 'rgba(255, 255, 255, 0.6)' }} />)}
                                    </div>
                                </div>
                                {formData.idProofFile && (
                                    <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>File uploaded successfully!</span>
                                )}
                            </FormGroup>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                                <div style={{ color: '#ffffff', fontWeight: 600 }}>Final Summary:</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', color: '#fff' }}>
                                    <span>Selected Rooms:</span>
                                    <span>{formData.selectedRooms.join(', ')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#fff' }}>
                                    <span>Nights:</span>
                                    <span>{Math.max(1, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)))}</span>
                                </div>
                                <div style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: 700, marginTop: '1.5rem', textAlign: 'right' }}>
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

            {/* Toast Notifications */}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                zIndex: 99999, pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{
                        background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .fa-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </PageWrapper>
    );
};

export default QuickBooking;
