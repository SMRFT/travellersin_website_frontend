import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    FaHotel, FaCalendarCheck, FaCalendarAlt, FaQuestionCircle,
    FaSignOutAlt, FaTachometerAlt, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaShieldAlt,
    FaBars
} from 'react-icons/fa';
import ManageRooms from '../admin/ManageRooms';
import ManageBookings from '../admin/ManageBookings';
import ManageEvents from '../admin/ManageEvents';
import ManageQueries from '../admin/ManageQueries';
import api from '../services/api';

/* ================= STYLED COMPONENTS ================= */

const DashboardWrapper = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: #0a0a12;
  color: #fff;

  @media (max-width: 1024px) {
    grid-template-columns: 80px 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    left: ${props => props.$isOpen ? '0' : '-100%'};
    width: 280px;
    background: #0f0f1a;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4af37;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 4rem;
  padding: 0 0.5rem;
  height: 60px;

  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: #d4af37;
    @media (max-width: 1024px) { display: none; }
    @media (max-width: 768px) { display: block; font-size: 1.2rem; }
  }

  .mobile-only {
    display: none;
    @media (max-width: 768px) {
      display: block;
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.2rem;
      &:hover { color: #ff4d4d; }
    }
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const NavItem = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(212, 175, 55, 0.1)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.$active ? '#d4af37' : 'rgba(255, 255, 255, 0.6)'};
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  span {
    @media (max-width: 1024px) { display: none; }
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutBtn = styled(NavItem)`
  margin-top: auto;
  color: #ff4d4d;
  &:hover {
    background: rgba(255, 77, 77, 0.1);
    color: #ff4d4d;
  }
`;

const MainContent = styled.main`
  padding: 3rem;
  overflow-y: auto;
  max-height: 100vh;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  height: 60px; /* Fixed height to match brand baseline */

  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
  }
`;

/* ================= PLACEHOLDER COMPONENTS ================= */

const QuickStats = ({ stats }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {[
            { label: 'Total Bookings', value: stats.totalBookings || '0', icon: <FaCalendarCheck />, color: '#d4af37' },
            { label: 'Live Rooms', value: stats.liveRooms || '0', icon: <FaHotel />, color: '#4d94ff' },
            { label: 'Pending Queries', value: stats.pendingQueries || '0', icon: <FaQuestionCircle />, color: '#ff4d4d' },
            { label: 'Active Events', value: stats.activeEvents || '0', icon: <FaCalendarAlt />, color: '#10b981' }
        ].map((stat, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center'
                }}
            >
                <div style={{ color: stat.color, fontSize: '2rem', marginBottom: '1rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stat.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{stat.label}</div>
            </motion.div>
        ))}
    </div>
);

/* ================= MAIN DASHBOARD COMPONENT ================= */

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        liveRooms: 0,
        pendingQueries: 0,
        activeEvents: 0
    });
    const { isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin/login');
        } else {
            fetchStats();
        }
    }, [isAdmin, navigate]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/');
            setStats({
                totalBookings: response.data.total_bookings,
                liveRooms: response.data.live_rooms,
                pendingQueries: response.data.pending_queries,
                activeEvents: response.data.active_events
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    if (!isAdmin) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <QuickStats stats={stats} />
                        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Select a category from the sidebar to manage details.</div>
                    </motion.div>
                );
            case 'rooms':
                return <ManageRooms />;
            case 'bookings':
                return <ManageBookings />;
            case 'events':
                return <ManageEvents />;
            case 'queries':
                return <ManageQueries />;
            default:
                return null;
        }
    };

    return (
        <DashboardWrapper>
            <MobileOverlay $isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(false)} />
            <Sidebar $isOpen={isMobileMenuOpen}>
                <Brand>
                    <FaShieldAlt style={{ fontSize: '1.8rem', color: '#d4af37' }} />
                    <h2>Admin Panel</h2>
                    <FaTimes
                        className="mobile-only"
                        style={{ marginLeft: 'auto', cursor: 'pointer', display: 'none' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </Brand>

                <NavList>
                    {[
                        { id: 'overview', icon: <FaTachometerAlt />, label: 'Overview' },
                        { id: 'rooms', icon: <FaHotel />, label: 'Manage Rooms' },
                        { id: 'bookings', icon: <FaCalendarCheck />, label: 'Bookings' },
                        { id: 'events', icon: <FaCalendarAlt />, label: 'Event Management' },
                        { id: 'queries', icon: <FaQuestionCircle />, label: 'Queries' }
                    ].map(item => (
                        <NavItem
                            key={item.id}
                            $active={activeTab === item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            {item.icon} <span>{item.label}</span>
                        </NavItem>
                    ))}
                </NavList>

                <LogoutBtn onClick={() => { logout(); navigate('/'); }}>
                    <FaSignOutAlt /> <span>Sign Out</span>
                </LogoutBtn>
            </Sidebar>

            <MainContent>
                <Header>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Welcome back, {user?.name}</p>
                    </div>
                    <Hamburger onClick={() => setIsMobileMenuOpen(true)}>
                        <FaBars />
                    </Hamburger>
                </Header>

                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </MainContent>
        </DashboardWrapper>
    );
};

export default AdminDashboard;
