import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import CharacterPod from '../components/CharacterPod';
import MovieEvent from '../components/MovieEvent';
import { timelineData } from '../data/timelineData';

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const HyperspaceContainer = styled.div`
  min-height: 100vh;
  background: black;
  color: white;
`;

const ScrollContainer = styled.div`
  height: 100vh;
  overflow-y: scroll;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ScrollableContent = styled.div`
  position: relative;
  height: 400vh;
`;

const FixedOverlay = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const StarField = styled.div`
  position: absolute;
  inset: 0;
  background: black;
  overflow: hidden;
`;

const Star = styled.div`
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: ${props => !props.isScrolling ? pulseAnimation : 'none'} ${props => props.duration}s infinite;
  animation-delay: ${props => props.delay}s;
`;

const HyperspaceGlow = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(20px);
  background: radial-gradient(circle, 
    rgba(59, 130, 246, ${props => props.intensity * 0.8}), 
    rgba(59, 130, 246, ${props => props.intensity * 0.3}), 
    transparent
  );
`;

const YearDisplay = styled.div`
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
`;

const YearDisplayInner = styled.div`
  background: rgba(30, 58, 138, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 12px 24px;
  border: 1px solid rgb(96, 165, 250);
`;

const YearLabel = styled.div`
  color: rgb(147, 197, 253);
  font-size: 14px;
  text-align: center;
`;

const YearValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
`;

const InstructionsInner = styled.div`
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid rgb(75, 85, 99);
`;

const InstructionsText = styled.div`
  color: rgb(209, 213, 219);
  font-size: 14px;
  text-align: center;
`;

const HyperspaceTimeline = () => {
  const minYear = -100;
  const maxYear = 50;
  const yearRange = maxYear - minYear;
  
  // Start at 0 BBY
  const initialScrollPosition = (0 - minYear) / yearRange; // 0.667
  
  const [currentYear, setCurrentYear] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(initialScrollPosition);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobileScrolling, setIsMobileScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [holdTimer, setHoldTimer] = useState(null);
  const scrollTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Hyperspace streak animation state
  const NUM_STREAKS = 120;
  // Increase streak density slightly for a richer warp effect
  const DESIRED_STREAKS = 160;
  const streaksRef = useRef([]);
  const speedRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const prevTsRef = useRef(0);
  const [animationTick, setAnimationTick] = useState(0);

  if (streaksRef.current.length === 0) {
    // Initialize streaks with angles around the circle
    streaksRef.current = Array.from({ length: DESIRED_STREAKS }).map((_, i) => {
      const angle = (i / DESIRED_STREAKS) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      return {
        angle,
        distance: Math.random() * 100, // percent from center
        length: 20,
      };
    });
  }


  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        
        setScrollPosition(scrollPercent);
        setCurrentYear(minYear + (scrollPercent * yearRange));
        
        // Set scrolling state
        setIsScrolling(true);
        // Derive instantaneous scroll speed for streak animation
        const lastTop = lastScrollTopRef.current || 0;
        const delta = Math.abs(scrollTop - lastTop);
        lastScrollTopRef.current = scrollTop;
        const viewport = containerRef.current.clientHeight || 1;
        // Map delta (px) to a reasonable speed value
        const boost = Math.min(5, (delta / viewport) * 300);
        speedRef.current = Math.min(5, speedRef.current + boost);
        
        // Clear existing timer
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        // Set new timer to detect when scrolling stops
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150); // 150ms delay after scrolling stops
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Set initial scroll position to 0 BBY
      const scrollHeight = container.scrollHeight - container.clientHeight;
      container.scrollTop = initialScrollPosition * scrollHeight;
      // Trigger initial calculation
      handleScroll();
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [minYear, yearRange, initialScrollPosition]);

  // RAF loop to animate streaks based on scroll momentum
  useEffect(() => {
    let rafId;
    const animate = (ts) => {
      const prev = prevTsRef.current || ts;
      const dt = Math.min(32, ts - prev); // cap to avoid huge jumps
      prevTsRef.current = ts;

      // Exponential decay of speed when not actively scrolling
      if (speedRef.current > 0) {
        speedRef.current *= 0.92; // slightly slower decay to keep the warp feeling
        if (speedRef.current < 0.01) speedRef.current = 0;
      }

      const speed = speedRef.current;
      if (speed > 0) {
        const advance = (speed * dt) / 6; // move faster for stronger streaks
        const maxDistance = 230; // percent from center before recycle
        streaksRef.current.forEach((s) => {
          s.distance += advance;
          // length grows with speed
          s.length = 24 + speed * 26;
          if (s.distance > maxDistance) {
            s.distance = 0;
            s.angle = Math.random() * Math.PI * 2;
          }
        });
        // Trigger render
        setAnimationTick((v) => (v + 1) % 1000000);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Mobile touch controls
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    
    // Start hold timer
    const timer = setTimeout(() => {
      setIsMobileScrolling(true);
    }, 300); // 300ms hold time
    setHoldTimer(timer);
  };

  const handleTouchMove = (e) => {
    if (!isMobileScrolling) return;
    
    e.preventDefault(); // Prevent default scroll
    const touch = e.touches[0];
    const deltaY = touchStartY - touch.clientY;
    const sensitivity = 0.002; // Adjust sensitivity as needed
    
    if (containerRef.current) {
      const newScrollPosition = Math.max(0, Math.min(1, scrollPosition + deltaY * sensitivity));
      const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = newScrollPosition * scrollHeight;
      
      setScrollPosition(newScrollPosition);
      setCurrentYear(minYear + (newScrollPosition * yearRange));
    }
    
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    setIsMobileScrolling(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'black', color: 'white' }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div 
        ref={containerRef}
        style={{ 
          height: '100vh', 
          overflowY: 'scroll',
          WebkitScrollbar: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: 'relative', height: '400vh' }}>
          <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'black', overflow: 'hidden' }}>
              {/* Static background stars - always visible but fade when scrolling */}
              {[...Array(140)].map((_, i) => {
                // Deterministic pseudo-randoms per index for stability across renders
                const sx = Math.sin((i + 1) * 127.1) * 43758.5453;
                const sy = Math.sin((i + 1) * 311.7) * 12543.3271;
                const randomX = (sx - Math.floor(sx)) * 100;
                const randomY = (sy - Math.floor(sy)) * 100;
                const sz = Math.sin((i + 1) * 19.19) * 1000;
                const baseSize = 1 + ((sz - Math.floor(sz)) * 2); // 1px - 3px
                const colorMix = 0.6 + ((sx - Math.floor(sx)) * 0.4); // 0.6 - 1.0
                const color = `rgba(${Math.round(220 + 35 * colorMix)}, ${Math.round(230 + 20 * colorMix)}, 255, 1)`;
                const opacity = isScrolling ? Math.max(0.06, 1 - scrollPosition * 0.9) : 1;

                return (
                  <div
                    key={`static-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${randomX}%`,
                      top: `${randomY}%`,
                      width: `${baseSize}px`,
                      height: `${baseSize}px`,
                      background: color,
                      borderRadius: '50%',
                      opacity,
                      filter: 'drop-shadow(0 0 2px rgba(147,197,253,0.6))',
                      animation: !isScrolling ? `pulse ${2 + ((sy - Math.floor(sy)) * 3)}s infinite` : 'none',
                      animationDelay: !isScrolling ? `${(sx - Math.floor(sx)) * 2}s` : '0s'
                    }}
                  />
                );
              })}
              
              {/* Hyperspace streaks driven by scroll momentum */}
              {streaksRef.current.map((s, i) => {
                const centerX = 50;
                const centerY = 50;
                const x = centerX + Math.cos(s.angle) * s.distance;
                const y = centerY + Math.sin(s.angle) * s.distance;
                const opacity = Math.max(0, 1 - s.distance / 230);
                // Thickness increases with speed and slight distance to sell perspective
                const thickness = Math.max(1, 1 + speedRef.current * 1.4 + (s.distance / 230) * 0.6);
                // Subtle blue tint and bright head
                const deg = (s.angle * 180) / Math.PI;
                return (
                  <div
                    key={`streak-${i}-${animationTick}`}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${s.length}px`,
                      height: `${thickness}px`,
                      background: `linear-gradient(90deg,
                        rgba(255,255,255,0.95) 0%,
                        rgba(199,229,255,0.85) 25%,
                        rgba(147,197,253,0.55) 55%,
                        rgba(59,130,246,0.0) 100%)`,
                      borderRadius: '0',
                      opacity,
                      transform: `rotate(${deg}deg) translateZ(0)`,
                      transformOrigin: 'left center',
                      filter: 'drop-shadow(0 0 6px rgba(147,197,253,0.6))',
                      willChange: 'transform'
                    }}
                  />
                );
              })}

              {/* Central hyperspace glow - grows with scroll - starts early */}
              {scrollPosition > 0.1 && (
                <div 
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${scrollPosition * 240}px`,
                    height: `${scrollPosition * 240}px`,
                    background: `radial-gradient(circle, rgba(59, 130, 246, ${scrollPosition * 0.85}), rgba(59, 130, 246, ${scrollPosition * 0.4}), transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(26px)'
                  }}
                />
              )}
              {/* Vignette to enhance tunnel depth */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'
                }}
              />
            </div>

            {/* Current year display */}
            <div style={{ position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <div style={{ background: 'rgba(30, 58, 138, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '12px 24px', border: '1px solid rgb(96, 165, 250)' }}>
                <div style={{ color: 'rgb(147, 197, 253)', fontSize: '14px', textAlign: 'center' }}>Current Year</div>
                <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                  {currentYear > 0 ? `${Math.round(currentYear)} ABY` : `${Math.abs(Math.round(currentYear))} BBY`}
                </div>
              </div>
            </div>

            {/* Character pods along tunnel walls */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {timelineData.characters.map((character, index) => (
                <CharacterPod
                  key={character.name}
                  character={character}
                  currentYear={currentYear}
                  index={index}
                  scrollPosition={scrollPosition}
                />
              ))}
            </div>

            {/* Movie/Show events */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {timelineData.movies.map((movie, index) => {
                const movieProgress = (movie.year - minYear) / yearRange;
                // Calculate year directly from scroll position for immediate response
                const calculatedYear = minYear + (scrollPosition * yearRange);
                const isNearCurrent = Math.abs(calculatedYear - movie.year) < 0.5;
                
                return (
                  <MovieEvent
                    key={movie.title}
                    movie={movie}
                    isActive={isNearCurrent}
                    scrollPosition={scrollPosition}
                    movieProgress={movieProgress}
                  />
                );
              })}
            </div>

            {/* Instructions */}
            <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <div style={{ background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '8px 16px', border: '1px solid rgb(75, 85, 99)' }}>
                <div style={{ color: 'rgb(209, 213, 219)', fontSize: '14px', textAlign: 'center' }}>
                  {isMobileScrolling ? (
                    "Swipe up/down to navigate • Release to stop"
                  ) : (
                    "Scroll to travel through time • Mobile: Press & hold, then swipe"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HyperspaceTimeline;
