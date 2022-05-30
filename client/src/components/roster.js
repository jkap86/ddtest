import { useState } from "react";
import emoji from '../emoji.png';

const Roster = (props) => {
    const [allPlayers, setAllPlayers] = useState(props.allPlayers)
    const [activeTab, setActiveTab] = useState('Lineup')
    props.roster.taxi = props.roster.taxi === null ? [] : props.roster.taxi
    props.roster.reserve = props.roster.reserve === null ? [] : props.roster.reserve
    const picks = Object.keys(props.roster.draft_picks.picks).map(season =>
        Object.keys(props.roster.draft_picks.picks[season]).map(round =>
            props.roster.draft_picks.picks[season][round].picks.map(pick => {
                return {
                    season: season,
                    round: round,
                    order: pick.order,
                    total_rosters: pick.total_rosters
                }
            })
        )
    )
    const roster_value = props.roster === undefined ? 0 : props.roster.players.reduce((acc, cur) => acc + parseInt(props.getValue(cur)), 0)
    const picks_value = picks.flat(2).reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round, (cur.order / cur.total_rosters))), 0)

    return <>
        <h4 className="roster">{props.roster.username}</h4>
        {props.hideSummary === true ? null :
            <div>
                <p className='header'>Roster Value: {roster_value.toLocaleString("en-US")} </p>
                <p className='header'>Picks Value: {picks_value.toLocaleString("en-US")}</p>
                <p className="header">Total: {(parseInt(roster_value) + parseInt(picks_value)).toLocaleString("en-US")}</p>
            </div>
        }
        <button onClick={() => setActiveTab('Lineup')} className={activeTab === 'Lineup' ? 'rostertab active clickable' : 'rostertab clickable'}>Lineup</button>
        <button onClick={() => setActiveTab('Positions')} className={activeTab === 'Positions' ? 'rostertab active clickable' : 'rostertab clickable'}>Positions</button>
        {activeTab === 'Lineup' && props.roster !== undefined ?
            <div>
                <table className="rostercolumn">
                    <tbody>
                        <tr>
                            <th>Value</th>
                            <th>Starter</th>
                            <th>Proj</th>
                        </tr>
                        {props.roster.starters.map((player, index) =>
                            <tr key={index} className="roster_player">
                                <td className="black">
                                    <em style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.getValue(player)}
                                    </em>
                                </td>
                                <td>
                                    <div className="roster_player">
                                        {player === '0' ? <img className="thumbnail" alt="empty" src={emoji} /> : <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />}
                                        <p>
                                            {player === '0' ? <em>empty</em> : allPlayers[player].position + " " + allPlayers[player].first_name + " " +
                                                allPlayers[player].last_name} {player === '0' ? null : allPlayers[player].team === null ? 'FA' : allPlayers[player].team}
                                        </p>
                                    </div>
                                </td>
                                <td className="black">
                                    <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                        {props.getProjection(player).toFixed(2)}
                                    </em>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <table className="rostercolumn">
                    <tbody>
                        <tr>
                            <th>Value</th>
                            <th>Bench</th>
                            <th>Proj</th>
                        </tr>
                        {props.roster.players.filter(x => !props.roster.starters.includes(x) &&
                            !props.roster.taxi.includes(x) && !props.roster.reserve.includes(x)).sort((a, b) =>
                                parseInt(props.getValue(a)) < parseInt(props.getValue(b)) ? 1 : -1).map((player, index) =>
                                    <tr key={index} className="roster_player">
                                        <td className="black">
                                            <em style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                                {props.getValue(player)}
                                            </em>
                                        </td>
                                        <td>
                                            <div className="roster_player">
                                                <img
                                                    className="thumbnail"
                                                    alt="headshot"
                                                    src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`}
                                                    onError={(e) => { return e.target.src = emoji }}
                                                />
                                                <p>
                                                    {allPlayers[player].position + " " + allPlayers[player].first_name + " " +
                                                        allPlayers[player].last_name}&nbsp;{allPlayers[player].team === null ? 'FA' : allPlayers[player].team}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="black">
                                            <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                                {props.getProjection(player).toFixed(2)}
                                            </em>
                                        </td>
                                    </tr>
                                )}
                    </tbody>
                </table>
                {props.roster.settings.reserve_slots > 0 ?
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>IR</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.reserve.sort((a, b) => parseInt(props.getValue(b) - parseInt(props.getValue(a)))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="headshot" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>

                                </tr>
                            )}
                            {props.roster.settings.reserve_slots - props.roster.reserve.length === 0 ? null :
                                Array.from(Array(props.roster.settings.reserve_slots - props.roster.reserve.length).keys()).map((empty, index) =>
                                    <tr key={index}>
                                        <tr>
                                            <td colSpan={3}><p><em>empty</em></p></td>
                                        </tr>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                    : null
                }
                {props.roster.settings.taxi_slots > 0 ?
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>Taxi</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.taxi.sort((a, b) => parseInt(props.getValue(b)) - parseInt(props.getValue(a))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em className="dv" style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    : null
                }
                <table className="rostercolumn">
                    <tbody>
                        <tr>
                            <th>Draft Picks</th>
                        </tr>
                        <tr>
                            {Object.keys(props.roster.draft_picks.picks).map(season =>
                                <div className="picks_season">
                                    {Object.keys(props.roster.draft_picks.picks[season]).map(round =>
                                        props.roster.draft_picks.picks[season][round].picks.sort((a, b) => a.order - b.order).map(pick =>
                                            <p className="draft_pick">
                                                {pick.order !== undefined ?
                                                    season + ' ' + round + '.' + pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })
                                                    :
                                                    season + ' Round ' + round
                                                }&nbsp;
                                                <span className="black">
                                                    <em style={{ filter: `invert(${(props.matchPick(season, round) / 200) + 50}%) brightness(2)` }}>
                                                        {props.matchPick(season, round, (pick.order / pick.total_rosters))}
                                                    </em>
                                                </span>
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
            : activeTab === 'Positions' && props.roster !== undefined ?
                <div>
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>QB</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.players.filter(x => allPlayers[x].position === 'QB').sort((a, b) => parseInt(props.getValue(b)) - parseInt(props.getValue(a))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em className="dv" style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>RB</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.players.filter(x => allPlayers[x].position === 'RB').sort((a, b) => parseInt(props.getValue(b)) - parseInt(props.getValue(a))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em className="dv" style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>WR</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.players.filter(x => allPlayers[x].position === 'WR').sort((a, b) => parseInt(props.getValue(b)) - parseInt(props.getValue(a))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em className="dv" style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <table className="rostercolumn">
                        <tbody>
                            <tr>
                                <th>Value</th>
                                <th>TE</th>
                                <th>Proj</th>
                            </tr>
                            {props.roster.players.filter(x => allPlayers[x].position === 'TE').sort((a, b) => parseInt(props.getValue(b)) - parseInt(props.getValue(a))).map((player, index) =>
                                <tr key={index} className="roster_player">
                                    <td className="black">
                                        <em className="dv" style={{ filter: `invert(${(props.getValue(player) / 200) + 50}%) brightness(2)` }}>
                                            {props.getValue(player)}
                                        </em>
                                    </td>
                                    <td>
                                        <div className="roster_player">
                                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                            <p>
                                                {allPlayers[player].position + " " + allPlayers[player].first_name + " " + allPlayers[player].last_name}&nbsp;
                                                {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}:&nbsp;
                                            </p>
                                        </div>
                                    </td>
                                    <td className="black">
                                        <em style={{ filter: `invert(${(props.getProjection(player) * 2) + 50}%) brightness(2)` }}>
                                            {props.getProjection(player).toFixed(2)}
                                        </em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                : null
        }
    </>
}
export default Roster;
