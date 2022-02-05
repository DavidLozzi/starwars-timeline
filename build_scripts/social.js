// preps data.json for the web consumption
const data = require('./data.json'),
  fs = require('fs');
 

const convertYear = (year) => {
  if(year <= 0) return `${year * -1} BBY`;
  if(year > 0) return `${year} ABY`;
  return 'none';
};

const sortByTitle = (a, b) => a.title > b.title ? 1 : -1;
const sortByValue = (a, b) => a > b ? 1 : -1;

// build years
const _newYears = [];
const _startYear = data.sort((a, b) => a.startYear > b.startYear ? 1 : -1)[0].startYear;
const _endYear = data.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].endYear;

let yearIndex = 0;
for (let i = _startYear; i <= _endYear; i++) {
  const year = { year: i, display: convertYear(i) };
  const events = data
    .filter(e => (((e.startYear === i && !e.birthYear) || (e.endYear === i))))
    .map((e, i) => ({
      ...e,
      index: i,
      yearIndex,
      startYearDisplay: convertYear(e.startYear),
      endYearDisplay: convertYear(e.endYear)
    }));
        
  _newYears.push({
    ...year,
    yearIndex,
    events,
    eventCount: events.length
  });

  yearIndex++;
}

let output = '';
_newYears
  .filter(y => y.eventCount > 0)
  .forEach(y => {
    let linkToCharacter = '';
    if (y.events.some(e => e.type === 'era')) {
      output += y.events.filter(e => e.type === 'era').sort((a,b) => a.startYear > b.startYear ? -1 : 1).map(e => {
        if (e.endYear === y.year) {
          return `🍾  Long live the ${e.title}!`;
        }
        if (e.startYear === y.year) {
          return `📆  The ${e.title} has begun, in the year of ${y.display}`;
        }
      }).filter(e => !!e).sort(sortByValue).join('\n');
      output += '\n';
    } else {
      const era = data.find(d => d.type === 'era' && d.startYear <= y.year && d.endYear >= y.year);
      output += `📆  During the ${era.title}, in the year of ${y.display}\n\n`;
    }

    //movies/tv
    if (y.events.some(e => e.type === 'movie' || e.type === 'tv')) {
      output += y.events.map(e => {
        if (e.type === 'movie') {
          return `🍿  "${e.title}" movie occurred`;
        }
        if (e.type === 'tv') {
          return `📺  "${e.title}" TV show occurred`;
        }
        return null;
      }).filter(e => !!e).sort(sortByValue).join('\n');
      output += '\n';
      output += '\n';
    }

    //birthdays
    if (y.events.some(e => e.type === 'character' && e.startYear === y.year)) {
      output += '🎂  ';
      output += y.events.sort(sortByTitle).map(e => {
        if (e.type === 'character') {
          if (e.startYear === y.year) {
            if (!linkToCharacter) {
              linkToCharacter = e.title;
            }
            return `${e.title}${e.startYearUnknown ? ' (maybe?)' : ''}`;
          }
        }
        return null;
      }).filter(e => !!e).join(', ');
      output += ' was born\n';
      output += '\n';
    }

    //deaths
    if (y.events.some(e => e.type === 'character' && e.endYear === y.year)) {
      output += '🪦  ';
      output += y.events.sort(sortByTitle).map(e => {
        if (e.type === 'character') {
          if (!linkToCharacter) {
            linkToCharacter = e.title;
          }
          if (e.endYear === y.year) {
            return `${e.title}${e.endYearUnknown ? ' (maybe?)' : ''}`;
          }
        }
        return null;
      }).filter(e => !!e).join(', ');
      output += ' died\n';
      output += '\n';
    }
    output += `Explore more https://timeline.starwars.guide/${linkToCharacter ? `character/${encodeURI(linkToCharacter)}` : ''}\n`;
    output += '#StarWars ';
    output += '\n\n***************\n\n';
  });

const characters = JSON.parse(fs.readFileSync('./src/data/characters.json'));

characters.forEach(c => {
  const _birthYear = c.birthYear || c.startYear;

  output += `${c.title}\n`;
  output += `${convertYear(c.startYear)} - ${convertYear(c.endYear)}${c.startYearUnknown || c.endYearUnknown ? '(maybe?)' : ''}\n\n`;
  output += c.seenIn.length > 6 ? 'Has been busy in a lot\n' : 'Has been in\n';

  c.seenIn
    .sort((a, b) => a.year > b.year ? 1 : -1)
    .forEach(y =>
      y.events
        .forEach(e => {
          output += `${e.title}, ${convertYear(e.startYear)} (${y.year - _birthYear} years old)\n`;
        }));

  output += `\nExplore more https://timeline.starwars.guide/character/${c.title}?year=${c.startYear}`;
  output += `\n#${c.title.replace(/\s/ig,'')} #starwars`;
  output += '\n\n***************\n\n';
});


fs.writeFile('./build_scripts/socials.txt', output, (err) => {
  if (err) {
    console.error(`socials writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('socials.txt file created');
  }
});