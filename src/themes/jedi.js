import { css } from 'styled-components';

const layout = { // in rem
  pxInRem: 16, // pixels in a rem
  topMargin: 6,
  gridHeight: 2,
  gridWidth: 2,
  elements: {
    year: {
      height: 2,
      leftPageMargin: 2
    },
    movie: {
      leftPageMargin: 8,
      nextMoviePad: 8
    },
    character: {
      width: 4,
      spacer: 1,
      leftPageMargin: 10
    }
  }
};
  
const palette = {
  primary: '54,116,172',
  secondary: '224,196,56',
  tertiary: '52,61,155',
  black: '30,30,30',
  darkgray: '70,70,70',
  gray: '100,100,100',
  lightgray: '141,141,141',
  lightergray: '200,200,200',
  white: '255,255,255',
};


export default {
  name: 'jedi',
  palette,
  elements: {
    body: css`
      background-color: rgb(${palette.black});
      margin: 0;
      font-family: 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: 'antialiased';
      -moz-osx-font-smoothing: 'grayscale';
    `,
    header: css`
      background-color: rgb(${palette.black});
      h1 {
        color: rgb(224,196,56);
        margin-left: 2rem;
        font-size: 1.3rem;
        font-family: Arial Black;
        text-transform: uppercase;
      }
    `,
    menu: {
      ul: {
        backgroundColor: `rgba(${palette.white}, 0.95)`
      },
      li: css`
        color: rgb(${palette.black});
        a {
          color: rgb(${palette.black});

          :hover {
            color: rgb(${palette.primary});
          }
        }
      `
    },
    form: {
      button: (theme, invert) => css`
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 1rem;
          height: 2rem;
          font-size: .75rem;
          border: solid 2px rgb(${theme.palette.primary});
          background-color: rgb(${theme.palette.primary});
          color: rgb(${theme.palette.white});
          padding: .5rem;
          min-width: 5rem;
          font-weight: bold;
          margin-left: 1rem;
          cursor: pointer;

          &:hover {
            background-color: rgba(${theme.palette.primary}, 0.8);
          }

          ${invert && css`
            background-color: rgb(${theme.palette.white});
            color: rgb(${theme.palette.primary});
          &:hover {
            background-color: rgba(${theme.palette.lightgray}, 0.2);
          }
          `}
        `
    },
    era: css`
          background: linear-gradient(120deg, rgba(${ palette.black }, 1) 0%, rgba(${ palette.black }, 1) 10%, rgba(${ palette.black }, 0.75) 100%);
    `,
    eraPill: css`
      background-color: rgb(${palette.gray});
      color: rgb(${palette.black});
      border-radius: 1rem;
      padding: .4rem;
      font-size: .8rem;
    `,
    year: {
      borderTop: `solid 1px rgb(${palette.darkgray})`,
      borderRadius: '1rem',
    },
    yearPill: {
      backgroundColor: `rgb(${palette.lightgray})`,
      borderRadius: '1rem',
      padding: '.4rem',
      fontSize: '.8rem'
    },
    yearPillCurrent: {
      backgroundColor: `rgba(${palette.white},0.8)`
    },
    currentYear: {
      backgroundColor: `rgba(${palette.white},0.8)`,
      height: '2rem',
      zIndex: '20'
    },
    currentYearText: {
      zIndex: '40'
    },
    movie: {
      backgroundColor: `rgba(${palette.primary},1)`,
      border: `1px solid rgba(${palette.lightergray},0.3)`,
      color: `rgb(${palette.white})`,
      borderRadius: '1rem',
      paddingLeft: '1rem',
      lineHeight: '1.8rem',
      fontSize: '.8rem',
    },
    currentMovie: {
      backgroundColor: `rgba(${palette.primary},0.8)`,
    },
    character: {
      background: `linear-gradient(rgba(${palette.secondary},1), rgba(${palette.secondary},1)) no-repeat center/8px 100%`,
      borderRadius: '50%',
      transition: 'all 300ms ease-in-out'
    },
    characterDetail: {
      backgroundColor: `rgba(${palette.secondary},1)`,
      borderRadius: `${layout.gridWidth}rem`, //${({ theme }) => theme.layout.gridWidth}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem;
      fontSize: '.8rem',
      textAlign: 'center',
      filter: 'grayscale(75%)'
    },
    characterDetailActive: {
      filter: 'grayscale(0)'
    },
    characterDetailCurrent: {
      transition: 'all 150ms eaase-in-out'
    },
    characterDetailModal: css`
      color: rgb(${palette.black});
    `,
    characterDetailCurrentAnimation: {
      '0%': {
        transform: 'rotate(3deg)',
        filter: 'brightness(1.3)'
      },
      '20%': {
        transform: 'rotate(-3deg)',
        filter: 'brightness(1)'
      },
      '40%': {
        transform: 'rotate(3deg)',
        filter: 'brightness(1.5)'
      },
      '60%': {
        transform: 'rotate(-5deg)',
        filter: 'brightness(1)'
      },
      '80%': {
        transform: 'rotate(4deg)',
        filter: 'brightness(1.3)'
      },
      '100%': {
        transform: 'rotate(0deg)',
        filter: 'brightness(1)'
      }
    },
    characterImage: {
      width: `${layout.gridWidth * 2}rem`,
      height: `${layout.gridWidth * 2}rem`,
      borderRadius: '50%',
      filter: 'grayscale(75%)',
      transition: 'all 300ms ease-in-out'
    },
    characterImageActive: {
      filter: 'grayscale(0)'
    },
    toolTip: {
      backgroundColor: `rgb(${palette.white})`,
      fontSize: '.7rem',
      borderRadius: '1rem',
      padding: '.5rem'
    },
    altTitle: {
      fontSize: '.7rem',
      fontStyle: 'italic'
    },
    seenInCircle: {
      backgroundColor: `rgba(${palette.primary},1)`,
      borderRadius: '50%',
      border: `3px solid rgba(${palette.secondary},1)`,
      width: `${layout.gridWidth * .75}rem`,
      height: `${layout.gridWidth * .75}rem`,
      ':hover': {
        width: `${layout.gridWidth}rem`,
        height: `${layout.gridWidth}rem`,
        backgroundColor: `rgba(${palette.secondary},1)`
      }
    },
    modalWrapper: {
      backgroundColor: `rgba(${palette.gray},1)`
    },
    modal: css`
      background-color: rgba(${palette.white},1);
      color: ${palette.white};
    `,
    listItem: css`
      border: 0;
      background: transparent;
      width: 100%;
      height: 1.6rem;
      font-size: .8rem;
      display: block;
      padding: 0;
      text-align: left;
      cursor: pointer;
      text-decoration: underline;
      color: rgb(${({ theme }) => theme.palette.primary});

      :hover {
        color: rgb(${({ theme }) => theme.palette.tertiary});
      }
    `
  },
  layout
};
