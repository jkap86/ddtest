import { useState } from 'react';
import allPlayers from '../allplayers.json';
import emoji from '../emoji.png';
import Roster from './roster';
import SearchPlayer from './searchPlayer';

const PlayerShares = (props) => {
    const [players, setPlayers] = useState([])
    const [sortBy, setSortBy] = useState('count')
    const [activeTab, setActiveTab] = useState('Owned')
    const [filters, setFilters] = useState({
        'r_d': 'All',
        'b_s': 'All',
        positions: [],
        yearsExp: [0, 25],
        age: [18, 50]
    })

    if (props.players !== players) setPlayers(props.players)

    const showLeagues = (player_id) => {
        let p = players
        p.filter(x => x.id === player_id).map(player => {
            return player.isLeaguesHidden = !player.isLeaguesHidden
        })
        setPlayers([...p])
    }
    const showRoster = (player_id, league_id, owned = true) => {
        let p = players
        if (owned) {
            p.filter(x => x.id === player_id).map(player => {
                return player.leagues.filter(x => x.league_id === league_id).map(league => {
                    return league.isRosterHidden = league.isRosterHidden === undefined ? false : !league.isRosterHidden
                })
            })
        } else {
            p.filter(x => x.id === player_id).map(player => {
                return player.leagues_taken.filter(x => x.league_id === league_id).map(league => {
                    return league.isRosterHidden = league.isRosterHidden === undefined ? false : !league.isRosterHidden
                })
            })
        }

        setPlayers([...p])
    }
    const getSelection = (data) => {
        const key = Object.keys(data)[0]
        let f = { ...filters, [key]: data[key] }
        setFilters(f)

    }

    const getYearsExp = (data) => {
        setFilters({ ...filters, yearsExp: data })
    }

    const getAge = (data) => {
        setFilters({ ...filters, age: data })
    }

    const filterPosition = (e) => {
        let f = filters.positions
        if (e.target.checked) {
            const index = f.indexOf(e.target.name)
            f.splice(index, 1)
        } else {
            f.push(e.target.name)
        }
        setFilters({ ...filters, positions: f })
    }

    const getPlayer = (data) => {
        console.log(data)
        let p = players
        if (data) {
            p.map(player => {
                return player.isPlayerHidden = true
            })
            p.filter(x => x.id === data).map(player => {
                return player.isPlayerHidden = false
            })
        } else {
            p.map(player => {
                return player.isPlayerHidden = false
            })
        }
        setPlayers([...p])

    }
    console.log(players.sort((a, b) => b.count - a.count))
    return <>
        <br />
        <h2>Player Shares</h2>
        <div className="checkboxes">
            <label className="script">
                QB
                <input name="QB" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                RB
                <input name="RB" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                WR
                <input name="WR" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                TE
                <input name="TE" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
        </div>
        <SearchPlayer sendPlayer={getPlayer} />
        <table className="main">
            <tbody>
                <tr>
                    <th className='clickable' onClick={() => setSortBy('count')}>Count</th>
                    <th></th>
                    <th colSpan={3}>Player</th>
                    <th className='clickable' onClick={() => setSortBy('dv')}>Value</th>
                    <th>Age</th>
                    <th>Yrs Exp</th>
                    <th colSpan={2} className="clickable" onClick={() => setSortBy('winpct')}>Record</th>
                    <th colSpan={2}>Fantasy Points</th>
                </tr>
            </tbody>

            {players.filter(x => x.isPlayerHidden === false && !filters.positions.includes(allPlayers[x.id].position)).sort((a, b) => b[sortBy] - a[sortBy]).slice(
                    0, players.filter(x => x.count > 0).length).map(player =>
                        <tbody key={player.id}>
                            <tr name={player.id} onClick={() => showLeagues(player.id)} className={player.isLeaguesHidden === true ? 'hover' : 'hover active'} >
                                <td>{player.count}</td>
                                <td><img className='thumbnail' alt={player.id} src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`} onError={(e) => { return e.target.src = emoji }} /></td>
                                <td colSpan={3}>{allPlayers[player.id].first_name + " " + allPlayers[player.id].last_name}&nbsp;
                                    {allPlayers[player.id].position} {allPlayers[player.id].team === null ? 'FA' : allPlayers[player.id].team}</td>
                                <td>
                                    <em className="dv" style={{ filter: `invert(${(props.matchPlayer(player.id) / 200) + 50}%) brightness(2)` }}>
                                        {props.matchPlayer(player.id)}
                                    </em>
                                </td>
                                <td>{allPlayers[player.id].age}</td>
                                <td>{player.yearsExp}</td>
                                <td colSpan={2} className="nowrap">{player.wins}-{player.losses}{player.ties > 0 ? `-${player.ties}` : null} <em>{player.winpct.toFixed(4)}</em></td>
                                <td colSpan={2}>{Number(player.fpts.toFixed(2)).toLocaleString("en-US")} - {Number(player.fpts_against.toFixed(2)).toLocaleString("en-US")}</td>
                            </tr>

                            {player.isLeaguesHidden === true ? null :
                                <tr className="black">
                                    <td colSpan="12">
                                        <button name='Owned' onClick={() => setActiveTab('Owned')} className={activeTab === 'Owned' ? 'rostertab activetab' : 'rostertab'}>Owned</button>
                                        <button name='Taken' onClick={() => setActiveTab('Taken')} className={activeTab === 'Taken' ? 'rostertab activetab' : 'rostertab'}>Taken</button>
                                        <button name='Available' onClick={() => setActiveTab('Available')} className={activeTab === 'Available' ? 'rostertab activetab' : 'rostertab'}>Available</button>
                                        {activeTab === 'Owned' ?
                                            <table className="black">
                                                <tbody>
                                                    <tr>
                                                        <th></th>
                                                        <th colSpan={5}>League</th>
                                                        <th colSpan={2}>Status</th>
                                                        <th colSpan={2}>Record</th>
                                                        <th colSpan={3}>Points</th>
                                                        <th colSpan={3}>Against</th>
                                                    </tr>
                                                </tbody>
                                                {player.leagues.sort((a, b) => a.index - b.index).map(league =>
                                                    <tbody>
                                                        <tr className={league.isRosterHidden === true ? 'hoverblack' : 'hoverblack active'} key={league.league_id} onClick={() => showRoster(player.id, league.league_id)}>
                                                            <td><img className="thumbnail" alt={league.avatar} src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`} /></td>
                                                            <td colSpan={5}>{league.name}</td>
                                                            <td colSpan={2}>
                                                                {league.starters.includes(player.id) ? 'Starter' :
                                                                    league.taxi.includes(player.id) ? 'Taxi' :
                                                                        league.reserve.includes(player.id) ? 'IR' : 'Bench'
                                                                }
                                                            </td>
                                                            <td colSpan={2}>{league.wins}-{league.losses}{league.ties > 0 ? `-${league.ties}` : null}</td>
                                                            <td colSpan={3}>{league.fpts === null ? 0 : Number(league.fpts.toFixed(2)).toLocaleString("en-US")}</td>
                                                            <td colSpan={3}>{league.fpts === null ? 0 : Number(league.fpts_against.toFixed(2)).toLocaleString("en-US")}</td>
                                                        </tr>
                                                        {league.isRosterHidden === undefined || league.isRosterHidden === true ? null :
                                                            <tr className='roster'>
                                                                <td colSpan={16}>
                                                                    {league.rosters.find(x => x.players.includes(player.id)) === undefined ? null :
                                                                        <Roster
                                                                            roster={{
                                                                                ...league.rosters.find(x => x.players.includes(player.id)),
                                                                                settings: {
                                                                                    taxi_slots: league.settings.taxi_slots,
                                                                                    reserve_slots: league.settings.reserve_slots
                                                                                }
                                                                            }}
                                                                            matchPlayer={props.matchPlayer}
                                                                            matchPick={props.matchPick}
                                                                        />
                                                                    }
                                                                </td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                )}
                                            </table>
                                            : activeTab === 'Taken' ?
                                                <table className='black'>
                                                    <tbody>
                                                        <tr>
                                                            <th colSpan={2}></th>
                                                            <th colSpan={5}>League</th>
                                                            <th colSpan={4}>Owner</th>
                                                            <th colSpan={2}>Status</th>
                                                            <th colSpan={3}>Record</th>
                                                            <th colSpan={3}>Points</th>
                                                            <th colSpan={3}>Against</th>
                                                        </tr>
                                                    </tbody>

                                                    {player.leagues_taken.sort((a, b) => a.index - b.index).map(league =>
                                                        <tbody>
                                                            <tr className={league.isRosterHidden === true ? 'hoverblack' : 'hoverblack active'} key={league.id + league.league_id} onClick={() => showRoster(player.id, league.league_id, false)}>
                                                                <td colSpan={2}><img className='thumbnail' alt={league.avatar} src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`} /></td>
                                                                <td colSpan={5}>{league.name}</td>
                                                                <td colSpan={4}>{league.roster.username}</td>
                                                                <td colSpan={2}>
                                                                    {league.roster.starters.includes(player.id) ? 'Starter' :
                                                                        league.roster.taxi !== null && league.roster.taxi.includes(player.id) ? 'Taxi' :
                                                                            league.roster.reserve !== null && league.roster.reserve.includes(player.id) ? 'IR' : 'Bench'
                                                                    }
                                                                </td>
                                                                <td colSpan={3}>{league.wins}-{league.losses}{league.ties > 0 ?`-${league.ties}` : null}</td>
                                                                <td colSpan={3}>{league.fpts === null ? 0 : Number(league.fpts.toFixed(2)).toLocaleString("en-US")}</td>
                                                                <td colSpan={3}>{league.fpts_against === null ? 0 : Number(league.fpts_against.toFixed(2)).toLocaleString("en-US")}</td>
                                                            </tr>
                                                            {league.isRosterHidden === undefined || league.isRosterHidden === true ? null :
                                                                <tr className='roster'>
                                                                    <td colSpan={11}>
                                                                        {league.rosters.find(x => x.players.includes(player.id)) === undefined ? null :
                                                                            <Roster
                                                                                roster={{
                                                                                    ...league.rosters.find(x => x.players.includes(player.id)),
                                                                                    settings: {
                                                                                        taxi_slots: league.settings.taxi_slots,
                                                                                        reserve_slots: league.settings.reserve_slots
                                                                                    }
                                                                                }}
                                                                                matchPlayer={props.matchPlayer}
                                                                                matchPick={props.matchPick}
                                                                            />
                                                                        }
                                                                    </td>
                                                                    <td colSpan={11}>

                                                                        <Roster
                                                                            roster={{
                                                                                ...league.userRoster,
                                                                                settings: {
                                                                                    taxi_slots: league.settings.taxi_slots,
                                                                                    reserve_slots: league.settings.reserve_slots
                                                                                }
                                                                            }}
                                                                            matchPlayer={props.matchPlayer}
                                                                            matchPick={props.matchPick}
                                                                        />

                                                                    </td>
                                                                </tr>
                                                            }
                                                        </tbody>
                                                    )}


                                                </table>
                                                :
                                                <table className='black'>
                                                    <tbody>
                                                        <tr>
                                                            <th colSpan={1}></th>
                                                            <th colSpan={15}>League</th>
                                                        </tr>
                                                    </tbody>
                                                    <tbody>
                                                        {player.leagues_available.sort((a, b) => a.index - b.index).map(league =>
                                                            <tr className='hoverblack' key={league.league_id}>
                                                                <td colSpan={1}><img className='thumbnail' alt={league.avatar} src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`} /></td>
                                                                <td colSpan={15}>{league.name}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>

                                        }
                                    </td>
                                </tr>
                            }

                        </tbody>
                    )}

        </table>
    </>
}

export default PlayerShares

