import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import SliderToggle from './sliderToggle';
import DynastyValues from './dynastyValues';
import Leagues from './leagues';
import allPlayers from '../allplayers.json';
import PlayerShares from './playerShares';

const View = () => {
    const params = useParams()
    const [activeTab, setActiveTab] = useState('Values')
    const [filters, setFilters] = useState({ 'r_d': 'All', 'b_s': 'All' })
    const [dv, setDV] = useState({ players: [], picks: [] })
    const [user, setUser] = useState({})
    const [leagues, setLeagues] = useState([])

    const getSelection = async (data) => {
        const key = Object.keys(data)[0]
        let f = { ...filters, [key]: data[key] }
        setFilters(f)
        let l = leagues
        l.map(league => {
            league.isLeagueHidden = true;
            if (f.rd === 'All' && f.b_s === 'All') {
                league.isLeagueHidden = false
            } else if ((f.r_d === league.dynasty || f.r_d === 'All') && (f.b_s === league.bestball || f.b_s === 'All')) {
                league.isLeagueHidden = false
            }
        })
        setLeagues([...l])
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
                    dv: matchPlayer(p.id),
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
    const matchPlayer = (player) => {
        if (player === '0') {
            return null
        } else {
            if (dv.players.find(x => x.searchName === allPlayers[player].search_full_name && x.position === allPlayers[player].position)) {
                return dv.players.find(x => x.searchName === allPlayers[player].search_full_name).updated_value
            } else if (dv.players.find(x => allPlayers[player].search_full_name !== undefined && x.searchName.slice(-5, -2) === allPlayers[player].search_full_name.slice(-5, -2) && x.searchName.slice(0, 3) === allPlayers[player].search_full_name.slice(0, 3) && x.position === allPlayers[player].position)) {
                return dv.players.find(x => x.searchName.slice(-5, -2) === allPlayers[player].search_full_name.slice(-5, -2) && x.searchName.slice(0, 3) === allPlayers[player].search_full_name.slice(0, 3)).updated_value
            } else {
                return 0
            }
        }
    }
    const matchPick = (season, round, order) => {
        let value;
        if (order <= (1 / 3)) {
            value = dv.picks.find(x => `${season}early${round}` === x.searchName.slice(0, 10))
        } else if (order >= (2 / 3)) {
            value = dv.picks.find(x => `${season}late${round}` === x.searchName.slice(0, 9))
        } else {
            value = dv.picks.find(x => `${season}mid${round}` === x.searchName.slice(0, 8))
        }

        value = value === undefined ? 0 : value.updated_value
        return value
    }

    useEffect(() => {
        const fetchData = async () => {
            const getUser = async () => {
                const u = await axios.get('/user', {
                    params: {
                        username: params.username
                    }
                })
                setUser(u.data)
            }
            getUser()
            const getLeagues = async () => {
                const l = await axios.get('/leagues', {
                    params: {
                        username: params.username
                    }
                })
                return l.data
            }
            const l = await getLeagues()
            setLeagues(l)
            const getDrafts = async (l) => {
                const d = await axios.get('/drafts', {
                    params: {
                        username: params.username
                    }
                })
                l.map(league => {
                    return league.drafts = d.data.flat().filter(x => x !== null && x.league_id === league.league_id)
                })
                setLeagues(l)
            }
            await getDrafts(l)
        }
        fetchData()
    }, [params.username])


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
            return league.rosters.filter(x => x.players !== null && x.owner_id !== user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: league,
                        roster: roster,
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
        
        /*
        let all_active_players = []
        const ap_keys = Object.keys(allPlayers).filter(x => x === x.trim() && allPlayers[x].active === true)

        ap_keys.map(allPlayer => {
            const p = players.find(x => x.id === allPlayer)
            let leagues_unowned = playersAll.filter(x => x.id === allPlayer)
            if (p) {
                all_active_players.push({
                    ...p,
                    leagues_taken: leagues_unowned,
                    leagues_available: leagues.filter(x =>
                        p.leagues.find(y => y.league_id === x.league_id) === undefined &&
                        leagues_unowned.find(y => y.league.league_id === x.league_id) === undefined)
                })
            } else {
                all_active_players.push({
                    id: allPlayer,
                    dv: matchPlayer(allPlayer),
                    count: 0,
                    yearsExp: allPlayers[allPlayer].years_exp,
                    leagues: [],
                    leagues_taken: leagues_unowned,
                    leagues_available: leagues.filter(x =>
                        leagues_unowned.find(y => y.league.league_id === x.league_id) === undefined),
                    wins: 0,
                    losses: 0,
                    ties: 0,
                    winpct: 0,
                    fpts: 0,
                    fpts_against: 0,
                    sortName: allPlayers[allPlayer].last_name + " " + allPlayers[allPlayer].first_name + " " + allPlayers[allPlayer].position + " " + allPlayers[allPlayer].team,
                    isLeaguesHidden: true,
                    isPlayerHidden: true
                })
            }
        })
        */
        
        players = players.map(player => {
            let leagues_unowned = playersAll.filter(x => x.id === player.id)
            return {
                ...player,
                leagues: player.leagues,
                leagues_taken: leagues_unowned,
                leagues_available: leagues.filter(x =>
                    player.leagues.find(y => y.league_id === x.league_id) === undefined &&
                    leagues_unowned.find(y => y.league.league_id === x.league_id) === undefined) 
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
        console.log([...players, ...playersAll].sort((a, b) => b.count - a.count))
        return players

    }
    const players = useMemo(() => getPlayers(leagues), [leagues])







    return <>
        <Link className="link" to="/">Home</Link>
        <h1>Dynasty Dashboard</h1>
        <h2>{user.display_name}</h2>
        <div className="navcontainer">
            <button onClick={() => setActiveTab('Values')} className={activeTab === 'Values' ? 'active nav' : 'nav'}>Values</button>
            <button onClick={() => setActiveTab('Leagues')} className={activeTab === 'Leagues' ? 'active nav' : 'nav'}>Leagues</button>
            <button onClick={() => setActiveTab('Players')} className={activeTab === 'Players' ? 'active nav' : 'nav'}>Players</button>
            <button onClick={() => setActiveTab('Leaguemates')} className={activeTab === 'Leaguemates' ? 'active nav' : 'nav'}>Leaguemates</button>
        </div>
        <h5>
            <SliderToggle sendSelection={getSelection} className="slidertoggle" sendSelection={getSelection} name="r_d" names={['Redraft', 'All', 'Dynasty']} active="All" />
            <SliderToggle sendSelection={getSelection} className="slidertoggle" sendSelection={getSelection} name="b_s" names={['BestBall', 'All', 'Standard']} active="All" />
        </h5>
        <div hidden={activeTab === 'Values' ? false : true}>
            <DynastyValues sendDV={(data) => setDV(data)} />
        </div>
        <div hidden={activeTab === 'Leagues' ? false : true}>
            {leagues.length > 0 ?
                <Leagues user={user} leagues={leagues.filter(x => x.isLeagueHidden === false)} matchPick={matchPick} matchPlayer={matchPlayer} />
                : <h1>Loading...</h1>
            }
        </div>
        <div hidden={activeTab === 'Players' ? false : true}>
            {leagues.length > 0 ?
                <PlayerShares players={players} matchPlayer={matchPlayer} matchPick={matchPick} />
                : <h1>Loading...</h1>
            }
        </div>
    </>
}
export default View;