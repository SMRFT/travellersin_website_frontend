import api from './api';

export const getRooms = async () => {
    const response = await api.get('/rooms/');
    return response.data;
};

export const getRoomById = async (id) => {
    const response = await api.get(`/rooms/${id}/`);
    return response.data;
};

export const checkRoomAvailability = async (roomNumbers, checkIn, checkOut) => {
    // roomNumbers can be a single string or an array
    const rooms = Array.isArray(roomNumbers) ? roomNumbers.join(',') : roomNumbers;
    const response = await api.get('/rooms/check-availability/', {
        params: {
            room_numbers: rooms,
            check_in: checkIn,
            check_out: checkOut
        }
    });
    return response.data;
};
