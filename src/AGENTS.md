# Star Wars Timeline

This app is a fan creation website for Star Wars, including a timeline of the Star Wars movies and characters.

As you, the coding agent, learn about the user's preferences, application context, or anything else you were not aware about, write them below in the <learnings> section, as bullets.

<learnings>
- This is a React-based Star Wars timeline visualization app that displays characters, movies, TV shows, and eras chronologically
- The app uses styled-components for theming with Jedi and Sith themes
- Core data structure includes characters.json (76+ characters), years.json (timeline from -300 BBY to 50 ABY), seenIn.json (media appearances), and filters.json (character metadata)
- Characters have complex data including birth/death years, seenIn arrays, metadata (species, homeworld, force sensitivity), and image URLs with year-based variations
- The timeline spans from High Republic Era (-300 BBY) through New Jedi Order (36-50 ABY)
- Main features: interactive timeline scrolling, character filtering by species/homeworld/media, character detail modals, responsive design
- Uses React Router for character-specific URLs with query parameters for year positioning
- Implements viewport-based character rendering optimization (only renders characters in view)
- Has drag-to-scroll functionality and smooth scrolling animations
- Includes analytics tracking for user interactions
- Build scripts use OpenAI API to generate character descriptions from Wookieepedia URLs
- The app is deployed at https://timeline.starwars.guide/ and uses GitHub Pages
- User prefers concise responses without step explanations - just implement changes directly
- Code review is important - check for shared functions and avoid impacting other use cases
- Ask for decisions when needed rather than making assumptions
</learnings>