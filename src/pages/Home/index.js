import * as React from 'react';
import data from '../../data.json';

import * as Styled from './index.styles';

const Home = () => {
  const [years, setYears] = React.useState([]);
  const [characters, setCharacters] = React.useState([]);
  const [seenIn, setSeenIn] = React.useState([]);
  const [startYear, setStartYear] = React.useState(0);
  const [endYear, setEndYear] = React.useState(0);

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

  // create 1 array of events
  // set isSpanning, isStarting, isEnding (just in case)
  // add index to have consistent column counts
  // sort by era, movie, tv, book, event, character
  // TODO create node script to generate this output so it's not realtime
  React.useEffect(() => {
    const _newYears = [...years];
    const _startYear = data.sort((a, b) => a.startYear > b.startYear ? 1 : -1)[0].startYear;
    const _endYear = data.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].endYear;
    console.log('start', _startYear, 'end',  _endYear);
    setStartYear(_startYear);
    setEndYear(_endYear);
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
            const seenInYear = _newYears.filter(y => y.events.some(e => e.title === seen))[0];
            const seenInEvent = seenInYear.events.filter(e => e.title === seen)[0];
            console.log(seenInEvent);
            _seenIn.push({
              character: c,
              seenInEvent,
              seenInYear
            });
          });
        }
      });
    setSeenIn(_seenIn);
  }, [data]);

  return (
    <>
      <h1>Interactive Star Wars Timeline</h1>
      <Styled.Wrapper>
        {
          years
            .filter(({year}) => year % zoomLevel === 0)
            .map(year => {
              return (
                <>
                  <Styled.Year 
                    key={year.display}
                    year={year}>
                    {year.display}
                  </Styled.Year>
                  {year
                    .events
                    .filter(y => y.type === "era")
                    .sort((a, b) => {
                      if (a.index > b.index) return 1;
                      if (a.index < b.index) return -1;
                      return 0;
                    })
                    .map((e, index) => <Styled.Era
                      era={e}
                    >
                      <Styled.Sticky>
                        <Styled.EraLabel>
                          {e.imageUrl && <Styled.Image src={e.imageUrl} alt={e.title} />}
                          {e.title} {e.startYearDisplay} - {e.endYearDisplay}
                          {e.altTitle && <Styled.AltTitle>{e.altTitle}</Styled.AltTitle>}
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
                    .map((e, index) => <Styled.Movie
                      movie={e}
                      index={index}
                    >
                      {e.imageUrl && <Styled.Image src={e.imageUrl} alt={e.title} />}
                      {e.title}
                      {e.altTitle && <Styled.AltTitle>{e.altTitle}</Styled.AltTitle>}
                    </Styled.Movie>
                    )}
                </>
              );
            }
            )
        }
        {
          characters
            .map(character => <Styled.Character
              character={character}
            >
              <Styled.Sticky>
                {character.imageUrl && <Styled.Image src={character.imageUrl} alt={character.title} />}
                {character.title}
                {character.altTitle && <Styled.AltTitle>{character.altTitle}</Styled.AltTitle>}
              </Styled.Sticky>
            </Styled.Character>
            )
        }
        {
          seenIn
            .map(seen => <Styled.SeenIn
              seen={seen}
              title={`${seen.character.title} - ${seen.seenInEvent.title}`}
            >
            </Styled.SeenIn>
            )
        }
      </Styled.Wrapper>
    </>
  );
};

export default Home;