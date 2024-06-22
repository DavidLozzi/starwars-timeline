import * as React from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { useAppContext } from '../../AppContext';
import Modal from '../../molecules/modal';
import CharacterDetailModal from '../../organisms/CharacterDetailModal';
import CharacterDetailPill from '../../organisms/CharacterDetailPill';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';
import analytics, { ACTIONS } from '../../analytics';

import * as Styled from './index.styles';
import MainMenu from '../../organisms/MainMenu';
import SeenIn from '../../organisms/SeenIn';
import { Helmet } from 'react-helmet';
import Death from '../../organisms/Death';

window.scrolling = false;
addEventListener('scroll', () => {
  window.scrolling = true;
});
// testing web editor on ipad
const Home = () => {
  const theme = useTheme();
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
  const [hasScrolled, setHasScrolled] = React.useState(new Date()); // just used to refresh the state/DOM to show/hide characters
  const { filters, scrollTo, filterCount, scale } = useAppContext();

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

  const isCharacterInView = (character) => {
    const preLoadBuffer = 100;
    const position = {
      left: (Styled.getCharacterLeft(theme, character) * theme.layout.pxInRem - preLoadBuffer) * scale.scale,
      top: (Styled.getCharacterTop(theme, character) * theme.layout.pxInRem - preLoadBuffer) * scale.scale,
      right: ((Styled.getCharacterLeft(theme, character) + theme.layout.elements.character.width) * theme.layout.pxInRem + preLoadBuffer) * scale.scale,
      bottom: ((Styled.getCharacterHeight(theme, character) + Styled.getCharacterTop(theme, character)) * theme.layout.pxInRem + preLoadBuffer) * scale.scale
    };
    const winView = window.visualViewport;
    winView.pageRight = winView.pageLeft + winView.width;
    winView.pageBottom = winView.pageTop + winView.height;
    if ((position.left >= winView.pageLeft && position.left <= winView.pageRight) ||
      (position.right >= winView.pageLeft && position.right <= winView.pageRight)) {
      if ((position.top >= winView.pageTop && position.top <= winView.pageBottom) ||
        (position.bottom >= winView.pageTop && position.bottom <= winView.pageBottom) ||
        (position.top <= winView.pageTop && position.bottom >= winView.pageBottom)) {
        return true;
      }
    }
    return false;
  };

  const HeaderOutput = () => {
    const character = routeParams?.character;
    const characterUrl = encodeURI(character);
    if (character) {
      return <Helmet>
        <meta name="description" content={`Learn more about ${character} on the Ultimate Star Wars Timeline!`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@UltStarWarsTime" />
        <meta name="twitter:creator" content="@AurebeshFiles" />
        <meta property="og:title" content={`${character} - Ultimate Star Wars Timeline`} />
        <meta property="og:url" content={`https://timeline.starwars.guide$/character/${characterUrl}`} />
        <meta property="og:description" content={`Learn more about ${character} on the Ultimate Star Wars Timeline!`} />
        <meta property="og:image" content={`https://timeline.starwars.guide/${character === 'Luke Skywalker' ? `social/social_${character.replace(/\s/g, '_')}` : '/social'}.png`} />
        <title>{character} - Ultimate Star Wars Timeline</title>
      </Helmet>;
    }
    return <Helmet>
      <meta name="description" content="The Ultimate Star Wars Timeline including characters, movies, and TV shows." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@UltStarWarsTime" />
      <meta name="twitter:creator" content="@AurebeshFiles" />
      <meta property="og:title" content="Ultimate Star Wars Timeline" />
      <meta property="og:url" content="https://timeline.starwars.guide" />
      <meta property="og:description" content="The Ultimate Star Wars Timeline including characters, movies, and TV shows." />
      <meta property="og:image" content="https://timeline.starwars.guide/social.png" />
      <title>Ultimate Star Wars Timeline</title>
    </Helmet>;
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
      setTimeout(() => scrollTo(scrollToYear, scrollToChar), 3000);
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
      history.push(`/character/${scrollToChar.title}?year=${scrollToYear.year}`);
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
    setHasScrolled(new Date());
  }, [filters, filterCount]);

  React.useEffect(() => {
    setYears(yearsData);
    setCharacters(charactersData);
    setFilteredCharacters(charactersData);

    setInterval(() => {
      if (window.scrolling) {
        window.scrolling = false;
        const pxToRem = window.scrollY / theme.layout.pxInRem;
        setCurrentYearIndex(Math.round(pxToRem / 2));
        setHasScrolled(new Date());
      }
    }, 75);

    function scrollPage(e) {
      if (window.curDown) {
        window.scrollBy(window.curXPos - e.pageX, window.curYPos - e.pageY);
        window.animationFrameId = requestAnimationFrame(() => scrollPage(e));
      }
    }

    window.curYPos = 0;
    window.curXPos = 0;
    window.curDown = false;
    window.addEventListener('mousemove', function (e) {
      if (window.curDown) {
        cancelAnimationFrame(window.animationFrameId);
        window.animationFrameId = requestAnimationFrame(() => scrollPage(e));
      }
    });

    window.addEventListener('mousedown', function (e) {
      window.curYPos = e.pageY;
      window.curXPos = e.pageX;
      window.curDown = true;
    });

    window.addEventListener('mouseup', function (e) {
      window.curDown = false;
      cancelAnimationFrame(window.animationFrameId);
    });

  }, []);

  return (
    <>
      <HeaderOutput />
      <Styled.Wrapper>
        <Styled.Header>
          <h1>Ultimate Star Wars Timeline</h1>
          {/* <button onClick={() => scale.setScale(scale.scale - .1)}>-</button>
          <h1>{scale.scale.toFixed(1)}</h1>
          <button onClick={() => scale.setScale(scale.scale + .1)}>+</button> */}
          <MainMenu />
        </Styled.Header>
        <div style={{ userSelect: 'none', transform: `scale(${scale.scale})`, transformOrigin: 'left top' }}>
          {(years.length === 0 || characters.length === 0) && <Styled.Crawl><Styled.Long>A long time ago, in a galaxy far, far away...</Styled.Long><Styled.Note>Please wait while the page loads.</Styled.Note></Styled.Crawl>}
          {
            years
              .filter(({ year }) => year % zoomLevel === 0)
              .map(year => {
                const movies = year
                  .events
                  .filter(y => (y.type === 'movie' || y.type === 'tv')); // && y.endYear === year.year)
                return (
                  <React.Fragment
                    key={year.display}
                  >

                    <Styled.Year
                      style={{
                        top: `${theme.layout.elements.year.height * year.yearIndex + theme.layout.topMargin}rem`
                      }}
                      isCurrentYear={currentYear?.year === year.year}
                      characterCount={filteredCharacters.length}
                    />
                    <Styled.YearPill
                      isCurrentYear={currentYear?.year === year.year}
                      style={{
                        top: `${theme.layout.elements.year.height * year.yearIndex + theme.layout.topMargin}rem`
                      }}
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
                        return <React.Fragment
                          key={`${era.title}1`}>
                          <Styled.Era
                            era={era}
                            characterCount={filteredCharacters.length}
                            endYear={endYear}
                          />
                          <Styled.EraPill
                            era={era}
                            characterCount={filteredCharacters.length}
                            endYear={endYear}
                          >
                            <Styled.Sticky>
                              <Styled.EraLabel>
                                {era.title}
                              </Styled.EraLabel>
                            </Styled.Sticky>
                          </Styled.EraPill>
                        </React.Fragment>;
                      }
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

                if (isCharacterInView(character)) {
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
                        .sort((a, b) => a.year < b.year ? 1 : -1) // purposly sorting backwards for writing to the DOM and overlapping tooltips
                        .map((seen) => <SeenIn
                          seen={seen}
                          character={character}
                          key={`seen${seen.year}${character.title}`}
                        />
                        )
                    }
                  </React.Fragment>;
                }
              }
              )
          }
          {
            characters
              .filter(c => filteredCharacters.some(f => f.title === c.title))
              .filter(c => !c.endYearUnknown)
              .map(c => {
                const character = filteredCharacters.find(f => f.title === c.title);
                return <Death character={character} key={character.title} />;
              })
          }
        </div>
      </Styled.Wrapper>
      {showModal && <Modal onClickBg={() => setShowModal(false)}>{modalContents}</Modal>}
    </>
  );
};

export default Home;
