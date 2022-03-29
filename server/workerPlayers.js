const workerpool = require('workerpool')
const allPlayers = require('./allplayers.json')

const getPlayers = (leagues) => {
    let players = leagues.filter(x => x.isLeagueHidden === false && x.userRoster.players !== null).map(league => {
        return league.userRoster.players.map(player => {
            return {
                id: player,
                league: league,
                wins: league.wins,
                losses: league.losses,
                ties: league.ties,
                fpts: league.fpts,
                fpts_against: league.fpts_against
            }
        })
    }).flat()
    players = findOccurences(players)

    let playersAll = leagues.filter(x => x.isLeagueHidden === false).map(league => {
        return league.rosters.filter(x => x.players !== null && x.owner_id !== user.user_id).map(roster => {
            return roster.players.map(player => {
                return {
                    id: player,
                    league: league,
                    roster: roster,
                    fpts: 0,
                    fpts_against: 0,
                    wins: 0,
                    losses: 0,
                    ties: 0,
                    winpct: 0
                }
            })
        })
    }).flat(2)

    let all_active_players = []

    Object.keys(allPlayers).filter(x => x === x.trim() && allPlayers[x].status === 'Active').map(allPlayer => {
        const p = players.find(x => x.id === allPlayer)
        let leagues_unowned = playersAll.filter(x => x.id === allPlayer)
        if (p) {
            all_active_players.push({
                ...p,
                leagues_taken: leagues_unowned,
                leagues_available: leagues.filter(x =>
                    p.leagues.find(y => y.league_id === x.league_id) === undefined &&
                    leagues_unowned.find(y => y.league.league_id === x.league_id) === undefined)
            })
        } else {
            all_active_players.push({
                id: allPlayer,
                count: 0,
                yearsExp: allPlayers[allPlayer].years_exp,
                leagues: [],
                leagues_taken: leagues_unowned,
                leagues_available: leagues.filter(x =>
                    leagues_unowned.find(y => y.league.league_id === x.league_id) === undefined),
                wins: 0,
                losses: 0,
                ties: 0,
                winpct: 0,
                fpts: 0,
                fpts_against: 0,
                sortName: allPlayers[allPlayer].last_name + " " + allPlayers[allPlayer].first_name + " " + allPlayers[allPlayer].position + " " + allPlayers[allPlayer].team,
                isLeaguesHidden: true,
                isPlayerHidden: true
            })
        }
    })
    return all_active_players
}

workerpool.worker({
    getPlayers: getPlayers
})