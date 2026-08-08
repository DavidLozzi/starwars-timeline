import React from 'react';
import { createPortal } from 'react-dom';
import Modal from '../../molecules/modal';
import analytics, { ACTIONS } from '../../analytics';

import * as Styled from './index.styles';

const ALL_NEWS_URL = 'https://starwars.guide/news/';

// The feed's dates are plain YYYY-MM-DD; parsing them as-is would land on the previous
// day in western timezones, so read the parts directly.
const formatDate = (date) => {
  const [year, month, day] = (date || '').split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const News = ({ isOpen, onClose, items, products }) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // News is never blocking: if the feed didn't load, there is nothing to show
  if (!isOpen || !items?.length) return null;

  // The trigger lives inside the fixed header, whose theme styles target `h1` by
  // descendant selector - portalling to the body keeps that cascade off the modal.
  return createPortal(
    <Modal onClickBg={onClose}>
      <Styled.Wrapper>
        <Styled.H1>News</Styled.H1>
        <Styled.List>
          {items.map((item) => {
            const product = products?.[item.product] ?? products?.site;
            return (
              <Styled.Item key={item.id}>
                <Styled.ItemHeader>
                  {product && (
                    <Styled.Chip style={{ color: product.hex }}>
                      <i className={product.icon} />
                      {product.name}
                    </Styled.Chip>
                  )}
                  <Styled.Date>{formatDate(item.date)}</Styled.Date>
                </Styled.ItemHeader>
                <Styled.Title>{item.title}</Styled.Title>
                <Styled.Message dangerouslySetInnerHTML={{ __html: item.message }} />
                {item.url && (
                  <Styled.ReadMore
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => analytics.event(ACTIONS.NEWS_ITEM, 'news', item.id)}
                  >
                    Read more
                  </Styled.ReadMore>
                )}
              </Styled.Item>
            );
          })}
        </Styled.List>
        <Styled.Footer>
          <a href={ALL_NEWS_URL} target="_blank" rel="noreferrer">All news from Star Wars Guide</a>
        </Styled.Footer>
      </Styled.Wrapper>
    </Modal>,
    document.body
  );
};

export default News;
