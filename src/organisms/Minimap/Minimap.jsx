import React from 'react';
import { useTheme } from 'styled-components';
import { useAppContext } from '../../AppContext';
import * as Layout from '../../pages/Home/index.styles';
import * as Styled from './Minimap.styles';

export const MAP_WIDTH = 200;
export const MAP_HEIGHT = 300;

const COLORS = {
  era: ['lightgray', 0.25],
  movie: ['primary', 0.6],
  character: ['secondary', 0.9]
};

// Built from data, not the DOM: Home culls off-screen characters, so scanning the page would miss them.
export const buildMinimapRects = (theme, years, characters) => {
  const bounds = {
    w: Layout.getFullWidth(theme, characters.length),
    h: Layout.getFullHeight(theme) + theme.layout.topMargin
  };
  const rects = [];

  years.forEach(year => {
    year.events.forEach(event => {
      if (event.type === 'era') {
        const endYear = years.find(y => y.year === event.endYear);
        rects.push({
          kind: 'era',
          x: 0,
          y: Layout.getEraTop(theme, event),
          w: bounds.w,
          h: Layout.getEraHeight(theme, event, endYear)
        });
      } else if (event.type === 'movie' || event.type === 'tv') {
        const left = theme.layout.elements.movie.leftPageMargin;
        rects.push({
          kind: 'movie',
          x: left,
          y: Layout.getMovieTop(theme, event),
          w: bounds.w - left,
          h: Layout.getMovieHeight(theme, event)
        });
      }
    });
  });

  characters.forEach(character => {
    rects.push({
      kind: 'character',
      x: Layout.getCharacterLeft(theme, character),
      y: Layout.getCharacterTop(theme, character),
      w: theme.layout.elements.character.width,
      h: Layout.getCharacterHeight(theme, character)
    });
  });

  return { bounds, rects };
};

const Minimap = ({ years, characters }) => {
  const theme = useTheme();
  const { scale } = useAppContext();
  const canvasRef = React.useRef(null);
  const [showMap, setShowMap] = React.useState(false);

  const map = React.useMemo(
    () => buildMinimapRects(theme, years, characters),
    [theme, years, characters]
  );

  const pxPerRem = theme.layout.pxInRem * scale.scale;
  const wrapperMarginPx = theme.layout.gridWidth * theme.layout.pxInRem;
  const sx = MAP_WIDTH / map.bounds.w;
  const sy = MAP_HEIGHT / map.bounds.h;

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== MAP_WIDTH * dpr) {
      canvas.width = MAP_WIDTH * dpr;
      canvas.height = MAP_HEIGHT * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    map.rects.forEach(({ kind, x, y, w, h }) => {
      const [color, alpha] = COLORS[kind];
      ctx.fillStyle = `rgba(${theme.palette[color]},${alpha})`;
      ctx.fillRect(x * sx, y * sy, Math.max(1, w * sx), Math.max(1, h * sy));
    });

    const viewX = (window.scrollX - wrapperMarginPx) / pxPerRem;
    const viewY = (window.scrollY - wrapperMarginPx) / pxPerRem;
    ctx.strokeStyle = `rgb(${theme.palette.white})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      viewX * sx,
      viewY * sy,
      Math.max(2, (window.innerWidth / pxPerRem) * sx),
      Math.max(2, (window.innerHeight / pxPerRem) * sy)
    );
  }, [map, theme, sx, sy, pxPerRem, wrapperMarginPx]);

  React.useEffect(() => {
    if (!showMap) return undefined;
    draw();
    let frame = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        draw();
      });
    };
    window.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [showMap, draw]);

  const scrollToPoint = (clientX, clientY) => {
    const box = canvasRef.current.getBoundingClientRect();
    const remX = (clientX - box.left) / sx;
    const remY = (clientY - box.top) / sy;
    window.scrollTo(
      remX * pxPerRem + wrapperMarginPx - window.innerWidth / 2,
      remY * pxPerRem + wrapperMarginPx - window.innerHeight / 2
    );
  };

  const onMouseDown = (e) => {
    // Home's window-level drag-to-scroll would otherwise fight this drag.
    e.stopPropagation();
    e.preventDefault();
    scrollToPoint(e.clientX, e.clientY);
    const onMove = (ev) => scrollToPoint(ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <Styled.Wrapper>
      {showMap && <canvas ref={canvasRef} onMouseDown={onMouseDown} />}
      <Styled.ShowButton onClick={() => setShowMap(!showMap)}>{!showMap ? 'show' : 'hide'} map</Styled.ShowButton>
    </Styled.Wrapper>
  );
};

export default Minimap;
