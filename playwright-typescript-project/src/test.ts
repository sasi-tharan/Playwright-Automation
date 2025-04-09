import { chromium } from 'playwright';
import fs from 'fs';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

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

// Function to write back to the CSV file
function writeCsvFile(csvFile: string, data: any[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const csvWriter = createObjectCsvWriter({
      path: csvFile,
      header: [
        { id: 'url', title: 'url' },
        { id: 'username_locator_type', title: 'username_locator_type' },
        { id: 'username_locator_value', title: 'username_locator_value' },
        { id: 'password_locator_type', title: 'password_locator_type' },
        { id: 'password_locator_value', title: 'password_locator_value' },
        { id: 'submit_button_locator_type', title: 'submit_button_locator_type' },
        { id: 'submit_button_locator_value', title: 'submit_button_locator_value' },
        { id: 'username_value', title: 'username_value' },
        { id: 'password_value', title: 'password_value' },
        { id: 'expected_result', title: 'expected_result' },
        { id: 'dashboard_url', title: 'dashboard_url' }, // Ensure dashboard_url is included here
        { id: 'actual_result', title: 'actual_result' },
      ],
    });

    csvWriter
      .writeRecords(data)
      .then(() => {
        console.log('CSV file updated successfully.');
        resolve();
      })
      .catch((err) => {
        console.error('Error writing to CSV file:', err);
        reject(err);
      });
  });
}

async function openUrlsFromCsv() {
  const loginData = await readCsvFile('./data/demo.csv');

  if (loginData.length === 0) {
    console.log("No data found in the CSV file.");
    return;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Iterate through each row of the CSV and perform the test
  for (const [index, row] of loginData.entries()) {
    const {
      url,
      username_locator_type,
      username_locator_value,
      submit_button_locator_type,
      submit_button_locator_value,
      username_value,
      password_value,
      expected_result,
      dashboard_url // Added the dashboard_url from the CSV
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
    if (password_value) {
      console.log(`Filling password: ${password_value}`);
      await page.fill(`[name="password"]`, password_value);
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
          await page.locator(`xpath=${submit_button_locator_value}`).click();
          break;
        // Add other cases if needed
      }
    }

    // Wait for the page to load (or wait for a specific element if necessary)
    await page.waitForTimeout(2000);  // Wait for 2 seconds

    // Check if the current URL matches the expected dashboard URL
    const actualUrl = page.url();
    const actualResult = (actualUrl === dashboard_url) ? 'login successful' : 'login not successful';

    console.log(`Expected result: ${expected_result}`);
    console.log(`Actual URL: ${actualUrl}`);
    console.log(`Actual result: ${actualResult}`);

    // Update the row with the actual result
    row['actual_result'] = actualResult;

    await page.close();
  }

  // Write the updated data back to the CSV file
  await writeCsvFile('./data/demo.csv', loginData);

  await context.close();
  await browser.close();
}

// Run the test
openUrlsFromCsv().catch((error) => console.error('Error:', error));

