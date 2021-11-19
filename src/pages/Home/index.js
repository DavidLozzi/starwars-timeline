import * as React from 'react';
import { useAppContext } from '../../AppContext';
import Modal from '../../molecules/modal';
import CharacterDetail from '../../organisms/CharacterDetail';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';
import analytics, { ACTIONS } from '../../analytics';

import * as Styled from './index.styles';
import MainMenu from '../../organisms/MainMenu';
import Minimap from '../../organisms/Minimap/Minimap';

window.scrolling = false;
addEventListener('scroll', () => {
  window.scrolling = true;
});
// testing web editor on ipad
const Home = () => {
  const [years, setYears] = React.useState([]);
  const [characters, setCharacters] = React.useState([]);
  const [filteredCharacters, setFilteredCharacters] = React.useState([]);
  const [currentYearIndex, setCurrentYearIndex] = React.useState(null);
  const [currentYear, setCurrentYear] = React.useState(0);
  const [currentCharacter, setCurrentCharacter] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [modalContents, setModalContents] = React.useState();
  const { filters, scrollTo, filterCount } = useAppContext();

  // zoom level, incremements of years to show
  const [zoomLevel] = React.useState(1); 

  const showCharacterModal = (character) => {
    setModalContents(<CharacterDetail character={character} onClose={() => setShowModal(false)} currentYear={currentYear} />);
    setShowModal(true);
    window.location.hash = `year=${currentYear.year}&character=${character.title}`;
    analytics.event(ACTIONS.OPEN_CHARACTER, 'character', character.title);
  };

  React.useEffect(() => {
    if (currentYearIndex) {
      const _currentYear = years.find(y => y.yearIndex === currentYearIndex + 5);
      if (_currentYear) {
        setCurrentYear(_currentYear);
        const searchParams = new URLSearchParams(decodeURI(window.location.hash.substr(1)));
        window.location.hash = `year=${_currentYear.year}${searchParams.get('character') ? `&character=${searchParams.get('character')}` : ''}`;
      }
    }
  }, [currentYearIndex]);

  React.useEffect(() => {
    if (years.length > 0 && characters.length > 0) {
      let scrollToYear = null;
      let scrollToChar = null;
      if (window.location.hash.length > 0) {
        const searchParams = new URLSearchParams(window.location.hash.substr(1).replace('&amp;', '&'));
        scrollToYear = years.find(y => y.year === Number(searchParams.get('year')));
        scrollToChar = characters.find(c => c.title.toLowerCase() === (searchParams.get('character')?.toLowerCase() || 'luke skywalker'));
      } else {
        scrollToYear = years.find(y => y.year === 0);
        scrollToChar = characters.find(c => c.title === 'Luke Skywalker');
      }
      scrollTo(scrollToYear, scrollToChar);
      setCurrentCharacter(scrollToChar.title);
      setCurrentYearIndex(scrollToYear.yearIndex);
    }
  }, [years, characters]);

  React.useEffect(() => {
    if (filters?.character) {
      const scrollToChar = characters.find(c => c.title === filters.character);
      let scrollToYear = currentYear;
      if (scrollToYear.year > scrollToChar.endYear || scrollToYear.year < scrollToChar.startYear) {
        const targetYear = scrollToChar.endYear - Math.round((scrollToChar.endYear - scrollToChar.startYear) / 2);
        scrollToYear = years.find(y => y.year === targetYear);
      }
      window.location.hash = `year=${scrollToYear.year}&character=${scrollToChar.title}`;
      scrollTo(scrollToYear, scrollToChar);
      setCurrentCharacter(scrollToChar.title);
      setCurrentYear(scrollToYear);
    }

    let filtChars = [...charactersData];
    if (filters?.metadata && Object.keys(filters?.metadata).length > 0) {
      filtChars = charactersData;
      Object.keys(filters.metadata).forEach(key => {
        const filterValue = filters.metadata[key];
        filtChars = filtChars.filter(c =>
          c.metadata.some(m => m.name === key && m.value === filterValue)
        );
      });
    }
    if (filters?.movie) {
      filtChars = filtChars
        .filter(f => f.seenIn.some(s => s.events.some(e => e.title === filters.movie)))
        .sort((a, b) => a.startYear > b.startYear ? 1 : -1);
      
      const filteredMovieYear = years.find(y => y.events.some(e => e.title === filters.movie));
      scrollTo(filteredMovieYear);
    }

    filtChars = filtChars
      .sort((a, b) => a.startYear > b.startYear ? 1 : -1)
      .map((c, index) => ({ ...c, index }));
    setFilteredCharacters(filtChars);
  }, [filters, filterCount]);

  React.useEffect(() => {
    setYears(yearsData);
    setCharacters(charactersData);
    setFilteredCharacters(charactersData);

    setInterval(() => {
      if (window.scrolling) {
        window.scrolling = false;
        const pxToRem = window.scrollY / 16;
        setCurrentYearIndex(Math.round(pxToRem / 2));
      }
    }, 100);

  }, []);

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
              const movies = year
                .events
                .filter(y => (y.type === 'movie' || y.type === 'tv') && y.endYear === year.year);
              const spanningMovies = year
                .events
                .filter(y => (y.type === 'movie' || y.type === 'tv') && y.endYear !== year.year);
              return (
                <React.Fragment
                  key={year.display}
                >

                  <Styled.Year 
                    year={year}
                    isCurrentYear={currentYear?.year === year.year}
                    characterCount={filteredCharacters.length}
                  />
                  <Styled.YearPill 
                    year={year}
                    isCurrentYear={currentYear?.year === year.year}
                    characterCount={filteredCharacters.length}
                  >
                    <Styled.Sticky>
                      {year.display}
                    </Styled.Sticky>
                  </Styled.YearPill>
                  {year
                    .events
                    .filter(y => y.type === 'era')
                    .sort((a, b) => {
                      if (a.index > b.index) return 1;
                      if (a.index < b.index) return -1;
                      return 0;
                    })
                    .map((era) => <>
                      <Styled.Era
                        era={era}
                        key={`${era.title}1`}
                        characterCount={filteredCharacters.length}
                      />
                      <Styled.EraPill
                        era={era}
                        key={era.title}
                        characterCount={filteredCharacters.length}
                      >
                        <Styled.Sticky>
                          <Styled.EraLabel>
                            {era.title}
                          </Styled.EraLabel>
                        </Styled.Sticky>
                      </Styled.EraPill>
                    </>
                    )}
                  {spanningMovies.length > 0 && spanningMovies.map((movie, index) => <Styled.Movie
                    movie={movie}
                    index={index}
                    key={movie.title}
                    characterCount={filteredCharacters.length}
                    isCurrentYear={currentYear?.yearIndex === year.year}
                  >
                    <Styled.Sticky>
                      <Styled.MovieTitle>{movie.title}</Styled.MovieTitle>
                    </Styled.Sticky>
                  </Styled.Movie>
                  )}
                  {movies.length > 0 && <Styled.Movie
                    movie={movies[0]}
                    index={spanningMovies.length}
                    characterCount={filteredCharacters.length}
                    isCurrentYear={currentYear?.yearIndex === year.year}
                  >
                    <Styled.Sticky>
                      {movies
                        .sort((a, b) => a.title > b.title ? 1 : -1)
                        .map((movie) => <Styled.MovieTitle key={movie.title}>{movie.title}</Styled.MovieTitle>
                        )}
                    </Styled.Sticky>
                  </Styled.Movie>
                  }
                </React.Fragment>
              );
            }
            )
        }
        {
          characters
            .filter(c => filteredCharacters.some(f => f.title === c.title))
            .map(c => {
              const character = filteredCharacters.find(f => f.title === c.title);
              const startYear = character.birthYear || character.startYear;
              let imageUrl = character.imageUrl || '/images/starwars.jpg';
              if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
                imageUrl = character.imageYears.filter(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)[0].imageUrl;
              }
              return <React.Fragment
                key={character.title}>
                <Styled.CharacterColumn
                  character={character}
                >
                </Styled.CharacterColumn>
                <Styled.CharacterPill
                  character={character}
                >
                  <Styled.Sticky>
                    <Styled.CharacterDetail
                      onClick={() => showCharacterModal(character)}
                      isActive={currentYear?.year >= startYear && currentYear.year <= character.endYear}
                      isCurrent={currentCharacter === character.title}
                    >
                      <Styled.CharacterImage src={imageUrl} alt={character.title} isActive={currentYear?.year >= startYear && currentYear.year <= character.endYear} />
                      {character.title}
                      {character.altTitle && <Styled.AltTitle>{character.altTitle}</Styled.AltTitle>}
                      {currentYear?.year >= startYear && currentYear.year <= character.endYear && <Styled.AltTitle>{currentYear.year - startYear} yo{character.startYearUnknown ? '?' : ''}</Styled.AltTitle>}
                      {character.endYearUnknown && currentYear?.year + 10 > character.endYear && <Styled.AltTitle>End?</Styled.AltTitle>}
                    </Styled.CharacterDetail>
                  </Styled.Sticky>
                </Styled.CharacterPill>
                {
                  character.seenIn
                    .sort((a,b) => a.year < b.year ? 1 : -1) // purposly sorting backwards for writing to the DOM and overlapping tooltips
                    .map((seen) => <Styled.SeenIn
                      seen={seen}
                      character={character}
                      key={`seen${seen.year}${character.title}`}
                    >
                      <Styled.Circle>
                        <Styled.ToolTip>
                          {character.title} is in&nbsp;
                          {seen.events.map(e => 
                            <Styled.SeenInEvent key={`${character.title}${e.title}`}>{e.title}</Styled.SeenInEvent>
                          )}
                        </Styled.ToolTip>
                      </Styled.Circle>
                    </Styled.SeenIn>
                    )
                }
              </React.Fragment>;
            }
            )
        }
      </Styled.Wrapper>
      {showModal && <Modal onClickBg={() => setShowModal(false)}>{modalContents}</Modal>}
      <Minimap />
    </>
  );
};

export default Home;
