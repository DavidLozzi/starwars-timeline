// Prepare character descriptions and timelines from Wikipedia URLs
import fs from 'fs';
import got from 'got';
import dotenv from 'dotenv';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from 'zod';

dotenv.config();

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const generate_description_and_timeline = async (character, callback) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const ResponseFormat = z.object({
    description: z.string(),
    timeline: z.string()
  });

  const requestBody = {
    'model': 'o4-mini',
    "reasoning": {"effort": "medium"},
    "text": {
        "format": zodTextFormat(ResponseFormat, "ResponseFormat")
    },
    "input": [
        {
            "role": "user",
            "content": `please review ${character.wookiepedia}
1. Create a single paragraph summary defining who they are, what are they known for, and major milestones
2. Create a comprehensive timeline for the character. Ensure its in chronological order. For estimated years, use ~ before the year.
Do not include any hyperlinks or citations

Provide only the output, as HTML in 2 JSON parameters:
{
    "description": "<p>summary paragraph</p>",
    "timeline": "<h4>Date - Title</h4><p>brief description</p><h4>..."
}`

        }
    ]
  };

  const openaiUrl = 'https://api.openai.com/v1/responses';

  try {
    console.log(`Calling GPT for ${character.title}...\n`);
    const response = await got.post(openaiUrl, {
      headers: headers,
      json: requestBody,
      timeout: { request: 120000 }
    });

    if (!response.ok) {
      throw new Error(`Error from OpenAI: ${response.statusText}`);
    }
    console.log(response.body);
    
    const responseData = JSON.parse(response.body);
    const completedItem = responseData.output.find(item => item.status === 'completed');
    const message = completedItem.content[0].text;
    console.log(`Response for ${character.title}:`, message);
    
    // Try to parse as JSON, fallback to text if needed
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(message);
    } catch (e) {
      // If not valid JSON, create a structured response
      parsedResponse = {
        description: message,
        timeline: "Timeline could not be parsed from response"
      };
    }
    
    callback(parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error(`Error for ${character.title}:`, error.toString());
    console.error(error.response.body);
    return {
      description: `Error processing ${character.title}: ${error.toString()}`,
      timeline: "Error occurred while processing timeline"
    };
  }
};

const process_characters = async () => {
  // Load existing results if file exists
  let existingResults = {};
  try {
    existingResults = JSON.parse(fs.readFileSync('./character_descriptions.json', 'utf8'));
    console.log(`Loaded ${Object.keys(existingResults).length} existing character descriptions`);
  } catch (error) {
    console.log('No existing character_descriptions.json found, starting fresh');
  }

  // Extract only characters from data.json that don't exist in results
  const allCharacters = data.filter(item => item.type === 'character' && item.wookiepedia);
  const characters = allCharacters.filter(character => !existingResults[character.wookiepedia]);
  
  console.log(`Found ${characters.length} characters with Wikipedia URLs that need processing`);
  
  const results = { ...existingResults };
  const promises = [];
  
  for (let i = 0; i < characters.length; i++) {
    if (i % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const character = characters[i];
    const update = (response, character) => {
      console.log(`\nProcessing ${character.title}`);
      results[character.wookiepedia] = {
        character: character.title,
        description: response.description,
        timeline: response.timeline
      };
    };
    
    promises.push(generate_description_and_timeline(character, (response) => update(response, character)));
  }

  await Promise.all(promises);

  // Write results to file
  fs.writeFile('./character_descriptions.json', JSON.stringify(results, null, 2), (err) => {
    if (err) {
      console.error(`character_descriptions writeFile error: ${JSON.stringify(err)}`);
    } else {
      console.log('character_descriptions.json file created');
      console.log(`Processed ${Object.keys(results).length} total characters (${characters.length} new)`);
    }
  });
};

process_characters();
