import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    ${({ theme }) => theme.elements.characterDetailModal};
    width: 100%;

    /* Contain the floated image so a short bio can't leave it hanging out of
       the modal. */
    &::after {
      content: '';
      display: block;
      clear: both;
    }
  `,
  Header: styled.div`
    width: 100%;
  `,
  // Mobile: full-bleed image with the text stacked under it. Desktop: the image
  // floats so the title and metadata sit beside it and the description keeps
  // flowing underneath it instead of starting a new column.
  Image: styled.img`
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 5vh 0;

    ${({ theme }) => theme.breakpoints.md} {
      float: left;
      width: 30vw;
      max-width: 20rem;
      height: 30vw;
      max-height: 20rem;
      margin: 0 3vh 2vh 0;
    }

    &:hover {
      border-radius: 0;
    }
  `,
  H1: styled.h1`
    margin: 0;
    font-size: 3vh;
  `,
  H2: styled.h2`
    margin: 1vh 0;
    font-size: 2vh;
  `,
  Right: styled.div`
    padding: 2vh 3vh 0 3vh;
    min-width: 0;
  `,
  // Plain block flow (not a flex column) so the description wraps beside the
  // floated image and then continues below it.
  Body: styled.div`
    padding: 0 3vh 2vh 3vh;
  `,
  Note: styled.div`
    font-size: 1.5vh;
  `,
  Description: styled.div`
    font-size: 1.6vh;
    margin: 1.5vh 0 1vh 0;

    /* The bio arrives as parsed HTML; drop the leading <p> margin so it starts
       right under the metadata. */
    p {
      margin: 0 0 1vh 0;
    }
  `,
  // clear: left drops the section past the floated image so the timeline always
  // gets its own full-width row instead of starting alongside the picture.
  SectionTitle: styled.h3`
    font-size: 1.6vh;
    font-weight: bold;
    margin: 1.5vh 0 0 0;
    clear: left;
  `,
  Timeline: styled.div`
    font-size: 1.6vh;
    margin: 1vh 0;
  `,
  // overflow: hidden keeps the grid out from under the floated image — without
  // its own formatting context the columns would slide behind the picture.
  MetadataWrapper: styled.div`
    font-size: 1.6vh;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 1vh 2vh;
    margin: 1.5vh 0 0 0;
    overflow: hidden;
  `,
  Metadata: styled.div`
    min-width: 0;
  `,
  MetadataLabel: styled.div`
    font-weight: bold;
  `,
  MetadataValue: styled.div`
    overflow-wrap: anywhere;
  `,
  Wookiepedia: styled.a`
    font-size: 1.4vh;
    display: inline-block;
    color: rgb(${({ theme }) => theme.palette.primary});
  `,
  ListViewWrapper: styled.div`
    padding: 1rem 0;
    clear: left;
  `,
  ListViewTitle: styled.h3`
    font-size: 1.6vh;
    font-weight: bold;
  `
};