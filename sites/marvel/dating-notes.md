# Marvel in-story dating notes

This file records the reasoning behind every contested in-story `startYear`/`endYear`
in `data.json`'s `era`, `movie`, and `tv` entries. **In-story year, not release
year** — when the two differ, that's the entire point of this file.

Confidence key used throughout:

- **Established** — stated on-screen, confirmed by the production's own published
  timeline (e.g. Marvel Studios' official in-universe chronology), or otherwise
  unambiguous.
- **Inferred** — a reasonable placement derived from on-screen evidence (a
  dated document/gravestone, a stated age, a sequel's explicit time-jump) where
  no single authoritative source states the year outright.
- **Contested / compromise** — sources conflict, the on-screen evidence
  contradicts itself, or we picked a workable single year for an entry that
  arguably spans more than one. Treat these as the least precise entries in
  the file.

Do not read more precision into any of these than the note claims — several
are best-effort placements, not confirmed canon.

---

## MCU

### Iron Man — 2010 (Established)
The theatrical release year is 2008, but Marvel Studios' own published
in-universe timeline places the film's events in 2010, not 2008. We follow
the studio's timeline rather than the release year throughout this file (see
Captain Marvel, Endgame, Homecoming, and Far From Home below for the same
principle applied elsewhere). Downstream entries that were originally dated
relative to a 2008 Iron Man (Iron Man 2 / Incredible Hulk / Thor at "2011",
one year after Iron Man) keep that one-year offset, now anchored to 2010's
successor year of 2011 — consistent with the same official timeline, which
places those three in 2011 as well.

### Avengers: Endgame — 2023, single year (Contested / compromise)
Endgame's runtime spans two distinct points: the 2018 immediate aftermath of
Infinity War's snap, and the "five years later" 2023 main action (the time
heist and final battle). We collapse the entry to **2023 only** — the year
the film's climax, and Tony Stark's and Natasha Romanoff's deaths, actually
occur — rather than spanning 2018–2023. This is a deliberate simplification:
spanning the entry would misplace `endYearEvent` lookups and, more
importantly, would put the character death markers (which read from the
event's single year) in the wrong place relative to when those deaths
happen. The 2018 prologue belongs in prose (a character's `description`),
not in this entry's year range.

### Spider-Man: Homecoming — 2016 (Established, with a known error)
The film opens with an on-screen "Eight Years Later" card counting up from
the 2012 Battle of New York (i.e. implying 2020). This is a well-documented
continuity error the production itself has acknowledged informally — the
rest of the film's placement (Peter as a sophomore, Vulture's arc, the
character's age relative to Civil War the same in-story year) is only
consistent with **2016**, immediately after Civil War. We use 2016 and do
not propagate the on-screen card's arithmetic.

### Spider-Man: Far From Home — 2024 (Inferred)
Explicitly set "eight months after the Blip" resolves — i.e. eight months
after Endgame's 2023 climax restored the missing half of the population.
That places it in early-to-mid 2024. We use 2024.

### Captain Marvel — 1995 (Established)
Explicitly set in 1995 on-screen (Blockbuster Video, pager technology, the
Kree-Skrull conflict at that specific point). Not contested.

### Guardians of the Galaxy / Vol. 2 — both 2014 (Established / Inferred)
The first film is dated 2014 in-story (Peter Quill's abduction as a child is
1988, but the main action is contemporary-set 2014). Vol. 2 is understood to
take place mere months later the same year; we place both at 2014 rather
than splitting them, since the timeline's yearly granularity can't represent
a few months' gap and nothing downstream depends on the distinction.

---

## Fox X-Men

### X-Men Origins: Wolverine — 1979 (Inferred)
The film's framing device opens in 1845 and races through two centuries of
Logan's life in a montage before settling into its actual plot, which plays
out against a Bosnian-refugee-era Team X mission and later Three Mile
Island-adjacent government-experiment period beats. The film itself doesn't
carry a hard on-screen year for its main action; the most commonly cited
placement for the bulk of the plot (the Team X period through Logan's
escape) lands in the late 1970s. We use **1979** as a single-year
placement for the entry and do **not** use 1845 (that's prologue, not the
entry's year, exactly as Endgame's 2018 prologue is excluded above). This is
one of the softer dates in this file — treat 1979 as "our best placement,"
not as a stated fact.

### X-Men: Days of Future Past — 1973 (Established)
The past-set portion of the film — the half that actually plots new events
onto the timeline, since the future-set framing scenes are a dystopia this
timeline doesn't otherwise chart — is explicitly dated 1973 (Nixon-era,
Paris Peace Accords). We use 1973 and ignore the framing device's "present
day," matching the film's own on-screen date card.

### Logan — 2029 (Established)
Explicitly dated on-screen via a news broadcast and documents shown in the
film. Not contested.

---

## Fox Fantastic Four

### The Fantastic Four: First Steps — 1964 (Established, alternate-Earth)
Set on Earth-828, a retro-futurist alternate reality whose "present day"
resembles an idealized 1960s aesthetic; the film's own marketing and
production materials place it explicitly in that period. We use 1964 as the
representative year. Because this is a different Earth from the rest of the
`mcu`-tagged entries, its placement on the same numeric year axis as, say,
Captain America: The First Avenger (1943, Earth-616/MCU-prime) is a
timeline-rendering convenience, not a claim that the two share a universe
year-for-year. This is the one `mcu`-tagged entry in the file that is not
Earth-616.

---

## Sony's Spider-Man Universe (SSU)

### Madame Web — 2003 (Established, not the release year)
The film is explicitly and repeatedly dated on-screen as taking place in
2003 (period technology, a stated year), despite releasing in 2024. This is
the most clear-cut "in-story year ≠ release year" case in the whole file
after Iron Man, which is why it's called out by name in the work plan. We
use the film's own stated 2003, not its 2024 release year.

---

## Pre-MCU one-offs

These nine films predate any shared continuity and were each dated using
their own release year as the in-story year, since none of them make a
point of dating themselves differently from release (unlike Madame Web).
That is an assumption of convenience, not a researched claim — if any of
these films contains an internal date reference we haven't checked, treat
our placement as **inferred**, not established.

---

## Era spine

The six eras in this file (`The War Years` 1943–1961, `The Mutant Age`
1962–1999, `The Age of Heroes` 2000–2011, `The Avengers Era` 2012–2017,
`The Blip` 2018–2022, `The Multiverse Era` 2023–2029) are a single
**shared, non-overlapping spine** across every universe in this pack, not
a per-universe timeline. See the work plan (§3) for why: `Styled.Era`
paints a full-bleed bar and two eras covering the same years would overpaint
each other, so per-universe era sets are out of scope until a universe
picker exists.

### "The Blip" — known compromise
The name "The Blip" is MCU fan vocabulary for the 2018–2023 period between
Thanos's snap (Infinity War) and its reversal (Endgame). We reused it to
label the 2018–2022 era in the shared spine even though that same window
also contains **Deadpool 2** (2018, `fox-xmen`) and **Venom** (2018, `ssu`)
— two films with no connection to the Blip whatsoever. This is an accepted
compromise: the MCU dominates the story density of that five-year window
(nine mcu movie/tv entries fall inside it versus two non-MCU titles), and a
neutral label ("2018–2022") was judged less useful to a reader than a
recognizable one that's slightly overclaimed. Revisit when the picker can
swap era labels/sets per universe (out of scope for this work unit — see
the work plan's "Out of scope" section).

Note also that the era's `endYear` (2022) does not coincide with Endgame's
`endYear` (2023, in the following era, "The Multiverse Era") — Endgame's
climax is understood as the event that *ends* the Blip, so it correctly
falls just after the era boundary rather than inside it.
