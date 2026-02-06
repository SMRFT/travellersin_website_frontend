import api from './api';

export const submitEventInquiry = async (inquiryData) => {
    const response = await api.post('/events/bookings/', inquiryData);
    return response.data;
};

export const getAllEventBookings = async () => {
    const response = await api.get('/events/bookings/');
    return response.data;
};

export const trackEventBooking = async (bookingId, phone) => {
    const response = await api.post('/events/status/', {
        booking_id: bookingId,
        phone: phone
    });
    return response.data;
};

export const updateEventBookingStatus = async (bookingId, status) => {
    const response = await api.patch(`/admin/event-booking/${bookingId}/`, {
        status: status
    });
    return response.data;
};
