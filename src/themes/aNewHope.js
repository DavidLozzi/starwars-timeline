
const layout = { // in rem
  topMargin: 6,
  gridHeight: 2,
  gridWidth: 2,
  elements: {
    year: {
      leftMultiplier: 2
    },
    movie: {
      leftMultiplier: 4
    },
    character: {
      leftMultiplier: 8
    },
    seenIn: {
      leftMultiplier: 8
    }
  }
};
  
const palette = {
  primary: '13,90,160',
  secondary: '175,99,158',
  tertiary: '52,61,155',
  highlight: '215,192,120',
  black: '34,34,34',
  darkGrey: '78,78,78',
  grey: '113,113,113',
  lightGrey: '141,141,141',
  white: '255,255,255',
};
  
export default {
  palette,
  elements: {
    body: {
      backgroundColor: `rgb(${palette.black})`
    },
    header: {
      backgroundColor: `rgb(${palette.white})`,
      // paddingLeft: '2rem'
    },
    menu: {
      ul: {
        backgroundColor: `rgba(${palette.white}, 0.9)`
      },
      li: {
        
      }
    },
    era: {
      background: `linear-gradient(120deg, rgba(${palette.lightGrey},0.75) 0%, rgba(${palette.lightGrey},0.75) 10%, rgba(${palette.black},0.1) 100%)`,
      borderTop: `solid 2px rgb(${palette.grey})`
    },
    year: {
      borderTop: `solid 1px rgb(${palette.lightGrey})`
    },
    currentYear: {
      backgroundColor: `rgba(${palette.white},0.8)`,
      height: '2rem',
      zIndex: '50'
    },
    movie: {
      backgroundColor: `rgba(${palette.tertiary},0.8)`,
      color: `rgb(${palette.white})`,
      borderRadius: '1rem',
      paddingLeft: '1rem',
      lineHeight: '1.8rem',
      fontSize: '.9rem'
    },
    character: {
      background: `linear-gradient(rgba(${palette.highlight},0.5), rgba(${palette.highlight},0.7)) no-repeat center/8px 100%`,
      borderRadius: '50%'
    },
    characterDetail: {
      backgroundColor: `rgba(${palette.highlight},0.9)`,
      borderRadius: `${layout.gridWidth}rem`, //${({ theme }) => theme.layout.gridWidth}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem ${({ theme }) => theme.layout.gridWidth * 0.25}rem;
      fontSize: '.8rem',
      textAlign: 'center'
    },
    characterImage: {
      width: `${layout.gridWidth * 2}rem`,
      height: `${layout.gridWidth * 2}rem`,
      borderRadius: '50%'
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
      backgroundColor: `rgba(${palette.tertiary},0.9)`,
      borderRadius: '50%',
      border: `3px solid rgba(${palette.highlight},0.9)`,
      width: `${layout.gridWidth * .75}rem`,
      height: `${layout.gridWidth * .75}rem`,
      ':hover': {
        width: `${layout.gridWidth}rem`,
        height: `${layout.gridWidth}rem`,
        backgroundColor: `rgba(${palette.highlight},0.9)`
      }
    },
    modalWrapper: {
      backgroundColor: `rgba(${palette.grey},0.8)`
    },
    modal: {
      backgroundColor: `rgba(${palette.white},0.8)`
    }
  },
  layout
};
