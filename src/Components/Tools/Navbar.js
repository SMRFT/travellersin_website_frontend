import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

/* ================= KEYFRAME ANIMATIONS ================= */

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ================= STYLED COMPONENTS ================= */

const Nav = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ $scrolled }) => $scrolled ? '#0F1E2E' : 'rgba(15, 30, 46, 0.85)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ $scrolled }) => $scrolled ? 'rgba(201, 162, 77, 0.1)' : 'transparent'};
  box-shadow: ${({ $scrolled }) => $scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none'};
  padding: ${({ $scrolled }) => $scrolled ? '0 4rem' : '1.5rem 4rem'};

  @media (max-width: 1024px) {
    padding: ${({ $scrolled }) => $scrolled ? '0 2rem' : '1.5rem 2rem'};
  }

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    height: 70px;
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  text-decoration: none;
  z-index: 1001;
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #fff 0%, #C9A24D 50%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;

  &:hover {
    animation: ${shimmer} 2s linear infinite;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LogoAccent = styled.span`
  color: #C9A24D;
  -webkit-text-fill-color: #C9A24D;
`;

/* --- DESKTOP MENU --- */
const DesktopMenu = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinksContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-right: 2rem;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LoginBtn = styled(motion.button)`
  background: transparent;
  color: #fff;
  border: 1px solid rgba(201, 162, 77, 0.5);
  padding: 0.7rem 1.8rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-right: 1rem;

  &:hover {
    background: rgba(201, 162, 77, 0.1);
    border-color: #C9A24D;
  }
`;

const UserAvatar = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(201, 162, 77, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A24D;
  border: 1px solid rgba(201, 162, 77, 0.3);
  text-decoration: none;
  transition: all 0.3s ease;
  margin-right: 0.5rem;

  &:hover {
    background: rgba(201, 162, 77, 0.3);
    transform: scale(1.05);
  }
`;

const LogoutBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  margin-right: 1.5rem;

  &:hover {
    color: #ef4444;
  }
`;

const LinkItem = styled.div`
  position: relative;
`;

const StyledLink = styled(Link)`
  color: ${({ $isActive }) => $isActive ? '#C9A24D' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 500;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;

  &::before {
    content: '';
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 20px;
    height: 2px;
    background: linear-gradient(90deg, #C9A24D, #f5d76e);
    border-radius: 2px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);

    &::before {
      transform: translateX(-50%) scaleX(1);
    }
  }

  ${({ $isActive }) => $isActive && css`
    color: #C9A24D;
    
    &::before {
      transform: translateX(-50%) scaleX(1);
    }
  `}
`;

const Underline = styled(motion.div)`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #C9A24D, #f5d76e);
  border-radius: 2px;
`;

const BookButton = styled(motion.button)`
  background: #1E6F5C;
  color: #ffffff;
  padding: 0.85rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 20px rgba(30, 111, 92, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(30, 111, 92, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

/* --- MOBILE ICONS & MENU --- */
const MobileIcon = styled(motion.div)`
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #fff;
  z-index: 1001;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.3);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 998;
`;

const MobileMenuContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 85%;
  height: 100vh;
  background: #0F1E2E;
  display: flex;
  flex-direction: column;
  padding: 100px 2rem 2rem;
  z-index: 999;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  border-left: 1px solid rgba(201, 162, 77, 0.1);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 162, 77, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(201, 162, 77, 0.3);
    border-radius: 20px;
  }
`;

const MobileMenuHeader = styled.div`
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileMenuTitle = styled.h3`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MobileLink = styled(motion(Link))`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ $isActive }) => $isActive ? '#C9A24D' : 'rgba(255, 255, 255, 0.8)'};
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: linear-gradient(180deg, #C9A24D, #f5d76e);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    padding-left: 2rem;

    &::before {
      transform: scaleY(1);
    }
  }

  ${({ $isActive }) => $isActive && css`
    background: rgba(201, 162, 77, 0.1);
    
    &::before {
      transform: scaleY(1);
    }
  `}
`;

const MobileLinkNumber = styled.span`
  font-size: 0.8rem;
  color: rgba(201, 162, 77, 0.6);
  font-weight: 400;
`;

const MobileMenuFooter = styled.div`
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileBookButton = styled(motion.button)`
  width: 100%;
  background: #1E6F5C;
  color: #0f0f1a;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 20px rgba(30, 111, 92, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(30, 111, 92, 0.4);
  }
`;

/* ================= ANIMATION VARIANTS ================= */

const menuVariants = {
  closed: {
    x: "100%",
    transition: { type: "tween", duration: 0.3 }
  },
  open: {
    x: 0,
    transition: { type: "tween", duration: 0.3 }
  }
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

const linkVariants = {
  closed: { x: 50, opacity: 0 },
  open: (i) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.3 }
  })
};

/* ================= COMPONENT ================= */

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed transparency specific state since header is now solid #0F1E2E
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, toggleLoginModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Rooms', path: '/rooms' },
    { title: 'Gallery', path: '/gallery' },
    { title: 'Events', path: '/events' },
    { title: 'Track Stay', path: '/track-booking' },
    { title: 'Track Event', path: '/trackevent' },
    { title: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <Nav
        $scrolled={scrolled}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Logo to="/" onClick={closeMenu}>
          Travellers<LogoAccent>Inn</LogoAccent>
        </Logo>

        {/* --- DESKTOP VIEW --- */}
        <DesktopMenu>
          <NavLinksContainer>
            {navLinks.map((item) => (
              <LinkItem key={item.path}>
                <StyledLink to={item.path} $isActive={isActive(item.path)}>
                  {item.title}
                </StyledLink>
                {isActive(item.path) && (
                  <Underline layoutId="navbar-underline" />
                )}
              </LinkItem>
            ))}
          </NavLinksContainer>

          {user ? (
            <UserMenu>
              <UserAvatar to="/profile" onClick={closeMenu}>
                <FaUser />
              </UserAvatar>
              <LogoutBtn onClick={logout} title="Logout">
                <FaSignOutAlt />
              </LogoutBtn>
            </UserMenu>
          ) : (
            <LoginBtn
              onClick={toggleLoginModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </LoginBtn>
          )}

          <BookButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/quick-booking')}
          >
            Book Now
          </BookButton>
        </DesktopMenu>

        {/* --- MOBILE TOGGLE --- */}
        <MobileIcon
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaTimes />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaBars />
              </motion.div>
            )}
          </AnimatePresence>
        </MobileIcon>
      </Nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <MobileMenuOverlay
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={closeMenu}
            />
            <MobileMenuContainer
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <MobileMenuHeader>
                <MobileMenuTitle>Navigation</MobileMenuTitle>
              </MobileMenuHeader>

              <MobileNavLinks>
                {navLinks.map((item, index) => (
                  <MobileLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    $isActive={isActive(item.path)}
                    custom={index}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <MobileLinkNumber>0{index + 1}</MobileLinkNumber>
                    {item.title}
                  </MobileLink>
                ))}
                {user && (
                  <MobileLink
                    to="/profile"
                    onClick={closeMenu}
                    $isActive={isActive('/profile')}
                    custom={navLinks.length}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <MobileLinkNumber>0{navLinks.length + 1}</MobileLinkNumber>
                    Profile
                  </MobileLink>
                )}
              </MobileNavLinks>

              <MobileMenuFooter>
                <MobileBookButton
                  onClick={() => { navigate('/quick-booking'); closeMenu(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Your Stay
                </MobileBookButton>

                {!user ? (
                  <MobileBookButton
                    style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    onClick={() => { toggleLoginModal(); closeMenu(); }}
                  >
                    Sign In
                  </MobileBookButton>
                ) : (
                  <MobileBookButton
                    style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    onClick={() => { logout(); closeMenu(); }}
                  >
                    Sign Out
                  </MobileBookButton>
                )}
              </MobileMenuFooter>
            </MobileMenuContainer>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;