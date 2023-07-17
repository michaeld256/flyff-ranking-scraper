import puppeteer, { Browser, Page } from "puppeteer"
import { RankingScraper } from "./IRankingScraper"
import { FlyffRanking } from "./IRanking"
import { parseDuration } from "./utils"

class RankingScraperBrowser implements RankingScraper {
	private browser: Browser|null
	private tab: Page|null
	private sleepInbetweenPages: number
	private isSetUp: boolean

	public constructor(sleepInbetweenPages: number = 5_000) {
		this.browser = null;
		this.tab = null
		this.sleepInbetweenPages = sleepInbetweenPages
		this.isSetUp = false
	}

	/** Setup puppeteer
	 * 
	 * @returns Promise. Resolves when pupeteer is setup, rejects if pupeteer couldn't start.
	 */
	public async setup(): Promise<void> {
		return new Promise(async (resolve, rej) => {
			try {
				this.browser = await puppeteer.launch({ headless: true, args: ["--disable-setuid-sandbox", "--no-sandbox"] })
				this.tab = await this.browser.newPage();
				this.isSetUp = true
				
				resolve()
			} catch(e) {
				rej(e)
			}
		})
	}

	/** Scrapes multiple flyff universe servers.
	 * 
	 * @param servers Servers to scrape as an associative array (serverName => serverId)
	 */
	public async scrapeServers(servers: {[serverName: string]: number}): Promise<{[serverName: string]: FlyffRanking}> {
		return new Promise(async (resolve, reject) => {
			if(!this.isSetUp)
				return reject("Setup the RankingScraper before calling any other methods")

			let serverRankings: {[server: string]: FlyffRanking} = {}

			for(const [serverName, serverId] of Object.entries(servers)) {
				if(serverName === "default" || serverId as any === "default")
					continue; 
	
				serverRankings[serverName] = await this.scrapeServer(serverId)
			}
	
			return resolve(serverRankings)
		})
	}

	/** Scrapes a single flyff universe server given by its id
	 * 
	 * @param server 
	 * @param pages 
	 * @returns 
	 */
	public async scrapeServer(server: number, pages: number = 20): Promise<FlyffRanking> {	
		return new Promise(async (resolve, reject) => {
			if(!this.isSetUp)
				return reject("Setup the RankingScraper before calling any other methods")

			let tmpRanking: FlyffRanking = {}
			for(let i: number = 1; i <= pages; i++) {
				// Navigate puppeteer to Flyff ranking url for given server and page
				await this.tab!.goto(`https://universe.flyff.com/sniegu/ranking/characters?server=${server}&page=${i}`)
				
				// Wait until table is rendered
				await this.tab!.waitForSelector("tbody tr")
		
				// Get all table rows
				let rows = await this.tab!.$$("tbody tr")
		
				for (const row of rows) {
					// Get ranking pos
					const rankNum = await row.$$eval("th", (th) => {
						let innerHTML = th[0].innerHTML
						if(innerHTML.includes("medal_first"))
							return 1
						if(innerHTML.includes("medal_second"))
							return 2
						if(innerHTML.includes("medal_third"))
							return 3
		
						return Number(th[0].innerText);
					});
					
					// Get all tds and parse their data
					const playerData = await row.$$eval("td", (tds) => {
						let jobRank = tds[2].innerText.trim().match(".*\#([1-9]+)")

						return {
							sex: (tds[0].innerHTML.includes("Sex/0.png") ? "male" : "female") as "male" | "female",
							name: tds[0].innerText.trim(),
							level: parseInt(tds[1].innerText.trim()),
							job: tds[2].innerText.trim().replace(/ \#.*/, ""),
							jobRank: jobRank ? parseInt(jobRank[1]) : -1,
							guild: tds[3].innerText.trim() || "",
							playtime: tds[4].innerText.trim() as any
						}
					})

					// Fix playtime
					playerData.playtime = parseDuration(playerData.playtime)
		
					// Set ranking position
					tmpRanking[rankNum] = {...playerData, position: rankNum}
				}
		
				// Sleep until next page
				await (new Promise(res => setTimeout(res, this.sleepInbetweenPages)))    
			}
		
			return resolve(tmpRanking)
		})
	}
}

export {RankingScraperBrowser};