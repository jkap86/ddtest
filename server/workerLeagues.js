const workerpool = require('workerpool')
const axios = require('axios')

const config = {
    headers: {
        'Content-Type': 'text/json'
    }
}

const getDraftPicks = async (league, rosters, users, traded_picks_current, drafts) => {
    let draft_season;
    let draft_order;
    let draft_current = drafts.find(x => x.status === 'pre_draft' && x.settings.rounds === league.settings.draft_rounds)
    if (draft_current === undefined) {
        draft_season = parseInt(league.season) + 1
    } else {
        draft_season = parseInt(league.season)
        if (draft_current.draft_order === null) {
            draft_order = undefined
        } else {
            const draft = await axios.get(`https://api.sleeper.app/v1/draft/${draft_current.draft_id}`)
            draft_order = draft.data.slot_to_roster_id
        }

    }

    let traded_picks = traded_picks_current
    let previous_league_id = league.previous_league_id
    let i = draft_season
    while (previous_league_id > 0 && i <= parseInt(league.season) + 2) {
        const [picks, prev_league] = await Promise.all([
            await axios.get(`https://api.sleeper.app/v1/league/${previous_league_id}/traded_picks`),
            await axios.get(`https://api.sleeper.app/v1/league/${previous_league_id}`)
        ])
        traded_picks.push(picks.data.filter(x => parseInt(x.season) >= draft_season))
        previous_league_id = prev_league.data.previous_league_id
        i = i + 1
    }
    traded_picks = traded_picks.flat()

    let original_picks = {}
    for (let i = 1; i <= league.total_rosters; i++) {
        const user_id = rosters.find(x => x.roster_id === i).owner_id
        const username = users.find(x => x.user_id === user_id) === undefined ? 'orphan' : users.find(x => x.user_id === user_id).display_name
        original_picks[i] = {
            username: username,
            picks: {}
        }
        for (let j = draft_season; j <= parseInt(league.season) + 2; j++) {
            original_picks[i]['picks'][j] = {}
            for (let k = 1; k <= league.settings.draft_rounds; k++) {
                let picks = [{
                    pick: i,
                    order: draft_order === undefined || j !== draft_season ? undefined : parseInt(Object.keys(draft_order).find(x => draft_order[x] === i)),
                    total_rosters: league.total_rosters
                }]
                let picks_in = traded_picks.filter(x => parseInt(x.season) === j && x.round === k && x.owner_id === i)
                let picks_out = traded_picks.filter(x => parseInt(x.season) === j && x.round === k && x.previous_owner_id === i)

                picks_in.map(pick => {
                    picks.push({
                        pick: pick.roster_id,
                        order: draft_order === undefined || j !== draft_season ? undefined : parseInt(Object.keys(draft_order).find(x => draft_order[x] === pick.roster_id)),
                        total_rosters: league.total_rosters
                    })
                })
                for (let l = 0; l < picks_out.length; l++) {
                    const index = picks.indexOf(picks.find(x => x.pick === picks_out[l].roster_id))
                    if (index !== -1) {
                        picks.splice(index, 1)
                    }

                }
                picks = picks.reduce((acc, cur) => {
                    const x = acc.find(item => item.pick === cur.pick);
                    if (!x) {
                        return acc.concat([cur])
                    } else {
                        return acc
                    }
                }, [])
                original_picks[i]['picks'][j][k] = {}
                original_picks[i]['picks'][j][k].picks = picks
                original_picks[i]['picks'][j][k].picks_in = picks_in
                original_picks[i]['picks'][j][k].picks_out = picks_out
            }
        }
    }

    return original_picks
}

const getLeagues = async (username, season) => {
    const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`)
    let user;
    try {
        user = await axios.get(`https://api.sleeper.app/v1/user/${username}`, config, { timeout: 3000 })
    } catch (error) {
        return (error)
    }
    const leagues = []
    const l = await axios.get(`https://api.sleeper.app/v1/user/${user.data.user_id}/leagues/nfl/${season}`, config, { timeout: 3000 })
    await Promise.all(l.data.map(async (league, index) => {
        let [rosters, users, traded_picks, drafts] = await Promise.all([
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`, config, { timeout: 3000 }),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/users`, config, { timeout: 3000 }),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/traded_picks`, config, { timeout: 3000 }),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/drafts`, config, { timeout: 3000 })
        ])
        let draft_picks = await getDraftPicks(league, rosters.data, users.data, traded_picks.data, drafts.data)
        rosters = rosters.data.map(roster => {
            const prev_wins = roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? null : roster.metadata.record.match(/W/g) === null ? 0 : roster.metadata.record.match(/W/g).length
            const prev_losses = roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? null : roster.metadata.record.match(/L/g) === null ? 0 : roster.metadata.record.match(/L/g).length
            const prev_ties = roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? null : roster.metadata.record.match(/T/g) === null ? 0 : roster.metadata.record.match(/T/g).length
            return {
                ...roster,
                avatar: roster.owner_id === null ? null : users.data.find(x => x.user_id === roster.owner_id).avatar,
                username: roster.owner_id === null ? 'orphan' : users.data.find(x => x.user_id === roster.owner_id).display_name,
                draft_picks: draft_picks[roster.roster_id],
                settings: {
                    ...roster.settings,
                    wins: state.data.week === 0 ? prev_wins : roster.settings.wins,
                    losses: state.data.week === 0 ? prev_losses : roster.settings.losses,
                    ties: state.data.week === 0 ? prev_ties : roster.settings.ties
                }
            }
        })
        let userRoster = rosters.find(x => x.owner_id === user.data.user_id)
        if (userRoster !== undefined) {
            const prev_wins_user = userRoster.metadata === null ? null : userRoster.metadata.record.match(/W/g) === null ? 0 : userRoster.metadata.record.match(/W/g).length
            const prev_losses_user = userRoster.metadata === null ? null : userRoster.metadata.record.match(/L/g) === null ? 0 : userRoster.metadata.record.match(/L/g).length
            const prev_ties_user = userRoster.metadata === null ? null : userRoster.metadata.record.match(/T/g) === null ? 0 : userRoster.metadata.record.match(/T/g).length
            leagues.push({
                avatar: league.avatar,
                bestball: league.settings.best_ball === 1 ? 'BestBall' : 'Standard',
                draft_picks: draft_picks,
                drafts: [],
                dynasty: league.settings.type === 2 ? 'Dynasty' : 'Redraft',
                fpts: Number(userRoster.settings.fpts + "." + userRoster.settings.fpts_decimal),
                fpts_against: Number(userRoster.settings.fpts_against + "." + userRoster.settings.fpts_against_decimal),
                index: index,
                isLeagueHidden: false,
                isRosterHidden: true,
                league_id: league.league_id,
                losses: state.data.week === 0 ? prev_losses_user : userRoster.settings.losses,
                name: league.name,
                reserve: userRoster.reserve === null ? [] : userRoster.reserve,
                reserve_slots: league.settings.reserve_slots,
                rosters: rosters,
                settings: league.settings,
                starters: userRoster.starters === null ? [] : userRoster.starters,
                taxi: userRoster.taxi === null ? [] : userRoster.taxi,
                taxi_slots: league.settings.taxi_slots,
                ties: state.data.week === 0 ? prev_ties_user : userRoster.settings.ties,
                wins: state.data.week === 0 ? prev_wins_user : userRoster.settings.wins,
                userRoster: userRoster
            })
        }

    }))
    return leagues
}

workerpool.worker({
    getLeagues: getLeagues
})