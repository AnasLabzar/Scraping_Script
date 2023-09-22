const processedCodes = new Set(); // Use a Set to track processed codes

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', reason.stack || reason);
});


const scraperObject = {
  url: 'https://www.key-2702.com/-back-office/commande.php',
  page: null, // Global variable to store the page reference
  async scraper(browser) {
    this.page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);

    let EmailLogin = "guillaumebigot12@gmail.com";
    let PswLogin = "123456";

    try {
      // Navigate to the login page
      await this.page.goto(this.url);

      // Check if the URL is redirected to "command.php"
      if (this.page.url().includes('commande.php')) {
        console.log('Already on the desired page. No need to log in.');
      } else {
        // Perform login if not redirected
        await this.page.waitForTimeout(1000); // 1-second delay

        await this.page.type('input[type="email"]', EmailLogin);

        // Wait for the page to load
        await this.page.waitForTimeout(400); // 1-second delay

        await this.page.type('input[type="password"]', PswLogin);

        // Click the "detail" button
        await this.page.keyboard.press('Enter');

        await this.page.waitForTimeout(15000); // 15-second delay

        try {
          // Wait for navigation to accueil.php
          await this.page.waitForNavigation({ url: 'https://www.key-2702.com/-back-office/accueil.php' });
          console.log("hello1");
        } catch (error) {
          console.log("Sorry! The 15-second timeout for navigation to accueil.php has expired.");
          throw error; // Rethrow the error to stop processing
        }
      }

      await this.page.waitForSelector('a[href="commande.php"]');
      console.log("hello2");

      await this.page.waitForTimeout(500);

      await this.page.evaluate(() => {
        const commandeLink = document.querySelector('a[href="commande.php"]');
        if (commandeLink) {
          commandeLink.click();
        } else {
          console.log("le click de redirection c'est pas marche");
          throw new Error("Clicking redirection link failed."); // Throw an error to skip processing
        }
      });

      await this.page.waitForTimeout(2000);
      console.log("test1");

      await processData(); // Start processing initially
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
};

async function processData() {
  const accordionButtons = await scraperObject.page.$$('.accordion-button');
  console.log("accordionButtons");

  for (const accordionButton of accordionButtons) {
    try {
      console.log("test111");
      await accordionButton.click();
      await scraperObject.page.waitForTimeout(1000);

      await scraperObject.page.waitForSelector('table tbody tr');
      console.log("test3");

      const rows = await scraperObject.page.$$('table tbody tr');
      console.log("test4");

      // await scraperObject.page.waitForTimeout(1000);

      for (const row of rows) {
        try {
          console.log("test5");

          const columns = await row.$$('td');
          await scraperObject.page.waitForTimeout(1000);

          console.log("test6");

          const codeColumn = columns[0]; // Assuming the code is in the first column
          await scraperObject.page.waitForTimeout(1000);

          const code = await codeColumn.evaluate(element => element.textContent.trim());

          if (!processedCodes.has(code)) {
            const secondColumnText = await columns[1].evaluate(element => element.textContent);
            await scraperObject.page.waitForTimeout(1000);

            if (secondColumnText.includes('KENDO-TEST')) {
              console.log("is just a test technique");
            } else {
              const buttons = await row.$$('td:last-child a');
              if (buttons.length >= 0) {
                console.log("test7");

                const newPage = await scraperObject.page.browser().newPage();
                const link = await buttons[0].evaluate(link => link.href);

                await newPage.goto(link);
                await scraperObject.page.waitForTimeout(1000);

                console.log(`Scraping data from page: ${link}`);

                const vertiTimelineCount = await newPage.$$eval('.verti-timeline li', (elements) => elements.length);
                console.log("test9");
                await scraperObject.page.waitForTimeout(1000);


                if (vertiTimelineCount === 1) {
                  console.log("test10");
                  await newPage.click('#order-check');
                  await scraperObject.page.waitForTimeout(1000);

                  console.log("test11");
                  await newPage.waitForSelector('.confirmation_check');
                  console.log("test12");
                  const checkboxes = await newPage.$$('.confirmation_check');
                  console.log("test13");
                  await scraperObject.page.waitForTimeout(1000);

                  for (const checkbox of checkboxes) {
                    await checkbox.click();
                    await scraperObject.page.waitForTimeout(1000);

                  }

                  console.log("test14");
                }

                // await scraperObject.page.waitForTimeout(500);
                await newPage.close();
                console.log("Finished processing current row.");
                processedCodes.add(code); // Add the processed code to the Set
              }
            }
          } else {
            console.log(`Skipping row with code ${code} as it has already been processed.`);
          }
        } catch (error) {
          console.error(`Error in row processing: ${error.message}`);
        }
        await scraperObject.page.waitForTimeout(2000);

      }

      console.log('Finished processing accordion button.');
    } catch (error) {
      console.error(`Error in accordion button processing: ${error.message}`);
    }

  }

  console.log('All accordion buttons have been processed.');
  startCheckingForData();
  await scraperObject.page.waitForTimeout(3000);
}

let pageRefreshCount = 0; // Initialize page refresh counter
const maxRefreshCount = 10; // Specify the maximum number of page refreshes before processing

async function startCheckingForData() {

  console.log('Starting periodic data check...');
  while (true) {
    // await scraperObject.page.waitForTimeout(2000);
    await scraperObject.page.reload();
    console.log('Refreshing the page and checking for new data...');

    // Increment the refresh counter
    pageRefreshCount++;
    await scraperObject.page.waitForTimeout(1000);


    if (pageRefreshCount >= maxRefreshCount) {
      // Reset the refresh counter
      pageRefreshCount = 0;
      await scraperObject.page.waitForTimeout(10000); // 10-second delay
      console.log(`Maximum refresh count reached. Waiting for 3 seconds...`);
    } else {
      await scraperObject.page.waitForTimeout(1000); // 1-second delay
    }

    await processData();
  }
}

module.exports = scraperObject;
