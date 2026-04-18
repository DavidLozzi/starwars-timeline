// gets words to use in SWORDLE app

const data = require('./data.json');

const words = [];

const splitAndAdd = (phrase) => {
  phrase?.split(' ').forEach(t => {
    const newT = t.replace(/[:.,]/ig, '');
    if (newT.length >= 4 && newT.length <= 6 && newT !== 'Star') {
      words.push(newT);
    }
  });
};
data.forEach(d => {
  splitAndAdd(d.title);
  splitAndAdd(d.altTitle);
  d.metadata?.forEach(m => {
    splitAndAdd(m.name);
    splitAndAdd(m.value);
  });
  splitAndAdd(d.description);
});

const reduced = words.reduce((a, b) => {
  if (a.indexOf(b) === -1) a.push(b);
  return a;
}, []);

reduced.sort((a, b) => a > b ? 1 : -1).forEach(w => console.log(w));
console.log(words.length + ' total words');