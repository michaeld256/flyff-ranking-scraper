interface FlyffRanking {[rankNum: number]: FlyffRankData}

interface FlyffRankData {
	position: number,
	sex: "male" | "female",
	name: string,
	level: number,
	job: string,
	jobRank: number,
	guild: string,
	playtime: Date
}

export {FlyffRanking, FlyffRankData}