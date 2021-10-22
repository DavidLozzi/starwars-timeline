// preps data.json for the web consumption
const data = require('../src/data/data.json'),
  fs = require('fs');
 

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

let years = [];
let characters = [];
let seenIn = [];

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
years = _newYears;


// build characters
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
  .map((e, index) => ({
    ...e,
    index,
    yearIndex: _newYears.filter(y => y.year === e.startYear)[0].yearIndex,
    years: e.endYear - e.startYear,
    startYearDisplay: convertYear(e.startYear),
    endYearDisplay: convertYear(e.endYear)
  }));
characters = _characters;
 

// build seen in
const _seenIn = [];
_characters
  .forEach(c => {
    if (c.seenIn && c.seenIn.length > 0) {
      c.seenIn.forEach(seen => {
        const seenInYear = _newYears.find(y => y.events.some(e => e.title === seen));
        const seenInEvent = seenInYear.events.find(e => e.title === seen);
        _seenIn.push({
          character: c,
          seenInEvent,
          seenInYear
        });
      });
    }
  });
seenIn = _seenIn;

fs.writeFile("../src/data/years.json", JSON.stringify(years), (err) => {
  if (err) {
    console.error(`years writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('years.json file created');
  }
});

fs.writeFile("../src/data/characters.json", JSON.stringify(characters), (err) => {
  if (err) {
    console.error(`characters writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('characters.json file created');
  }
});

fs.writeFile("../src/data/seenIn.json", JSON.stringify(seenIn), (err) => {
  if (err) {
    console.error(`seenIn writeFile ${JSON.stringify(err)}`);
  } else {
    console.log('seenIn.json file created');
  }
});