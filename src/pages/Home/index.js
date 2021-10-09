import * as React from 'react';
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
    console.log(character);
    setModalContents(<CharacterDetail character={character} onClose={() => setShowModal(false)} currentYear={currentYear} />);
    setShowModal(true);
  };

  // create 1 array of events
  // set isSpanning, isStarting, isEnding (just in case)
  // add index to have consistent column counts
  // sort by era, movie, tv, book, event, character
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
      .sort((a, b) => a.startYear > b.startYear ? 1 : -1)
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
        // console.log(Math.round((pxToRem / 2)) - 6);
        setCurrentYearIndex(Math.round(pxToRem / 2));
      }
    }, 300);

  }, [data]);

  React.useEffect(() => {
    // console.log(years.find(y => y.yearIndex === currentYearIndex));
    setCurrentYear(years.find(y => y.yearIndex === currentYearIndex + 2));
  }, [currentYearIndex]);

  React.useEffect(() => {
    if (years.length > 0 && characters.length > 0) {
      const scrollToY = (years.find(y => y.year === 0).yearIndex - 2) * 32;
      const scrollToX = characters.find(c => c.title === "Luke Skywalker").index * 32 + 96;
      window.scrollTo(scrollToX, scrollToY);
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
                    isCurrentYear={currentYear?.year === year.year}>
                    <Styled.Sticky>
                      {year.display}
                    </Styled.Sticky>
                  </Styled.Year>
                  {year
                    .events
                    .filter(y => y.type === "era")
                    .sort((a, b) => {
                      if (a.index > b.index) return 1;
                      if (a.index < b.index) return -1;
                      return 0;
                    })
                    .map((era, index) => <Styled.Era
                      era={era}
                      key={era.title}
                    >
                      <Styled.Sticky>
                        <Styled.EraLabel>
                          {era.title} {era.startYearDisplay} - {era.endYearDisplay}
                          {era.altTitle && <Styled.AltTitle>{era.altTitle}</Styled.AltTitle>}
                        </Styled.EraLabel>
                      </Styled.Sticky>
                    </Styled.Era>
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
                  // data-tip={`${convertYear(character.startYear)} - ${convertYear(character.endYear)}`}
                  >
                    <Styled.CharacterImage src={imageUrl} alt={character.title} />
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