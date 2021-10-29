---
name: 'New Data '
about: Suggest additional data to add
title: ''
labels: new data
assignees: ''

---

**Share more data below**
There are three ways to share data, depending on your preference:

# Provide the basics

**Title**
What's the name of the character, movie, or TV show you'd like to add. Sorry, not including books yet, there are too many of those.

**Link**
Provide a link to the content on Wookiepedia.

# Provide the formatted data

**Edit the following for the data you want to add or modify**

```json
  {
    "title": "Primary name, i.e. Anakin Skywalker",
    "altTitle": "Subtitle, i.e. Darth Vadar",
    "startYear": -41, // when were they born? If BBY, use a negative number, ABY use a positive
    "startYearUnknown": true, // if exact startYear is unknown, sent this to true
    "endYear": 4, //  // when did they die ? If BBY, use a negative number, ABY use a positive
    "endYearUnknown": true, // if exact endYear is unknown, set this to true
    "seenIn": [ // provide a list of movies & TV shows they've been seen in
      "Episode I: The Phantom Menace",
      "Episode II: Attack of the Clones",
      "Episode III: Revenge of the Sith",
      "The Clone Wars (movie)",
      "The Clone Wars (TV series)",
      "Star Wars Rebels",
      "Rogue One: A Star Wars Story",
      "Episode IV: A New Hope",
      "Episode V: The Empire Strikes Back",
      "Episode VI: Return of the Jedi"
    ],
    "description": "Provide a description of the user",
    "wookiepedia": "https://starwars.fandom.com/wiki/Anakin_Skywalker", // provide the full URL to their wookiepedia page
    "metadata": [ // provide additional information about the person
      {
        "name": "Homeworld",
        "value": "Tatooine"
      },
      {
        "name": "Species",
        "value": "Human"
      }
    ]
  }
```

# Edit the data directly

The data for everything is in `/build/data.json`. You may edit that and submit a pull request.

**Thank you!**
