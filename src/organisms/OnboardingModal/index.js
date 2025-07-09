import React from 'react';
import Styled from './index.styles';

const OnboardingModal = ({ onClose }) => {
  const [currentScreen, setCurrentScreen] = React.useState(0);

  const screens = [
    {
      title: 'Welcome to the Ultimate Star Wars Timeline!',
      content: 'Explore Star Wars characters across movies and TV shows, see who\'s in what and how old they are at any given time.'
    },
    {
      title: 'Simple to use',
      content: 'Just scroll right and left, up and down to explore!',
      hasGif: true
    },
    {
      title: 'Find what you need fast',
      content: 'Use the search and filters to narrow down by character and show.'
    }
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handlePrev = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };

  const goToScreen = (screenIndex) => {
    setCurrentScreen(screenIndex);
  };

  return (
    <Styled.Wrapper>
      <Styled.ContentWrapper>
        <Styled.Header>
          <Styled.Title>{screens[currentScreen].title}</Styled.Title>
        </Styled.Header>
        
        <Styled.Content>
          <Styled.ContentText>
            {screens[currentScreen].content}
          </Styled.ContentText>
          
          {screens[currentScreen].hasGif && (
            <Styled.GifPlaceholder>
              <Styled.GifText>GIF showing how to use the app will be here</Styled.GifText>
            </Styled.GifPlaceholder>
          )}
        </Styled.Content>

        <Styled.Footer>
          <Styled.DotsContainer>
            {screens.map((_, index) => (
              <Styled.Dot
                key={index}
                active={index === currentScreen}
                onClick={() => goToScreen(index)}
              />
            ))}
          </Styled.DotsContainer>

          <Styled.ButtonContainer>
            {currentScreen > 0 && (
              <Styled.Button onClick={handlePrev}>Previous</Styled.Button>
            )}
            
            {currentScreen < screens.length - 1 ? (
              <Styled.PrimaryButton onClick={handleNext}>Next</Styled.PrimaryButton>
            ) : (
              <Styled.PrimaryButton onClick={handleFinish}>Get Started</Styled.PrimaryButton>
            )}
          </Styled.ButtonContainer>
        </Styled.Footer>
      </Styled.ContentWrapper>
    </Styled.Wrapper>
  );
};

export default OnboardingModal;