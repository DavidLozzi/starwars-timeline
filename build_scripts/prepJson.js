// preps data.json for the web consumption
const data = require('./data.json'),
  fs = require('fs'),
  { create } = require('xmlbuilder2');
 

const convertYear = (year) => {
  if(year <= 0) return `${year * -1} BBY`;
  if(year > 0) return `${year} ABY`;
  return 'none';
};

const sortByOrderOrTitle = (a, b) => {
  if (!!a.order && !!b.order) {
    return a.order > b.order ? 1 : -1;
  }
  return a.title > b.title ? 1 : -1;
};


// build years
const _newYears = [];
const _startYear = data.sort((a, b) => a.startYear > b.startYear ? 1 : -1)[0].startYear;
const _endYear = data.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].endYear;

let yearIndex = 0;
for (let i = _startYear; i <= _endYear; i++) {
  const year = { year: i, display: convertYear(i) };
  const eventsEnding = data // get what ends this year to pad the beginning of the year
    .filter(e => (e.startYear !== i && e.endYear === i && e.type !== 'character' && e.type !== 'era'));
  
  const events = data
    .filter(e => (e.startYear === i && e.type !== 'character' && e.type !== 'era'))
    .sort(sortByOrderOrTitle)
    .map((e, i) => ({
      ...e,
      index: i + eventsEnding.length,
      yearIndex,
      years: e.endYear - e.startYear,
      startYearDisplay: convertYear(e.startYear),
      endYearDisplay: convertYear(e.endYear)
    }));
  
  data
    .filter(e => (e.startYear === i && e.type === 'era'))
    .sort(sortByOrderOrTitle)
    .forEach((e, i) => {
      events.push({
        ...e,
        index: i + events.length, // shouldn't be needed but want it higher than the movies in it
        yearIndex,
        years: e.endYear - e.startYear,
        startYearDisplay: convertYear(e.startYear),
        endYearDisplay: convertYear(e.endYear)
      });
    });
      
  _newYears.push({
    ...year,
    yearIndex: yearIndex,
    events,
    eventCount: events.length
  });

  yearIndex += (events.length > 1 ? events.filter(e => e.type !== 'era').length : 1) + eventsEnding.length;
  // yearIndex++;
}


// build characters
const _filters = [];
const _seenInFilter = [];
const _characters = data
  .filter(e => (e.type === 'character'))
  .sort((a, b) => {
    let retVal = -1;
    if (a.startYear > b.startYear) {
      retVal = 1;
    }
    if (retVal === -1 && a.birthYear && b.birthYear && a.startYear === b.startYear) {
      if (a.birthYear > b.birthYear) {
        retVal = 1;
      }
    }
    return retVal;
  })
  .map((e, index) => {
    const seenInYears = [];
    e.seenIn.forEach((s, index) => {
      const eventStart = data.find(d => d.title === s).startYear; // get the start year for the event
      const year = { ..._newYears.find(y => y.year === eventStart) }; // get the new year object created above
      const event = year.events.find(e => e.title === s); // get the new event with the right indexes created above
      delete year.events; // will replace with this characters events

      let charYear = seenInYears.find(y => y.year === year.year);
      if (charYear) {
        charYear.events.push(event);
      } else {
        charYear = {
          ...year,
          index,
          events: [event]
        };
        seenInYears.push(charYear);
      }
    });

    // get the filters
    e.metadata.forEach(m => {
      if (_filters.some(f => f.name === m.name)) {
        const _filter = _filters.find(f => f.name === m.name);
        if (_filter.values.some(v => v.name === m.value)) {
          _filter.values.find(v => v.name === m.value).count += 1;
        } else {
          _filter.values.push({ name: m.value, count: 1 });
        }
      } else {
        _filters.push({ name: m.name, values: [{ name: m.value, count: 1 }] });
      }
    });

    //get the seen in filters
    e.seenIn.forEach(s => {
      const movie = data.find(d => d.title === s);
      if (_seenInFilter.some(f => f.name === s)) {
        const _seenIn = _seenInFilter.find(f => f.name === s);
        _seenIn.count += 1;
      } else {
        _seenInFilter.push({ name: s, startYear: movie.startYear, count: 1});
      }
    });
    _seenInFilter.sort((a,b) => a.startYear > b.startYear ? 1 : -1);

    // find the last year's index, including seen in index
    let endYearIndex = _newYears.find(y => y.year === e.endYear).yearIndex;
    // get the last seen in index
    const lastSeenIn = seenInYears.sort((a, b) => a.year > b.year ? 1 : -1).slice(-1)[0];
    const lastEvent = lastSeenIn?.events?.sort((a, b) => a.index > b.index ? 1 : -1).slice(-1)[0];
    if (lastEvent && endYearIndex < lastEvent.yearIndex + lastEvent.index) {
      endYearIndex = lastEvent.yearIndex + lastEvent.index;
    }

    return ({
      ...e,
      index,
      seenIn: seenInYears,
      yearIndex: _newYears.find(y => y.year === e.startYear).yearIndex,
      endYearIndex,
      years: e.endYear - e.startYear,
      startYearDisplay: convertYear(e.startYear),
      endYearDisplay: convertYear(e.endYear)
    });
  });

_filters.forEach(filter => {
  filter.values.sort((a, b) => {
    if (a.count < b.count) {
      return 1;
    } else if (a.count === b.count) {
      if (a.name > b.name) {
        return 1;
      }
    }
    return -1;
  });
});
 
fs.writeFile('./src/data/years.json', JSON.stringify(_newYears), (err) => {
  if (err) {
    console.error(`years writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('years.json file created');
  }
});

fs.writeFile('./src/data/characters.json', JSON.stringify(_characters), (err) => {
  if (err) {
    console.error(`characters writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('characters.json file created');
  }
});

fs.writeFile('./src/data/filters.json', JSON.stringify(_filters), (err) => {
  if (err) {
    console.error(`filters writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('filters.json file created');
  }
});

fs.writeFile('./src/data/seenIn.json', JSON.stringify(_seenInFilter), (err) => {
  if (err) {
    console.error(`seenIn writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('seenIn.json file created');
  }
});


const createFileFromTemplate = (fileName, content, title) => {
  const file = fs.readFileSync('./public/contentTemplate.html', 'utf-8');
  let newValue = file.replace(/{{CONTENT}}/ig, content);
  newValue = newValue.replace(/{{PAGE_TITLE}}/ig, title);
  fs.writeFileSync(`./public/${fileName}.html`, newValue, 'utf-8');
  console.log(`updated ${fileName}.html`);
};
// update index.html to include some content for some SEO
let moviesHtml = '';
let tvHtml = '';
let characterHtml = '';

moviesHtml += '<h2>Star Wars Movies Timeline</h2>\n';
moviesHtml += '<p>A long time ago in a galaxy far, far away...</p>\n';
moviesHtml += '<ul>\n';
data.sort((a,b) => a.startYear > b.startYear ? 1 : -1).filter(d => d.type === 'movie').forEach(movie => {
  moviesHtml += `<li><h3><a href="/?year=${movie.startYear}">${movie.title}</a></h3></li>\n`;
});
moviesHtml += '</ul>\n\n';

createFileFromTemplate('starwars_movies', moviesHtml, 'Star Wars Movies Timeline');

tvHtml += '<h2>Star Wars TV Shows Timeline</h2>\n';
tvHtml += '<p>Click on any of the Star Wars TV shows below to see it in the timline!</p>';
tvHtml += '<ul>\n';
data.sort((a,b) => a.startYear > b.startYear ? 1 : -1).filter(d => d.type === 'tv').forEach(tv => {
  tvHtml += `<li><a href="/?year=${tv.startYear}">${tv.title}</a></li>\n`;
});
tvHtml += '</ul>\n';

createFileFromTemplate('starwars_tvshows', tvHtml, 'Star Wars TV Show Timeline');

characterHtml += '<h2>Star Wars Characters Timeline</h2>\n';
characterHtml += '<p>Click on any of the Star Wars characters below to see it in the timline!</p>';
_characters.forEach(character => {
  characterHtml += `<h3><a href="/character/${character.title}?year=${character.startYear}&show=true">${character.title}</a>, born ${convertYear(character.birthYear || character.startYear)}</h3>\n
  <p>${character.description}</p>
  <h4>${character.title}'s Timeline</h4>\n
  <ul>\n`;

  character
    .seenIn
    .sort((a, b) => a.year > b.year ? 1 : -1)
    .forEach(y => y.events.forEach(e => {
      characterHtml += `<li><a href="/character/${character.title}?year=${e.startYear}">${e.title}, ${convertYear(e.startYear)} (${y.year - character.birthYear} years old)</a></li>\n`;
    }));
  characterHtml += '\n</ul>';
});


createFileFromTemplate('starwars_characters', characterHtml, 'Star Wars Characters Timeline');

// add all to index file
const html = `<div id="content">${moviesHtml + tvHtml + characterHtml}</div>`;
var file = fs.readFileSync('./public/index.html', 'utf-8');
var newValue = file.replace(/<div id="content">[\s\S]*<\/ul>\n[\s]*<\/div>/mig, html);
fs.writeFileSync('./public/index.html', newValue, 'utf-8');
console.log('updated index.html');


// generate sitemap.xml
const root = create({ version: '1.0', encoding: 'UTF-8', ignoreConverters: true })
  .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

root
  .ele('url')
  .ele('loc').txt('https://timeline.starwars.guide/').up()
  .ele('lastmod').txt(new Date().toISOString().slice(0, 10)).up();

root
  .ele('url')
  .ele('loc').txt('https://timeline.starwars.guide/starwars_movies.html').up()
  .ele('lastmod').txt(new Date().toISOString().slice(0, 10)).up();

root
  .ele('url')
  .ele('loc').txt('https://timeline.starwars.guide/starwars_tvshows.html').up()
  .ele('lastmod').txt(new Date().toISOString().slice(0, 10)).up();
  
root
  .ele('url')
  .ele('loc').txt('https://timeline.starwars.guide/starwars_characters.html').up()
  .ele('lastmod').txt(new Date().toISOString().slice(0, 10)).up();
    
_characters.forEach(d => {
  root
    .ele('url')
    .ele('loc').txt(`https://timeline.starwars.guide/character/${d.title}?year=${d.startYear}&show=true`).up()
    .ele('lastmod').txt(new Date().toISOString().slice(0,10)).up();
});

// convert the XML tree to string
const xml = root.end({ prettyPrint: true });
fs.writeFileSync('./public/sitemap.xml', xml, 'utf-8');
console.log('updated sitemap.xml');