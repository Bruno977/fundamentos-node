import fs from 'fs';
import { parse } from 'csv-parse';

const csvFilePath = new URL('./tasks.csv', import.meta.url)
const parser = fs.createReadStream(csvFilePath)
  .pipe(parse({ columns: true, skip_empty_lines: true }));

for await (const record of parser) {
  try {
    await fetch("http://localhost:3333/tasks", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    })

  } catch (error) {
    console.log(error);
  }
}