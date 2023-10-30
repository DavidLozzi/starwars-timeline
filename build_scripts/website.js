const data = require('../src/data/characters.json'),
  fs = require('fs');


const convertYear = (year) => {
  if (year <= 0) return `${year * -1} BBY`;
  if (year > 0) return `${year} ABY`;
  return 'none';
};

data
  .sort((a, b) => a.title > b.title ? 1 : -1)
  .forEach(character => {
    const characterUrl = `https://timeline.starwars.guide/character/${character.title}?year=`;
    let _birthYear = character.startYear;
    if (character.birthYear) {
      _birthYear = character.birthYear;
    }
    const seenInData = [];
    character.seenIn
      .sort((a, b) => a.year > b.year ? 1 : -1)?.forEach(y => y.events?.forEach(e => { seenInData.push({ text: `${e.title}, ${convertYear(e.startYear)} (${y.year - _birthYear} years old)`, year: y, event: e }); }));

    let page = `---
title: ${character.title}
layout: page
---
<a href="/character" class="smaller">Back to All Characters</a>

<div class="container">
  <div class="col-10">
    <p>
    ${character.title} ${character.altTitle?.length > 0 ? `(${character.altTitle}) ` : ''}\
    ${(!character.startYearUnknown && !character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a> and died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(character.startYearUnknown && !character.endYearUnknown) ? `died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(!character.startYearUnknown && character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a>.` : ''}
    </p>

    <p>${character.description}</p>


    ${(character.metadata && character.metadata.length > 0) ?
        `<div class='metadata'>
      ${character.metadata.map(m => `<div>
        <label>${m.name}:</label>
        <span>${m.value}</span>
      </div>`).join('')}
    </div>`
        : ''
      }


    <h2>You can see ${character.title} in:</h2>

    <ul>
    ${seenInData.map(seenIn => `  <li><a href="${characterUrl + seenIn.year.year}" target="_blank">${seenIn.text}</a></li>`).join('\n')}
    </ul>

    ${character.wookiepedia ? `<a href="${character.wookiepedia}" target="_blank">Learn more on Wookiepedia.com</a>` : ''}
  </div>
  <div class="character_image col-2">
    ${character.imageYears ? character.imageYears.sort((a, b) => a.startYear > b.startYear ? 1 : -1).map(img => `<img src="https://timeline.starwars.guide/${img.imageUrl}" alt="${character.title}" />`).join('\n') : ''}
    <img src="https://timeline.starwars.guide/${character.imageUrl}" alt="${character.title}" />
  </div>
</div>
`;

    fs.writeFileSync(`../starwars-guide/character/${character.title.replace(/\s/ig, '-')}.md`, page);
  });

let listView = `---
title: Star Wars Characters on the Timeline
layout: page
---

Have fun, explore all of the characters in the Star Wars universe, and learn more about them.

<ul class="character_list">
${data
    .sort((a, b) => a.title > b.title ? 1 : -1)
    .map(character => `<li><a href="/character/${character.title.replace(/\s/ig, '-')}">${character.title}</a></li>`).join('\n')}
</ul>
`;
fs.writeFileSync('../starwars-guide/character/index.md', listView);