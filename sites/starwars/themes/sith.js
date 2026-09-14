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
      leftPageMargin: 10,
      pillHeight: 9.5 // CharacterDetail min-height; also how far the pill rides above the line
    }
  }
};
  
const palette = {
  primary: '143,6,8',
  secondary: '175,99,158',
  tertiary: '143,6,8',
  black: '34,34,34',
  darkgray: '78,78,78',
  gray: '113,113,113',
  lightgray: '141,141,141',
  lightergray: '200,200,200',
  white: '255,255,255',
};

// Kept in sync with the Jedi theme — components reference theme.breakpoints
// regardless of which theme is active.
const windowWidths = {
  sm: 390,
  md: 640,
  lg: 1024
};

const breakpoints = {
  sm: `@media screen and (min-width: ${windowWidths.sm}px)`,
  md: `@media screen and (min-width: ${windowWidths.md}px)`,
  lg: `@media screen and (min-width: ${windowWidths.lg}px)`
};

export default {
  name: 'sith',
  palette,
  breakpoints,
  windowWidths,
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
      /* matches the pill bezel: 1px light top edge + soft drop */
      text-shadow: 0 1px 0 rgba(255,241,168,0.22), 0 .1rem .3rem rgba(0,0,0,0.55);
    }
  `,
    menu: {
      ul: css`
        background-color: rgba(${palette.black}, 0.95);
      `,
      li: css`
        color: rgb(${palette.white});
        a {
          color: rgb(${palette.secondary});
          :hover {
            color: rgb(${palette.primary});
          }
        }
      `,
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
      background: linear-gradient(120deg, rgba(${palette.darkgray},0.75) 0%, rgba(${palette.darkgray},0.75) 10%, rgba(${palette.black},0.1) 100%);
    `,
    eraPill: css`
      background-color: rgb(${palette.darkgray});
      color: rgb(${palette.lightergray});
      border-radius: 1rem;
      padding: .4rem;
      font-size: .8rem;
      `,
    year: {
      borderTop: `solid 1px rgb(${palette.gray})`,
      borderRadius: '1rem',
    },
    yearPill: {
      backgroundColor: `rgb(${palette.gray})`,
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
    },
    character: {
      // See the Jedi theme for why this is two background layers rather than a
      // box-shadow or drop-shadow filter: beveled rod + offset cast shadow.
      background: `linear-gradient(90deg,
          rgba(150,85,135,1) 0%,
          rgba(${palette.secondary},0.85) 35%,
          rgba(197,138,183,1) 50%,
          rgba(${palette.secondary},0.85) 70%,
          rgba(155,88,140,1) 100%) no-repeat center/8px 100%,
        linear-gradient(90deg,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0.15) 40%,
          rgba(0,0,0,0.15) 70%,
          rgba(0,0,0,0) 100%) no-repeat calc(50% + 2px) center/11px 100%`,
      borderRadius: '50%',
      transition: 'all 300ms ease-in-out'
    },
    characterDetail: {
      background: `linear-gradient(180deg, rgba(191,124,176,1) 0%, rgba(${palette.secondary},0.9) 55%, rgba(155,86,140,1) 100%)`,
      border: '1px solid rgba(235,190,225,0.2)',
      // outer drop shadow + inset bezel highlight (top) and shade (bottom)
      boxShadow: `0 .15rem .5rem rgba(0,0,0,0.24),
        inset 0 1px 0 rgba(255,255,255,0.22),
        inset 0 -1px 2px rgba(50,25,45,0.18)`,
      borderRadius: `${layout.gridWidth}rem`, //${({ theme }) => theme.layout.gridWidth}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem;
      fontSize: '.8rem',
      textAlign: 'center',
      filter: 'grayscale(75%)'
    },
    characterDetailActive: {
      filter: 'grayscale(0)',
      boxShadow: `0 .18rem .6rem rgba(0,0,0,0.28),
        inset 0 1px 0 rgba(255,255,255,0.32),
        inset 0 -1px 2px rgba(50,25,45,0.18)`
    },
    characterDetailCurrent: {
      transition: 'all 150ms eaase-in-out'
    },
    characterDetailModal: css`
      color: rgb(${palette.white});
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
      // off-center radial highlight reads as a lit sphere; hover must respecify
      // `background` (not backgroundColor) or the gradient survives the swap
      background: `radial-gradient(circle at 34% 28%, rgba(178,42,44,0.92) 0%, rgba(${palette.tertiary},0.9) 55%, rgba(107,5,7,0.92) 100%)`,
      borderRadius: '50%',
      border: `3px solid rgba(${palette.secondary},0.8)`,
      boxShadow: '0 .1rem .3rem rgba(0,0,0,0.25), inset 0 -1px 2px rgba(0,0,0,0.18)',
      width: `${layout.gridWidth * .75}rem`,
      height: `${layout.gridWidth * .75}rem`,
      ':hover': {
        width: `${layout.gridWidth}rem`,
        height: `${layout.gridWidth}rem`,
        background: `radial-gradient(circle at 34% 28%, rgba(197,138,183,0.92) 0%, rgba(${palette.secondary},0.9) 55%, rgba(140,77,126,0.92) 100%)`
      }
    },
    modalWrapper: {
      backgroundColor: `rgba(${palette.gray},0.8)`
    },
    modal: css`
      background-color: rgba(${palette.black},0.8);
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
      color: rgb(${({ theme }) => theme.palette.secondary});

      :hover {
        color: rgb(${({ theme }) => theme.palette.primary});
      }
    `
  },
  layout
};
