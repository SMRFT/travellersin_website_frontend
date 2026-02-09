import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../services/api';

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const QueryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
`;

const QueryCard = styled(motion.div)`
  background: #0f151a; // Darker card
  border: 1px solid ${props => props.$resolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.$resolved ? '#10b981' : '#d4af37'};
  margin-bottom: 0.5rem;
`;

const ManageQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date Filter State (Default 3 days)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => { fetchQueries(); }, [startDate, endDate]);

    const fetchQueries = async () => {
        try {
            const response = await api.get(`/queries/?start_date=${startDate}&end_date=${endDate}`);
            setQueries(response.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleToggleResolve = async (id, currentStatus) => {
        try {
            await api.patch(`/queries/${id}/`, { status: currentStatus === 'resolved' ? 'pending' : 'resolved' });
            fetchQueries();
        } catch (err) { alert('Update failed'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this query?')) {
            await api.delete(`/queries/${id}/`);
            fetchQueries();
        }
    };

    if (loading) return <div>Loading Queries...</div>;

    // Filter handled by backend
    const filteredQueries = queries;

    return (
        <Container>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>From:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>To:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                    />
                </div>
            </div>
            <QueryList>
                {filteredQueries.map(query => (
                    <QueryCard key={query.id} $resolved={query.status === 'resolved'}>
                        <div style={{ flex: 1 }}>
                            <Status $resolved={query.status === 'resolved'}>
                                {query.status === 'resolved' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                {query.status.toUpperCase()}
                            </Status>
                            <h3 style={{ marginBottom: '0.5rem' }}>{query.name}</h3>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                {query.email} • {query.phone_number}
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>"{query.message}"</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleToggleResolve(query.id, query.status)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: query.status === 'resolved' ? '#10b981' : '#fff', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                <FaCheckCircle />
                            </button>
                            <button
                                onClick={() => handleDelete(query.id)}
                                style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </QueryCard>
                ))}
            </QueryList>
        </Container>
    );
};

export default ManageQueries;
