import React, { useState, useEffect } from 'react';
import pagemap from 'pagemap';
import * as Styled from './Minimap.styles';

const PageMapWrapper = ({ children }) => {
  const [mapShowing, setMapShowing] = useState(false);
  const showMap = React.useRef(window.location.href.indexOf('minimap') > 0);

  useEffect(() => {
    if (!mapShowing && showMap.current) {
      pagemap(document.querySelector('#pagemap'), {
        viewport: null,
        styles: {
          'header,footer,section,article': 'rgba(0, 0, 0, 0.08)',
          'h1,a': 'rgba(0, 0, 0, 0.10)',
          'h2,h3,h4': 'rgba(0, 0, 0, 0.08)'
        },
        back: 'rgba(0, 0, 0, 0.1)',
        view: 'rgba(0, 0, 0, 0.2)',
        drag: 'rgba(0, 0, 0, 0.3)',
        interval: null
      });
      setMapShowing(true);
    }
  });

  return (
    <Styled.Wrapper>
      {showMap.current && <canvas id="pagemap" />}
      {children}
    </Styled.Wrapper>
  );
};

export default PageMapWrapper;