import * as React from 'react';
import { ThemeContext } from 'styled-components';
import Modal from '../../molecules/modal';
import CharacterDetail from '../../organisms/CharacterDetail';
import data from '../../data.json';

import * as Styled from './index.styles';
import MainMenu from '../../organisms/MainMenu';

window.scrolling = false;
addEventListener('scroll', () => {
  window.scrolling = true;
});

const Home = () => {
  const [years, setYears] = React.useState([]);
  const [characters, setCharacters] = React.useState([]);
  const [seenIn, setSeenIn] = React.useState([]);
  const [currentYearIndex, setCurrentYearIndex] = React.useState(0);
  const [currentYear, setCurrentYear] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [modalContents, setModalContents] = React.useState();
  const theme = React.useContext(ThemeContext);

  // zoom level, incremements of years to show
  const [zoomLevel, setZoomLevel] = React.useState(1); 

  const sortOrder = [
    { type: 'era', sort: 1},
    { type: 'movie', sort: 2},
    { type: 'tv', sort: 3 },
    { type: 'character', sort: 4}
  ];

  const convertYear = (year) => {
    if(year <= 0) return `${year * -1} BBY`;
    if(year > 0) return `${year} ABY`;
    return 'none';
  };

  const sortByYear = (a, b) => {
    const aSorter = sortOrder.find(s => s.type === a.type).sort;
    const bSorter = sortOrder.find(s => s.type === b.type).sort;
    if (aSorter > bSorter) return 1;
    if (aSorter < bSorter) return -1;
    return 0;
  };

  const showCharacterModal = (character) => {
    setModalContents(<CharacterDetail character={character} onClose={() => setShowModal(false)} currentYear={currentYear} />);
    setShowModal(true);
  };

  // TODO create node script to generate this output so it's not realtime
  React.useEffect(() => {
    const _newYears = [...years];
    const _startYear = data.sort((a, b) => a.startYear > b.startYear ? 1 : -1)[0].startYear;
    const _endYear = data.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].endYear;

    let yearIndex = 0;
    for(let i = _startYear - zoomLevel; i <= _endYear + zoomLevel; i++) {
      const year = { year: i, display: convertYear(i) };
      const events = data
        .filter(e => (e.startYear === i && e.type !== 'character'))
        .sort(sortByYear)
        .map((e, i) => ({
          ...e,
          index: i,
          yearIndex,
          years: e.endYear - e.startYear,
          startYearDisplay: convertYear(e.startYear),
          endYearDisplay: convertYear(e.endYear)
        }));
      
      _newYears.push({
        ...year,
        yearIndex,
        events,
        eventCount: events.length
      });

      yearIndex++;
    }
    setYears(_newYears);

    const _characters = data
      .filter(e => (e.type === 'character'))
      .sort((a, b) => {
        let retVal = -1;
        if (a.startYear > b.startYear) {
          retVal = 1;
        }
        if (retVal === -1 && a.birthYear && b.birthYear && a.startYear === b.startYear) {
          console.log('sorting birth');
          if (a.birthYear > b.birthYear) {
            retVal = 1;
          }
        }
        return retVal;
      })
      .map((e, index) => ({
        ...e,
        index,
        yearIndex: _newYears.filter(y => y.year === e.startYear)[0].yearIndex,
        years: e.endYear - e.startYear,
        startYearDisplay: convertYear(e.startYear),
        endYearDisplay: convertYear(e.endYear)
      }));
    setCharacters(_characters);
    
    const _seenIn = [];
    _characters
      .forEach(c => {
        if (c.seenIn && c.seenIn.length > 0) {
          c.seenIn.forEach(seen => {
            const seenInYear = _newYears.find(y => y.events.some(e => e.title === seen));
            const seenInEvent = seenInYear.events.find(e => e.title === seen);
            // console.log(seenInEvent);
            _seenIn.push({
              character: c,
              seenInEvent,
              seenInYear
            });
          });
        }
      });
    setSeenIn(_seenIn);

    setInterval(() => {
      if (window.scrolling) {
        window.scrolling = false;
        const pxToRem = window.scrollY / 16;
        setCurrentYearIndex(Math.round(pxToRem / 2));
      }
    }, 150);

  }, [data]);

  /* scroll to
    _year: the year object
    _character: the character object
  */
  const scrollTo = (_year, _character) => {
    let scrollToY = window.scrollY;
    if (_year) {
      scrollToY = (_year.yearIndex - 5) * theme.layout.elements.year.height * theme.layout.pxInRem + theme.layout.topMargin;
    }
    let scrollToX = window.scrollX;
    if (_character) {
      scrollToX = _character.index * 32 + 96;
    }
    window.scrollTo(scrollToX, scrollToY);
  };

  React.useEffect(() => {
    setCurrentYear(years.find(y => y.yearIndex === currentYearIndex + 5));
  }, [currentYearIndex]);

  React.useEffect(() => {
    if (years.length > 0 && characters.length > 0) {
      const scrollToYearNumber = Number(window.location.hash.substr(6));
      const scrollToYear = years.find(y => y.year === scrollToYearNumber);
      const scrollToChar = characters.find(c => c.title === "Chewbacca");
      scrollTo(scrollToYear, scrollToChar);
    }
  }, [seenIn]);

  return (
    <>
      <Styled.Wrapper>
        <Styled.Header>
          <Styled.H1>Ultimate Star Wars Timeline</Styled.H1>
          <MainMenu />
        </Styled.Header>
        {
          years
            .filter(({year}) => year % zoomLevel === 0)
            .map(year => {
              return (
                <React.Fragment
                  key={year.display}
                >

                  <Styled.Year 
                    year={year}
                    isCurrentYear={currentYear?.year === year.year}
                    characterCount={characters.length}
                  />
                  <Styled.YearPill 
                    year={year}
                    isCurrentYear={currentYear?.year === year.year}
                    characterCount={characters.length}
                  >
                    <Styled.Sticky>
                      {year.display}
                    </Styled.Sticky>
                  </Styled.YearPill>
                  {year
                    .events
                    .filter(y => y.type === "era")
                    .sort((a, b) => {
                      if (a.index > b.index) return 1;
                      if (a.index < b.index) return -1;
                      return 0;
                    })
                    .map((era, index) => <>
                      <Styled.Era
                        era={era}
                        key={`${era.title}1`}
                        characterCount={characters.length}
                      />
                      <Styled.EraPill
                        era={era}
                        key={era.title}
                        characterCount={characters.length}
                      >
                        <Styled.Sticky>
                          <Styled.EraLabel>
                            {era.title}
                          </Styled.EraLabel>
                        </Styled.Sticky>
                      </Styled.EraPill>
                    </>
                    )}
                  {year
                    .events
                    .filter(y => y.type === "movie" || y.type === "tv")
                    .sort((a, b) => {
                      if (a.index > b.index) return 1;
                      if (a.index < b.index) return -1;
                      return 0;
                    })
                    .map((movie, index) => <Styled.Movie
                      movie={movie}
                      index={index}
                      key={movie.title}
                      characterCount={characters.length}
                      isCurrentYear={currentYear?.yearIndex === movie.yearIndex}
                    >
                      <Styled.Sticky>
                        {movie.title}
                        {movie.altTitle && <Styled.AltTitle>{movie.altTitle}</Styled.AltTitle>}
                      </Styled.Sticky>
                    </Styled.Movie>
                    )}
                </React.Fragment>
              );
            }
            )
        }
        {
          characters
            .map(character => {
              const startYear = character.birthYear || character.startYear;
              let imageUrl = character.imageUrl || "/images/starwars.jpg";
              if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
                imageUrl = character.imageYears.filter(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)[0].imageUrl;
              }
              return <Styled.Character
                character={character}
                key={character.title}
              >
                {
                  seenIn
                    .filter(s => s.character.title === character.title)
                    .map(seen => <Styled.SeenIn
                      seen={seen}
                      key={`${seen.character.title} - ${seen.seenInEvent.title}`}
                    >
                      <Styled.Circle>
                        <Styled.ToolTip>{seen.character.title} in {seen.seenInEvent.title}</Styled.ToolTip>
                      </Styled.Circle>
                    </Styled.SeenIn>
                    )
                }
                <Styled.Sticky>
                  <Styled.CharacterDetail
                    onClick={() => showCharacterModal(character)}
                    isActive={currentYear?.year >= startYear && currentYear.year <= character.endYear}
                  >
                    <Styled.CharacterImage src={imageUrl} alt={character.title} isActive={currentYear?.year >= startYear && currentYear.year <= character.endYear} />
                    {character.title}
                    {character.altTitle && <Styled.AltTitle>{character.altTitle}</Styled.AltTitle>}
                    {currentYear?.year >= startYear && currentYear.year <= character.endYear && <Styled.AltTitle>{currentYear.year - startYear} yo{character.startYearUnknown ? '?' : ''}</Styled.AltTitle>}
                    {character.endYearUnknown && currentYear?.year + 10 > character.endYear && <Styled.AltTitle>Death?</Styled.AltTitle>}
                  </Styled.CharacterDetail>
                </Styled.Sticky>
              </Styled.Character>;
            }
            )
        }
      </Styled.Wrapper>
      {showModal && <Modal onClickBg={() => setShowModal(false)}>{modalContents}</Modal>}
    </>
  );
};

export default Home;
