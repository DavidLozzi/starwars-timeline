// Single source of truth for formatting a timeline year into its display
// string, replacing the seven near-identical `convertYear` copies scattered
// across build_scripts/ and src/ (see CLAUDE.md's data-pipeline notes and the
// content-agnostic-site-packs plan, WU-2).
//
// Must stay zero-dependency: build_scripts/prerenderCharacters.js imports
// modules from this directory and CI never runs `npm ci` inside
// build_scripts/, so nothing here may `import` a package.
//
// `years` is the site-pack config block shaped like:
//   { negativeSuffix, positiveSuffix, zeroIsNegative, absolute, unknownLabel }
//
// Star Wars: { negativeSuffix: 'BBY', positiveSuffix: 'ABY', zeroIsNegative: true, absolute: true, unknownLabel: 'unknown' }
//   -300 -> '300 BBY', 0 -> '0 BBY', 75 -> '75 ABY', null/undefined -> 'unknown'
//   (reproduces build_scripts/prepJson.js's convertYear exactly for every
//   numeric input; prepJson.js is the one whose output is committed as the
//   *Display fields other consumers read, so it is the behavior of record.)
//
// Marvel (plain calendar years): { negativeSuffix: '', positiveSuffix: '', zeroIsNegative: false, absolute: false }
//   -300 -> '-300', 0 -> '0', 75 -> '75', null/undefined -> 'unknown'
export function formatYear(year, years) {
  const {
    negativeSuffix = '',
    positiveSuffix = '',
    zeroIsNegative = true,
    absolute = true,
    unknownLabel = 'unknown',
  } = years || {};

  if (year === null || year === undefined) return unknownLabel;

  const isNegativeBranch = zeroIsNegative ? year <= 0 : year < 0;
  const suffix = isNegativeBranch ? negativeSuffix : positiveSuffix;
  const magnitude = isNegativeBranch && absolute ? Math.abs(year) : year;

  return suffix ? `${magnitude} ${suffix}` : `${magnitude}`;
}

export default formatYear;
