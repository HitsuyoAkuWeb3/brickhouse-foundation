import fs from 'fs';
import * as xlsx from 'xlsx';

const workbook = xlsx.readFile('/Users/ramajjohnson/Brickhouse Mindset/BrickhouseMindset_Brick1Lessons_BetaUpload.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

// Clean keys and map appropriately
const lessons = data.map(row => ({
  number: row['Lesson #'] || '',
  title: row['Lesson Title (Large Bold text)'] || '',
  body: row['Full Body Text'] || '',
  pullQuote: row['Quotable (Pull quote)'] || '',
  promptType: row['Prompt Type (Reflection vs Homework)'] || '',
  promptBox: row['Prompt Inside Colored Box'] || '',
  discardedBelief: row['Discarded Belief'] || '',
  installedBelief: row['Installed Belief'] || ''
})).filter(lesson => lesson.number && lesson.title);

const output = `export const brick1Lessons = ${JSON.stringify(lessons, null, 2)} as const;\n`;
fs.writeFileSync('/Users/ramajjohnson/Brickhouse Mindset/brickhouse-foundation/src/data/brick1Lessons.ts', output);
console.log('Script completed. Generated brick1Lessons.ts');
