import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  FaHotel, FaCalendarCheck, FaCalendarAlt, FaQuestionCircle,
  FaSignOutAlt, FaTachometerAlt, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaBars, FaUserShield
} from 'react-icons/fa';
import ManageRooms from '../admin/ManageRooms';
import ManageBookings from '../admin/ManageBookings';
import ManageEvents from '../admin/ManageEvents';
import ManageQueries from '../admin/ManageQueries';
import RoomAvailability from '../admin/RoomAvailability';
import ManageAdmins from '../admin/ManageAdmins';
import AccountSummary from '../admin/AccountSummary';
import ManageGallery from '../admin/ManageGallery';
import api from '../services/api';
import {FaImage} from 'react-icons/fa';
/* ================= STYLED COMPONENTS ================= */

const DashboardWrapper = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: #FAFAFA;
  color: #333333;

  @media (max-width: 1024px) {
    grid-template-columns: 80px 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: #5a3078;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 900;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    left: ${props => props.$isOpen ? '0' : '-100%'};
    width: 280px;
    background: #5a3078;
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
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1C0D24;
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
  gap: 0.75rem;
  margin-bottom: 3rem;
  padding: 0 0.5rem;

  img {
    height: 48px;
    width: 48px;
    object-fit: contain;
    border-radius: 10px;
    background: #ffffff;
    padding: 3px;
    flex-shrink: 0;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    @media (max-width: 1024px) { height: 38px; width: 38px; }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    @media (max-width: 1024px) { display: none; }
    @media (max-width: 768px) { display: flex; }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }

    .brand-sub {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.55);
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
  }

  .mobile-only {
    display: none;
    @media (max-width: 768px) {
      display: block;
      margin-left: auto;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.2rem;
      cursor: pointer;
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
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'};
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
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
  height: 100vh;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  height: 60px;

  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    color: #1C0D24;
  }
`;

/* ================= PLACEHOLDER COMPONENTS ================= */

const QuickStats = ({ stats }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
    {[
      { label: 'Total Bookings', value: stats.totalBookings || '0', icon: <FaCalendarCheck />, color: '#ffffff' },
      { label: 'Live Rooms', value: stats.liveRooms || '0', icon: <FaHotel />, color: '#ffffff' },
      { label: 'Pending Queries', value: stats.pendingQueries || '0', icon: <FaQuestionCircle />, color: '#ffffff' },
      { label: 'Active Events', value: stats.activeEvents || '0', icon: <FaCalendarAlt />, color: '#ffffff' }
    ].map((stat, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        style={{
          background: '#5a3078',
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 10px 30px rgba(193, 128, 210, 0.15)',
          textAlign: 'center'
        }}
      >
        <div style={{ color: stat.color, fontSize: '2rem', marginBottom: '1rem' }}>{stat.icon}</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>{stat.value}</div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{stat.label}</div>
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
            <div style={{ color: '#666' }}>Select a category from the sidebar to manage details.</div>
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
      case 'availability':
        return <RoomAvailability onEditBooking={() => setActiveTab('bookings')} />;
      case 'admins':
        return <ManageAdmins />;
      case 'accounts':
        return <AccountSummary />;
      case 'gallery':
        return <ManageGallery />;
      default:
        return null;
    }
  };

  return (
    <DashboardWrapper>
      <MobileOverlay $isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(false)} />
      <Sidebar $isOpen={isMobileMenuOpen}>
        <Brand>
          <img src="/TRAVELLERSINN_LOGO.jpeg" alt="Travellers Inn" />
          <div className="brand-text">
            <span className="brand-name">TravellersInn</span>
            <span className="brand-sub">Admin Panel</span>
          </div>
          <FaTimes
            className="mobile-only"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </Brand>

        <NavList>
          {[
            { id: 'overview', icon: <FaTachometerAlt />, label: 'Overview' },
            { id: 'rooms', icon: <FaHotel />, label: 'Manage Rooms' },
            { id: 'bookings', icon: <FaCalendarCheck />, label: 'Bookings' },
            { id: 'availability', icon: <FaCalendarAlt />, label: 'Room Availability' },
            { id: 'events', icon: <FaCalendarAlt />, label: 'Event Management' },
            { id: 'queries', icon: <FaQuestionCircle />, label: 'Queries' },
            { id: 'accounts', icon: <FaTachometerAlt />, label: 'Accounts' }, // Using Tachometer as placeholder
            { id: 'gallery', icon: <FaImage />, label: 'Gallery' },
            ...(user?.is_superadmin ? [{ id: 'admins', icon: <FaUserShield />, label: 'Manage Admins' }] : [])
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
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Welcome back, {user?.name}</p>
          </div>
          <Hamburger onClick={() => setIsMobileMenuOpen(true)}>
            <FaBars />
          </Hamburger>
        </Header>

        {/* Persistent Overview Stats */}
        <QuickStats stats={stats} />

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </MainContent>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
