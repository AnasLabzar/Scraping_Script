const scraperObject = {
  url: 'https://www.key-2702.com/-back-office/commande.php',
  async scraper(browser) {
    let page = await browser.newPage(); // Create a new page
    console.log(`Navigating to ${this.url}...`);

    let EmailLogin = "guillaumebigot12@gmail.com";
    let PswLogin = "123456";

    // Navigate to the login page
    await page.goto(this.url);

    // Check if the URL is redirected to "command.php"
    if (page.url().includes('commande.php')) {
      console.log('Already on the desired page. No need to log in.');
    } else {
      // Perform login if not redirected
      await page.waitForTimeout(1000); // 1-second delay

      await page.type('input[type="email"]', EmailLogin)

      // Wait for the page to load
      await page.waitForTimeout(400); // 1-second delay

      await page.type('input[type="password"]', PswLogin);

      // Click the "detail" button
      await page.keyboard.press('Enter');

      await page.waitForTimeout(15000); // 1-second delay


      try {
        // Wait for navigation to accueil.php
        await page.waitForNavigation({ url: 'https://www.key-2702.com/-back-office/accueil.php' });
        console.log("hello1");
      } catch (error) {
        console.log("Sorry! The 15-second timeout for navigation to accueil.php has expired.");
      }
    }

    await page.waitForSelector('a[href="commande.php"]');
    console.log("hello2");

    await page.waitForTimeout(500); // 1-second delay

    // Use page.evaluate to click the <a> element
    await page.evaluate(() => {
      console.log("hello3");
      const commandeLink = document.querySelector('a[href="commande.php"]');
      console.log("hello4");
      if (commandeLink) {
        commandeLink.click();
        console.log("hello5");
      } else {
        console.log("le click de redirection c'est pas marche");
      }
    });

    await page.waitForTimeout(2000); // 1-second delay
    console.log("test1");

    // Find all elements with class 'accordion-button'
    const accordionButtons = await page.$$('.accordion-button');
    console.log("accordionButtons");

    for (const accordionButton of accordionButtons) {
      console.log("test111");

      // if (accordionButton.length >= 2) {
      //   // Click the second accordion button
      //   await accordionButton[1].click();
      //   console.log("test2");
      // } else if (accordionButton.length === 1) {
      //   // Click the first accordion button
      //   await accordionButton[0].click();
      //   console.log("test2");
      // } else {
      //   // Handle the case where there are no accordion buttons
      //   console.log("No accordion buttons found.");
      // }

      await accordionButton.click();

      // Wait for the table to load, adjust the selector if necessary
      await page.waitForSelector('table tbody tr');
      console.log("test3");

      // Find and click the "a" button in the last column of the row with "KENDO-TEST" in the second column
      const rows = await page.$$('table tbody tr');
      console.log("test4");

      for (const row of rows) {
        await page.waitForTimeout(1000); // 1-second delay
        console.log("test5");

        const columns = await row.$$('td');
        console.log("test6");

        if (columns.length >= 2) {
          const secondColumnText = await columns[1].evaluate(element => element.textContent);
          if (secondColumnText.includes('KENDO-TEST')) {
            console.log("is just a test technique");
          } else {
            const buttons = await row.$$('td:last-child a');
            if (buttons.length >= 0) {
              console.log("test7");

              const newPage = await browser.newPage(); // Create a new page for the link
              const link = await buttons[0].evaluate(link => link.href);

              await newPage.goto(link);
              console.log(`Scraping data from page: ${link}`);



              // // Wait for navigation to complete
              // await page.waitForNavigation();
              // console.log("Navigation completed.");

              // Check if there is more than one <li> with class "verti-timeline"
              const vertiTimelineCount = await newPage.$$eval('.verti-timeline li', (elements) => elements.length);
              console.log("test9");

              if (vertiTimelineCount === 1) {
                console.log("test10");

                // If there is only one <li>, click the "order-check" button
                await newPage.click('#order-check');
                console.log("test11");

                // Wait for the checkboxes to appear, adjust the selector as needed
                await newPage.waitForSelector('.confirmation_check');
                console.log("test12");

                // Click on all checkboxes
                const checkboxes = await newPage.$$('.confirmation_check');
                console.log("test13");
                
                await page.waitForTimeout(1000); // 1-second delay

                // for (const checkbox of checkboxes) {
                //   await checkbox.click();
                // }

                // Click the "order-ok" button
                // await newPage.click('#order-ok');

                console.log("test14");
              }

              // Set refreshPage to true to refresh the page after exiting the inner loop
              
              await newPage.close();
              console.log("Finished processing current row.");
            }
          }
          await page.waitForTimeout(1000); // 1-second delay
        }
      }

      console.log('Finished processing accordion button.');
    }
    await page.reload();


    console.log('Process completed.');
    await page.reload();
  }
}

module.exports = scraperObject;
