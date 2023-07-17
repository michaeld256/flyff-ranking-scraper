import { FlyffRanking } from "./IRanking"

interface RankingScraper {
	setup: () => Promise<void>,
	scrapeServers: (servers: {[serverName: string]: number}) => Promise<{[serverName: string]: FlyffRanking}>,
	scrapeServer: (server: number, pages: number) => Promise<FlyffRanking>
}

export {RankingScraper}