import * as React from 'react';
import { ThemeContext } from 'styled-components';
import Modal from '../../molecules/modal';
import CharacterDetail from '../../organisms/CharacterDetail';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';
import seenInData from '../../data/seenIn.json';
import analytics, { ACTIONS } from '../../analytics';

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
  const [currentCharacter, setCurrentCharacter] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [modalContents, setModalContents] = React.useState();
  const theme = React.useContext(ThemeContext);
  const appliedFilter = { param: 'title', value: 'Luke Skywalker' };

  // zoom level, incremements of years to show
  const [zoomLevel, setZoomLevel] = React.useState(1); 

  const showCharacterModal = (character) => {
    setModalContents(<CharacterDetail character={character} onClose={() => setShowModal(false)} currentYear={currentYear} />);
    setShowModal(true);
    window.location.hash = `year=${currentYear.year}&character=${character.title}`;
    analytics.event(ACTIONS.OPEN_CHARACTER, "character", character.title);
  };

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
      scrollToX = _character.index * 80;
    }
    window.scrollTo(scrollToX, scrollToY);
  };

  React.useEffect(() => {
    const _currentYear = years.find(y => y.yearIndex === currentYearIndex + 5);
    if (_currentYear) {
      setCurrentYear(_currentYear);
      window.location.hash = `year=${_currentYear.year}`;
    }
  }, [currentYearIndex]);

  React.useEffect(() => {
    if (years.length > 0 && characters.length > 0) {
      let scrollToYear = null;
      let scrollToChar = null;
      if (window.location.hash.length > 0) {
        const searchParams = new URLSearchParams(window.location.hash.substr(1));
        scrollToYear = years.find(y => y.year === Number(searchParams.get("year")));
        scrollToChar = characters.find(c => c.title.toLowerCase() === (searchParams.get("character")?.toLowerCase() || "luke skywalker"));
      } else {
        scrollToYear = years.find(y => y.year === 0);
        scrollToChar = characters.find(c => c.title === "Luke Skywalker");
      }
      scrollTo(scrollToYear, scrollToChar);
      setCurrentCharacter(scrollToChar.title);
    }
  }, [seenIn]);

  React.useEffect(() => {
    if (appliedFilter) {
      const filteredCharacters = characters.filter(c => c[appliedFilter.param] === appliedFilter.value);
      console.log(filteredCharacters);
      // setCharacters(filteredCharacters);
    } else {
      setCharacters(charactersData);
    }
  }, [appliedFilter]);

  React.useEffect(() => {
    setYears(yearsData);
    setCharacters(charactersData);
    setSeenIn(seenInData);

    setInterval(() => {
      if (window.scrolling) {
        window.scrolling = false;
        const pxToRem = window.scrollY / 16;
        setCurrentYearIndex(Math.round(pxToRem / 2));
      }
    }, 150);

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
                    isCurrent={currentCharacter === character.title}
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
