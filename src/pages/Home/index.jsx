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
const OnboardingGuide = React.lazy(() => import('../../organisms/OnboardingGuide'));
import { getOnboardingState, decodeCharacterParam } from '../../utils';

window.scrolling = false;
addEventListener('scroll', () => {
  window.scrolling = true;
});
// characters.json already ships oldest-first (prepJson.js sorts by startYear, then birthYear) and each
// entry's `index` is its position in that order. Never re-derive that sort here -- reassert it from the
// data, then compact so hidden characters let the remaining columns shift left. Compaction preserves
// relative order, so a compacted index stays monotonic in age and this is safe to apply repeatedly.
const orderByAge = (chars) => [...chars]
  .sort((a, b) => a.index - b.index)
  .map((c, index) => ({ ...c, index }));

// testing web editor on ipad
const Home = () => {
  const theme = useTheme();
  const routeParams = useParams();
  const routeCharacter = React.useMemo(
    () => decodeCharacterParam(routeParams?.character),
    [routeParams?.character]
  );
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
  const { filters, scrollTo, filterCount, scale, hideDeceased } = useAppContext();

  // zoom level, incremements of years to show
  const [zoomLevel] = React.useState(1);

  // Onboarding guide state
  const [showOnboardingGuide, setShowOnboardingGuide] = React.useState(() => {
    // Check localStorage on initial mount
    const state = getOnboardingState();
    return !state || !state.hasSeenGuide;
  });
  const [onboardingOpenSource, setOnboardingOpenSource] = React.useState(() => {
    const state = getOnboardingState();
    return !state || !state.hasSeenGuide ? 'first_visit' : null;
  });

  // Function to manually trigger onboarding guide (for on-demand access)
  const handleShowOnboardingGuide = React.useCallback(() => {
    setOnboardingOpenSource('menu');
    setShowOnboardingGuide(true);
  }, []);

  const handleDismissOnboardingGuide = React.useCallback(() => {
    setShowOnboardingGuide(false);
    setOnboardingOpenSource(null);
  }, []);

  const showCharacter = (character) => {
    history.push(`/character/${encodeURIComponent(character.title)}?year=${currentYear.year}&show=true`);
    showCharacterModal(character);
  };

  const showCharacterModal = (character, year = currentYear) => {
    setModalContents(<CharacterDetailModal character={character} onClose={() => setShowModal(false)} currentYear={year} />);
    setShowModal(true);
    analytics.event(ACTIONS.OPEN_CHARACTER, 'character', character.title);
  };

  // Deceased characters drop out as the scrolled-to year passes their death; orderByAge compacts the
  // survivors so the remaining columns shift left without disturbing the oldest-first order.
  const visibleCharacters = React.useMemo(() => {
    if (!hideDeceased) return filteredCharacters;
    const year = currentYear?.year;
    if (year === undefined) return filteredCharacters;
    return orderByAge(filteredCharacters.filter(c => c.endYearUnknown || c.endYear >= year));
  }, [filteredCharacters, hideDeceased, currentYear]);

  const isCharacterInView = (character) => {
    if (!character) return false;
    const vv = window.visualViewport;
    if (!vv) return true;

    const preLoadBuffer = 100;
    const position = {
      left: (Styled.getCharacterLeft(theme, character) * theme.layout.pxInRem - preLoadBuffer) * scale.scale,
      // the detail pill rides a pill-height above the top of the character's line, so include it here
      top: ((Styled.getCharacterTop(theme, character) - theme.layout.elements.character.pillHeight) * theme.layout.pxInRem - preLoadBuffer) * scale.scale,
      right: ((Styled.getCharacterLeft(theme, character) + theme.layout.elements.character.width) * theme.layout.pxInRem + preLoadBuffer) * scale.scale,
      bottom: ((Styled.getCharacterHeight(theme, character) + Styled.getCharacterTop(theme, character)) * theme.layout.pxInRem + preLoadBuffer) * scale.scale
    };
    const winView = vv;
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
    const character = routeCharacter;
    if (character) {
      // Keep these in sync with the prerendered page that GitHub Pages serves
      // for this URL (build_scripts/prerenderCharacters.js) -- helmet replaces
      // the static tags on mount, so a mismatch means the crawled HTML and the
      // rendered HTML disagree. metaDescription is precomputed by prepJson.js.
      const characterData = charactersData.find(c => c.title.toLowerCase() === character.toLowerCase());
      const name = characterData?.title || character;
      const url = `https://timeline.starwars.guide/character/${encodeURIComponent(name)}`;
      const description = characterData?.metaDescription || `Learn more about ${name} on the Ultimate Star Wars Timeline!`;
      const image = name === 'Luke Skywalker'
        ? 'https://timeline.starwars.guide/social/social_Luke_Skywalker.png'
        : 'https://timeline.starwars.guide/social.png';
      return <Helmet>
        <meta name="description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@UltStarWarsTime" />
        <meta name="twitter:creator" content="@AurebeshFiles" />
        <meta name="twitter:title" content={`${name} - Ultimate Star Wars Timeline`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Ultimate Star Wars Timeline" />
        <meta property="og:title" content={`${name} - Ultimate Star Wars Timeline`} />
        <meta property="og:url" content={url} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <title>{name} - Ultimate Star Wars Timeline</title>
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
          // replace, not push: scrolling fires this constantly, so pushing filled
          // the back stack with one entry per year and leaked a ?year= variant of
          // every character URL into search engines.
          history.replace({
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
      let openModal = false;
      if (routeCharacter) {
        scrollToChar = charactersData.find(c => c.title.toLowerCase() === routeCharacter.toLowerCase());
        if (scrollToChar) {
          setCurrentCharacter(scrollToChar.title);
          openModal = Boolean(searchParams.get('show')) == true;
        }
      }
      if (!scrollToChar) {
        scrollToChar = characters.find(c => c.title === 'Luke Skywalker') || characters[0];
        const defaultYearObj = years.find(y => y.year === 0) || years[0];
        history.push(`/character/${encodeURIComponent(scrollToChar.title)}?year=${defaultYearObj.year}&show=true`);
      }

      let scrollToYear = null;
      const yearParam = searchParams.get('year');
      if (yearParam != null && yearParam !== '') {
        const y = Number(yearParam);
        if (!Number.isNaN(y)) {
          scrollToYear = years.find(yr => yr.year === y);
        }
      }
      if (!scrollToYear) {
        // Search results land on /character/<Name> with no year. Aim at the
        // character's first appearance rather than 0 BBY (centuries off for the
        // High Republic) or their lifespan midpoint (empty for anyone whose
        // death is unknown, since endYear is then the end of the timeline).
        const firstSeenYear = scrollToChar.seenIn?.length > 0
          ? Math.min(...scrollToChar.seenIn.map(s => s.year))
          : scrollToChar.startYear;
        scrollToYear = years.find(yr => yr.year === firstSeenYear)
          || years.find(yr => yr.year === 0)
          || years[0];
      }
      scrollTo(scrollToYear, scrollToChar);
      setCurrentCharacter(scrollToChar.title);
      setCurrentYearIndex(scrollToYear.yearIndex);
      if (openModal) {
        showCharacterModal(scrollToChar, scrollToYear);
      }
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
      history.push(`/character/${encodeURIComponent(scrollToChar.title)}?year=${scrollToYear.year}`);
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
        .filter(f => f.seenIn.some(s => s.events.some(e => e.title === filters.movie)));

      const filteredMovieYear = years.find(y => y.events.some(e => e.title === filters.movie));
      if (filteredMovieYear) scrollTo(filteredMovieYear);
    }

    setFilteredCharacters(orderByAge(filtChars));
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
          <MainMenu onShowOnboardingGuide={handleShowOnboardingGuide} />
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
                      characterCount={visibleCharacters.length}
                    />
                    <Styled.YearPill
                      isCurrentYear={currentYear?.year === year.year}
                      style={{
                        top: `${theme.layout.elements.year.height * year.yearIndex + theme.layout.topMargin}rem`
                      }}
                      characterCount={visibleCharacters.length}
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
                            characterCount={visibleCharacters.length}
                            endYear={endYear}
                          />
                          <Styled.EraPill
                            era={era}
                            characterCount={visibleCharacters.length}
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
                        characterCount={visibleCharacters.length}
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
              .filter(c => visibleCharacters.some(f => f.title === c.title))
              .map(c => {
                const character = visibleCharacters.find(f => f.title === c.title);

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
              .filter(c => visibleCharacters.some(f => f.title === c.title))
              .filter(c => !c.endYearUnknown)
              .map(c => {
                const character = visibleCharacters.find(f => f.title === c.title);
                return <Death character={character} key={character.title} />;
              })
          }
        </div>
      </Styled.Wrapper>
      {showModal && <Modal onClickBg={() => setShowModal(false)}>{modalContents}</Modal>}
      {showOnboardingGuide && (
        <React.Suspense fallback={null}>
          <OnboardingGuide
            isOpen={showOnboardingGuide}
            onDismiss={handleDismissOnboardingGuide}
            openSource={onboardingOpenSource}
          />
        </React.Suspense>
      )}
    </>
  );
};

export default Home;
