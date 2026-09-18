import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings/', bookingData);
  return response.data;
};

export const createRazorpayOrder = async (amount) => {
  const response = await api.post('/payments/create-order/', { amount });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payments/verify/', paymentData);
  return response.data;
};

export const confirmCashBooking = async (bookingId) => {
  const response = await api.post('/payments/confirm-cash/', { booking_id: bookingId });
  return response.data;
};

export const getUserBookings = async (customerId) => {
  const response = await api.get(`/bookings/?customer_id=${customerId}`);
  return response.data;
};

export const trackBooking = async (bookingId, phone) => {
  const response = await api.get(`/bookings/track/?booking_id=${bookingId}&phone=${phone}`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason) => {
  const response = await api.post(`/bookings/${bookingId}/cancel/`, { reason });
  return response.data;
};

export const initiateBookingPayment = async (bookingId) => {
  const response = await api.post(`/payments/booking/${bookingId}/initiate/`);
  return response.data;
};

export const approveCancellation = async (bookingId) => {
  const response = await api.post(`/admin/booking/${bookingId}/approve-cancellation/`);
  return response.data;
};

export const rejectCancellation = async (bookingId) => {
  const response = await api.post(`/admin/booking/${bookingId}/reject-cancellation/`);
  return response.data;
};