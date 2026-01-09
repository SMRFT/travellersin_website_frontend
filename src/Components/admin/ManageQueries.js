import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaReply, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../services/api';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
`;

const QueryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
`;

const QueryCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
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

    useEffect(() => { fetchQueries(); }, []);

    const fetchQueries = async () => {
        try {
            const response = await api.get('/queries/');
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

    return (
        <Container>
            <QueryList>
                {queries.map(query => (
                    <QueryCard key={query.id} $resolved={query.status === 'resolved'}>
                        <div style={{ flex: 1 }}>
                            <Status $resolved={query.status === 'resolved'}>
                                {query.status === 'resolved' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                {query.status.toUpperCase()}
                            </Status>
                            <h3 style={{ marginBottom: '0.5rem' }}>{query.name}</h3>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                {query.email} • {query.phone}
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
