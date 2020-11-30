import * as React from 'react';
import data from '../../data.json';

import * as Styled from './index.styles';

const Home = () => {
  const [years, setYears] = React.useState([]);

  const convertYear = (year) => {
    if(year <= 0) return `${year * -1} BBY`;
    if(year > 0) return `${year} ABY`;
    return 'none';
  };

  const sortByYear = (a, b) => {
    if(a.startYear > b.startYear) return 1;
    if(a.startYear < b.startYear) return -1;
    return 0;
  };

  // create 1 array of events
  // set isSpanning, isStarting, isEnding (just in case)
  // add index to have consistent column counts
  // sort by era, movie, tv, book, event, character
  React.useEffect(() => {
    const newYears = [...years];
    for(let i = data.startYear; i <= data.endYear; i++) {
      const year = { year: i, display: convertYear(i) };
      const events = data.events.filter(e => e.startYear === i && !e.endYear).sort(sortByYear);
      const spanningEvents = data.events.filter(e => e.startYear <= i && e.endYear >= i).sort(sortByYear);
      const eventCount = events.length + spanningEvents.length;
      newYears.push({ ...year, events, spanningEvents, eventCount });
    }
    setYears(newYears);
  }, [data]);

  return (
    <>
      <h1>Interactive Star Wars Timeline</h1>
      <Styled.Wrapper>
        <h3>Year</h3>
        {
          years
            .map(year => {
              return (
                <Styled.Year count={year.events.length === 0 ? 1 : year.events.length}>{year.display}
                  {year
                    .spanningEvents
                    .filter(e => e.startYear === year.year)
                    .map((e, index) => <Styled.SpanningEvent
                      years={e.endYear - e.startYear}
                      type={e.type}
                      count={index + 1 + year.spanningEvents.length - year.spanningEvents.filter(e => e.startYear === year.year).length}
                    >
                      {e.imageUrl && <Styled.Image src={e.imageUrl} alt={e.title} />}
                      {e.title}
                      {e.altTitle && <Styled.AltTitle>{e.altTitle}</Styled.AltTitle>}
                    </Styled.SpanningEvent>)}
                  {year.events.map((e, index) => {
                    if(e.type === "movie") {
                      return (<Styled.Movie
                        count={index}>
                        {e.imageUrl && <Styled.Image src={e.imageUrl} alt={e.title} />}
                        {e.title}
                        {e.altTitle && <Styled.AltTitle>{e.altTitle}</Styled.AltTitle>}
                        {year
                          .spanningEvents
                          .filter(s => s.seenIn?.some(si => si === e.title))
                          .map((s, sindex) => <Styled.CrossEvent count={year.spanningEvents.findIndex(f => f.title === s.title) - 1}> 👀</Styled.CrossEvent>)}
                      </Styled.Movie>);
                    }
                    if(e.type === "tv") {
                      return (<Styled.Tv
                        count={index}>
                        {e.imageUrl && <Styled.Image src={e.imageUrl} alt={e.title} />}
                        {e.title}
                        {e.altTitle && <Styled.AltTitle>{e.altTitle}</Styled.AltTitle>}
                        {year
                          .spanningEvents
                          .filter(s => s.seenIn?.some(si => si === e.title))
                          .map((s, sindex) => <Styled.CrossEvent count={year.spanningEvents.findIndex(f => f.title === s.title) - 1}>👀</Styled.CrossEvent>)}
                      </Styled.Tv>);
                    }
                  }
                  )}
                </Styled.Year>
              );
            }
            )
        }
      </Styled.Wrapper>
    </>
  );
};

export default Home;