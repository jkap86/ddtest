const workerpool = require('workerpool')
const axios = require('axios')

const getDrafts = async (username, season) => {
    const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`)
    const leagues = await axios.get(`https://api.sleeper.app/v1/user/${user.data.user_id}/leagues/nfl/${season}`)

    const draftsCurrent = await Promise.all(leagues.data.map(async league => {
        const league_drafts = await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/drafts`)
        let drafts = await Promise.all(league_drafts.data.map(async draft => {

            let draft_info = await axios.get(`https://api.sleeper.app/v1/draft/${draft.draft_id}`)
            let picks = await axios.get(`https://api.sleeper.app/v1/draft/${draft.draft_id}/picks`)
            return {
                avatar: league.avatar,
                draft_id: draft.draft_id,
                draft_order: draft_info.data.draft_order,
                isDraftHidden: false,
                isDraftRowHidden: true,
                league_id: league.league_id,
                league_name: league.name,
                picks: picks.data,
                rounds: draft.settings.rounds,
                start_time: draft.start_time,
                status: draft.status,
                type: draft.type
            }
        }))
        let previous_league_id = league.previous_league_id
        while (previous_league_id > 0) {
            const prev_league = await axios.get(`https://api.sleeper.app/v1/league/${previous_league_id}`)
            const prev_league_drafts = await axios.get(`https://api.sleeper.app/v1/league/${previous_league_id}/drafts`)
            await Promise.all(prev_league_drafts.data.map(async prev_draft => {
                let prev_draft_info = await axios.get(`https://api.sleeper.app/v1/draft/${prev_draft.draft_id}`)
                let prev_picks = await axios.get(`https://api.sleeper.app/v1/draft/${prev_draft.draft_id}/picks`)
                drafts.push({
                    avatar: league.avatar,
                    draft_id: prev_draft.draft_id,
                    draft_order: prev_draft_info.data.draft_order,
                    isDraftHidden: false,
                    isDraftRowHidden: true,
                    league_id: league.league_id,
                    league_name: league.name,
                    picks: prev_picks.data,
                    rounds: prev_draft.settings.rounds,
                    start_time: prev_draft.start_time,
                    status: prev_draft.status,
                    type: prev_draft.type
                })
            }))

            previous_league_id = prev_league.data.previous_league_id
        }

        return drafts
    }))

    return draftsCurrent

}


workerpool.worker({
    getDrafts: getDrafts
})