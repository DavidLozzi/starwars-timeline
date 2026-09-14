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
  name: 'jedi',
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
        margin-left: .5rem;
        font-size: 1rem;
        font-family: 'Arial Black', Arial, sans-serif;
        text-transform: uppercase;
        /* matches the pill bezel: 1px light top edge + soft drop */
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
      // Two stacked background layers, no filter/box-shadow: the column box is
      // 4rem wide and thousands of rem tall, so box-shadow would trace the box
      // (not the stripe) and a drop-shadow filter would rasterize that whole
      // area. Layer 1 = beveled rod (dark edges, lit core across the 8px
      // stripe). Layer 2 = a wider, offset, soft-edged dark stripe painted
      // behind it as the cast shadow.
      background: `linear-gradient(90deg,
          rgba(190,166,48,1) 0%,
          rgba(${palette.secondary},1) 35%,
          rgba(234,211,94,1) 50%,
          rgba(${palette.secondary},1) 70%,
          rgba(196,171,49,1) 100%) no-repeat center/8px 100%,
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
      // outer drop shadow + inset bezel highlight (top) and shade (bottom)
      boxShadow: `0 .15rem .5rem rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.28),
        inset 0 -1px 2px rgba(90,78,22,0.15)`,
      borderRadius: `${layout.gridWidth}rem`, //${({ theme }) => theme.layout.gridWidth}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem;
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
      // off-center radial highlight reads as a lit sphere; hover must respecify
      // `background` (not backgroundColor) or the gradient survives the swap
      background: `radial-gradient(circle at 34% 28%, rgba(92,152,204,1) 0%, rgba(${palette.primary},1) 55%, rgba(42,92,138,1) 100%)`,
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
