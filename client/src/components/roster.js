import { useState } from "react";
import allplayers from '../allplayers.json'
import emoji from '../emoji.png';

const Roster = (props) => {
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
    const roster_value = props.roster === undefined ? 0 : props.roster.players.reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0)
    const picks_value = picks.flat(2).reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round, (cur.order / cur.total_rosters))), 0)

    return <>
        <br />
        <h3>{props.roster.username}</h3>
        <br />
        {props.hideSummary === true ? null :
            <div>
                <p className='header'>Roster Value: {roster_value.toLocaleString("en-US")} </p>
                <p className='header'>Picks Value: {picks_value.toLocaleString("en-US")}</p>
                <p className="header">Total: {(parseInt(roster_value) + parseInt(picks_value)).toLocaleString("en-US")}</p>
            </div>
        }
        <button onClick={() => setActiveTab('Lineup')} className={activeTab === 'Lineup' ? 'rostertab activetab' : 'rostertab'}>Lineup</button>
        <button onClick={() => setActiveTab('Positions')} className={activeTab === 'Positions' ? 'rostertab activetab' : 'rostertab'}>Positions</button>

        {activeTab === 'Lineup' && props.roster !== undefined ?
            <div className='leagueplayers'>
                <div className='rostercolumn'>
                    <p className='header'>
                        starters
                        <br />
                        {props.roster.starters.reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                    </p>
                    {props.roster.starters.map((player, index) =>
                        <div className="roster_player">
                            {player === '0' ? <img className="thumbnail" alt="empty" src={emoji} /> : <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />}
                            <p className='hover' key={player === '0' ? index : player}>
                                {player === '0' ? <em>empty</em> : allplayers[player].position + " " + allplayers[player].first_name + " " +
                                    allplayers[player].last_name} {player === '0' ? null : allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                    {props.matchPlayer(player)}
                                </em>
                            </p>
                        </div>
                    )}
                </div>
                <div className='rostercolumn'>
                    <p className='header'>
                        Bench
                        <br />
                        {props.roster.players.filter(x => !props.roster.starters.includes(x) && !props.roster.taxi.includes(x) && !props.roster.reserve.includes(x)).reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                    </p>
                    {props.roster.players.filter(x => !props.roster.starters.includes(x) && !props.roster.taxi.includes(x) && !props.roster.reserve.includes(x)).sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map((player, index) =>
                        <div className="roster_player">
                            <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                            <p className='hover' key={player}>{allplayers[player].position + " " + allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                    {props.matchPlayer(player)}
                                </em>
                            </p>
                        </div>
                    )}
                </div>
                {props.roster.settings.reserve_slots > 0 ?
                    <div className='rostercolumn'>
                        <p className='header'>
                            IR
                            <br />
                            {props.roster.reserve.reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.reserve.sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map((player, index) =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].position + " " + allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                        {props.roster.settings.reserve_slots - props.roster.reserve.length === 0 ? null :
                            Array.from(Array(props.roster.settings.reserve_slots - props.roster.reserve.length).keys()).map(empty =>
                                <p key={empty}><em>empty</em></p>
                            )}
                    </div>
                    : null
                }
                {props.roster.settings.taxi_slots > 0 ?
                    <div className='rostercolumn'>
                        <p className='header'>
                            Taxi
                            <br />
                            {props.roster.taxi.reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.taxi.sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map((player, index) =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].position + " " + allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                        {props.roster.settings.taxi_slots - props.roster.taxi.length === 0 ? null :
                            Array.from(Array(props.roster.settings.taxi_slots - props.roster.taxi.length).keys()).map(empty =>
                                <p key={empty}><em>empty</em></p>
                            )}
                    </div>
                    : null
                }
                <div className="rostercolumn">
                    <p className="header">Draft Picks</p>
                    {Object.keys(props.roster.draft_picks.picks).map(season =>
                        <div className="picks_season">
                            {Object.keys(props.roster.draft_picks.picks[season]).map(round =>
                                props.roster.draft_picks.picks[season][round].picks.sort((a, b) => a.order - b.order).map(pick =>
                                    <p className="hover">
                                        {pick.order !== undefined ?
                                            season + ' ' + round + '.' + pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 }) :
                                            season + ' Round ' + round}:&nbsp;
                                        <em className="dv" style={{ filter: `invert(${(props.matchPick(season, round) / 200) + 50}%) brightness(2)` }}>
                                            {props.matchPick(season, round, (pick.order / pick.total_rosters))}
                                        </em>
                                    </p>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
            : activeTab === 'Positions' && props.roster !== undefined ?
                <div className='positionplayers'>
                    <div className='rostercolumn'>
                        <p className='header'>
                            QB
                            <br />
                            {props.roster.players.filter(x => allplayers[x].position === 'QB').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.players.filter(x => allplayers[x].position === 'QB').sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map(player =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                    </div>
                    <div className='rostercolumn'>
                        <p className='header'>
                            RB
                            <br />
                            {props.roster.players.filter(x => allplayers[x].position === 'RB').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.players.filter(x => allplayers[x].position === 'RB' || allplayers[x].position === 'FB').sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map(player =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                    </div>
                    <div className='rostercolumn'>
                        <p className='header'>
                            WR
                            <br />
                            {props.roster.players.filter(x => allplayers[x].position === 'WR').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.players.filter(x => allplayers[x].position === 'WR').sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map(player =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                    </div>
                    <div className='rostercolumn'>
                        <p className='header'>
                            TE
                            <br />
                            {props.roster.players.filter(x => allplayers[x].position === 'TE').reduce((acc, cur) => acc + Number(props.matchPlayer(cur)), 0).toLocaleString("en-US")}
                        </p>
                        {props.roster.players.filter(x => allplayers[x].position === 'TE').sort((a, b) => Number(props.matchPlayer(a)) < Number(props.matchPlayer(b)) ? 1 : -1).map(player =>
                            <div className="roster_player">
                                <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                <p className='hover' key={player}>{allplayers[player].first_name + " " + allplayers[player].last_name}&nbsp;
                                    {allplayers[player].team === null ? 'FA' : allplayers[player].team}:&nbsp;
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player)}
                                    </em>
                                </p>
                            </div>
                        )}
                    </div>

                    {props.roster.players.filter(x => !['QB', 'RB', 'FB', 'WR', 'TE'].includes(allplayers[x].position)).length > 0 ?
                        <div className='unimportantplayers'>
                            <p className='header'>Unimportant</p>
                            {props.roster.players.filter(x => !['QB', 'RB', 'FB', 'WR', 'TE'].includes(allplayers[x].position)).map(player =>
                                <div className="roster_player">
                                    <img className="thumbnail" alt="player" src={`https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`} onError={(e) => { return e.target.src = emoji }} />
                                    <p className='hover' key={player}>{allplayers[player].position + " " + allplayers[player].first_name + " " +
                                        allplayers[player].last_name} {allplayers[player].team === null ? 'FA' : allplayers[player].team}</p>
                                </div>
                            )}
                        </div>
                        : null
                    }
                    <div className="rostercolumn">
                        <p className="header">Draft Picks</p>
                        {Object.keys(props.roster.draft_picks.picks).map(season =>
                            <div className="picks_season">
                                {Object.keys(props.roster.draft_picks.picks[season]).map(round =>
                                    props.roster.draft_picks.picks[season][round].picks.map(pick =>
                                        <p className="hover">
                                            {pick.order !== undefined ?
                                                season + ' ' + round + '.' + pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 }) :
                                                season + ' Round ' + round}:&nbsp;
                                            <em className="dv" style={{ filter: `invert(${(props.matchPick(season, round) / 200) + 50}%) brightness(2)` }}>
                                                {props.matchPick(season, round, (pick.order / pick.total_rosters))}
                                            </em>
                                        </p>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
                : null
        }
    </>
}
export default Roster;