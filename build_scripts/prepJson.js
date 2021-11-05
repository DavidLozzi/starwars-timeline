// preps data.json for the web consumption
const data = require('./data.json'),
  fs = require('fs'),
  { create } = require('xmlbuilder2');
 

const convertYear = (year) => {
  if(year <= 0) return `${year * -1} BBY`;
  if(year > 0) return `${year} ABY`;
  return 'none';
};

const sortOrder = [
  { type: 'era', sort: 1},
  { type: 'movie', sort: 2},
  { type: 'tv', sort: 3 },
  { type: 'character', sort: 4}
];

const sortByYear = (a, b) => {
  const aSorter = sortOrder.find(s => s.type === a.type).sort;
  const bSorter = sortOrder.find(s => s.type === b.type).sort;
  if (aSorter > bSorter) return 1;
  if (aSorter < bSorter) return -1;
  return 0;
};


// build years
const _newYears = [];
const _startYear = data.sort((a, b) => a.startYear > b.startYear ? 1 : -1)[0].startYear;
const _endYear = data.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].endYear;

let yearIndex = 0;
for (let i = _startYear; i <= _endYear; i++) {
  const year = { year: i, display: convertYear(i) };
  const events = data
    .filter(e => (e.startYear === i && e.type !== 'character'))
    .sort(sortByYear)
    .map((e, i) => ({
      ...e,
      index: i,
      yearIndex,
      years: e.endYear - e.startYear,
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
    e.seenIn.forEach(s => {
      const event = data.find(d => d.title === s);
      const year = {..._newYears.find(y => y.year === event.startYear)};
      delete year.events; // will replace with this characters events

      let charYear = seenInYears.find(y => y.year === year.year);
      if (charYear) {
        charYear.events.push(event);
      } else {
        charYear = {
          ...year,
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

    //get the seen ins
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

    return ({
      ...e,
      index,
      seenIn: seenInYears,
      yearIndex: _newYears.filter(y => y.year === e.startYear)[0].yearIndex,
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

// update index.html to include some content for some SEO
let html = '';

html += '<h2>Star Wars Movies</h2>\n';
html += '<p>Click on any of the Star Wars movies below to see it in the timline!</p>\n';
html += '<ul>\n';
data.sort((a,b) => a.startYear > b.startYear ? 1 : -1).filter(d => d.type === 'movie').forEach(movie => {
  html += `<li><a href="https://timeline.starwars.guide/#year=${movie.startYear}">${movie.title}</a></li>\n`;
});
html += '</ul>\n\n';

html += '<h2>Star Wars TV Shows</h2>\n';
html += '<p>Click on any of the Star Wars TV shows below to see it in the timline!</p>';
html += '<ul>\n';
data.sort((a,b) => a.startYear > b.startYear ? 1 : -1).filter(d => d.type === 'tv').forEach(tv => {
  html += `<li><a href="https://timeline.starwars.guide/#year=${tv.startYear}">${tv.title}</a></li>\n`;
});
html += '</ul>\n';

html += '<h2>Star Wars Characters</h2>\n';
html += '<p>Click on any of the Star Wars characters below to see it in the timline!</p>';
html += '<ul>\n';
data.sort((a,b) => a.startYear > b.startYear ? 1 : -1).filter(d => d.type === 'character').forEach(character => {
  html += `<li><a href="https://timeline.starwars.guide/#year=${character.startYear}&character=${character.title}">${character.title}</a>\n
  ${character.description}
  </li>\n`;
});
html += '</ul>\n';
var file = fs.readFileSync('./public/index.html', 'utf-8');

html = `<div id="content">${html}</div>`;
var newValue = file.replace(/<div id="content">[\s<>\/!=":#-éa-z0-9]*<\/ul>\n<\/div>/mig, html);

fs.writeFileSync('./public/index.html', newValue, 'utf-8');


const root = create({ version: '1.0' })
  .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

data.forEach(d => {
  root
    .ele('url')
    .ele('loc').txt(`https://timeline.starwars.guide/${d.type}/${d.title}/#${d.type}=${d.title}&year=${d.startYear}`).up()
    .ele('lastmod').txt(new Date().toISOString().slice(0,10)).up();
});

// convert the XML tree to string
const xml = root.end({ prettyPrint: true });
fs.writeFileSync('./public/sitemap.xml', xml, 'utf-8');