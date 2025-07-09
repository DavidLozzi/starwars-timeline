import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 70vh;
    max-width: 900px;
    margin: 0 auto;
  `,
  
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 800px;
  `,
  
  Header: styled.div`
    text-align: center;
    margin-bottom: 2rem;
  `,
  
  Title: styled.h1`
    font-size: 2.5rem;
    margin: 0;
    color: rgb(${({ theme }) => theme.palette.black});
    font-weight: bold;
    line-height: 1.2;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  `,
  
  Content: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-bottom: 2rem;
  `,
  
  ContentText: styled.p`
    font-size: 1.25rem;
    line-height: 1.6;
    color: rgb(${({ theme }) => theme.palette.darkgray});
    margin: 0 0 2rem 0;
    max-width: 600px;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  `,
  
  GifPlaceholder: styled.div`
    width: 100%;
    max-width: 400px;
    height: 200px;
    background-color: rgba(${({ theme }) => theme.palette.lightergray}, 0.3);
    border: 2px dashed rgb(${({ theme }) => theme.palette.lightgray});
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  `,
  
  GifText: styled.span`
    color: rgb(${({ theme }) => theme.palette.gray});
    font-style: italic;
    font-size: 1rem;
  `,
  
  Footer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  `,
  
  DotsContainer: styled.div`
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  `,
  
  Dot: styled.button`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background-color: ${({ active, theme }) => active ? `rgb(${theme.palette.primary})` : `rgba(${theme.palette.lightgray}, 0.5)`};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: ${({ active, theme }) => active ? `rgb(${theme.palette.primary})` : `rgba(${theme.palette.gray}, 0.7)`};
    }
  `,
  
  ButtonContainer: styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  `,
  
  Button: styled.button`
    ${({ theme, primary }) => theme.elements.form.button(theme, !primary)};
    min-width: 120px;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  `,
  
  PrimaryButton: styled.button`
    ${({ theme }) => theme.elements.form.button(theme, false)};
    min-width: 120px;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: rgb(${({ theme }) => theme.palette.primary});
    color: rgb(${({ theme }) => theme.palette.white});
    border-color: rgb(${({ theme }) => theme.palette.primary});
    
    &:hover {
      background-color: rgba(${({ theme }) => theme.palette.primary}, 0.8);
    }
  `
};