import { css } from 'styled-components';

// Layout stays numerically identical to the Star Wars pack — the plan
// forbids layout changes; only palette/vocabulary are pack-specific.
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

// Marvel red + gold, on a near-black ground — distinct from the Jedi blue /
// Sith magenta palettes, not a recolor of either.
const palette = {
  primary: '178,24,32',
  secondary: '212,175,55',
  tertiary: '90,16,20',
  black: '18,18,18',
  darkgray: '60,60,60',
  gray: '90,90,90',
  lightgray: '150,150,150',
  lightergray: '205,205,205',
  white: '255,255,255',
};

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
  name: 'mcu',
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
        color: rgb(${palette.secondary});
        margin-left: .5rem;
        font-size: 1rem;
        font-family: 'Arial Black', Arial, sans-serif;
        text-transform: uppercase;
        text-shadow: 0 1px 0 rgba(255,241,168,0.22), 0 .1rem .3rem rgba(0,0,0,0.55);
      }
      ${breakpoints.md} {
        h1 {
          margin-left: 2rem;
          font-size: 1.4rem;
        }
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
          background: linear-gradient(120deg, rgba(${palette.black}, 1) 0%, rgba(${palette.black}, 1) 10%, rgba(${palette.black}, 0.75) 100%);
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
      // Two stacked background layers, no filter/box-shadow: see the Star
      // Wars jedi theme for why (the column box is 4rem wide and thousands
      // of rem tall, so a filter/box-shadow would rasterize/trace the whole
      // box instead of just the stripe).
      background: `linear-gradient(90deg,
          rgba(140,18,24,1) 0%,
          rgba(${palette.primary},1) 35%,
          rgba(214,60,68,1) 50%,
          rgba(${palette.primary},1) 70%,
          rgba(146,20,26,1) 100%) no-repeat center/8px 100%,
        linear-gradient(90deg,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0.15) 40%,
          rgba(0,0,0,0.15) 70%,
          rgba(0,0,0,0) 100%) no-repeat calc(50% + 2px) center/11px 100%`,
      transition: 'all 300ms ease-in-out'
    },
    characterDetail: {
      background: `linear-gradient(180deg, rgba(234,209,88,1) 0%, rgba(${palette.secondary},1) 55%, rgba(213,186,53,1) 100%)`,
      border: '1px solid rgba(255,241,168,0.25)',
      boxShadow: `0 .15rem .5rem rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.28),
        inset 0 -1px 2px rgba(90,78,22,0.15)`,
      borderRadius: `${layout.gridWidth}rem`,
      fontSize: '.8rem',
      textAlign: 'center',
      filter: 'grayscale(75%)'
    },
    characterDetailActive: {
      filter: 'grayscale(0)',
      boxShadow: `0 .18rem .6rem rgba(0,0,0,0.24),
        inset 0 1px 0 rgba(255,255,255,0.38),
        inset 0 -1px 2px rgba(90,78,22,0.15)`
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
      background: `radial-gradient(circle at 34% 28%, rgba(214,60,68,1) 0%, rgba(${palette.primary},1) 55%, rgba(120,14,19,1) 100%)`,
      borderRadius: '50%',
      border: `3px solid rgba(${palette.secondary},1)`,
      boxShadow: '0 .1rem .3rem rgba(0,0,0,0.22), inset 0 -1px 2px rgba(0,0,0,0.15)',
      width: `${layout.gridWidth * .75}rem`,
      height: `${layout.gridWidth * .75}rem`,
      ':hover': {
        width: `${layout.gridWidth}rem`,
        height: `${layout.gridWidth}rem`,
        background: `radial-gradient(circle at 34% 28%, rgba(240,217,100,1) 0%, rgba(${palette.secondary},1) 55%, rgba(191,166,45,1) 100%)`
      }
    },
    deathCircle: {
      backgroundColor: `rgba(${palette.black},1)`,
      borderRadius: '50%',
      border: `3px solid rgba(${palette.secondary},1)`,
      width: `${layout.gridWidth * .75}rem`,
      height: `${layout.gridWidth * .75}rem`,
      transition: 'all 300ms ease-in-out',
      display: 'flex',
      justifyContent: 'center',
      ':hover': {
        backgroundColor: `rgba(${palette.black},1)`
      }
    },
    modalWrapper: css`
      background-color: rgba(${palette.gray},0.7)
    `,
    modal: css`
      background-color: rgba(${palette.white},1);
      color: ${palette.white};
    `,
    modalClose: css`

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
