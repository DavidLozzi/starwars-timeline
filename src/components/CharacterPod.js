import React from 'react';
import { Skull } from 'lucide-react';
import styled from 'styled-components';

const CharacterPodContainer = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  z-index: ${props => 10 + props.index};
`;

const CharacterPodInner = styled.div`
  position: relative;
  padding: 8px 12px;
  border-radius: 50px;
  backdrop-filter: blur(4px);
  border: 1px solid;
  transition: all 0.5s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
  
  &:hover {
    transform: scale(1.1);
  }
  
  ${props => props.isDead ? `
    background: rgba(153, 27, 27, 0.8);
    border-color: rgb(248, 113, 113);
    box-shadow: 0 4px 6px -1px rgba(248, 113, 113, 0.5);
  ` : `
    background: rgba(30, 58, 138, 0.8);
    border-color: rgb(96, 165, 250);
    box-shadow: 0 4px 6px -1px rgba(96, 165, 250, 0.5);
  `}
`;

const CharacterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const CharacterName = styled.div`
  color: white;
  font-weight: 500;
`;

const AgeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.isDead ? 'rgb(252, 165, 165)' : 'rgb(147, 197, 253)'};
`;

const GlowEffect = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50px;
  filter: blur(4px);
  z-index: -1;
  opacity: 0.5;
  background: ${props => props.isDead ? 'rgb(248, 113, 113)' : 'rgb(96, 165, 250)'};
`;

const CharacterPod = ({ 
  character, 
  currentYear, 
  index, 
  scrollPosition 
}) => {
  const age = Math.max(0, Math.round(currentYear - character.birthYear));
  const isDead = character.deathYear && currentYear >= character.deathYear;
  const isAlive = currentYear >= character.birthYear && (!character.deathYear || currentYear < character.deathYear);

  // Position pods around the tunnel
  const angle = (index * 137.5) % 360; // Golden angle for nice distribution
  const radius = 45; // Distance from center
  const verticalOffset = (index % 3) * 10; // Stagger vertically

  const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
  const y = 50 + Math.sin(angle * Math.PI / 180) * radius + verticalOffset;

  // Add movement based on scroll
  const floatOffset = Math.sin(scrollPosition * 10 + index) * 5;

  if (!isAlive && !isDead) return null;

  return (
    <CharacterPodContainer
      index={index}
      style={{
        left: `${x}%`,
        top: `${y + floatOffset}%`,
      }}
    >
      <CharacterPodInner isDead={isDead}>
        <CharacterInfo>
          <CharacterName>{character.name}</CharacterName>
          
          {isDead ? (
            <AgeInfo isDead={isDead}>
              <Skull size={14} />
              <span>†</span>
            </AgeInfo>
          ) : (
            <AgeInfo isDead={isDead}>
              Age {age}
            </AgeInfo>
          )}
        </CharacterInfo>
        
        <GlowEffect isDead={isDead} />
      </CharacterPodInner>
    </CharacterPodContainer>
  );
};

export default CharacterPod;

