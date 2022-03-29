import { useState } from "react";
import Roster from "./roster";
import allPlayers from '../allplayers.json';
import emoji from '../emoji.png';

const League = (props) => {
    const [activeTab, setActiveTab] = useState('Rosters')
    const [league, setLeague] = useState()
    if (props.league !== league) setLeague(props.league)

    const showRoster = (roster_id) => {
        let l = league
        l.rosters.filter(x => x.roster_id === roster_id).map(roster => {
            return roster.isRosterHidden = roster.isRosterHidden === undefined ? false : !roster.isRosterHidden
        })
        setLeague({ ...l })
    }
    const showDraftPicks = (draft_id) => {
        let l = league
        l.drafts.filter(x => x.draft_id === draft_id).map(draft => {
            return draft.isPicksHidden = draft.isPicksHidden === undefined ? false : !draft.isPicksHidden
        })
        setLeague({ ...l })
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
                const qb_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0)
                const rb_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0)
                const wr_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0)
                const te_value = roster.players === null ? 0 : roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0)
                return {
                    ...roster,
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
            <button onClick={() => setActiveTab('Rosters')} className={activeTab === 'Rosters' ? 'leaguetab active' : 'leaguetab'}>Rosters</button>
            <button onClick={() => setActiveTab('Drafts')} className={activeTab === 'Drafts' ? 'leaguetab active' : 'leaguetab'}>Drafts</button>
            {activeTab === 'Rosters' ?
                <table className="black smaller">
                    <tbody>
                        <tr>
                            <th></th>
                            <th colSpan={3}>Username</th>
                            <th colSpan={2}>Record</th>
                            <th colSpan={3}>Total Value</th>
                            <th colSpan={3}>Roster</th>
                            <th colSpan={3}>Picks</th>
                            <th colSpan={3}>Breakdown</th>
                        </tr>
                        {league_display.rosters.sort((a, b) => b.total_value - a.total_value).map(roster =>
                            <>
                                <tr key={roster.roster_id} onClick={() => showRoster(roster.roster_id)} className={roster.isRosterHidden === false ? 'hoverblack active' : 'hoverblack'}>
                                    <td><img className="thumbnail" alt={roster.username} src={roster.avatar === null ? emoji : `https://sleepercdn.com/avatars/${roster.avatar}`} /></td>
                                    <td colSpan={3} className="break">{roster.username}</td>
                                    <td colSpan={2}>{roster.settings.wins}-{roster.settings.losses}</td>
                                    <td colSpan={3}>
                                        {roster.total_value.toLocaleString("en-US")}
                                    </td>
                                    <td colSpan={3}>
                                        {roster.roster_value.toLocaleString("en-US")}
                                    </td>
                                    <td colSpan={3}>
                                        {roster.picks_value.toLocaleString("en-US")}
                                    </td>
                                    <td colSpan={3}>
                                        <p>QB: {roster.qb_value.toLocaleString("en-US")}</p>
                                        <p>RB: {roster.rb_value.toLocaleString("en-US")}</p>
                                        <p>WR: {roster.wr_value.toLocaleString("en-US")}</p>
                                        <p>TE: {roster.te_value.toLocaleString("en-US")}</p>
                                    </td>
                                </tr>
                                {roster.isRosterHidden === false && roster.players !== null ?
                                    <tr className="roster">
                                        <td colSpan={18}>
                                            <Roster
                                                roster={{
                                                    ...roster,
                                                    settings: {
                                                        taxi_slots: league_display.settings.taxi_slots,
                                                        reserve_slots: league_display.settings.reserve_slots
                                                    }
                                                }}
                                                matchPlayer={props.matchPlayer}
                                                matchPick={props.matchPick}
                                                hideSummary={true}
                                            />
                                        </td>
                                    </tr>
                                    : null
                                }
                            </>
                        )}
                    </tbody>
                </table>
                :
                <table className="black smaller">
                    <tbody>
                        <tr>
                            <th>Start</th>
                            <th>Status</th>
                            <th>Rounds</th>
                            <th>Type</th>
                        </tr>
                    </tbody>
                    {league_display.drafts.map(draft =>
                        <tbody>
                            <tr onClick={() => showDraftPicks(draft.draft_id)} className={draft.isPicksHidden === false ? 'hoverblack active' : 'hoverblack'}>
                                <td>{new Date(draft.start_time).toLocaleDateString("en-US")}</td>
                                <td>{draft.status.replace('_', '')}</td>
                                <td>{draft.rounds}</td>
                                <td>{draft.type}</td>
                            </tr>
                            {draft.isPicksHidden === false ?
                                <tr className="roster">
                                    <td colSpan={4}>
                                        <div className="picks">
                                            {Array.from(Array(draft.rounds).keys()).map(n => n + 1).map((round) =>
                                                <div className="roundrow" key={round + " " + draft.draft_id}>
                                                    <table className="round">
                                                        <tbody>
                                                            {draft.picks.filter(x => x.round === round).length > 0 ?
                                                                <tr>
                                                                    <th>R</th>
                                                                    <th>P</th>
                                                                    <th>Player</th>
                                                                    <th>Value</th>
                                                                </tr>
                                                                :
                                                                null
                                                            }
                                                            {draft.picks.filter(x => x.round === round).map(pick =>
                                                                <tr key={draft.draft_id + " " + pick.player_id}
                                                                    className={pick.picked_by === props.user.user_id ? 'active2' : null}>
                                                                    <td>{pick.round}</td>
                                                                    <td>{pick.pick_no}</td>
                                                                    <td className="nowrap">
                                                                        {allPlayers[pick.player_id].first_name}&nbsp;
                                                                        {allPlayers[pick.player_id].last_name}&nbsp;
                                                                        {allPlayers[pick.player_id].position}&nbsp;
                                                                    </td>
                                                                    <td>
                                                                        <em className="dv" style={{ filter: `invert(${(props.matchPlayer(pick.player_id) / 200) + 50}%) brightness(2)` }}>
                                                                            {props.matchPlayer(pick.player_id)}
                                                                        </em>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                : null
                            }
                        </tbody>
                    )}
                </table>
            }
        </>
}
export default League;