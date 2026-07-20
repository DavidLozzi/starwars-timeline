import React, { useState, useEffect } from 'react';
import pagemap from 'pagemap';
import * as Styled from './Minimap.styles';
import { useTheme } from 'styled-components';

const PageMapWrapper = () => {
  const theme = useTheme();
  const mapRef = React.useRef(null);
  const [showMap, setShowMap] = React.useState(false);

  useEffect(() => {
    if (showMap) {
      pagemap(mapRef.current, {
        viewport: null,
        styles: {
          'div[data-testid=\'character\']': theme.elements.character.background,
          'div[data-testid=\'movie\']': theme.elements.movie.backgroundColor
        },
        back: 'rgba(0, 0, 0, 0.1)',
        view: `rgba(${theme.palette.tertiary}, 0.2)`,
        drag: 'rgba(0, 0, 0, 0.3)',
        interval: null
      });
    }
  }, [showMap]);

  return (
    <Styled.Wrapper>
      {showMap && <canvas ref={mapRef}></canvas>}
      <Styled.ShowButton onClick={() => setShowMap(!showMap)}>{!showMap ? 'show' : 'hide'} map</Styled.ShowButton>
    </Styled.Wrapper>
  );
};

export default PageMapWrapper;