import api from './api';

const queryService = {
    submitQuery: async (queryData) => {
        try {
            const response = await api.post('/queries/', queryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default queryService;
