import React, { useState } from "react";
import emoji from '../emoji.png';
import Roster from "./roster";
import { motion } from "framer-motion";

const League = (props) => {
    const [sortBy, setSortBy] = useState('starters_proj')
    const [allPlayers, setAllPlayers] = useState(props.allPlayers)
    const [league, setLeague] = useState()
    if (props.league !== league) setLeague(props.league)

    const showRoster = (roster_id) => {
        let l = league
        l.rosters.filter(x => x.roster_id === roster_id).map(roster => {
            return roster.isRosterHidden = roster.isRosterHidden === undefined ? false : !roster.isRosterHidden
        })
        setLeague({...l})
    }

    let league_display = league === undefined ? undefined :
        {
            ...league,
            rosters: league.rosters.map(roster => {
                const picks = Object.keys(roster.draft_picks.picks).map(season =>
                    Object.keys(roster.draft_picks.picks[season]).map(round =>
                        roster.draft_picks.picks[season][round].picks.map(pick => {
                            return {
                                season: season,
                                round: round,
                                roster_id: pick
                            }
                        })
                    )
                )
                const picks_value = picks.flat(2).reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0)
                const qb_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(props.getValue(cur)), 0)
                const rb_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(props.getValue(cur)), 0)
                const wr_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(props.getValue(cur)), 0)
                const te_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(props.getValue(cur)), 0)
                const starters_proj = roster.players === null ? 0 : roster.starters.reduce((acc, cur) => acc + parseFloat(props.getProjection(cur)), 0).toFixed(2)
                return {
                    ...roster,
                    starters_proj: starters_proj,
                    qb_value: qb_value,
                    rb_value: rb_value,
                    wr_value: wr_value,
                    te_value: te_value,
                    picks_value: picks_value,
                    roster_value: qb_value + rb_value + wr_value + te_value,
                    total_value: qb_value + rb_value + wr_value + te_value + picks_value
                }
            })
        }

    return league_display === undefined ? <h1>Loading...</h1> :
        <>
            <table className="secondary">
                <tbody>
                    <tr>
                        <th colSpan={4}>Username</th>
                        <th colSpan={2}>Record</th>
                        <th colSpan={2} className="clickable" onClick={() => setSortBy('starters_proj')}>Projection</th>
                        <th colSpan={3} className="clickable" onClick={() => setSortBy('total_value')}>Total Value</th>
                        <th colSpan={3} className="clickable" onClick={() => setSortBy('roster_value')}>Roster</th>
                        <th colSpan={3} className="clickable" onClick={() => setSortBy('picks_value')}>Picks</th>
                        <th colSpan={3}>Breakdown</th>
                    </tr>
                    {league_display.rosters.sort((a, b) => b[sortBy] - a[sortBy]).map((roster, index) =>
                        <React.Fragment key={index}>
                            <tr onClick={() => showRoster(roster.roster_id)} className={roster.isRosterHidden === undefined || roster.isRosterHidden === true ? "hover_black clickable" : "hover_black clickable active"}>
                                <td>
                                    <motion.img
                                        animate={{ rotate: 360 }}
                                        transition={{ 
                                            repeat: Infinity,
                                            duration: Math.random() * 10 + 3
                                        }}
                                        className="thumbnail"
                                        src={roster.avatar === null ? emoji : `https://sleepercdn.com/avatars/${roster.avatar}`}
                                    />
                                </td>
                                <td colSpan={3}>{roster.username}</td>
                                <td colSpan={2}>{roster.settings.wins}-{roster.settings.losses}</td>
                                <td colSpan={2}>{parseFloat(roster.starters_proj).toLocaleString("en-US")}</td>
                                <td colSpan={3}>{roster.total_value.toLocaleString("en-US")}</td>
                                <td colSpan={3}>{roster.roster_value.toLocaleString("en-US")}</td>
                                <td colSpan={3}>{roster.picks_value.toLocaleString("en-US")}</td>
                                <td colSpan={3}>
                                    <p>QB: {roster.qb_value.toLocaleString("en-US")}</p>
                                    <p>RB: {roster.rb_value.toLocaleString("en-US")}</p>
                                    <p>WR: {roster.wr_value.toLocaleString("en-US")}</p>
                                    <p>TE: {roster.te_value.toLocaleString("en-US")}</p>
                                </td>
                            </tr>
                            {roster.isRosterHidden === false && roster.players !== null ?
                                <tr className="tertiary">
                                    <td colSpan={20}>
                                        <Roster 
                                            allPlayers={props.allPlayers}
                                            getProjection={props.getProjection}
                                            getValue={props.getValue}
                                            hideSummary={true}
                                            matchPick={props.matchPick}
                                            roster={{
                                                ...roster,
                                                settings: {
                                                    taxi_slots: league_display.settings.taxi_slots,
                                                    reserve_slots: league_display.settings.reserve_slots
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                                : null
                            }
                        </React.Fragment>
                    )}
                </tbody>
            </table>
        </>
}
export default League;