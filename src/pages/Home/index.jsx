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
import Minimap from '../../organisms/Minimap/Minimap';
import SeenIn from '../../organisms/SeenIn';
import { Helmet } from 'react-helmet';
import Death from '../../organisms/Death';
import CharacterEvents from '../../organisms/CharacterEvents';
import { buildCharacterEvents } from '../../organisms/CharacterEvents/events';
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
  const [focusedTitle, setFocusedTitle] = React.useState(null);
  // Measured height (rem) of the expanded pill's details, for lifting the pill
  // above the first event dot and for the entry scroll -- see focusLayout.
  const [focusPanelHeight, setFocusPanelHeight] = React.useState(null);
  // Set by enterFocus, consumed by the layout effect that scrolls once the
  // expanded pill is in the DOM and can be measured.
  const pendingFocusScroll = React.useRef(null);
  // The column index the last focus scroll aimed at (see the hideDeceased
  // re-scroll effect).
  const focusScrolledIndex = React.useRef(null);
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

  // Puts the timeline into focus mode on `character` -- see the "Character
  // focus mode" plan, decisions 1-3 and 10, and Revision 1. `year` defaults to
  // the currently scrolled-to year, but the initial-load effect passes the
  // year it just resolved instead, since currentYear (state) hasn't been set
  // yet then. The scroll itself waits for the layout effect below, which can
  // measure the expanded pill.
  const enterFocus = (character, year = currentYear) => {
    setFocusedTitle(character.title);
    setFocusPanelHeight(null);
    setCurrentCharacter(character.title);
    setShowModal(false);
    pendingFocusScroll.current = { title: character.title, year };

    const samePathCharacter = routeCharacter?.toLowerCase() === character.title.toLowerCase();
    const url = `/character/${encodeURIComponent(character.title)}?year=${year?.year}`;
    if (samePathCharacter) {
      history.replace(url);
    } else {
      history.push(url);
    }

    analytics.event(ACTIONS.OPEN_CHARACTER, 'character', character.title);
  };

  const exitFocus = React.useCallback(() => setFocusedTitle(null), []);

  const showCharacter = (character) => {
    enterFocus(character);
  };

  const showCharacterModal = (character, year = currentYear, timelineEventIndex = null) => {
    setModalContents(<CharacterDetailModal character={character} onClose={() => setShowModal(false)} currentYear={year} timelineEventIndex={timelineEventIndex} />);
    setShowModal(true);
    analytics.event(ACTIONS.CHARACTER_SEE_MORE, 'character', character.title);
  };

  // Deceased characters drop out as the scrolled-to year passes their death; orderByAge compacts the
  // survivors so the remaining columns shift left without disturbing the oldest-first order.
  const visibleCharacters = React.useMemo(() => {
    if (!hideDeceased) return filteredCharacters;
    const year = currentYear?.year;
    if (year === undefined) return filteredCharacters;
    return orderByAge(filteredCharacters.filter(c => c.endYearUnknown || c.endYear >= year));
  }, [filteredCharacters, hideDeceased, currentYear]);

  const focusedCharacter = focusedTitle ? visibleCharacters.find(c => c.title === focusedTitle) : null;
  const focusEvents = React.useMemo(
    () => focusedCharacter ? buildCharacterEvents(focusedCharacter, years, theme) : null,
    [focusedCharacter, years, theme]
  );

  // Where the expanded pill's sticky container starts (rem): lifted by the
  // expanded height so its bottom rests just above the line's start or the
  // first event dot, whichever is higher -- the same rule the collapsed pill
  // follows with pillHeight, so no dot starts out hidden under the panel.
  const pillHeight = theme.layout.elements.character.pillHeight;
  const focusTop = focusedCharacter
    ? Math.min(Styled.getCharacterTop(theme, focusedCharacter), (focusEvents?.dots[0]?.top ?? Infinity) - 0.4)
      - Math.max(pillHeight, focusPanelHeight || pillHeight)
    : undefined;

  const onFocusSeeMore = React.useCallback((c) => showCharacterModal(c), [currentYear]);
  const onFocusEventClick = React.useCallback((c, eventIndex) => showCharacterModal(c, currentYear, eventIndex), [currentYear]);

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
      // Same rule as socialImage() in build_scripts/prerenderCharacters.js.
      const image = characterData?.socialImage
        ? `https://timeline.starwars.guide${encodeURI(characterData.socialImage.normalize('NFC'))}`
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
      let openFocus = false;
      if (routeCharacter) {
        scrollToChar = charactersData.find(c => c.title.toLowerCase() === routeCharacter.toLowerCase());
        if (scrollToChar) {
          setCurrentCharacter(scrollToChar.title);
          openFocus = Boolean(searchParams.get('show')) == true;
        }
      }
      if (!scrollToChar) {
        scrollToChar = characters.find(c => c.title === 'Luke Skywalker') || characters[0];
        const defaultYearObj = years.find(y => y.year === 0) || years[0];
        history.push(`/character/${encodeURIComponent(scrollToChar.title)}?year=${defaultYearObj.year}`);
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
      if (openFocus) {
        enterFocus(scrollToChar, scrollToYear);
      }
    }
  }, [years, characters]);

  // Measures the expanded pill as soon as it is in the DOM, then runs the
  // entry scroll enterFocus queued: horizontally, the column lands at the
  // far-left inset; vertically, the target event dot (the first one at or
  // after the current year when that is inside the character's life,
  // otherwise their first event) lands just below the expanded pill, which
  // sticks at 6rem. Children's layout effects run first, so the details'
  // own measurement is already done.
  React.useLayoutEffect(() => {
    const request = pendingFocusScroll.current;
    if (!request || !focusedCharacter || focusedCharacter.title !== request.title || !focusEvents) return;
    pendingFocusScroll.current = null;

    const { pxInRem, gridWidth } = theme.layout;
    const panelEl = document.querySelector('[data-testid="focus-panel"]');
    const viewportRem = window.innerHeight / pxInRem;
    const measured = panelEl?.scrollHeight ? panelEl.scrollHeight / pxInRem : 0;
    const panelHeight = Math.max(pillHeight, Math.min(measured, viewportRem - 8));
    setFocusPanelHeight(panelHeight);

    const character = focusedCharacter;
    const left = Styled.getFocusScrollLeft(theme, character, scale.scale);
    focusScrolledIndex.current = character.index;

    const startYear = character.birthYear || character.startYear;
    const endYear = character.endYearUnknown ? Infinity : character.endYear;
    const yearValue = request.year?.year;
    const withinRange = yearValue !== undefined && yearValue >= startYear && yearValue <= endYear;
    const { dots } = focusEvents;
    const targetDot = (withinRange && dots.find(d => d.year >= yearValue)) || dots[0];

    let top = window.scrollY;
    if (targetDot) {
      const dotPx = (gridWidth + targetDot.top * scale.scale) * pxInRem;
      const belowPanelPx = (6 + (panelHeight + 1.5) * scale.scale) * pxInRem;
      top = Math.max(0, dotPx - belowPanelPx);
    } else {
      const startRow = years.find(y => y.year === character.startYear);
      if (startRow) top = (startRow.yearIndex - 5) * theme.layout.elements.year.height * pxInRem + theme.layout.topMargin;
    }

    window.scrollTo({ left, top, behavior: 'smooth' });
  }, [focusedCharacter, focusEvents]);

  // With hideDeceased on, columns compact as the scrolled-to year passes
  // deaths, so the focused character's index (and x position) changes while
  // scrolling vertically. Follow it so the line stays at the far-left inset.
  React.useEffect(() => {
    if (!focusedCharacter || pendingFocusScroll.current) return;
    if (focusScrolledIndex.current === focusedCharacter.index) return;
    focusScrolledIndex.current = focusedCharacter.index;
    window.scrollTo({ left: Styled.getFocusScrollLeft(theme, focusedCharacter, scale.scale), behavior: 'smooth' });
  }, [focusedCharacter?.index]);

  // Escape closes the modal first (if one is open), then exits focus mode.
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showModal) {
        setShowModal(false);
      } else if (focusedTitle) {
        exitFocus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal, focusedTitle]);

  // A route change to a different character (e.g. the Back button) exits
  // focus mode rather than leaving a stale panel pointed at the old route.
  React.useEffect(() => {
    if (focusedTitle && routeCharacter?.toLowerCase() !== focusedTitle.toLowerCase()) {
      exitFocus();
    }
  }, [routeCharacter]);

  // The focused character can drop out of visibleCharacters (a filter change,
  // or hideDeceased passing their death year) without any route change.
  React.useEffect(() => {
    if (focusedTitle && visibleCharacters.length > 0 && !visibleCharacters.some(c => c.title === focusedTitle)) {
      exitFocus();
    }
  }, [visibleCharacters]);

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

    const scrollPoll = setInterval(() => {
      if (window.scrolling) {
        window.scrolling = false;
        const pxToRem = window.scrollY / theme.layout.pxInRem;
        setCurrentYearIndex(Math.round(pxToRem / theme.layout.elements.year.height));
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
    const onMouseMove = (e) => {
      if (window.curDown) {
        cancelAnimationFrame(window.animationFrameId);
        window.animationFrameId = requestAnimationFrame(() => scrollPage(e));
      }
    };
    const onMouseDown = (e) => {
      window.curYPos = e.pageY;
      window.curXPos = e.pageX;
      window.curDown = true;
    };
    const onMouseUp = () => {
      window.curDown = false;
      cancelAnimationFrame(window.animationFrameId);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Without this, every remount (HMR in dev) stacks another poller and drag
    // handler; stale pollers with old layout math fight over currentYear.
    return () => {
      clearInterval(scrollPoll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <HeaderOutput />
      <Styled.Wrapper>
        <Styled.Header>
          {/* data-aurebesh is the same string rendered again in the Aurebesh
              face beside the title, the hub's wordmark treatment. It is an
              attribute rather than markup so the h1 stays one clean text node;
              the theme's header block draws it. */}
          <h1 data-aurebesh="Ultimate Star Wars Timeline">Ultimate Star Wars Timeline</h1>
          {/* <button onClick={() => scale.setScale(scale.scale - .1)}>-</button>
          <h1>{scale.scale.toFixed(1)}</h1>
          <button onClick={() => scale.setScale(scale.scale + .1)}>+</button> */}
          <MainMenu onShowOnboardingGuide={handleShowOnboardingGuide} />
        </Styled.Header>
        <Minimap years={years} characters={visibleCharacters} />
        <div
          style={{ userSelect: 'none', transform: `scale(${scale.scale})`, transformOrigin: 'left top' }}
          onClick={(e) => {
            if (!focusedTitle) return;
            if (Math.abs(e.pageX - window.curXPos) > 5 || Math.abs(e.pageY - window.curYPos) > 5) return;
            if (e.target.closest?.('[data-focus-keep]')) return;
            exitFocus();
          }}
        >
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

                // The focused character always renders: its expanded pill and
                // line are the focus view, even mid-scroll.
                const isFocused = character.title === focusedTitle;
                if (isFocused || isCharacterInView(character)) {
                  const isDimmed = Boolean(focusedTitle) && !isFocused;
                  return <React.Fragment
                    key={character.title}>
                    <Styled.CharacterColumn
                      character={character}
                      $dimmed={isDimmed}
                      data-dimmed={isDimmed ? 'true' : undefined}
                      data-focus-keep={isFocused ? 'true' : undefined}
                    >
                    </Styled.CharacterColumn>
                    <CharacterDetailPill
                      character={character}
                      currentYear={currentYear}
                      currentCharacter={currentCharacter}
                      onPillPress={showCharacter}
                      isDimmed={isDimmed}
                      isFocused={isFocused}
                      focusTop={isFocused ? focusTop : undefined}
                      plottedCount={isFocused ? focusEvents?.plottedCount : undefined}
                      onSeeMore={onFocusSeeMore}
                      onClose={exitFocus}
                    />
                    {
                      character.seenIn
                        .sort((a, b) => a.year < b.year ? 1 : -1) // purposly sorting backwards for writing to the DOM and overlapping tooltips
                        .map((seen) => <SeenIn
                          seen={seen}
                          character={character}
                          isDimmed={isDimmed}
                          isFocused={isFocused}
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
                const isFocused = character.title === focusedTitle;
                const isDimmed = Boolean(focusedTitle) && !isFocused;
                return <Death character={character} isDimmed={isDimmed} isFocused={isFocused} key={character.title} />;
              })
          }
          {focusedCharacter && focusEvents && <>
            <CharacterEvents
              character={focusedCharacter}
              dots={focusEvents.dots}
              cards={focusEvents.cards}
              onEventClick={onFocusEventClick}
            />
            <Styled.FocusSpacer style={{ left: `calc(${Styled.getCharacterLeft(theme, focusedCharacter)}rem + 100vw)` }} />
          </>}
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
