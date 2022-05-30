import React, { useState } from 'react';
import emoji from '../emoji.png';
import League from './league';
import { motion } from 'framer-motion';

const Leagues = (props) => {
    const [leagues, setLeagues] = useState([])
    if (props.leagues !== leagues) setLeagues(props.leagues)

    const showRoster = (league_id) => {
        let l = leagues;
        l.filter(x => x.league_id === league_id).map(league => {
            league.isRosterHidden = !league.isRosterHidden;
        })
        setLeagues([...l])
    }

    let total_wins = leagues.reduce((acc, cur) => acc + cur.wins, 0)
    let total_losses = leagues.reduce((acc, cur) => acc + cur.losses, 0)
    let total_ties = leagues.reduce((acc, cur) => acc + cur.ties, 0)
    let total_fpts = leagues.reduce((acc, cur) => acc + cur.fpts, 0)
    let total_fpts_against = leagues.reduce((acc, cur) => acc + cur.fpts_against, 0)

    return <>
        <br />
        <table className="summary">
            <tbody>
                <tr>
                    <th colSpan="2">{leagues.length} Leagues</th>
                </tr>
                <tr>
                    <td colSpan="2">Record: {total_wins}-{total_losses}{total_ties === 0 ? null : `-${total_ties}`} <em>{total_wins + total_losses === 0 ? '.0000' : (total_wins / (total_wins + total_losses)).toFixed(4)}</em></td>
                </tr>
                <tr>
                    <td colSpan="2">{Number(total_fpts.toFixed(2)).toLocaleString("en-US")} - {Number(total_fpts_against.toFixed(2)).toLocaleString("en-US")}</td>
                </tr>
            </tbody>
        </table>
        <table className='main'>
            <tbody>
                <tr>
                    <th colSpan={4}>League</th>
                    <th>Record</th>
                    <th>Win Pct</th>
                    <th colSpan={2}>Fantasy Points</th>
                </tr>
                {leagues.sort((a, b) => a.index - b.index).map((league, index) =>
                    <React.Fragment key={index}>
                        <tr onClick={() => showRoster(league.league_id)} className={league.isRosterHidden ? 'hover clickable' : 'hover clickable active'}>
                            <td>
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
                            <td colSpan={3} className='left'>{league.name}</td>
                            <td>{league.wins}-{league.losses}{league.ties > 0 ? `-${league.ties}` : null}</td>
                            <td>{league.wins + league.losses > 0 ? (league.wins / (league.wins + league.losses)).toFixed(4) : '.0000'}</td>
                            <td colSpan={2}>{Number(league.fpts).toLocaleString("en-US")} - {Number(league.fpts_against).toLocaleString("en-US")}</td>
                        </tr>
                        {league.isRosterHidden ? null : 
                            <tr key={index + '_league'}>
                                <td colSpan={8}>
                                    <League
                                        allPlayers={props.allPlayers}
                                        league={league}
                                        getValue={props.getValue}
                                        matchPick={props.matchPick}
                                        getProjection={props.getProjection}
                                    />
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default Leagues;