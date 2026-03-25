const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('/Users/ramajjohnson/Brickhouse Mindset/BrickhouseMindset_Brick1Lessons_BetaUpload.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

// Clean keys and map appropriately
const lessons = data.map(row => ({
  number: String(row['Lesson #'] || ''),
  title: row['Lesson Title'] || '',
  body: row['Lesson Body'] || '',
  pullQuote: row['Quotable'] || '',
  promptType: row['Prompt Type'] || '',
  promptBox: row['Prompt Text'] || '',
  discardedBelief: row['Mindset Shift FROM'] || '',
  installedBelief: row['Mindset Shift TO'] || ''
})).filter(lesson => lesson.number && lesson.title);

const output = `export const brick1Lessons = ${JSON.stringify(lessons, null, 2)} as const;\n`;
fs.writeFileSync('/Users/ramajjohnson/Brickhouse Mindset/brickhouse-foundation/src/data/brick1Lessons.ts', output);
console.log(`Script completed. Generated brick1Lessons.ts with ${lessons.length} lessons.`);
