import { chromium } from 'playwright';
import fs from 'fs';
import csvParser from 'csv-parser';

// Function to read the CSV file and extract the rows
function readCsvFile(csvFile: string): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    const results: any[] = [];
    console.log(`Reading CSV file: ${csvFile}`);

    fs.createReadStream(csvFile)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() })) // Ensure headers are standardized
      .on('data', (data) => {
        results.push(data);  // Push each row into the results array
      })
      .on('end', () => {
        console.log('CSV file read completed.');
        resolve(results);  // Resolve with the parsed rows
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        reject(err);
      });
  });
}

// Function to open the URL, interact with the form, and perform actions
async function openUrlsFromCsv() {
  const loginData = await readCsvFile('./data/demo.csv');

  if (loginData.length === 0) {
    console.log("No data found in the CSV file.");
    return;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  for (const [index, row] of loginData.entries()) {
    const {
      url,
      username_locator_type,
      username_locator_value,
      submit_button_locator_type,
      submit_button_locator_value,
      username_value,
      password_locator_type,
      password_locator_value,
      password_value
    } = row;

    // Ensure URL is not missing
    if (!url) {
      console.error(`Row ${index + 1}: URL is missing.`);
      continue;
    }

    // Launch new page
    const page = await context.newPage();
    console.log(`Opening URL: ${url}`);
    await page.goto(url);  // Open the URL

    // Handle username input field based on locator type and value
    if (username_locator_type && username_locator_value) {
      console.log(`Filling username: ${username_value}`);
      switch (username_locator_type.toLowerCase()) {
        case 'id':
          await page.fill(`#${username_locator_value}`, username_value);
          break;
        case 'name':
          await page.fill(`[name="${username_locator_value}"]`, username_value);
          break;
        case 'xpath':
          await page.fill(username_locator_value, username_value); // Use the XPath value
          break;
        // Add other cases if needed
      }
    }

    // Handle password input field based on locator type and value
    if (password_locator_type && password_locator_value) {
      console.log(`Filling password: ${password_value}`);
      switch (password_locator_type.toLowerCase()) {
        case 'id':
          await page.fill(`#${password_locator_value}`, password_value);
          break;
        case 'name':
          await page.fill(`[name="${password_locator_value}"]`, password_value);
          break;
        case 'xpath':
          await page.fill(password_locator_value, password_value); // Use the XPath value
          break;
        // Add other cases if needed
      }
    }

    if (submit_button_locator_type && submit_button_locator_value) {
      console.log(`Clicking submit button.`);
      switch (submit_button_locator_type.toLowerCase()) {
        case 'id':
          await page.click(`#${submit_button_locator_value}`);
          break;
        case 'name':
          await page.click(`[name="${submit_button_locator_value}"]`);
          break;
        case 'xpath':
          // Use the 'xpath=' prefix to tell Playwright to treat it as XPath
          await page.locator(`xpath=${submit_button_locator_value}`).click();
          break;
        // Add other cases if needed
      }
    }
    


    // Optionally wait for page change or result (like success message)
    await page.waitForTimeout(2000);  // Wait for 2 seconds to see the result

    await page.close();
  }

  await context.close();
  await browser.close();
}

// Run the test
openUrlsFromCsv().catch((error) => console.error('Error:', error));
