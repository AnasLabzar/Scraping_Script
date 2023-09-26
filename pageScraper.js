const processedCodes = new Set(); // Use a Set to track processed codes
const reopenCodes = new Set(); // Use a Set to track processed codes

const scraperObject = {
    url: 'https://www.key-2702.com/-back-office/commande.php',
    async scraper(browser) {
        let page = await browser.newPage();
        let EmailLogin = "guillaumebigot12@gmail.com";
        let PswLogin = "123456";

        await page.goto(this.url);
        console.log(`Navigating to ${this.url}...`);

        // Check if the URL is redirected to "command.php"
        if (page.url().includes('commande.php')) {
            console.log('Already on the desired page. No need to log in.');
        } else {
            // Perform login if not redirected
            await page.waitForTimeout(1000); // 1-second delay

            await page.type('input[type="email"]', EmailLogin);

            // Wait for the page to load
            await page.waitForTimeout(400); // 1-second delay

            await page.type('input[type="password"]', PswLogin);

            // Click the "detail" button
            await page.keyboard.press('Enter');

            await page.waitForTimeout(15000); // 15-second delay

            try {
                // Wait for navigation to accueil.php
                await page.waitForNavigation({ url: 'https://www.key-2702.com/-back-office/accueil.php' });
            } catch (error) {
                console.log("Sorry! The 15-second timeout for navigation to accueil.php has expired.");
                throw error; // Rethrow the error to stop processing
            }
        }

        await page.waitForSelector('a[href="commande.php"]');
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            let commandeLink = document.querySelector('a[href="commande.php"]');
            if (commandeLink) {
                commandeLink.click();
            } else {
                console.log("le click de redirection c'est pas marche");
                throw new Error("Clicking redirection link failed.");
            }
        });

        await page.waitForTimeout(2000);

        async function scrapeCurrentPage() {
            console.log("T1");
            await page.waitForSelector('table tbody tr');
            console.log("T2");
            let urls = await page.$$eval('table tbody tr', links => {
                console.log("T3");
                // Extract the links from the data
                links = links.map(el => el.querySelector('td:last-child a').href);
                console.log("T4");
                return links;
            });
            console.log("T5");

            console.log(urls);

            // Loop through each of those links, open a new page instance and get the relevant data from them
            console.log("T6");
            for (let link of urls) {
                console.log("T7");
                const code = extractCodeFromLink(link); // Extract code from the link
                console.log("T8");
                
                if (code !== null && !processedCodes.has(code) || reopenCodes.has(code)) {
                    console.log("Processing link with code:", code);
                    let currentPageData = await pagePromise(link, code);
                    console.log("T8");
                    console.log(currentPageData);
                } else {
                    console.log("Skipping link with code:", code);
                }
            }

            console.log("T9");
            await page.reload();
            return scrapeCurrentPage();
        }

        async function pagePromise(link, code) {
            console.log("T10");
            let newPage = await browser.newPage();
            console.log("T11");
            await newPage.goto(link);
            console.log("T12");

            const vertiTimelineCount = await newPage.$$eval('.verti-timeline li', (elements) => elements.length);

            if (vertiTimelineCount === 1) {
                // Re-open the file if vertiTimelineCount is 1
                console.log("Re-opening the file due to vertiTimelineCount === 1");
                await newPage.goto(link); // Re-open the page
                await newPage.click('#order-check');
                await newPage.waitForSelector('.confirmation_check');

                const checkboxes = await newPage.$$('.confirmation_check');

                for (const checkbox of checkboxes) {
                    await checkbox.click();
                }
                
                reopenCodes.add(code);
            }
            processedCodes.add(code);
            console.log("T13");
            // Close the new page
            await newPage.close();
        }
        console.log("T14");

        function extractCodeFromLink(link) {
            const regex = /customer=(\d+)/; // Regular expression to match "customer=12345"
            const match = link.match(regex);
            if (match) {
                return match[1]; // Extracted code or ID
            }
            return null; // Return null if no match is found
        }

        let data = await scrapeCurrentPage();
        console.log(data);
        return data;
    }
}

module.exports = scraperObject;




















        
