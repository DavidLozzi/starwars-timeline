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

let allOutput = '';
_newYears
  .filter(y => y.eventCount > 0)
  .forEach(y => {
    let output = '';
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
        if (!linkToCharacter) {
          linkToCharacter = `?year=${e.startYear}`;
        }
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
              linkToCharacter = `character/${encodeURI(e.title)}?year=${e.startYear}`;
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
            linkToCharacter = `character/${encodeURI(e.title)}?year=${e.startYear}`;
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
    output += `Explore more https://timeline.starwars.guide/${linkToCharacter ? linkToCharacter : ''}\n`;
    output += '#StarWars ';
    output += `\n\n${output.length} characters`;
    output += '\n***************\n\n';
    allOutput += output;
  });

const characters = JSON.parse(fs.readFileSync('./src/data/characters.json'));

const getEventIcon = (e) => {
  if (e.type === 'movie') {
    return '🍿';
  }
  if (e.type === 'tv') {
    return '📺';
  }
};
characters.forEach(c => {
  const _birthYear = c.birthYear || c.startYear;
  let output = '';
  output += `${c.title}\n`;
  if (!c.startYearUnknown) {
    output += `${convertYear(c.startYear)} `;
  } else {
    output += 'birth date? ';
  }
  if (!c.endYearUnknown) {
    output += `- ${convertYear(c.endYear)} `;
  } else {
    output += '- death date? ';
  }
  if (!c.startYearUnknown && !c.endYearUnknown) {
    output += `(${c.endYear - c.startYear} years old)`;
  }
  output += '\n\n';
  output += c.seenIn.length > 6 ? 'Has been busy in a lot\n' : 'Has been in\n';

  c.seenIn
    .sort((a, b) => a.year > b.year ? 1 : -1)
    .forEach(y =>
      y.events
        .forEach(e => {
          output += `${getEventIcon(e)} ${e.title}, ${convertYear(e.startYear)} (${c.startYearUnknown ? 'abt ' : ''}${y.year - _birthYear}yo)\n`;
        }));

  output += `\nExplore more https://timeline.starwars.guide/character/${encodeURI(c.title)}?year=${c.startYear}`;
  output += `\n#${c.title.replace(/\s/ig,'')}${c.altTitle ? ` #${c.altTitle.replace(/\s/ig,'')}` : ''} #StarWars`;
  output += `\n\n${output.length} characters`;
  output += '\n***************\n\n';
  allOutput += output;
});


fs.writeFile('./build_scripts/socials.txt', allOutput, (err) => {
  if (err) {
    console.error(`socials writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('socials.txt file created');
  }
});