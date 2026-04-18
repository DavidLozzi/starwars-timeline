import React from 'react';
import styled, { keyframes } from 'styled-components';

const pingAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const MovieEventContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
`;

const MovieEventInner = styled.div`
  position: relative;
  padding: 16px 24px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  border: 2px solid;
  transition: all 0.5s ease;
  transform: scale(1.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  ${props => props.type === 'movie' ? `
    background: rgba(180, 83, 9, 0.9);
    border-color: rgb(251, 191, 36);
    box-shadow: 0 25px 50px -12px rgba(251, 191, 36, 0.5);
  ` : `
    background: rgba(88, 28, 135, 0.9);
    border-color: rgb(196, 181, 253);
    box-shadow: 0 25px 50px -12px rgba(196, 181, 253, 0.5);
  `}
`;

const MovieContent = styled.div`
  text-align: center;
`;

const MovieTitle = styled.div`
  color: white;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 4px;
`;

const MovieYear = styled.div`
  font-size: 14px;
  color: ${props => props.type === 'movie' ? 'rgb(253, 224, 71)' : 'rgb(196, 181, 253)'};
`;

const MovieCharacters = styled.div`
  font-size: 12px;
  color: rgb(209, 213, 219);
  margin-top: 8px;
`;

const GlowEffect = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 8px;
  filter: blur(6px);
  z-index: -1;
  opacity: 0.6;
  background: ${props => props.type === 'movie' ? 'rgb(251, 191, 36)' : 'rgb(196, 181, 253)'};
`;

const Particle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: ${pingAnimation} 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  background: ${props => props.type === 'movie' ? 'rgb(251, 191, 36)' : 'rgb(196, 181, 253)'};
  left: ${props => props.left}%;
  top: ${props => props.top}px;
  animation-delay: ${props => props.delay}s;
`;

const MovieEvent = ({ 
  movie, 
  isActive, 
  scrollPosition, 
  movieProgress 
}) => {
  if (!isActive) return null;

  return (
    <MovieEventContainer>
      <MovieEventInner type={movie.type}>
        <MovieContent>
          <MovieTitle>{movie.title}</MovieTitle>
          <MovieYear type={movie.type}>
            {movie.year > 0 ? `${movie.year} ABY` : `${Math.abs(movie.year)} BBY`} • {movie.type.toUpperCase()}
          </MovieYear>
          <MovieCharacters>
            Featuring: {movie.characters.slice(0, 3).join(', ')}
            {movie.characters.length > 3 && ` +${movie.characters.length - 3} more`}
          </MovieCharacters>
        </MovieContent>
        
        <GlowEffect type={movie.type} />
        
        {/* Particle effects */}
        {[...Array(6)].map((_, i) => (
          <Particle
            key={i}
            type={movie.type}
            left={20 + i * 10}
            top={-10 - Math.random() * 20}
            delay={i * 0.2}
          />
        ))}
      </MovieEventInner>
    </MovieEventContainer>
  );
};

export default MovieEvent;

