import fs from 'fs';
import { url } from 'inspector';

const data = JSON.parse(fs.readFileSync('../src/data/characters.json', 'utf8'));
const characterDescriptions = JSON.parse(fs.readFileSync('./character_descriptions.json', 'utf8'));

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

    let characterImage = character.imageYears && character.imageYears.length > 0 ? character.imageYears[0].imageUrl : character.imageUrl;
    characterImage = characterImage.replace('/images/', '');
    // Copy the character image to the output directory
    try {
      const sourceImagePath = `../public/images/${characterImage}`;
      const destImagePath = `../../starwars-guide/assets/characters/${characterImage}`;
      fs.copyFileSync(sourceImagePath, destImagePath);
    } catch (error) {
      console.log(`Could not copy image for ${character.title}: ${error.message}`);
    }
    
    // Find matching character description from character_descriptions.json
    let characterDescription = character.description;
    let characterTimeline = '';
    
    if (character.wookiepedia && characterDescriptions[character.wookiepedia]) {
      const descData = characterDescriptions[character.wookiepedia];
      characterDescription = descData.description;
      characterTimeline = descData.timeline;
    }
    
    let page = `---
title: ${character.title}'s Timeline
layout: character
date: 2022-05-08
last_modified_at: ${new Date().toISOString()}
social-desc: ${character.title} ${character.altTitle?.length > 0 ? `(${character.altTitle}) ` : ''} | Star Wars
social-image: /assets/characters/${characterImage}
---
<a href="/character" class="smaller">Back to All Characters</a>

<div class="character-profile container">
  <div class="col-10">
    <p>
    ${character.title} ${character.altTitle?.length > 0 ? `(${character.altTitle}) ` : ''}\
    ${(!character.startYearUnknown && !character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a> and died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(character.startYearUnknown && !character.endYearUnknown) ? `died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(!character.startYearUnknown && character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a>.` : ''}
    </p>

    <p>${characterDescription}</p>
    
    ${(character.metadata && character.metadata.length > 0) ?
      `<div class='metadata'>
      ${character.metadata.map(m => `<div>
      <label>${m.name}:</label>
      <span>${m.value}</span>
      </div>`).join('')}
      </div>`
      : ''
    }

    ${characterTimeline ? `<div class="timeline">${characterTimeline}</div>` : ''}
    
    <p>&nbsp;</p>
    <h3>View ${character.title} in our timeline:</h3>

    <ul>
    ${seenInData.map(seenIn => `  <li><a href="${characterUrl + seenIn.year.year}" target="_blank">${seenIn.text}</a></li>`).join('\n')}
    </ul>

    <p>&nbsp;</p>

    ${character.wookiepedia ? `<a href="${character.wookiepedia}" target="_blank">Learn more on Wookiepedia.com</a>` : ''}

    <p>&nbsp;</p>
    <a href="/character" class="smaller">Back to All Characters</a>
  </div>
  <div class="character_image col-2">
    ${character.imageYears ? character.imageYears.sort((a, b) => a.startYear > b.startYear ? 1 : -1).map(img => `<img src="https://timeline.starwars.guide/${img.imageUrl}" alt="${character.title}" />`).join('\n') : ''}
    <img src="https://timeline.starwars.guide/${character.imageUrl}" alt="${character.title}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6056590143595280"
        crossorigin="anonymous"></script>
    <!-- starwars character -->
    <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-6056590143595280"
        data-ad-slot="1622037034"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</div>
`;
      
    fs.writeFileSync(`../../starwars-guide/character/${character.title.replace(/\s/ig, '-')}.md`, page);
    console.log(character.title);
  });

let listView = `---
title: Star Wars Characters on the Timeline
layout: page
date: 2022-05-08
last_modified_at: ${new Date().toISOString()}
---

Explore all of the characters from the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>.

<ul class="character_list">
${data
    .sort((a, b) => a.title > b.title ? 1 : -1)
    .map(character => `<li><a href="/character/${character.title.replace(/\s/ig, '-')}">${character.title}</a></li>`).join('\n')}
</ul>
`;
console.log("index");
fs.writeFileSync('../../starwars-guide/character/index.md', listView);