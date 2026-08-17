import React from 'react';
import * as Styled from './index.styles';

const AD_CLIENT = 'ca-pub-6056590143595280';
const AD_SLOT = '3687052385';

/* The adsbygoogle.js loader lives in index.html; this only asks it to fill the
   slot. Fixed size on purpose — no data-ad-format / data-full-width-responsive,
   either of which makes AdSense ignore the dimensions and serve a responsive
   unit (tall rectangles, anchor overlays) instead. */
const AdBanner = () => {
  const pushed = React.useRef(false);

  React.useEffect(() => {
    // Pushing a slot that already holds an ad throws "All 'ins' elements in the
    // DOM with class=adsbygoogle already have ads in them", so fill exactly once.
    if (pushed.current) return;
    pushed.current = true;

    try {
      // Opt out of Auto ads' anchor/vignette overlays: those are injected straight
      // into <body> as position:fixed elements, independent of the unit below and
      // its clipping wrapper.
      (window.adsbygoogle = window.adsbygoogle || []).push({ overlays: { bottom: false } });
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // blocked scripts / privacy tools — do not break the app
    }
  }, []);

  return (
    <Styled.Wrapper>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
      />
    </Styled.Wrapper>
  );
};

export default AdBanner;
