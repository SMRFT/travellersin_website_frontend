import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser, FaPhone, FaMoneyBillWave, FaEdit, FaUpload, FaSpinner, FaGoogle, FaFileExcel, FaPrint, FaFilePdf, FaEye, FaIdCard, FaImage } from 'react-icons/fa';
import * as XLSX from 'xlsx';

import api from '../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, startOfToday } from 'date-fns';

import { getRooms, checkRoomAvailability } from '../services/roomService';
import { approveCancellation, rejectCancellation } from '../services/bookingService';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const Container = styled.div`
  background: #5a3078;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(193, 128, 210, 0.15);
  border-radius: 24px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const BookingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 900px;

  th, td {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  th {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
        switch (props.$color) {
            case 'success': return 'background: rgba(16, 185, 129, 0.2); color: #10b981;';
            case 'warning': return 'background: rgba(255, 255, 255, 0.2); color: #ffffff;';
            case 'info': return 'background: rgba(59, 130, 246, 0.2); color: #3b82f6;';
            case 'error': return 'background: rgba(239, 68, 68, 0.2); color: #ef4444;';
            default: return 'background: rgba(255, 255, 255, 0.1); color: rgba(255,255,255,0.85);';
        }
    }}
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: ${props => props.$color};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  transition: transform 0.2s;

  &:hover { transform: scale(1.2); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: #431d59;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #ffffff;
`;

const PreviewModalContent = styled.div`
  background: #431d59;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 24px;
  padding: 1.5rem;
  width: 95%;
  max-width: 900px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 50px 100px rgba(0,0,0,0.3);
  color: #ffffff;
`;

const Input = styled.input`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: #fff;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
  }
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
  display: block;
`;

const DatePickerStyles = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    width: 100%;
  }
  
  .react-datepicker {
    background-color: #431d59;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-family: inherit;
    color: #fff;
    border-radius: 12px;
    overflow: hidden;
  }

  .react-datepicker__header {
    background-color: #431d59;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    padding-top: 1rem;
  }

  .react-datepicker__current-month, .react-datepicker__day-name {
    color: #ffffff;
    font-weight: 600;
  }

  .react-datepicker__day {
    color: #fff;
    border-radius: 8px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }

  .react-datepicker__day--disabled {
    color: rgba(255, 255, 255, 0.3);
  }

  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
    background-color: #ffffff !important;
    color: #431d59 !important;
    font-weight: 700;
  }

  .react-datepicker__time-container {
    border-left: 1px solid rgba(255, 255, 255, 0.25);
    background-color: #431d59;
  }

  .react-datepicker__time {
    background-color: #431d59;
    color: #fff;
  }

  .react-datepicker__time-list-item:hover {
    background-color: rgba(255, 255, 255, 0.25) !important;
  }

  .react-datepicker__time-list-item--selected {
    background-color: #ffffff !important;
    color: #431d59 !important;
  }

  .react-datepicker__navigation--next { border-left-color: #ffffff; }
  .react-datepicker__navigation--previous { border-right-color: #ffffff; }
`;

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState({ show: false, booking: null, amount: '', payment_type: 'cash', transaction_id: '' });
    const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null, reason: '', refundType: 'auto' });
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const [createModal, setCreateModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewModal, setPreviewModal] = useState({ show: false, url: '' });
    const [newBooking, setNewBooking] = useState({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        number_of_guests: 1,
        id_proof_type: 'Aadhar Card',
        id_proof_number: '',
        id_proof_file: 'manual_verified',
        room_numbers: [],
        check_in: '',
        check_out: '',
        amount: '',
        amount_paid: '',
        discount_amount: '',
        guest_address: '',
        payment_type: 'cash',
        transaction_id: '',
        extra_addons: []
    });


    const [unavailableRooms, setUnavailableRooms] = useState([]);
    const [showRoomModal, setShowRoomModal] = useState(false);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Available Rooms State
    const [availableRooms, setAvailableRooms] = useState([]);

    useEffect(() => {
        fetchBookings();
        fetchRooms();
    }, [startDate, endDate]);

    // Check availability whenever dates change in the manual booking form
    useEffect(() => {
        if (newBooking.check_in && newBooking.check_out && createModal) {
            checkAvailability();
        }
    }, [newBooking.check_in, newBooking.check_out, createModal]);

    // Auto-calculate Total Amount
    useEffect(() => {
        if (createModal && newBooking.check_in && newBooking.check_out) {
            calculateTotalAmount();
        }
    }, [newBooking.room_numbers, newBooking.check_in, newBooking.check_out, newBooking.extra_addons, createModal]);

    const calculateTotalAmount = () => {
        if (!newBooking.check_in || !newBooking.check_out) return;
        
        const start = new Date(newBooking.check_in);
        const end = new Date(newBooking.check_out);
        
        if (isNaN(start) || isNaN(end) || end <= start) {
            // If invalid dates, maybe just calculate addons if any, but usually 0 nights.
            // But let's keep it as is.
            return;
        }

        // Calculate nights
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Sum of room prices
        let roomsTotal = 0;
        if (Array.isArray(newBooking.room_numbers)) {
            newBooking.room_numbers.forEach(roomNum => {
                const room = availableRooms.find(r => r.room_number === roomNum);
                if (room) {
                    roomsTotal += parseFloat(room.price || 0);
                }
            });
        }

        // Sum of extra addons
        let addonsTotal = 0;
        if (Array.isArray(newBooking.extra_addons)) {
            newBooking.extra_addons.forEach(addon => {
                if (addon.price) {
                    addonsTotal += parseFloat(addon.price || 0);
                }
            });
        }

        const total = (roomsTotal * diffDays) + addonsTotal;
        setNewBooking(prev => ({ ...prev, amount: total.toString() }));
    };

    const checkAvailability = async () => {
        if (!newBooking.check_in || !newBooking.check_out) return;

        try {
            // Get all room numbers to check
            const allRoomNumbers = availableRooms.map(r => r.room_number);
            if (allRoomNumbers.length === 0) return;

            const response = await checkRoomAvailability(allRoomNumbers, newBooking.check_in, newBooking.check_out);
            setUnavailableRooms(response.conflicts || []);
        } catch (err) {
            console.error("Failed to check availability:", err);
        }
    };

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            setAvailableRooms(data);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get(`/bookings/?start_date=${startDate}&end_date=${endDate}`);
            setBookings(response.data);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus, extraData = {}) => {
        try {
            // Fetch current booking to merge payment details properly
            // Or we can rely on the fact that we have the 'booking' object passed via UI state if we wanted, 
            // but handleUpdateStatus is generic.

            // Wait, we call this from buttons where we might not have the full fresh booking object handy 
            // except what's in the list.
            // Let's assume we need to construct a proper payload.

            // If extraData contains amount_paid, we are doing a payment update.
            // We need to send payment_details object.

            let payload = { booking_status: newStatus };

            if (extraData.amount_paid !== undefined) {
                // Payment recording: pass through all fields from the modal
                payload.amount_paid = extraData.amount_paid;
                payload.payment_type = extraData.payment_type || extraData.method || 'cash';
                payload.method = extraData.method || extraData.payment_type || 'cash';
                payload.transaction_id = extraData.transaction_id;
                payload.payment_status = extraData.payment_status;
                
                // Pass the pre-built payment_details if provided
                if (extraData.payment_details) {
                    payload.payment_details = extraData.payment_details;
                }

                console.log("FINAL PAYLOAD TO API:", JSON.stringify(payload, null, 2));
            } else {
                // For standard status updates (cancel, confirm), just merge extraData
                payload = { ...payload, ...extraData };
            }

            // Forward cancellation reason if present
            if (extraData.cancellation_reason) payload.cancellation_reason = extraData.cancellation_reason;

            const response = await api.patch(`/admin/booking/${bookingId}/`, payload);

            if (newStatus === 'confirmed' || extraData.amount_paid) {
                if (extraData.amount_paid) {
                    const latestBill = response.data.booking.payment_details.latest_billing_no;
                    const pType = extraData.payment_type || 'cash';
                    if (latestBill) {
                        showToast(`✅ Payment recorded! ₹${extraData.amount_paid} via ${pType.toUpperCase()}`);
                        if (window.confirm("Do you want to print the bill?")) {
                            printBill(response.data.booking, latestBill, extraData.amount_paid, pType);
                        }
                    } else {
                        showToast(`✅ Payment recorded! ₹${extraData.amount_paid}`);
                    }
                } else if (newStatus === 'confirmed') {
                    showToast('✅ Booking Confirmed & WhatsApp Sent!');
                } else if (newStatus === 'cancelled') {
                    showToast('🚫 Booking Cancelled.', 'error');
                } else {
                    showToast('✅ Status Updated Successfully!');
                }
            } else {
                showToast('✅ Status Updated Successfully!');
            }

            fetchBookings();
            setPaymentModal({ show: false, booking: null, amount: '', payment_type: 'cash', transaction_id: '' });
        } catch (err) {
            showToast('❌ Update failed: ' + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleExcelExport = () => {
        const dataToExport = bookings.map(b => ({
            'Booking ID': b.booking_id,
            'Guest Name': b.guest_name,
            'Phone': b.guest_phone,
            'Email': b.guest_email || 'N/A',
            'Address': b.guest_address || 'N/A',
            'Rooms': Array.isArray(b.room_numbers) ? b.room_numbers.join(', ') : b.room_numbers,
            'Check In': b.check_in,
            'Check Out': b.check_out,
            'Total Amount': b.payment_details?.amount || 0,
            'Discount': b.discount_amount || 0,
            'Amount Paid': b.payment_details?.amount_paid || 0,
            'Balance': ((b.payment_details?.amount || 0) - (b.discount_amount || 0)) - (b.payment_details?.amount_paid || 0),
            'Status': b.booking_status,
            'Payment Status': b.payment_details?.status,
            'Booking Source': b.booking_source,
            'Created At': new Date(b.created_at).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `Bookings_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleExcelImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    showToast("No data found in Excel sheet", "error");
                    return;
                }

                if (window.confirm(`Found ${data.length} bookings. Import them?`)) {
                    setLoading(true);
                    for (const row of data) {
                        const payload = {
                            guest_name: row['Guest Name'] || row['name'],
                            guest_phone: row['Phone'] || row['phone'],
                            guest_email: row['Email'] || row['email'] || null,
                            guest_address: row['Address'] || row['address'] || '',
                            number_of_guests: parseInt(row['Guests'] || row['number_of_guests'] || 1),
                            room_numbers: row['Rooms'] || row['room_numbers'] || '',
                            check_in: row['Check In'] || row['check_in'],
                            check_out: row['Check Out'] || row['check_out'],
                            discount_amount: parseFloat(row['Discount'] || row['discount_amount'] || 0),
                            payment_details: {
                                amount: parseFloat(row['Total Amount'] || row['amount'] || 0),
                                amount_paid: parseFloat(row['Amount Paid'] || row['amount_paid'] || 0),
                                method: 'cash'
                            },
                            booking_status: 'confirmed',
                            booking_source: 'manual'
                        };
                        try {
                            await api.post('/bookings/', payload);
                        } catch (err) {
                            console.error("Failed to import row:", row, err);
                        }
                    }
                    showToast("Import completed!");
                    fetchBookings();
                }
            } catch (err) {
                showToast("Failed to parse Excel file: " + err.message, "error");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const printBookingDetails = (booking) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Booking Details - ${booking.booking_id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .details { margin-top: 30px; }
                    .row { display: flex; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    .label { width: 150px; font-weight: bold; }
                    .value { flex: 1; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Traveller's Inn</h1>
                    <p>Booking Confirmation Receipt</p>
                </div>
                <div class="details">
                    <div class="row"><div class="label">Booking ID:</div><div class="value">${booking.booking_id}</div></div>
                    <div class="row"><div class="label">Status:</div><div class="value">${booking.booking_status.toUpperCase()}</div></div>
                    <div class="row"><div class="label">Guest Name:</div><div class="value">${booking.guest_name}</div></div>
                    <div class="row"><div class="label">Phone:</div><div class="value">${booking.guest_phone || 'N/A'}</div></div>
                    <div class="row"><div class="label">Email:</div><div class="value">${booking.guest_email || 'N/A'}</div></div>
                    <div class="row"><div class="label">Address:</div><div class="value">${booking.guest_address || 'N/A'}</div></div>
                    <div class="row"><div class="label">Check-in:</div><div class="value">${new Date(booking.check_in).toLocaleString()}</div></div>
                    <div class="row"><div class="label">Check-out:</div><div class="value">${new Date(booking.check_out).toLocaleString()}</div></div>
                    <div class="row"><div class="label">Rooms:</div><div class="value">${booking.room_numbers}</div></div>
                    <div class="row"><div class="label">Total Amount:</div><div class="value">₹${booking.payment_details?.amount || 0}</div></div>
                    <div class="row"><div class="label">Discount:</div><div class="value">₹${booking.discount_amount || 0}</div></div>
                    <div class="row"><div class="label">Paid Amount:</div><div class="value">₹${booking.payment_details?.amount_paid || 0}</div></div>
                    <div class="row"><div class="label">Remaining:</div><div class="value">₹${((booking.payment_details?.amount || 0) - (booking.discount_amount || 0)) - (booking.payment_details?.amount_paid || 0)}</div></div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const printAllBookings = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = bookings.map(b => `
            <tr>
                <td>${b.booking_id}<br/><small>${new Date(b.created_at).toLocaleDateString()}</small></td>
                <td>${b.guest_name}<br/>${b.guest_phone}</td>
                <td>${b.room_numbers}</td>
                <td>${b.check_in.split('T')[0]} to ${b.check_out.split('T')[0]}</td>
                <td>₹${b.payment_details?.amount || 0}</td>
                <td>${b.booking_status}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Bookings List</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; }
                    h2 { text-align: center; }
                </style>
            </head>
            <body>
                <h2>Traveller's Inn - Bookings Report (${startDate} to ${endDate})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID & Date</th>
                            <th>Guest</th>
                            <th>Rooms</th>
                            <th>Dates</th>
                            <th>Amt</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };


    const handleApproveCancel = async (bookingId) => {
        if (!window.confirm("Approve this cancellation request?")) return;
        try {
            await approveCancellation(bookingId);
            fetchBookings();
        } catch (err) {
            showToast("Failed to approve cancellation", "error");
        }
    };

    const handleRejectCancel = async (bookingId) => {
        if (!window.confirm("Reject this cancellation request?")) return;
        try {
            await rejectCancellation(bookingId);
            fetchBookings();
        } catch (err) {
            showToast("Failed to reject cancellation", "error");
        }
    };

    const printBill = (booking, billNo, amountPaid, paymentType) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast("Popup blocked! Please allow popups to print the bill.", "error");
            return;
        }
        printWindow.document.write(`
            <html>
            <head>
                <title>Bill - ${billNo}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    p { margin: 5px 0; font-size: 14px; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 16px; margin-top: 10px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <h2>Traveller's Inn</h2>
                <p style="text-align:center">Booking Receipt</p>
                <div class="line"></div>
                <p><strong>Bill No:</strong> ${billNo}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Guest:</strong> ${booking.guest_name}</p>
                <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                <p><strong>Room(s):</strong> ${Array.isArray(booking.room_numbers) ? booking.room_numbers.join(', ') : booking.room_numbers}</p>
                <div class="line"></div>
                <p><strong>Payment Type:</strong> ${paymentType.toUpperCase()}</p>
                <p class="total">Amount Paid: ₹${amountPaid}</p>
                <div class="line"></div>
                <p class="footer">Thank you for staying with us!</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await api.post('/upload/room-image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewBooking(prev => ({ ...prev, id_proof_file: response.data.url }));
        } catch (err) {
            showToast('Upload failed: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleEditBooking = (booking) => {
        setEditingBooking(booking);
        setNewBooking({
            guest_name: booking.guest_name || '',
            guest_phone: booking.guest_phone || '',
            guest_email: booking.guest_email || '',
            number_of_guests: booking.number_of_guests || 1,
            id_proof_type: booking.id_proof_type || 'Aadhar Card',
            id_proof_number: booking.id_proof_number || '',
            id_proof_file: booking.id_proof_file || '',
            room_numbers: Array.isArray(booking.room_numbers) ? booking.room_numbers : (booking.room_numbers ? booking.room_numbers.split(',').filter(r => r) : []),
            check_in: booking.check_in ? booking.check_in.slice(0, 16) : '', // format for datetime-local
            check_out: booking.check_out ? booking.check_out.slice(0, 16) : '',
            amount: booking.payment_details?.amount || '',
            amount_paid: booking.payment_details?.amount_paid || '',
            discount_amount: booking.discount_amount || '',
            guest_address: booking.guest_address || '',
            payment_type: booking.payment_details?.method || 'cash',
            transaction_id: booking.payment_details?.latest_transaction_id || '',
            extra_addons: booking.extra_addons || []
        });


        setCreateModal(true);
    };

    const handleSaveBooking = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                guest_name: newBooking.guest_name,
                guest_phone: newBooking.guest_phone,
                guest_email: newBooking.guest_email || null,
                guest_address: newBooking.guest_address || '',
                number_of_guests: parseInt(newBooking.number_of_guests),
                id_proof_type: newBooking.id_proof_type,
                id_proof_number: newBooking.id_proof_number,
                id_proof_file: newBooking.id_proof_file || 'manual_entry',
                
                // Handle room_numbers: backend expects comma-separated string
                room_numbers: Array.isArray(newBooking.room_numbers) ? newBooking.room_numbers.join(',') : newBooking.room_numbers,
                check_in: newBooking.check_in,
                check_out: newBooking.check_out,
                discount_amount: parseFloat(newBooking.discount_amount || 0),
                payment_details: {
                    amount: parseFloat(newBooking.amount),
                    amount_paid: parseFloat(newBooking.amount_paid || 0),
                    status: (() => {
                        const total = parseFloat(newBooking.amount);
                        const discount = parseFloat(newBooking.discount_amount || 0);
                        const paid = parseFloat(newBooking.amount_paid || 0);
                        const netPayable = total - discount;

                        if (paid >= netPayable) return 'paid';
                        if (paid > 0) return 'partially_paid';
                        return 'pending';
                    })(),
                    method: newBooking.payment_type || 'cash',
                    latest_transaction_id: newBooking.transaction_id || ''
                },
                booking_status: editingBooking ? editingBooking.booking_status : 'confirmed',
                booking_source: 'manual',
                extra_addons: newBooking.extra_addons || []
            };


            if (editingBooking) {
                await api.patch(`/bookings/${editingBooking.booking_id}/`, payload);
                showToast("Booking updated successfully!");
            } else {
                await api.post('/bookings/', payload);
                showToast("Booking created successfully!");
            }

            fetchBookings();
            setCreateModal(false);
            setEditingBooking(null);
            setNewBooking({
                guest_name: '', guest_phone: '', guest_email: '',
                number_of_guests: 1, id_proof_type: 'Aadhar Card', id_proof_file: '',
                room_numbers: [], check_in: '', check_out: '', amount: '', amount_paid: '', discount_amount: '', guest_address: ''
            });

        } catch (err) {
            showToast("Failed to save booking: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const getStatusColor = (status) => {
        if (['confirmed', 'paid'].includes(status)) return 'success';
        if (['pending', 'partially_paid', 'cancellation_requested'].includes(status)) return 'warning';
        if (['cancelled'].includes(status)) return 'error';
        return 'default';
    };

    if (loading) return <div>Loading Bookings...</div>;

    // Filter now handled by backend
    const filteredBookings = bookings;

    return (
        <>
            <Container>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>From:</span>
                    <DatePickerStyles>
                        <DatePicker
                            selected={new Date(startDate)}
                            onChange={date => setStartDate(format(date, 'yyyy-MM-dd'))}
                            customInput={<Input style={{ width: '130px', padding: '0.5rem' }} />}
                            dateFormat="yyyy-MM-dd"
                        />
                    </DatePickerStyles>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>To:</span>
                    <DatePickerStyles>
                        <DatePicker
                            selected={new Date(endDate)}
                            onChange={date => setEndDate(format(date, 'yyyy-MM-dd'))}
                            customInput={<Input style={{ width: '130px', padding: '0.5rem' }} />}
                            dateFormat="yyyy-MM-dd"
                        />
                    </DatePickerStyles>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <ActionBtn
                        $color="#fff"
                        title="Export Excel"
                        style={{ background: '#107c41', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        onClick={handleExcelExport}
                    >
                        <FaFileExcel />
                    </ActionBtn>
                    {/* <ActionBtn
                        $color="#fff"
                        title="Import Excel"
                        style={{ background: '#217346', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        onClick={() => document.getElementById('excel-import').click()}
                    >
                        <FaUpload />
                        <input type="file" id="excel-import" hidden accept=".xlsx, .xls" onChange={handleExcelImport} />
                    </ActionBtn> */}
                    <ActionBtn
                        $color="#fff"
                        title="Print List"
                        style={{ background: '#3b82f6', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        onClick={printAllBookings}
                    >
                        <FaPrint />
                    </ActionBtn>
                    <ActionBtn
                        $color="#fff"
                        style={{ background: '#431d59', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => {
                            setEditingBooking(null);
                            setNewBooking({
                                guest_name: '', guest_phone: '', guest_email: '',
                                number_of_guests: 1, id_proof_type: 'Aadhar Card', id_proof_file: '',
                                room_numbers: [],
                                // Set default times to 12:00 and 10:00
                                check_in: new Date().toISOString().split('T')[0] + 'T12:00',
                                check_out: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T10:00',
                                amount: '', amount_paid: '', discount_amount: '', guest_address: ''
                            });
                            setCreateModal(true);
                        }}
                    >
                        + Add Booking
                    </ActionBtn>
                </div>

            </div>

            <TableWrapper>
                <BookingsTable>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest</th>
                            <th>Dates & Rooms</th>
                            <th>Add-ons</th>
                            <th>Payment Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking.booking_id}>
                                <td>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{booking.booking_id}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(booking.created_at).toLocaleDateString()}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaUser size={12} color="#ffffff" />
                                            {booking.guest_name || 'Guest'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                                            <FaPhone size={10} />
                                            {booking.guest_phone || 'N/A'}
                                        </div>
                                        {booking.id_proof_type && (
                                            <div style={{ 
                                                marginTop: '0.4rem',
                                                padding: '0.4rem 0.6rem',
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)' }}>
                                                    <FaIdCard size={10} style={{ marginRight: '0.3rem' }} />
                                                    {booking.id_proof_type}: {booking.id_proof_number || 'N/A'}
                                                </div>
                                                {booking.id_proof_file && booking.id_proof_file !== 'manual_entry' && (
                                                    <button 
                                                        onClick={() => setPreviewModal({ show: true, url: booking.id_proof_file })}
                                                        style={{ 
                                                            background: 'none', 
                                                            border: 'none', 
                                                            color: '#ffffff', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '2px'
                                                        }}
                                                        title="Preview ID Proof"
                                                    >
                                                        {booking.id_proof_file.toLowerCase().endsWith('.pdf') ? <FaFilePdf size={14} /> : <FaImage size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <FaCalendarAlt size={12} color="rgba(255,255,255,0.7)" />
                                            {booking.check_in.split('T')[0]} - {booking.check_out.split('T')[0]}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: '500' }}>
                                            Rooms: {typeof booking.room_numbers === 'string'
                                                ? booking.room_numbers.replace(/^,|,$/g, '').replace(/,/g, ', ')
                                                : (Array.isArray(booking.room_numbers) ? booking.room_numbers.join(', ') : booking.room_numbers)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                                        {booking.extra_addons && booking.extra_addons.length > 0 ? (
                                            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                                {booking.extra_addons.map((addon, idx) => (
                                                    <li key={idx}>
                                                        {addon.name || addon.id || addon}
                                                        {addon.price && ` (₹${addon.price})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>None</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>₹{booking.payment_details?.amount || 0}</div>
                                        {booking.discount_amount > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)' }}>- Disc: ₹{booking.discount_amount}</div>
                                        )}
                                        <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Paid: ₹{booking.payment_details?.amount_paid || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#ff4d4d' }}>
                                            Bal: ₹{((booking.payment_details?.amount || 0) - (booking.discount_amount || 0)) - (booking.payment_details?.amount_paid || 0)}
                                        </div>
                                        {booking.payment_details?.refund_amount !== undefined && (
                                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                Refund: ₹{booking.payment_details.refund_amount}
                                                {booking.payment_details.cancellation_fine > 0 && ` (Fine: ₹${booking.payment_details.cancellation_fine})`}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <StatusBadge $color={getStatusColor(booking.booking_status)}>
                                            {booking.booking_status}
                                        </StatusBadge>
                                        <StatusBadge $color={getStatusColor(booking.payment_details?.status)}>
                                            {booking.payment_details?.status?.replace('_', ' ')}
                                        </StatusBadge>
                                        {booking.cancellation_reason && (
                                            <div style={{ fontSize: '0.7rem', color: '#ff4d4d', maxWidth: '150px', fontStyle: 'italic' }}>
                                                Reason: {booking.cancellation_reason}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {booking.booking_status === 'cancellation_requested' ? (
                                            <>
                                                <ActionBtn
                                                    $color="#10b981"
                                                    title="Approve Cancellation"
                                                    onClick={() => handleApproveCancel(booking.booking_id)}
                                                >
                                                    <FaCheck />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $color="#ff4d4d"
                                                    title="Reject Cancellation"
                                                    onClick={() => handleRejectCancel(booking.booking_id)}
                                                >
                                                    <FaTimes />
                                                </ActionBtn>
                                            </>
                                        ) : (
                                            <>
                                                <ActionBtn
                                                    $color="#3b82f6"
                                                    title="Edit Booking"
                                                    disabled={booking.booking_status === 'cancelled'}
                                                    onClick={() => !booking.booking_status?.includes('cancelled') && handleEditBooking(booking)}
                                                >
                                                    <FaEdit />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $color="#10b981"
                                                    title="Confirm"
                                                    disabled={booking.booking_status === 'confirmed' || booking.booking_status === 'cancelled'}
                                                    onClick={() => booking.booking_status !== 'cancelled' && handleUpdateStatus(booking.booking_id, 'confirmed')}
                                                >
                                                    <FaCheck />
                                                </ActionBtn>
                                                {booking.payment_details?.status !== 'paid' && (
                                                    <ActionBtn
                                                        $color="#ffffff"
                                                        title="Record Payment"
                                                        disabled={booking.booking_status === 'cancelled'}
                                                        onClick={() => booking.booking_status !== 'cancelled' && setPaymentModal({ show: true, booking, amount: '', payment_type: 'cash', transaction_id: '' })}
                                                    >
                                                        <FaMoneyBillWave />
                                                    </ActionBtn>
                                                )}
                                                <ActionBtn
                                                    $color="#3b82f6"
                                                    title="Print Details"
                                                    onClick={() => printBookingDetails(booking)}
                                                >
                                                    <FaPrint />
                                                </ActionBtn>
                                                <ActionBtn
                                                    $color="#ff4d4d"
                                                    title="Cancel Booking"
                                                    disabled={booking.booking_status === 'cancelled'}
                                                    onClick={() => booking.booking_status !== 'cancelled' && setCancelModal({ show: true, bookingId: booking.booking_id, reason: '', refundType: 'auto' })}
                                                >
                                                    <FaTimes />
                                                </ActionBtn>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </BookingsTable>
            </TableWrapper >

            {
                paymentModal.show && (
                    <ModalOverlay onClick={() => setPaymentModal({ show: false, booking: null, amount: '', transactionId: '' })}>
                        <ModalContent onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', fontFamily: 'Playfair Display' }}>Record Payment</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                Record payment for Booking: {paymentModal.booking.booking_id}
                            </p>

                            <div>
                                <Label>Amount Paid (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={paymentModal.amount}
                                    onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                                />
                                {paymentModal.booking && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <ActionBtn 
                                            type="button" 
                                            $color="#3b82f6" 
                                            style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                                            onClick={() => {
                                                const total = parseFloat(paymentModal.booking.payment_details?.amount || 0);
                                                setPaymentModal({ ...paymentModal, amount: (total * 0.15).toFixed(2) });
                                            }}
                                        >
                                            15% Advance
                                        </ActionBtn>
                                        <ActionBtn 
                                            type="button" 
                                            $color="#10b981" 
                                            style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                                            onClick={() => {
                                                const total = parseFloat(paymentModal.booking.payment_details?.amount || 0);
                                                const discount = parseFloat(paymentModal.booking.discount_amount || 0);
                                                const paidSoFar = parseFloat(paymentModal.booking.payment_details?.amount_paid || 0);
                                                const remaining = Math.max(0, (total - discount) - paidSoFar);
                                                setPaymentModal({ ...paymentModal, amount: remaining.toFixed(2) });
                                            }}
                                        >
                                            Full Remaining
                                        </ActionBtn>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <Label>Payment Type</Label>
                                <select
                                    value={paymentModal.payment_type}
                                    onChange={e => setPaymentModal({ ...paymentModal, payment_type: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="cash">Cash</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="upi">UPI</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="card">Card</option>
                                    <option style={{ background: '#1a1a2e', color: '#fff' }} value="online">Online</option>
                                </select>
                            </div>

                            {paymentModal.payment_type !== 'cash' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Label>Transaction ID / Reference Number</Label>
                                    <Input
                                        placeholder="Enter transaction ID"
                                        value={paymentModal.transaction_id}
                                        onChange={e => setPaymentModal({ ...paymentModal, transaction_id: e.target.value })}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <ActionBtn
                                    $color="#10b981"
                                    style={{ background: 'rgba(16,185,129,0.1)', flex: 1, borderRadius: '8px' }}
                                    onClick={() => {
                                        const total = parseFloat(paymentModal.booking.payment_details?.amount || 0);
                                        const discount = parseFloat(paymentModal.booking.discount_amount || 0);
                                        const paidSoFar = parseFloat(paymentModal.booking.payment_details?.amount_paid || 0);
                                        const currentPayment = parseFloat(paymentModal.amount || 0);
                                        const newTotalPaid = paidSoFar + currentPayment;
                                        const netPayable = total - discount;

                                        const newStatus = newTotalPaid >= netPayable ? 'paid' : 'partially_paid';

                                        const payload = {
                                            amount_paid: currentPayment, 
                                            payment_type: paymentModal.payment_type,
                                            method: paymentModal.payment_type,
                                            transaction_id: paymentModal.transaction_id || null,
                                            payment_status: newStatus
                                        };

                                        console.log("Sending Payment Update:", JSON.stringify(payload, null, 2));

                                        handleUpdateStatus(
                                            paymentModal.booking.booking_id,
                                            paymentModal.booking.booking_status, 
                                            payload
                                        );
                                    }}
                                >
                                    Record
                                </ActionBtn>
                                <ActionBtn
                                    $color="#ff4d4d"
                                    style={{ background: 'rgba(255,77,77,0.1)', flex: 1, borderRadius: '8px' }}
                                    onClick={() => setPaymentModal({ show: false, booking: null, amount: '', payment_type: 'cash', transaction_id: '' })}
                                >
                                    Cancel
                                </ActionBtn>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )
            }

            {cancelModal.show && (
                <ModalOverlay onClick={() => setCancelModal({ show: false, bookingId: null, reason: '', refundType: 'auto' })}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: '#fff', fontFamily: 'Playfair Display' }}>Cancel Booking</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                            Booking ID: {cancelModal.bookingId}
                        </p>

                        <div style={{ marginTop: '1rem' }}>
                            <Label>Cancellation Reason</Label>
                            <Input
                                placeholder="Enter reason (optional)"
                                value={cancelModal.reason}
                                onChange={e => setCancelModal({ ...cancelModal, reason: e.target.value })}
                            />
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <Label>Refund Type</Label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <ActionBtn 
                                    type="button" 
                                    $color="#ffffff" 
                                    style={{ 
                                        background: cancelModal.refundType === 'auto' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: cancelModal.refundType === 'auto' ? '1px solid #ffffff' : '1px solid transparent',
                                        fontSize: '0.8rem', padding: '0.6rem', borderRadius: '8px' 
                                    }}
                                    onClick={() => setCancelModal({ ...cancelModal, refundType: 'auto' })}
                                >
                                    Auto Policy
                                </ActionBtn>
                                <ActionBtn 
                                    type="button" 
                                    $color={cancelModal.refundType === 'full' ? '#10b981' : '#ffffff'} 
                                    style={{ 
                                        background: cancelModal.refundType === 'full' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: cancelModal.refundType === 'full' ? '1px solid #10b981' : '1px solid transparent',
                                        fontSize: '0.8rem', padding: '0.6rem', borderRadius: '8px' 
                                    }}
                                    onClick={() => setCancelModal({ ...cancelModal, refundType: 'full' })}
                                >
                                    Force Full Refund
                                </ActionBtn>
                                <ActionBtn 
                                    type="button" 
                                    $color={cancelModal.refundType === 'fine' ? '#ff4d4d' : '#ffffff'} 
                                    style={{ 
                                        background: cancelModal.refundType === 'fine' ? 'rgba(255,77,77,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: cancelModal.refundType === 'fine' ? '1px solid #ff4d4d' : '1px solid transparent',
                                        fontSize: '0.8rem', padding: '0.6rem', borderRadius: '8px' 
                                    }}
                                    onClick={() => setCancelModal({ ...cancelModal, refundType: 'fine' })}
                                >
                                    Force 15% Fine
                                </ActionBtn>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                *Auto Policy applies a full refund if cancelled within 24 hours of booking, otherwise a 15% fine.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <ActionBtn
                                $color="#ff4d4d"
                                style={{ background: '#ff4d4d', color: '#fff', flex: 1, borderRadius: '8px' }}
                                onClick={() => {
                                    handleUpdateStatus(cancelModal.bookingId, 'cancelled', { 
                                        cancellation_reason: cancelModal.reason || 'Cancelled by Admin',
                                        refund_type: cancelModal.refundType
                                    });
                                    setCancelModal({ show: false, bookingId: null, reason: '', refundType: 'auto' });
                                }}
                            >
                                Confirm Cancel
                            </ActionBtn>
                            <ActionBtn
                                $color="#ffffff"
                                style={{ background: 'rgba(255,255,255,0.1)', flex: 1, borderRadius: '8px' }}
                                onClick={() => setCancelModal({ show: false, bookingId: null, reason: '', refundType: 'auto' })}
                            >
                                Close
                            </ActionBtn>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}


            {
                createModal && (
                    <ModalOverlay onClick={() => setCreateModal(false)}>
                        <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <h3 style={{ color: '#fff', fontFamily: 'Playfair Display', margin: 0 }}>{editingBooking ? 'Edit Booking' : 'Create Manual Booking'}</h3>
                                <button onClick={() => setCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSaveBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <Label>Guest Name</Label>
                                    <Input required value={newBooking.guest_name} onChange={e => setNewBooking({ ...newBooking, guest_name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div>
                                    <Label>Guest Phone</Label>
                                    <Input required value={newBooking.guest_phone} onChange={e => setNewBooking({ ...newBooking, guest_phone: e.target.value })} placeholder="+91..." />
                                </div>
                                <div>
                                    <Label>Guest Email (Optional)</Label>
                                    <Input type="email" value={newBooking.guest_email} onChange={e => setNewBooking({ ...newBooking, guest_email: e.target.value })} placeholder="email@example.com" />
                                </div>
                                <div>
                                    <Label>Number of Guests</Label>
                                    <Input required type="number" min="1" value={newBooking.number_of_guests} onChange={e => setNewBooking({ ...newBooking, number_of_guests: e.target.value })} />
                                </div>
                                <div>
                                    <Label>ID Proof Type</Label>
                                    <select
                                        value={newBooking.id_proof_type}
                                        onChange={e => setNewBooking({ ...newBooking, id_proof_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    >
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Aadhar Card">Aadhar Card</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Passport">Passport</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Driving License">Driving License</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Voter ID">Voter ID</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>ID Proof Number</Label>
                                    <Input 
                                        value={newBooking.id_proof_number} 
                                        onChange={e => setNewBooking({ ...newBooking, id_proof_number: e.target.value })} 
                                        placeholder="Enter ID number" 
                                    />
                                </div>
                                <div>
                                    <Label>ID Proof File</Label>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        {uploading ? <FaSpinner className="fa-spin" /> : <FaUpload />}
                                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                            {uploading ? 'Uploading...' : (newBooking.id_proof_file ? 'Change File' : 'Upload File')}
                                        </span>
                                        <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    {newBooking.id_proof_file && (
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaCheck /> File Uploaded
                                            <a href={`${(API_BASE_URL || '').replace(/\/$/, '')}/${newBooking.id_proof_file.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View</a>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Check In</Label>
                                    <DatePickerStyles>
                                        <DatePicker
                                            selected={newBooking.check_in ? new Date(newBooking.check_in) : null}
                                            onChange={date => setNewBooking({ ...newBooking, check_in: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                                            showTimeSelect
                                            dateFormat="yyyy-MM-dd HH:mm"
                                            customInput={<Input required />}
                                        />
                                    </DatePickerStyles>
                                </div>
                                <div>
                                    <Label>Check Out</Label>
                                    <DatePickerStyles>
                                        <DatePicker
                                            selected={newBooking.check_out ? new Date(newBooking.check_out) : null}
                                            onChange={date => setNewBooking({ ...newBooking, check_out: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                                            showTimeSelect
                                            dateFormat="yyyy-MM-dd HH:mm"
                                            minDate={newBooking.check_in ? new Date(newBooking.check_in) : null}
                                            customInput={<Input required />}
                                        />
                                    </DatePickerStyles>
                                    {newBooking.check_in && newBooking.check_out && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: '#ffffff', fontWeight: '500' }}>
                                            {(() => {
                                                const start = new Date(newBooking.check_in);
                                                const end = new Date(newBooking.check_out);
                                                if (!isNaN(start) && !isNaN(end) && end > start) {
                                                    const diffTime = Math.abs(end - start);
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return `${diffDays} Night${diffDays > 1 ? 's' : ''} Calculated`;
                                                }
                                                return '';
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Label>Rooms</Label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        {Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.map(r => (
                                            <span key={r} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {r} <FaTimes style={{ cursor: 'pointer' }} onClick={() => setNewBooking({ ...newBooking, room_numbers: newBooking.room_numbers.filter(n => n !== r) })} />
                                            </span>
                                        ))}
                                    </div>
                                    <ActionBtn type="button" $color="#ffffff" style={{ border: '1px solid rgba(255, 255, 255, 0.25)', width: '100%', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }} onClick={() => setShowRoomModal(true)}>
                                        Select Rooms
                                    </ActionBtn>
                                </div>
                                <div>
                                    <Label>Total Amount (₹)</Label>
                                    <Input required type="number" value={newBooking.amount} onChange={e => setNewBooking({ ...newBooking, amount: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Discount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={newBooking.discount_amount}
                                        onChange={e => {
                                            const discount = parseFloat(e.target.value) || 0;
                                            // Optional: Auto-update total amount if we had a base price logic, but here amount is manual.
                                            // So we just let admin adjust amount manually or we can act smart.
                                            // Let's just store it.
                                            setNewBooking({ ...newBooking, discount_amount: e.target.value });
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label>Amount Paid (₹)</Label>
                                    <Input type="number" value={newBooking.amount_paid} onChange={e => setNewBooking({ ...newBooking, amount_paid: e.target.value })} placeholder="0" disabled={true} />

                                </div>
                                <div>
                                    <Label>Payment Type</Label>
                                    <select
                                        value={newBooking.payment_type}
                                        onChange={e => setNewBooking({ ...newBooking, payment_type: e.target.value })} disabled={true}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    >
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="cash">Cash</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="upi">UPI</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="card">Card</option>
                                        <option style={{ background: '#1a1a2e', color: '#fff' }} value="online">Online</option>
                                    </select>
                                </div>
                                {newBooking.payment_type !== 'cash' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Transaction ID / Reference Number</Label>
                                        <Input
                                            placeholder="Enter transaction ID for online/upi/card"
                                            value={newBooking.transaction_id}
                                            onChange={e => setNewBooking({ ...newBooking, transaction_id: e.target.value })} disabled={true}
                                        />
                                    </div>
                                )}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Label>Guest Address</Label>
                                    <textarea
                                        value={newBooking.guest_address}
                                        onChange={e => setNewBooking({ ...newBooking, guest_address: e.target.value })}
                                        placeholder="Full address of the guest..."
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            minHeight: '80px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <Label>Extra Add-ons</Label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {(newBooking.extra_addons || []).map((addon, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                                <Input
                                                    placeholder="Addon Name"
                                                    value={addon.name || ''}
                                                    onChange={e => {
                                                        const updated = [...newBooking.extra_addons];
                                                        updated[index].name = e.target.value;
                                                        setNewBooking({ ...newBooking, extra_addons: updated });
                                                    }}
                                                    style={{ flex: 2, padding: '0.5rem' }}
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={addon.price || ''}
                                                    onChange={e => {
                                                        const updated = [...newBooking.extra_addons];
                                                        updated[index].price = e.target.value;
                                                        setNewBooking({ ...newBooking, extra_addons: updated });
                                                    }}
                                                    style={{ flex: 1, padding: '0.5rem' }}
                                                />
                                                <ActionBtn
                                                    type="button"
                                                    $color="#ff4d4d"
                                                    onClick={() => {
                                                        const updated = newBooking.extra_addons.filter((_, i) => i !== index);
                                                        setNewBooking({ ...newBooking, extra_addons: updated });
                                                    }}
                                                >
                                                    <FaTimes />
                                                </ActionBtn>
                                            </div>
                                        ))}
                                        <ActionBtn
                                            type="button"
                                            $color="#ffffff"
                                            style={{ border: '1px dashed rgba(255, 255, 255, 0.35)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                                            onClick={() => setNewBooking({ ...newBooking, extra_addons: [...(newBooking.extra_addons || []), { name: '', price: '' }] })}
                                        >
                                            + Add Extra Add-on
                                        </ActionBtn>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <ActionBtn type="submit" $color="#fff" style={{ background: '#431d59', flex: 1, borderRadius: '8px', padding: '0.8rem' }} disabled={uploading}>
                                        {editingBooking ? 'Update Booking' : 'Create Booking'}
                                    </ActionBtn>
                                </div>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )
            }
            {
                showRoomModal && (
                    <ModalOverlay onClick={() => setShowRoomModal(false)} style={{ zIndex: 2100 }}>
                        <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>Select Rooms</h3>
                                <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><FaTimes /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {availableRooms.map(room => {
                                    const isUnavailable = unavailableRooms.includes(room.room_number) && !newBooking.room_numbers.includes(room.room_number);
                                    // Note: If already selected (e.g. editing), we shouldn't disable it just because it conflicts with ITSELF (if checking logic is strictly date based).
                                    // But checkRoomAvailability usually excludes the *current* booking if we passed an ID. 
                                    // Here we are in "Create" mode mostly or "Edit".
                                    // If Edit, we might have issues. But for now let's just mark conflict.

                                    return (
                                        <div
                                            key={room.room_number}
                                            onClick={() => {
                                                if (isUnavailable) return;
                                                const current = Array.isArray(newBooking.room_numbers) ? newBooking.room_numbers : [];
                                                const updated = current.includes(room.room_number)
                                                    ? current.filter(r => r !== room.room_number)
                                                    : [...current, room.room_number];
                                                setNewBooking({ ...newBooking, room_numbers: updated });
                                            }}
                                            style={{
                                                padding: '0.8rem',
                                                borderRadius: '8px',
                                                border: Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.includes(room.room_number) ? '1px solid #10b981' : (isUnavailable ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)'),
                                                background: Array.isArray(newBooking.room_numbers) && newBooking.room_numbers.includes(room.room_number) ? 'rgba(16, 185, 129, 0.1)' : (isUnavailable ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'),
                                                cursor: isUnavailable ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                opacity: isUnavailable ? 0.6 : 1
                                            }}
                                        >
                                            <span style={{ fontWeight: 'bold' }}>{room.room_number}</span>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{room.room_type}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>₹{room.price}</span>
                                            {isUnavailable && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.2rem' }}>Unavailable</span>}
                                        </div>
                                    )
                                })}
                            </div>
                            <ActionBtn $color="#fff" style={{ background: '#431d59', marginTop: '1rem', padding: '0.8rem', borderRadius: '8px' }} onClick={() => setShowRoomModal(false)}>
                                Done
                            </ActionBtn>
                        </ModalContent>
                    </ModalOverlay>
                )
            }
        </Container>

            {/* Toast Notifications */}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                zIndex: 99999, pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{
                        background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
                        color: '#fff',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                        animation: 'slideInRight 0.3s ease',
                        maxWidth: '360px',
                        pointerEvents: 'auto'
                    }}>
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
            {/* ID Proof Preview Modal */}
            {previewModal.show && (
                <ModalOverlay onClick={() => setPreviewModal({ show: false, url: '' })}>
                    <PreviewModalContent onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '1rem',
                            padding: '0 0.5rem' 
                        }}>
                            <h3 style={{ color: '#fff', margin: 0, fontFamily: 'Playfair Display' }}>ID Proof Preview</h3>
                            <button 
                                onClick={() => setPreviewModal({ show: false, url: '' })}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{ flex: 1, background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {previewModal.url.toLowerCase().endsWith('.pdf') || previewModal.url.includes('pdf') ? (
                                <iframe 
                                    src={`${API_BASE_URL}${previewModal.url}`} 
                                    title="PDF Preview" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 'none' }}
                                />
                            ) : (
                                <img 
                                    src={`${API_BASE_URL}${previewModal.url}`} 
                                    alt="ID Proof" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        // Fallback for cases where extension is missing but it might be a PDF
                                        e.target.style.display = 'none';
                                        showToast("Attempting PDF preview fallback...", "info");
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <ActionBtn 
                                $color="#ffffff" 
                                style={{ flex: 1 }}
                                onClick={() => window.open(`${API_BASE_URL}${previewModal.url}`, '_blank')}
                            >
                                Open in New Tab
                            </ActionBtn>
                        </div>
                    </PreviewModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default ManageBookings;
