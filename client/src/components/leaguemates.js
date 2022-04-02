import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import emoji from '../emoji.png';
import Roster from './roster';
import SearchLeaguemate from './searchLeaguemate';

const Leaguemates = (props) => {
    const [leaguemates, setLeaguemates] = useState([])
    let params = useParams();

    if (props.leaguemates !== leaguemates) setLeaguemates(props.leaguemates)


    const showLeagues = (leaguemate_id) => {
        let lms = leaguemates
        lms.filter(x => x.id === leaguemate_id).map(lm => {
            return lm.isLeaguesHidden = !lm.isLeaguesHidden
        })
        setLeaguemates([...lms])

    }

    const showRosters = (leaguemate_id, league_id) => {
        let lm = leaguemates
        lm.find(x => x.id === leaguemate_id).leagues.find(x => x.league_id === league_id).isRostersHidden =
            !lm.find(x => x.id === leaguemate_id).leagues.find(x => x.league_id === league_id).isRostersHidden

        setLeaguemates([...lm])
    }

    const getLeaguemate = (data) => {
        console.log(data)
        const lm = leaguemates
        if (data) {
            lm.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = true
            })
            lm.filter(x => x.username === data).map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        } else {
            lm.map(leaguemate => {
                return leaguemate.isLeaguemateHidden = false
            })
        }
        setLeaguemates([...lm])
    }

    return <>
        <br />
        <br />
        <h2>{leaguemates.length} Leaguemates</h2>
        <SearchLeaguemate sendLeaguemate={getLeaguemate} leaguemates={leaguemates.map(leaguemate => leaguemate.username)}  />
        <table className='main'>
            <tbody>
                <tr>
                    <th colSpan={9}></th>
                    <th colSpan={4}>{params.username}</th>
                </tr>
                <tr>
                    <th></th>
                    <th colSpan={3}></th>
                    <th>Count</th>
                    <th colSpan={2}>Record</th>
                    <th colSpan={2}>WinPct</th>
                    <th colSpan={2}>Record</th>
                    <th colSpan={2}>WinPct</th>
                </tr>
            </tbody>
            {leaguemates.filter(x => x.isLeaguemateHidden === false).sort((a, b) => b.count - a.count).slice(0, 100).map(leaguemate =>
                <tbody key={leaguemate.id}>
                    <tr onClick={() => showLeagues(leaguemate.id)} className={leaguemate.isLeaguesHidden ? 'hover' : 'hover active'}>
                        <td><img className='thumbnail' src={leaguemate.avatar === null ? emoji : `https://sleepercdn.com/avatars/${leaguemate.avatar}`} /></td>
                        <td colSpan={3}>{leaguemate.username}</td>
                        <td>{leaguemate.count}</td>
                        <td colSpan={2}>{leaguemate.wins}-{leaguemate.losses}{leaguemate.ties > 0 ? `-${leaguemate.ties}` : null}</td>
                        <td colSpan={2}>{leaguemate.wins + leaguemate.losses > 0 ? Number(leaguemate.wins / (leaguemate.wins + leaguemate.losses)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>

                        <td colSpan={2}>{leaguemate.userWins}-{leaguemate.userLosses}{leaguemate.userTies > 0 ? `-${leaguemate.userTies}` : null}</td>
                        <td colSpan={2}>{leaguemate.userWins + leaguemate.userLosses > 0 ? Number(leaguemate.userWins / (leaguemate.userWins + leaguemate.userLosses)).toFixed(4).toLocaleString("en-US") : '.0000'}</td>
                    </tr>
                    {leaguemate.isLeaguesHidden === true ? null :
                        <tr className='black'>
                            <td colSpan={13}>
                                <table className='black'>
                                    <tbody>
                                        <tr>
                                            <th className='leaguemate' colSpan={2}>{leaguemate.username}</th>
                                            <th colSpan={2}></th>
                                            <th className='leaguemate' colSpan={2}>{params.username}</th>
                                        </tr>
                                        <tr>
                                            <th>Record</th>
                                            <th>WinPct</th>
                                            <th colSpan={2}></th>
                                            <th>Record</th>
                                            <th>WinPct</th>
                                        </tr>
                                    </tbody>
                                    {leaguemate.leagues.map((league, index) =>
                                        <tbody key={index + '' + league.id}>
                                            <tr onClick={() => showRosters(leaguemate.id, league.league_id)} className={league.isRostersHidden ? 'hoverblack' : 'hoverblack active'}>
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
                                                <tr className='roster'>
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
                                                            matchPlayer={props.matchPlayer}
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
                                                            matchPlayer={props.matchPlayer}
                                                            matchPick={props.matchPick}
                                                        />

                                                    </td>
                                                </tr>
                                            }

                                        </tbody>
                                    )}


                                </table>
                            </td>
                        </tr>
                    }
                </tbody>
            )}
        </table>
    </>
}

export default Leaguemates