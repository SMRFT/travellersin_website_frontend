import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

/* ================= KEYFRAME ANIMATIONS ================= */

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`;

/* ================= STYLED COMPONENTS ================= */

/* --- Full Page Loader --- */
const FullPageOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoaderLogo = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #fff 0%, #d4af37 25%, #fff 50%, #d4af37 75%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
  margin-bottom: 3rem;
`;

const LogoAccent = styled.span`
  -webkit-text-fill-color: #d4af37;
`;

/* --- Spinner Loader --- */
const SpinnerContainer = styled.div`
  position: relative;
  width: ${props => props.$size || 60}px;
  height: ${props => props.$size || 60}px;
`;

const SpinnerRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #d4af37;
  animation: ${rotate} 1s linear infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    border: 3px solid transparent;
  }

  &::before {
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border-top-color: rgba(212, 175, 55, 0.5);
    animation: ${rotate} 2s linear infinite reverse;
  }

  &::after {
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    border-top-color: rgba(212, 175, 55, 0.3);
    animation: ${rotate} 1.5s linear infinite;
  }
`;

/* --- Dots Loader --- */
const DotsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div`
  width: ${props => props.$size || 12}px;
  height: ${props => props.$size || 12}px;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.$delay || 0}s;
`;

/* --- Wave Loader --- */
const WaveContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 40px;
`;

const WaveBar = styled.div`
  width: 6px;
  height: ${props => props.$height || 20}px;
  background: linear-gradient(to top, #d4af37, #f5d76e);
  border-radius: 3px;
  animation: ${wave} 1s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
`;

/* --- Skeleton Loader --- */
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${props => props.$radius || '8px'};
`;

const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.$height || '16px'};
  width: ${props => props.$width || '100%'};
  margin-bottom: ${props => props.$margin || '8px'};
`;

const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.$size || '50px'};
  height: ${props => props.$size || '50px'};
  border-radius: 50%;
`;

const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '200px'};
`;

/* --- Inline Loader --- */
const InlineContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const MiniSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: ${rotate} 0.8s linear infinite;
`;

/* --- Loading Text --- */
const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-top: 1.5rem;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

/* --- Progress Bar --- */
const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 2rem;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f5d76e);
  border-radius: 2px;
`;

/* ================= LOADER COMPONENTS ================= */

// Full Page Loader - for initial app load
export const FullPageLoader = ({ text = 'Loading...' }) => (
    <FullPageOverlay
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
        <LoaderLogo>
            Travellers<LogoAccent>Inn</LogoAccent>
        </LoaderLogo>
        <SpinnerContainer $size={60}>
            <SpinnerRing />
        </SpinnerContainer>
        <LoadingText>{text}</LoadingText>
    </FullPageOverlay>
);

// Spinner Loader - for sections
export const Spinner = ({ size = 50 }) => (
    <SpinnerContainer $size={size}>
        <SpinnerRing />
    </SpinnerContainer>
);

// Dots Loader - for buttons or small areas
export const DotsLoader = ({ size = 10 }) => (
    <DotsContainer>
        <Dot $size={size} $delay={0} />
        <Dot $size={size} $delay={0.16} />
        <Dot $size={size} $delay={0.32} />
    </DotsContainer>
);

// Wave Loader - for audio/processing states
export const WaveLoader = () => (
    <WaveContainer>
        {[20, 35, 25, 40, 15, 30, 20].map((height, i) => (
            <WaveBar key={i} $height={height} $delay={i * 0.1} />
        ))}
    </WaveContainer>
);

// Inline Loader - for inline loading states
export const InlineLoader = ({ text = 'Loading' }) => (
    <InlineContainer>
        <MiniSpinner />
        <span>{text}</span>
    </InlineContainer>
);

// Skeleton Loaders - for content placeholders
export const Skeleton = {
    Text: SkeletonText,
    Circle: SkeletonCircle,
    Rect: SkeletonRect,

    // Pre-built skeleton layouts
    Card: () => (
        <div style={{ padding: '1rem' }}>
            <SkeletonRect $height="180px" $radius="16px" style={{ marginBottom: '1rem' }} />
            <SkeletonText $width="70%" />
            <SkeletonText $width="40%" />
            <SkeletonText $width="90%" />
        </div>
    ),

    Profile: () => (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SkeletonCircle $size="60px" />
            <div style={{ flex: 1 }}>
                <SkeletonText $width="60%" />
                <SkeletonText $width="40%" />
            </div>
        </div>
    )
};

// Progress Loader - for operations with known duration
export const ProgressLoader = ({ progress = 0 }) => (
    <ProgressContainer>
        <ProgressBar
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
        />
    </ProgressContainer>
);

// Default export - the most common loader
const Loader = ({
    type = 'spinner',
    size,
    text,
    fullPage = false,
    ...props
}) => {
    if (fullPage) {
        return <FullPageLoader text={text} />;
    }

    switch (type) {
        case 'dots':
            return <DotsLoader size={size} />;
        case 'wave':
            return <WaveLoader />;
        case 'inline':
            return <InlineLoader text={text} />;
        default:
            return <Spinner size={size} />;
    }
};

export default Loader;
