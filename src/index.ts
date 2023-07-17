import { RankingScraperBrowser } from "./RankingScraper/RankingScraperBrowser";

(async function() {
	const rankingScraper = new RankingScraperBrowser()
	await rankingScraper.setup()

	// Scrape ranking
	const ranking = await rankingScraper.scrapeServers({totemia: 8})

	// Do whatever you like with the ranking ...
	// e.g. scrape ranking every hour to compare with previous iteratations.
	console.log(ranking)
}()) 