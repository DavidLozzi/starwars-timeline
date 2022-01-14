import * as React from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import Modal from '../../molecules/modal';
import CharacterDetailModal from '../../organisms/CharacterDetailModal';
import CharacterDetailPill from '../../organisms/CharacterDetailPill';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';
import analytics, { ACTIONS } from '../../analytics';

import * as Styled from './index.styles';
import MainMenu from '../../organisms/MainMenu';
import Minimap from '../../organisms/Minimap/Minimap';
import SeenIn from '../../organisms/SeenIn';

window.scrolling = false;
addEventListener('scroll', () => {
  window.scrolling = true;
});
// testing web editor on ipad
const Home = () => {
  const routeParams = useParams();
  const history = useHistory();
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

  const showCharacter = (character) => {
    history.push(`/character/${character.title}?year=${currentYear.year}&show=true`);
    showCharacterModal(character);
  };

  const showCharacterModal = (character) => {
    setModalContents(<CharacterDetailModal character={character} onClose={() => setShowModal(false)} currentYear={currentYear} />);
    setShowModal(true);
    analytics.event(ACTIONS.OPEN_CHARACTER, 'character', character.title);
  };

  React.useEffect(() => {
    if (currentYearIndex) {
      const _currentYear = years.find(y => y.yearIndex === currentYearIndex + 5);
      const searchParams = new URLSearchParams(window.location.search);
      if (_currentYear) {
        setCurrentYear(_currentYear);
        if (Number(searchParams.get('year')) !== _currentYear.year) {
          history.push({
            pathname: window.location.pathname,
            search: `year=${_currentYear.year}`
          });
        }
      }
    }
  }, [currentYearIndex]);

  React.useEffect(() => {
    if (years.length > 0 && characters.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      let scrollToChar;
      if (routeParams?.character) {
        scrollToChar = charactersData.find(c => c.title.toLowerCase() === routeParams.character.toLowerCase());
        if (scrollToChar) {
          setCurrentCharacter(scrollToChar.title);
          if (Boolean(searchParams.get('show')) == true) {
            showCharacter(scrollToChar);
          }
        }
      }
      if (!scrollToChar) {
        scrollToChar = characters.find(c => c.title === 'Luke Skywalker');
        history.push(`/character/${scrollToChar.title}?year=${currentYear.year}&show=true`);
      }

      let scrollToYear = null;
      if (searchParams.get('year')) {
        scrollToYear = years.find(y => y.year === Number(searchParams.get('year')));
      } else {
        scrollToYear = years.find(y => y.year === 0);
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
      window.location.search = `year=${scrollToYear.year}`;
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
                .filter(y => (y.type === 'movie' || y.type === 'tv')); // && y.endYear === year.year)
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
                    .map((era) => {
                      const endYear = years.find(y => y.year === era.endYear);
                      return <>
                        <Styled.Era
                          era={era}
                          key={`${era.title}1`}
                          characterCount={filteredCharacters.length}
                          endYear={endYear}
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
                      </>;}
                    )}

                  {movies
                    .map((movie) => <Styled.Movie
                      movie={movie}
                      characterCount={filteredCharacters.length}
                      isCurrentYear={currentYear?.year === year.year}
                      key={movie.title}
                    >
                      <Styled.Sticky>
                        <Styled.MovieTitle>{movie.title}</Styled.MovieTitle>
                      </Styled.Sticky>
                    </Styled.Movie>
                    )
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

              return <React.Fragment
                key={character.title}>
                <Styled.CharacterColumn
                  character={character}
                >
                </Styled.CharacterColumn>
                <CharacterDetailPill
                  character={character}
                  currentYear={currentYear}
                  currentCharacter={currentCharacter}
                  onPillPress={showCharacter}
                />
                {
                  character.seenIn
                    .sort((a,b) => a.year < b.year ? 1 : -1) // purposly sorting backwards for writing to the DOM and overlapping tooltips
                    .map((seen) => <SeenIn
                      seen={seen}
                      character={character}
                      key={`seen${seen.year}${character.title}`}
                    />
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
