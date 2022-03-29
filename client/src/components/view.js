import React, { useState, useEffect, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import SliderToggle from './sliderToggle';
import DynastyValues from './dynastyValues';
import Leagues from './leagues';
import allPlayers from '../allplayers.json';

const View = () => {
    const params = useParams()
    const [activeTab, setActiveTab] = useState('Values')
    const [filters, setFilters] = useState({ 'r_d': 'All', 'b_s': 'All' })
    const [dv, setDV] = useState([])
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
        setLeagues(l)
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
                console.log(d.data)
                l.map(league => {
                    return league.drafts = d.data.flat().filter(x => x !== null && x.league_id === league.league_id)
                })
                setLeagues(l)
            }
            await getDrafts(l)
        }
        fetchData()
    }, [params.username])


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
    </>
}
export default View;