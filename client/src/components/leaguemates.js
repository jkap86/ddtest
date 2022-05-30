import React, { useState, useMemo } from "react";
import emoji from '../emoji.png';
import { motion } from "framer-motion";
import Roster from "./roster";
import SearchLeaguemate from './searchLeaguemate';

const Leaguemates = (props) => {
    const [lm, setLm] = useState([])

    const findOccurencesLeaguemates = (leaguemates) => {
        const lmOcurrences = []
        leaguemates.forEach(lm => {
            const index = lmOcurrences.findIndex(obj => {
                return obj.id === lm.owner_id
            })
            if (index === -1) {
                lmOcurrences.push({
                    id: lm.owner_id,
                    username: lm.username,
                    isLeaguemateHidden: false,
                    count: 1,
                    avatar: lm.avatar,
                    isLeaguesHidden: true,
                    leagues: [{
                        league_id: lm.league_id,
                        name: lm.league_name,
                        userWins: lm.userWins,
                        userLosses: lm.userLosses,
                        userTies: lm.userTies,
                        avatar: lm.league_avatar,
                        wins: lm.settings.wins,
                        losses: lm.settings.losses,
                        ties: lm.settings.ties,
                        isRostersHidden: true,
                        lmRoster: lm,
                        userRoster: lm.userRoster,
                        isRostersHidden: true
                    }],
                    userWins: lm.userWins,
                    userLosses: lm.userLosses,
                    userTies: lm.userTies,
                    wins: lm.settings.wins,
                    losses: lm.settings.losses,
                    ties: lm.settings.ties,
                })
            } else {
                lmOcurrences[index].leagues.push({
                    league_id: lm.league_id,
                    name: lm.league_name,
                    userWins: lm.userWins,
                    userLosses: lm.userLosses,
                    userTies: lm.userTies,
                    avatar: lm.league_avatar,
                    wins: lm.settings.wins,
                    losses: lm.settings.losses,
                    ties: lm.settings.ties,
                    userRoster: lm.userRoster,
                    lmRoster: lm,
                    isRostersHidden: true
                })
                lmOcurrences[index].count++
                lmOcurrences[index].userWins = lmOcurrences[index].userWins + lm.userWins
                lmOcurrences[index].userLosses = lmOcurrences[index].userLosses + lm.userLosses
                lmOcurrences[index].userTies = lmOcurrences[index].userTies + lm.userTies
                lmOcurrences[index].wins = lmOcurrences[index].wins + lm.settings.wins
                lmOcurrences[index].losses = lmOcurrences[index].losses + lm.settings.losses
                lmOcurrences[index].ties = lmOcurrences[index].ties + lm.settings.ties
            }
        })
        return lmOcurrences.sort((a, b) => a.leagues.length - b.leagues.length)
    }

    const getLeaguemates = (leagues) => {
        let leaguemates = props.leagues.filter(x => x.isLeagueHidden === false).map(league => {
            return league.rosters.map(roster => {
                return {
                    ...roster,
                    username: roster.username,
                    avatar: roster.avatar,
                    league_avatar: league.avatar,
                    league_name: league.name,
                    league_id: league.league_id,
                    reserve_slots: league.reserve_slots,
                    taxi_slots: league.taxi_slots,
                    userWins: league.wins,
                    userLosses: league.losses,
                    userTies: league.ties,
                    userRoster: {
                        ...league.userRoster,
                        players: league.userRoster.players === undefined ? [] : league.userRoster.players,
                        taxi: league.userRoster.taxi === undefined ? [] : league.userRoster.taxi,
                        reserve: league.userRoster.reserve === undefined ? [] : league.userRoster.reserve,
                        taxi_slots: league.taxi_slots,
                        reserve_slots: league.reserve_slots
                    }
                }
            })
        }).flat()
        leaguemates = findOccurencesLeaguemates(leaguemates)
        return leaguemates
    }
    const leaguemates = useMemo(() => getLeaguemates(props.leagues), [props.leagues])
    if (leaguemates !== lm) setLm(leaguemates)

    const showLeagues = (leaguemate_id) => {
        let leaguemates = lm
        leaguemates.filter(x => x.id === leaguemate_id).map(leaguemate => {
            return leaguemate.isLeaguesHidden = !leaguemate.isLeaguesHidden
        })
        setLm([...leaguemates])
    }
    const showRoster = (leaguemate_id, league_id) => {
        let leaguemates = lm
        leaguemates.find(x => x.id === leaguemate_id).leagues.find(x => x.league_id === league_id).isRostersHidden =
            !leaguemates.find(x => x.id === leaguemate_id).leagues.find(x => x.league_id === league_id).isRostersHidden
        setLm([...leaguemates])
    }
    const getLeaguemate = (data) => {
        const leaguemates = lm
        if (data) {
            leaguemates.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = true
            })
            leaguemates.filter(x => x.username === data).map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        } else {
            leaguemates.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        }
        setLm([...leaguemates])
    }
    return <>
        <SearchLeaguemate 
            sendLeaguemate={getLeaguemate} 
            leaguemates={
                leaguemates.map(leaguemate => leaguemate.username)
            }
        />
        <h2>{lm.length} Leaguemates</h2>

        <table className="main">
            <tbody>
                <tr>
                    <th colSpan={5}></th>
                    <th colSpan={4}>Leaguemate</th>
                    <th colSpan={4}>{props.user.display_name}</th>
                </tr>
                <tr>
                    <th colSpan={4}></th>
                    <th colSpan={1}>Count</th>
                    <th colSpan={2}>Record</th>
                    <th colSpan={2}>WinPct</th>
                    <th colSpan={2}>Record</th>
                    <th colSpan={2}>WinPct</th>
                </tr>
                {lm.filter(x => x.isLeaguemateHidden === false).sort((a, b) => b.count - a.count).slice(0, 100).map((leaguemate, index) =>
                    <React.Fragment key={index}>
                        <tr
                            className={leaguemate.isLeaguesHidden ? 'hover clickable' : 'hover clickable active'}
                            onClick={() => showLeagues(leaguemate.id)}
                        >
                            <td>
                                <motion.img
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: Math.random() * 5 + 3 }}
                                    className='thumbnail'
                                    src={leaguemate.avatar === null ? emoji : `https://sleepercdn.com/avatars/${leaguemate.avatar}`}
                                />
                            </td>
                            <td colSpan={3} className="left">{leaguemate.username}</td>
                            <td colSpan={1}>{leaguemate.count}</td>
                            <td colSpan={2}>{leaguemate.wins}-{leaguemate.losses}{leaguemate.ties > 0 ? `-${leaguemate.ties}` : null}</td>
                            <td colSpan={2}>{leaguemate.wins + leaguemate.losses > 0 ? Number(leaguemate.wins / (leaguemate.wins + leaguemate.losses)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>
                            <td colSpan={2}>{leaguemate.userWins}-{leaguemate.userLosses}{leaguemate.userTies > 0 ? `-${leaguemate.userTies}` : null}</td>
                            <td colSpan={2}>{leaguemate.userWins + leaguemate.userLosses > 0 ? Number(leaguemate.userWins / (leaguemate.userWins + leaguemate.userLosses)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>
                        </tr>
                        {leaguemate.isLeaguesHidden === true ? null :
                            <tr>
                                <td colSpan={13}>
                                    <table className="secondary">
                                        <tbody>
                                            <tr>
                                                <th colSpan={2}>{leaguemate.username}</th>
                                                <th colSpan={2}></th>
                                                <th colSpan={2}>{props.user.display_name}</th>
                                            </tr>
                                            <tr>
                                                <th>Record</th>
                                                <th>WinPct</th>
                                                <th colSpan={2}></th>
                                                <th>Record</th>
                                                <th>WinPct</th>
                                            </tr>
                                            {leaguemate.leagues.map((league, index) =>
                                                <React.Fragment key={index}>
                                                    <tr key={index} className={league.isRostersHidden ? 'hover_black clickable' : 'hover_black active clickable'} onClick={() => showRoster(leaguemate.id, league.league_id)}>
                                                        <td>{league.wins}-{league.losses}{league.ties > 0 ? `-${league.ties}` : null}</td>
                                                        <td>{league.wins + league.losses > 0 ? Number(league.wins / (league.losses + league.wins)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>
                                                        <td colSpan={2}>
                                                            <div className='leaguewrapper'>
                                                                <img className='thumbnail' alt={league.name} src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`} />
                                                                <p>{league.name}</p>
                                                            </div>
                                                        </td>
                                                        <td>{league.userWins}-{league.userLosses}{league.userTies > 0 ? `-${league.ties}` : null}</td>
                                                        <td>{league.userWins + league.userLosses > 0 ? Number(league.userWins / (league.userLosses + league.userWins)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>
                                                    </tr>
                                                    {league.isRostersHidden ? null :
                                                        <tr className="tertiary">
                                                            <td colSpan={3}>
                                                                <Roster
                                                                    roster={{
                                                                        ...league.lmRoster,
                                                                        settings: {
                                                                            ...league.lmRoster.settings,
                                                                            taxi_slots: league.lmRoster.taxi_slots,
                                                                            reserve_slots: league.lmRoster.reserve_slots
                                                                        }
                                                                    }}
                                                                    allPlayers={props.allPlayers}
                                                                    getProjection={props.getProjection}
                                                                    getValue={props.getValue}
                                                                    matchPick={props.matchPick}
                                                                />
                                                            </td>
                                                            <td colSpan={3}>
                                                                <Roster
                                                                    roster={{
                                                                        ...league.userRoster,
                                                                        settings: {
                                                                            ...league.userRoster.settings,
                                                                            taxi_slots: league.userRoster.taxi_slots,
                                                                            reserve_slots: league.userRoster.reserve_slots
                                                                        }
                                                                    }}
                                                                    allPlayers={props.allPlayers}
                                                                    getProjection={props.getProjection}
                                                                    getValue={props.getValue}
                                                                    matchPick={props.matchPick}
                                                                />
                                                            </td>
                                                        </tr>
                                                    }
                                                </React.Fragment>
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default Leaguemates;