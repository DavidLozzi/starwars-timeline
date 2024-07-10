// Prepare social media posts for Star Wars Timeline
import fs from 'fs';
import got from 'got';
import dotenv from 'dotenv';
dotenv.config();

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const generate_tweet = async (data, callback) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const requestBody = {
    'messages': [
      {
        'role': 'system',
        'content': `You are a GPT tasked with creating tweets based on a Star Wars timeline. You will be \
provided a tweet for one event or character, please review it and summarize it in a way that is engaging and informative. \
You can also add hashtags and emojis. Your tweet is the intro the the tweet sent to you. Do not ask the reader to do anything, \
just summarize the content. Keep it to 280 characters or less. \

Your tweet is a summary of the tweet(s) the user is giving you. The tweet provided to you will be added to your tweet later, do not \
include it, or a timeline in your tweet.
`,
      },
      {
        'role': 'user',
        'content': `${JSON.stringify(data)}`,
      },
    ],
    'model': 'gpt-4o',
    'temperature': 0.8,
    'top_p': 0.95,
    'frequency_penalty': 0,
    'presence_penalty': 0,
    'max_tokens': 1200,
  };

  const openaiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    console.log('Calling GPT...\n');
    // console.log(requestBody.messages[1].content);
    const response = await got.post(openaiUrl, {
      headers: headers,
      json: requestBody
    });

    if (!response.ok) {
      throw new Error(`Error from OpenAI: ${response.statusText}`);
    }

    const message = JSON.parse(response.body).choices[0].message.content;
    console.log(message);
    callback(message);
    return message;
  } catch (error) {
    console.error('Error:', error.toString());
    return error.toString();
  }

};


const convertYear = (year) => {
  if (year <= 0) return `${year * -1} BBY`;
  if (year > 0) return `${year} ABY`;
  return 'none';
};

const create_tweets = async () => {
  const sortByTitle = (a, b) => a.title > b.title ? 1 : -1;
  const sortByValue = (a, b) => a > b ? 1 : -1;
  const tweetSize = 280;
  const threadBreak = '\n\nTHREAD_BREAK\n\n';
  const allOutput = [];
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


  const getEventIcon = (e) => {
    if (e.type === 'movie') {
      return '🍿';
    }
    if (e.type === 'tv') {
      return '📺';
    }
  };
  const characters = JSON.parse(fs.readFileSync('../src/data/characters.json'));
  const getCharacterTweets = (character) => {
    const c = characters.find(ch => ch.title === character.title);
    const _birthYear = c.birthYear || c.startYear;
    let output = '';
    output += `${c.title}\n`;
    if (!c.startYearUnknown) {
      output += `Born ${convertYear(c.startYear)} `;
    } else {
      output += 'birth date? ';
    }
    if (!c.endYearUnknown) {
      output += `, died ${convertYear(c.endYear)} `;
    } else {
      output += ' (no known death) ';
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
    const hashtags = `\n#${c.title.replace(/[\s-]/ig, '')}${c.altTitle ? ` #${c.altTitle.replace(/[\s-]/ig, '')}` : ''} #StarWars`;

    if (output.length > tweetSize) {
      let tweet = '';
      let tweetCnt = 2; // start at 2 as the generated tweet is 1
      let thread = '';
      let _output = '';
      output.split('\n').forEach(l => {
        thread = `\n🧵${tweetCnt}/^#^`;
        if (tweetCnt === 1) {
          thread = `${hashtags}${thread}`;
        }
        if (tweet.length + l.length + thread.length < tweetSize) {
          tweet += `${l}\n`;
        } else {
          tweet += thread;
          tweetCnt++;
          tweet += threadBreak;
          _output += tweet;
          tweet = `${l}\n`;
        }
      });

      if (tweet) { // few remaining lines
        tweet += thread;
        _output += tweet;
      }
      output = _output.replace(/\^\#\^/ig, tweetCnt);
    }
    allOutput.push({ title: `${c.type}-${c.title}`, tweet: output, img: `https://timeline.starwars.guide${c.imageUrl}` });
  };

  _newYears
    .filter(y => y.eventCount > 0)
    .forEach(y => {
      let header = '';
      let linkToCharacter = '';
      if (y.events.some(e => e.type === 'era')) {
        header += y.events.filter(e => e.type === 'era').sort((a, b) => a.startYear > b.startYear ? -1 : 1).map(e => {
          if (e.endYear === y.year) {
            return `🍾  Long live the ${e.title}!`;
          }
          if (e.startYear === y.year) {
            return `📆  The ${e.title} has begun, in the year of ${y.display}`;
          }
        }).filter(e => !!e).sort(sortByValue).join('\n');
        header += '\n\n';
      } else {
        const era = data.find(d => d.type === 'era' && d.startYear <= y.year && d.endYear >= y.year);
        if (era) {
          header += `📆  During the ${era.title}, in the year of ${y.display}\n\n`;
        } else {
          console.log('No era for', y);
        }
      }

      let movies = '';
      //movies/tv
      if (y.events.some(e => e.type === 'movie' || e.type === 'tv')) {
        movies += y.events.map(e => {
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
        movies += '\n\n';
      }

      let birthdays = '';
      let imageUrl = '';
      //birthdays
      if (y.events.some(e => e.type === 'character' && e.startYear === y.year)) {
        birthdays += '🎂  ';
        birthdays += y.events.sort(sortByTitle).map(e => {
          if (e.type === 'character') {
            if (e.startYear === y.year) {
              if (!linkToCharacter) {
                linkToCharacter = `character/${encodeURI(e.title)}?year=${e.startYear}`;
                imageUrl = e.imageUrl;
              }
              return `${e.title}${e.startYearUnknown ? ' (maybe?)' : ''}`;
            }
          }
          return null;
        }).filter(e => !!e).join(', ');
        birthdays += ' was born\n\n';
      }

      let deaths = '';
      //deaths
      if (y.events.some(e => e.type === 'character' && e.endYear === y.year && !e.endYearUnknown)) {
        deaths += '🪦  ';
        deaths += y.events.sort(sortByTitle).filter(e => e.type === 'character' && e.endYear === y.year && !e.endYearUnknown).map(e => {
          if (!linkToCharacter) {
            linkToCharacter = `character/${encodeURI(e.title)}?year=${e.startYear}`;
          }
          return `${e.title}${e.endYearUnknown ? ' (maybe?)' : ''}`;
        }).filter(e => !!e).join(', ');
        deaths += ' died\n\n';
      }

      let footer = '';
      footer += `Explore more https://timeline.starwars.guide/${linkToCharacter ? linkToCharacter : ''}\n`;
      footer += '#StarWars ';

      if (movies.length > 0 && header.length + movies.length + footer.length < tweetSize) {
        movies = header + movies + footer;
        allOutput.push({ title: `movies-${y.display}`, tweet: movies });
      }

      if (birthdays.length > 0 && header.length + birthdays.length + footer.length < tweetSize) {
        birthdays = header + birthdays + footer;
        allOutput.push({ title: `births-${y.display}`, tweet: birthdays, img: `https://timeline.starwars.guide${imageUrl}` });
      }

      y.events.filter(e => e.type === 'character' && e.startYear === y.year).forEach(c => getCharacterTweets(c));

      if (deaths.length > 0 && header.length + deaths.length + footer.length < tweetSize) {
        deaths = header + deaths + footer;
        allOutput.push({ title: `death-${y.display}`, tweet: deaths });
      }

    });

  const promises = [];
  for (let i = 0; i < allOutput.length; i++) {
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    const update = (message, i) => {
      console.log('\nupdating message\n', i, message);
      const threadCount = allOutput[i].tweet.split(threadBreak).length;
      allOutput[i].tweet = `${message}\n🧵1/${threadCount + 1}${threadBreak}${allOutput[i].tweet}`;
    };
    promises.push(generate_tweet(allOutput[i], (message) => update(message, i)));
  }

  await Promise.all(promises);

  fs.writeFile('../public/socials.json', JSON.stringify(allOutput, null, 2), (err) => {
    if (err) {
      console.error(`socials writeFile ${JSON.stringify(err)}`);
    } else {
      console.log('socials.json file created');
    }
  });

  // get numbers
  console.log('total tweets:', allOutput.length);
};


create_tweets();