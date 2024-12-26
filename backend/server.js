const puppeteer = require('puppeteer');

// Endpoint to scrape player stats
app.get('/scrape-player-stats', async (req, res) => {
    const { playerUrl } = req.query;
    if (!playerUrl) {
        return res.status(400).json({ error: 'Player URL is required' });
    }

    try {
        // Launch a headless browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the player's page
        await page.goto(playerUrl, { waitUntil: 'networkidle2' });

        // Extract the player's name
        const playerName = await page.$eval('h1[itemprop="name"]', (el) => el.textContent.trim());

        // Extract the stats table (e.g., batting stats)
        const statsTable = await page.$('#batting_standard');
        if (!statsTable) {
            await browser.close();
            return res.status(404).json({ error: 'Stats table not found' });
        }

        // Extract table headers
        const headers = await statsTable.$$eval('thead th', (ths) =>
            ths.map((th) => th.textContent.trim())
        );

        // Extract table rows
        const rows = await statsTable.$$eval('tbody tr', (trs) =>
            trs.map((tr) => {
                const cells = tr.querySelectorAll('th, td');
                return Array.from(cells).map((cell) => cell.textContent.trim());
            })
        );

        // Close the browser
        await browser.close();

        res.json({ playerName, headers, stats: rows });
    } catch (error) {
        console.error('Error scraping player stats:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});