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
        } catch (error) {
          console.log("Sorry! The 15-second timeout for navigation to accueil.php has expired.");
          throw error; // Rethrow the error to stop processing
        }
      }

      await this.page.waitForSelector('a[href="commande.php"]');

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

    // async function processData() {
    //   const accordionButtons = await scraperObject.page.$$('.accordion-button');
    //   console.log("accordionButtons");

    //   for (const accordionButton of accordionButtons) {
    //     try {
    //       console.log("test111");
    //       await accordionButton.click();

    //       await scraperObject.page.waitForSelector('table tbody tr');

    //       const rows = await scraperObject.page.$$('table tbody tr');

    //       // await scraperObject.page.waitForTimeout(1000);

    //       for (const row of rows) {
    //         try {
    //           const columns = await row.$$('td');
    //           const codeColumn = columns[0]; // Assuming the code is in the first column
    //           const code = await codeColumn.evaluate(element => element.textContent.trim());

    //           if (!processedCodes.has(code)) {
    //             const secondColumnText = await columns[1].evaluate(element => element.textContent);

    //             if (secondColumnText.includes('KENDO-TEST')) {
    //               console.log("is just a test technique");
    //             } else {
    //               const buttons = await row.$$('td:last-child a');
    //               if (buttons.length >= 0) {
    //                 const newPage = await scraperObject.page.browser().newPage();
    //                 const link = await buttons[0].evaluate(link => link.href);

    //                 await newPage.goto(link);
    //                 await scraperObject.page.waitForTimeout(1000);

    //                 console.log(`Scraping data from page: ${link}`);

    //                 const vertiTimelineCount = await newPage.$$eval('.verti-timeline li', (elements) => elements.length);

    //                 if (vertiTimelineCount === 1) {
    //                   await newPage.click('#order-check');
    //                   await scraperObject.page.waitForTimeout(1000);
    //                   await newPage.waitForSelector('.confirmation_check');

    //                   const checkboxes = await newPage.$$('.confirmation_check');

    //                   for (const checkbox of checkboxes) {
    //                     await checkbox.click();
    //                   }

    //                 }

    //                 // await scraperObject.page.waitForTimeout(500);
    //                 processedCodes.add(code); // Add the processed code to the Set
    //                 await newPage.close();
    //               }
    //             }
    //           } else {
    //             console.log(`Skipping row with code ${code} as it has already been processed.`);
    //           }
    //         } catch (error) {
    //           console.error(`Error in row processing: ${error.message}`);
    //         }
    //       }
    //       console.log('Finished processing accordion button.');
    //     } catch (error) {
    //       console.error(`Error in accordion button processing: ${error.message}`);
    //     }
    //   }
    //   startCheckingForData();
    //   await scraperObject.page.waitForTimeout(1000);
    // }

    async function processData() {
      const accordionButtons = await scraperObject.page.$$('.accordion-button');
      console.log("accordionButtons");
    
      for (const accordionButton of accordionButtons) {
        try {
          console.log("test111");
          await accordionButton.click();
    
          await scraperObject.page.waitForSelector('table tbody tr');
    
          const rows = await scraperObject.page.$$('table tbody tr');
    
          for (const row of rows) {
            try {
              const columns = await row.$$('td');
              const codeColumn = columns[0]; // Assuming the code is in the first column
              const code = await codeColumn.evaluate(element => element.textContent.trim());
    
              if (!processedCodes.has(code)) {
                const secondColumnText = await columns[1].evaluate(element => element.textContent);
    
                if (secondColumnText.includes('KENDO-TEST')) {
                  console.log("is just a test technique");
                } else {
                  const buttons = await row.$$('td:last-child a');
                  if (buttons.length >= 0) {
                    const newPage = await scraperObject.page.browser().newPage();
                    const link = await buttons[0].evaluate(link => link.href);
    
                    await newPage.goto(link);
                    await scraperObject.page.waitForTimeout(1000);
    
                    console.log(`Scraping data from page: ${link}`);
    
                    const vertiTimelineCount = await newPage.$$eval('.verti-timeline li', (elements) => elements.length);
    
                    if (vertiTimelineCount === 1) {
                      // Re-open the file if vertiTimelineCount is 1
                      console.log("Re-opening the file due to vertiTimelineCount === 1");
                      await newPage.goto(link); // Re-open the page
                      await scraperObject.page.waitForTimeout(1000);

                      await newPage.click('#order-check');
                      await scraperObject.page.waitForTimeout(1000);
                      await newPage.waitForSelector('.confirmation_check');

                      const checkboxes = await newPage.$$('.confirmation_check');

                      for (const checkbox of checkboxes) {
                        await checkbox.click();
                      }
                    }
    
                    // Continue processing other actions
    
                    processedCodes.add(code); // Add the processed code to the Set
                    await newPage.close();
                  }
                }
              } else {
                console.log(`Skipping row with code ${code} as it has already been processed.`);
              }
            } catch (error) {
              console.error(`Error in row processing: ${error.message}`);
            }
          }
          console.log('Finished processing accordion button.');
        } catch (error) {
          console.error(`Error in accordion button processing: ${error.message}`);
        }
      }
      startCheckingForData();
      await scraperObject.page.waitForTimeout(1000);
    }
    


    async function startCheckingForData() {
      let pageRefreshCount = 0; // Initialize page refresh counter
      const maxRefreshCount = 10; // Specify the maximum number of page refreshes before processing
    
      console.log('Starting periodic data check...');
      while (true) {
        // await scraperObject.page.waitForTimeout(2000);
        await scraperObject.page.reload();
        console.log('Refreshing the page and checking for new data...');
    
        // Increment the refresh counter
        pageRefreshCount++;
    
        if (pageRefreshCount == maxRefreshCount) {
          // Reset the refresh counter
          pageRefreshCount = 0;
          await scraperObject.page.waitForTimeout(2000); // 2-second delay
          console.log(`Maximum refresh count reached. Waiting for 2 seconds...`);
        } else {
          await scraperObject.page.waitForTimeout(1000); // 1-second delay
        }
    
        await processData();
      }
    }
  }
};


module.exports = scraperObject;
