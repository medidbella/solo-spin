// goals scored:
// 	score 25 goals -> {first achievement}, score 75 goals {second achievement},  200 goals {last achievement}
// games played:
// 	play 10 games -> {first achievement}, play 25 games {second achievement},  play 60 games {last achievement}
// for the user level: 
// 	level 3 -> {first level based achievement}, level 7 -> {second level based achievement}, level 13 {last level based achievement}


const achievement_titles = ["scored 25 goals", "scored 75 goals", "scored 200 goals", "played 10 games",
		"played 25 games", "played 60 games", "reached level 3", "reached level 7", "reached level 13"]

let achievement_map = new Map

function achievement_map_init()
{
	let index = 0
	for (let i = 1; i <= 3; i++)
	{
		for (let j = 1; j<=3;j++)
		{
			achievement_map.set(`${i}-${j}`, achievement_titles[index])
			index++;
		}
	}			
}

achievement_map_init()

const achievement_consts = {
	first_level: 3,
	second_level: 7,
	last_level: 13,
	
	first_games: 10,
	second_games: 25,
	last_games: 60,

	first_goals: 25,
	second_goals: 75,
	last_goals: 200,
}

function updateGoalsAchievement(scored_goals:number, current_scored_goals:number):string
{
	// console.log(`scored_goals : ${scored_goals}, game_goals : ${current_scored_goals}`)//debug
	if (achievement_consts.last_goals > scored_goals &&
			scored_goals + current_scored_goals >= achievement_consts.last_goals)
		return  ("1-3,")
	else if (achievement_consts.second_goals > scored_goals &&
			scored_goals + current_scored_goals >= achievement_consts.second_goals)
		return  ("1-2,")
	else if (achievement_consts.first_goals > scored_goals &&
			scored_goals + current_scored_goals >= achievement_consts.first_goals)
		return ("1-1,")
	return ("")
}

function updatePlayedGamesAchievement(played_games:number):string
{
	switch (played_games)
	{
		case achievement_consts.last_games:
			return ("2-3,")
		case achievement_consts.second_games:
			return ("2-2,")
		case achievement_consts.first_games:
			return ("2-1,")
		default:
			return ""
	}
}

function updateLevelAchievement(user_level:number)
{
	switch (user_level)
	{
		case achievement_consts.first_level:
			return ("3-1,")
		case achievement_consts.second_level:
			return ("3-2,")
		case achievement_consts.last_level:
			return ("3-3,")
		default:
			return ""
	}
}

export function updateUserAchievements(winner:any, leveledUp:boolean, loser:any, winner_score:number, loser_score:number)
{
	winner.achievement_string = winner.achievement_string || ""
	loser.achievement_string = loser.achievement_string || ""

	if (leveledUp)
		winner.achievement_string += updateLevelAchievement(winner.level)
	winner.achievement_string     += updateGoalsAchievement(winner.goals_scored, winner_score)
	loser.achievement_string      += updateGoalsAchievement(loser.goals_scored, loser_score)
	winner.achievement_string     += updatePlayedGamesAchievement(winner.games_lost + winner.games_won + 1)
	loser.achievement_string      += updatePlayedGamesAchievement(loser.games_lost + loser.games_won + 1)
	// console.log(`winner string ${winner.achievement_string}`)//debug
	// console.log(`loser string ${loser.achievement_string}`)//debug

}

export function decodeUserAchievementString(achievement_string:string)
{
	let result:{code:string, title:string}[] = []
	if (!achievement_string || achievement_string === "null" || achievement_string == "")
		return []
	console.log(`string : ${achievement_string}`) //debug
	const codes:string[] = achievement_string.split(',')
	for (let i = 0;i < codes.length; i++)
	{
		if (codes[i] != "")
			result.push({code: codes[i]!, title:achievement_map.get(codes[i])})
	}
	return result
}
