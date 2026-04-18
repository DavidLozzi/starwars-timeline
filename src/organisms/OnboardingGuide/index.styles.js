import styled from 'styled-components';

const GuideContainer = styled.div`
  padding: 1.5rem;
  max-width: 600px;
  width: calc(100% - 2rem);
  max-height: 90vh;
  overflow-y: auto;
  color: ${({ theme }) => theme.palette.white};
  background-color: rgba(${({ theme }) => theme.palette.black}, 0.95);
  border-radius: 8px;
  outline: none;
  position: relative;
  z-index: 101;
  opacity: 0;
  transform: scale(0.95);
  animation: fadeInScale 0.2s ease forwards;

  @keyframes fadeInScale {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  ${({ theme }) => theme.breakpoints.sm} {
    padding: 2rem;
    width: 100%;
  }

  ${({ theme }) => theme.breakpoints.md} {
    padding: 2.5rem;
  }

  /* Mobile responsive: full width on small screens */
  @media screen and (max-width: 320px) {
    padding: 1rem;
    width: calc(100% - 1rem);
    font-size: 0.9rem;
  }
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: rgb(${({ theme }) => theme.palette.secondary});
  font-weight: bold;

  ${({ theme }) => theme.breakpoints.sm} {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  margin: 0 0 2rem 0;
  font-size: 1rem;
  line-height: 1.6;
  color: rgb(${({ theme }) => theme.palette.lightergray});
`;

const StepContent = styled.div`
  margin-bottom: 2rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: rgb(${({ theme }) => theme.palette.secondary});
  font-weight: 600;

  ${({ theme }) => theme.breakpoints.sm} {
    font-size: 1.5rem;
  }
`;

const StepText = styled.p`
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
  color: rgb(${({ theme }) => theme.palette.lightergray});
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(${({ theme }) => theme.palette.lightergray}, 0.3);
`;

const DismissButton = styled.button`
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  min-width: 44px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  background-color: rgb(${({ theme }) => theme.palette.secondary});
  color: rgb(${({ theme }) => theme.palette.black});
  border: none;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid rgb(${({ theme }) => theme.palette.secondary});
    outline-offset: 2px;
  }
`;

export default {
  GuideContainer,
  Title,
  Description,
  StepContent,
  StepTitle,
  StepText,
  ButtonContainer,
  DismissButton
};
