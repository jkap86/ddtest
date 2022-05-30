import React, { useState, useMemo } from "react";
import emoji from '../emoji.png';
import Roster from "./roster";
import { motion } from 'framer-motion';

const PlayerShares = (props) => {
    const [allPlayers, setAllPlayers] = useState(props.allPlayers)
    const [players, setPlayers] = useState([])
    const [sortBy, setSortBy] = useState('count')
    const [activeTab, setActiveTab] = useState('Owned')
    const [filters, setFilters] = useState({
        'r_d': 'All',
        'b_s': 'All',
        positions: [],
        types: []
    })



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
    const findOccurences = (players) => {
        const playersOccurences = []
        players.forEach(p => {
            const index = playersOccurences.findIndex(obj => {
                return obj.id === p.id
            })
            if (index === -1) {
                playersOccurences.push({
                    id: p.id,
                    dv: props.getValue(p.id),
                    projection: props.getProjection(p.id).toFixed(2),
                    count: 1,
                    yearsExp: allPlayers[p.id].years_exp,
                    leagues: [p.league],
                    wins: p.wins,
                    losses: p.losses,
                    ties: p.ties,
                    winpct: p.wins + p.losses > 0 ? p.wins / (p.wins + p.losses) : 0,
                    fpts: p.fpts === null ? 0 : p.fpts,
                    fpts_against: p.fpts_against === null ? 0 : p.fpts_against,
                    sortName: allPlayers[p.id].last_name + " " + allPlayers[p.id].first_name + " " + allPlayers[p.id].position + " " + allPlayers[p.id].team,
                    isLeaguesHidden: true,
                    isPlayerHidden: false

                })
            } else {
                playersOccurences[index].count++
                playersOccurences[index].leagues.push(p.league)
                playersOccurences[index].wins = playersOccurences[index].wins + p.wins
                playersOccurences[index].losses = playersOccurences[index].losses + p.losses
                playersOccurences[index].ties = playersOccurences[index].ties + p.ties
                playersOccurences[index].winpct = (playersOccurences[index].wins + playersOccurences[index].losses + p.wins + p.losses) > 0 ?
                    (playersOccurences[index].wins + p.wins) / (playersOccurences[index].wins + playersOccurences[index].losses + p.wins + p.losses) : 0
                playersOccurences[index].fpts = playersOccurences[index].fpts + p.fpts
                playersOccurences[index].fpts_against = playersOccurences[index].fpts_against + p.fpts_against

            }
        })
        return playersOccurences
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
    const filterYearsExp = (e) => {
        let f = filters.types
        if (e.target.checked) {
            const index = f.indexOf(e.target.name)
            f.splice(index, 1)
        } else {
            f.push(e.target.name)
        }
        setFilters({ ...filters, types: f })
    }

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
            return league.rosters.filter(x => x.players !== null && x.owner_id !== props.user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: {
                            ...league,
                            roster: roster
                        },
                        rosters: league.rosters,
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


        players = players.map(player => {
            let leagues_unowned = playersAll.filter(x => x.id === player.id).map(league_uo => {
                return league_uo.league
            })
            return {
                ...player,
                leagues: player.leagues,
                leagues_taken: leagues_unowned,
                leagues_available: leagues.filter(x =>
                    player.leagues.find(y => y.league_id === x.league_id) === undefined &&
                    leagues_unowned.find(y => y.league_id === x.league_id) === undefined)
            }
        })
        playersAll = findOccurences(playersAll)
        playersAll = playersAll.map(playerAll => {
            return {
                ...playerAll,
                count: 0,
                leagues: [],
                leagues_taken: playerAll.leagues,
                leagues_available: leagues.filter(x =>
                    playerAll.leagues.find(y => y.league_id === x.league_id) === undefined)

            }
        })
        const x = Object.keys(allPlayers).filter(x => allPlayers[x].status === 'Active' && x === x.trim()).map(allPlayer => {
            return {
                id: allPlayer,
                count: 0,
                leagues: [],
                leagues_taken: [],
                leagues_available: leagues,
                fpts: 0,
                fpts_against: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                winpct: 0,
                isPlayerHidden: false,
                isLeaguesHidden: true
            }
        })
        return [
            ...players,
            ...playersAll.filter(x => players.find(y => y.id === x.id) === undefined),
            ...x.filter(x => players.find(y => x.id === y.id) === undefined && playersAll.find(y => x.id === y.id) === undefined)
        ]

    }
    const p = useMemo(() => getPlayers(props.leagues), [props.leagues, filters])
    if (players !== p) {
        setPlayers(p)

    }



    return <>
        <h2>Player Shares</h2>
        <div className="checkboxes">
            <label className="script">
                QB
                <input className="clickable" name="QB" onClick={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                RB
                <input className="clickable" name="RB" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                WR
                <input className="clickable" name="WR" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <label className="script">
                TE
                <input className="clickable" name="TE" onChange={filterPosition} defaultChecked type="checkbox" />
            </label>
            <br />
            <label className='script'>
                Vets
                <input className="clickable" name='V' onChange={(e) => filterYearsExp(e, 'Vets')} defaultChecked type="checkbox" />
            </label>
            <label className='script'>
                Rookies
                <input className="clickable" name='R' onChange={(e) => filterYearsExp(e, 'Rookies')} defaultChecked type="checkbox" />
            </label>
        </div>
        <table className="main">
            <tbody>
                <tr>
                    <th className="clickable" onClick={() => setSortBy('count')}>Count</th>
                    <th colSpan={4}>Player</th>
                    <th className="clickable" onClick={() => setSortBy('dv')}>Value</th>
                    <th>Age</th>
                    <th>Yrs Exp</th>
                    <th colSpan={2} className="clickable" onClick={() => setSortBy('winpct')}>Record</th>
                    <th colSpan={2}>Fantasy Points</th>
                    <th colSpan={2} className="clickable" onClick={() => setSortBy('projection')}>Projection</th>
                </tr>

                {players.filter(x => !filters.types.includes(allPlayers[x.id].type) && !filters.positions.includes(allPlayers[x.id].position)).sort((a, b) => b[sortBy] - a[sortBy]).slice(0, players.filter(x => x.count > 0).length).map((player, index) =>
                    <React.Fragment key={index}>
                        <tr className={player.isLeaguesHidden ? 'hover clickable' : 'hover clickable active'} onClick={() => showLeagues(player.id)}>
                            <td >{player.count}</td>
                            <td>
                                <motion.img
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: Math.random() * 10 + 2 }}
                                    className='thumbnail'
                                    alt={player.id}
                                    src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                                    onError={(e) => { return e.target.src = emoji }} />
                            </td>
                            <td colSpan={3}>{allPlayers[player.id].first_name + " " + allPlayers[player.id].last_name}</td>
                            <td>
                                <em style={{ filter: `invert(${(props.getValue(player.id) / 200) + 50}%) brightness(2)` }}>
                                    {props.getValue(player.id)}
                                </em>
                            </td>
                            <td>{allPlayers[player.id].age}</td>
                            <td>{player.yearsExp}</td>
                            <td colSpan={2}>{player.wins}-{player.losses}{player.ties > 0 ? `-${player.ties}` : null} <em>{player.winpct.toFixed(4)}</em></td>
                            <td colSpan={2}>{player.fpts}</td>
                            <td colSpan={2}>{player.projection}</td>
                        </tr>
                        {player.isLeaguesHidden === true ? null :
                            <tr className="black">
                                <td colSpan={14}>
                                    <button className={activeTab === 'Owned' ? "player_leagues active clickable" : "player_leagues clickable"} onClick={() => setActiveTab('Owned')}>Owned</button>
                                    <button className={activeTab === 'Taken' ? "player_leagues active clickable" : "player_leagues clickable"} onClick={() => setActiveTab('Taken')}>Taken</button>
                                    <button className={activeTab === 'Available' ? "player_leagues active clickable" : "player_leagues clickable"} onClick={() => setActiveTab('Available')}>Available</button>
                                    {activeTab === 'Owned' ?
                                        <table className="secondary">
                                            <tbody>
                                                <tr>
                                                    <th colSpan={6}>League</th>
                                                    <th colSpan={2}>Status</th>
                                                    <th colSpan={2}>Record</th>
                                                    <th colSpan={3}>Points</th>
                                                    <th colSpan={3}>Against</th>
                                                </tr>

                                                {player.leagues.sort((a, b) => a.index - b.index).map((league, index) =>
                                                    <React.Fragment key={index}>
                                                        <tr onClick={() => showRoster(player.id, league.league_id)} className={league.isRosterHidden === true ? 'hover_black clickable' : 'hover_black clickable active'}>
                                                            <td>
                                                                <motion.img
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{
                                                                        repeat: Infinity,
                                                                        duration: Math.random() * 10 + 2

                                                                    }}
                                                                    className="thumbnail"
                                                                    src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`}
                                                                />
                                                            </td>
                                                            <td className="left" colSpan={5}>{league.name}</td>
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
                                                            <tr className='tertiary'>
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
                                                                            getValue={props.getValue}
                                                                            matchPick={props.matchPick}
                                                                            getProjection={props.getProjection}
                                                                            allPlayers={props.allPlayers}
                                                                        />
                                                                    }
                                                                </td>
                                                            </tr>
                                                        }
                                                    </React.Fragment>
                                                )}
                                            </tbody>
                                        </table>
                                        :
                                        activeTab === 'Taken' ?
                                            <table className="secondary >">
                                                <tbody>
                                                    <tr>
                                                        <th colSpan={7}>League</th>
                                                        <th colSpan={4}>Owner</th>
                                                        <th colSpan={2}>Status</th>
                                                        <th colSpan={3}>Record</th>
                                                        <th colSpan={3}>Points</th>
                                                        <th colSpan={3}>Against</th>
                                                    </tr>
                                                    {player.leagues_taken.sort((a, b) => a.index - b.index).map((league, index) =>
                                                        <React.Fragment key={index}>
                                                            <tr className={league.isRosterHidden === true ? 'hover_black clickable' : 'hover_black active clickable'} onClick={() => showRoster(player.id, league.league_id, false)} >
                                                                <td colSpan={2}>
                                                                    <motion.img
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{
                                                                            repeat: Infinity,
                                                                            duration: Math.random() * 10 + 2
                                                                        }}
                                                                        alt='avatar'
                                                                        className='thumbnail'
                                                                        src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`}
                                                                    />
                                                                </td>
                                                                <td colSpan={5}>{league.name}</td>
                                                                <td colSpan={4}>{league.roster.username}</td>
                                                                <td colSpan={2}>
                                                                    {league.roster.starters.includes(player.id) ? 'Starter' :
                                                                        league.roster.taxi !== null && league.roster.taxi.includes(player.id) ? 'Taxi' :
                                                                            league.roster.reserve !== null && league.roster.reserve.includes(player.id) ? 'IR' : 'Bench'
                                                                    }
                                                                </td>
                                                                <td colSpan={3}>{league.wins}-{league.losses}{league.ties > 0 ? `-${league.ties}` : null}</td>
                                                                <td colSpan={3}>{league.fpts === null ? 0 : Number(league.fpts.toFixed(2)).toLocaleString("en-US")}</td>
                                                                <td colSpan={3}>{league.fpts_against === null ? 0 : Number(league.fpts_against.toFixed(2)).toLocaleString("en-US")}</td>
                                                            </tr>
                                                            {league.isRosterHidden === undefined || league.isRosterHidden === true ? null :
                                                                <tr className="tertiary">
                                                                    <td colSpan={11}>
                                                                        <Roster
                                                                            roster={{
                                                                                ...league.rosters.find(x => x.players.includes(player.id)),
                                                                                settings: {
                                                                                    taxi_slots: league.settings.taxi_slots,
                                                                                    reserve_slots: league.settings.reserve_slots
                                                                                }
                                                                            }}
                                                                            getValue={props.getValue}
                                                                            matchPick={props.matchPick}
                                                                            getProjection={props.getProjection}
                                                                            allPlayers={props.allPlayers}
                                                                        />
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
                                                                            getValue={props.getValue}
                                                                            matchPick={props.matchPick}
                                                                            getProjection={props.getProjection}
                                                                            allPlayers={props.allPlayers}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            }
                                                        </React.Fragment>
                                                    )}
                                                </tbody>
                                            </table>
                                            :
                                            <table className="secondary">
                                                <tbody>
                                                    <tr>
                                                        <th colSpan={16}>League</th>
                                                    </tr>
                                                    {player.leagues_available.sort((a, b) => a.index - b.index).map((league, index) =>
                                                        <tr key={index}>
                                                            <td colSpan={1}><img className='thumbnail' alt={league.avatar} src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`} /></td>
                                                            <td colSpan={15} className="left">{league.name}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                    }
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default PlayerShares;