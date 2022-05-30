import React, { useState, useEffect, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import PlayerInfo from './playerInfo';
import Leagues from './leagues';
import PlayerShares from './playerShares';
import Leaguemates from './leaguemates';
import { motion } from 'framer-motion';
import SliderToggle from './sliderToggle';

const View = () => {
    const params = useParams()
    const [activeTab, setActiveTab] = useState('Leagues')
    const [user, setUser] = useState({})
    const [allPlayers, setAllPlayers] = useState({})
    const [playerInfo, setPlayerInfo] = useState([])
    const [leagues, setLeagues] = useState([])
    const [filters, setFilters] = useState({ 'r_d': 'All', 'b_s': 'All' })


    const getSelection = async (data) => {
        console.log(data)
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
            const getAllPlayers = async () => {
                const ap = await axios.get('/allplayers')
                const a = Object.keys(ap.data).map(player => {
                    ap.data[player].type = ap.data[player].years_exp > 0 ? 'V' : 'R'
                })
                console.log(ap.data)
                setAllPlayers(ap.data)
            }

            const getLeagues = async () => {
                const l = await axios.get('/leagues', {
                    params: {
                        username: params.username
                    }
                })
                setLeagues(l.data)
            }
            await Promise.all([
                await getAllPlayers(),
                await getLeagues()
            ])
        }
        fetchData()
    }, [params.username])

    const getValue = (player) => {
        if (parseInt(player) === 0) {
            return 0
        } else {
            if (playerInfo.find(x => parseInt(x.id) === parseInt(player))) {
                return parseInt(playerInfo.find(x => parseInt(x.id) === parseInt(player)).updated_value)
            } else {
                return 0
            }
        }
    }
    const matchPick = (season, round, order) => {
        let value;
        console.log(playerInfo)
        if (order <= (1 / 3)) {
            value = playerInfo.filter(x => typeof (x.id) === 'string').find(x => `${season}early${round}` === x.id.slice(0, 10))
        } else if (order >= (2 / 3)) {
            value = playerInfo.filter(x => typeof (x.id) === 'string').find(x => `${season}late${round}` === x.id.slice(0, 9))
        } else {
            value = playerInfo.filter(x => typeof (x.id) === 'string').find(x => `${season}mid${round}` === x.id.slice(0, 8))
        }
        value = value === undefined ? 0 : value.updated_value
        return value
    }
    const getProjection = (player) => {
        if (parseInt(player) === 0) {
            return 0
        } else {
            if (playerInfo.find(x => parseInt(x.id) === parseInt(player))) {
                return parseFloat(playerInfo.find(x => parseInt(x.id) === parseInt(player)).updated_fpts)
            } else {
                return 0
            }
        }
    }
    return <>
        <Link className='link' to="/">Home</Link>
        <button
            onClick={() => setActiveTab('All Players')}
            className={activeTab === 'All Players' ? 'navbutton active clickable' : 'navbutton clickable'}
        >
            All Players
        </button>
        <h1>
            Dynasty Dashboard
        </h1>
        <motion.h2
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 15 }}
        >
            {user.display_name}
        </motion.h2>
        <div className="navcontainer">
            <button onClick={() => setActiveTab('Leagues')} className={activeTab === 'Leagues' ? 'active nav clickable' : 'nav clickable'}>Leagues</button>
            <button onClick={() => setActiveTab('Players')} className={activeTab === 'Players' ? 'active nav clickable' : 'nav clickable'}>Players</button>
            <button onClick={() => setActiveTab('Leaguemates')} className={activeTab === 'Leaguemates' ? 'active nav clickable' : 'nav'}>Leaguemates</button>
        </div>
        <div className='slidercontainer'>
            <SliderToggle sendSelection={getSelection} className="slidertoggle" sendSelection={getSelection} name="r_d" names={['Redraft', 'All', 'Dynasty']} active="All" />
            <SliderToggle sendSelection={getSelection} className="slidertoggle" sendSelection={getSelection} name="b_s" names={['BestBall', 'All', 'Standard']} active="All" />
        </div>

        <div hidden={activeTab === 'All Players' ? false : true}>
            <Suspense fallback={<h1>Loading...</h1>}>
                <PlayerInfo
                    sendPlayers={(data) => setPlayerInfo(data)}
                    allPlayers={allPlayers}
                />
            </Suspense>
        </div>

        <div hidden={activeTab === 'Leagues' ? false : true}>
            {leagues.length > 0 ?
                <Leagues
                    leagues={leagues.filter(x => x.isLeagueHidden === false)}
                    allPlayers={allPlayers}
                    getValue={getValue}
                    matchPick={matchPick}
                    getProjection={getProjection}
                />
                : <h1>Loading...</h1>
            }
        </div>
        <div hidden={activeTab === 'Players' ? false : true}>
            {leagues.length > 0 ?
                <PlayerShares
                    allPlayers={allPlayers}
                    leagues={leagues.filter(x => x.isLeagueHidden === false)}
                    user={user}
                    getValue={getValue}
                    getProjection={getProjection}
                    matchPick={matchPick}
                />
                : <h1>Loading...</h1>
            }
        </div>
        <div hidden={activeTab === 'Leaguemates' ? false : true}>
            {leagues.length > 0 ?
                <Leaguemates
                    allPlayers={allPlayers}
                    leagues={leagues.filter(x => x.isLeagueHidden === false)}
                    user={user}
                    getValue={getValue}
                    getProjection={getProjection}
                    matchPick={matchPick}
                />
                : <h1>Loading...</h1>
            }
        </div>
    </>
}
export default View;