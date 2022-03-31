import allPlayers from '../allplayers.json';
import { useState, useEffect } from 'react';
import './searchPlayer.css';

const SearchPlayer = (props) => {
    const [activePlayers, setActivePlayers] = useState([])
    const [playerSearched, setPlayerSearched] = useState('')

    const getActivePlayers = (allplayers) => {
        const activePlayers = Object.keys(allPlayers).filter(x => x === x.trim() && allPlayers[x].status === 'Active').map(player => {
            return {
                id: player,
                value: player,
                label: allPlayers[player].first_name + " " + allPlayers[player].last_name + " " + allPlayers[player].position +
                    (allPlayers[player].team === null ? ' FA' : " " + allPlayers[player].team)
            }
        })
        setActivePlayers(activePlayers.sort((a, b) => a.label > b.label ? 1 : -1))
    }

    const filterPlayer = (e) => {
        let id = activePlayers.find(x => x.label === e.target.value) === undefined ? null : activePlayers.find(x => x.label === e.target.value).id
        setPlayerSearched(id)
    }

    const handleClear = (e) => {
        let p = null
        setPlayerSearched(p)
    }

    useEffect(() => {
        getActivePlayers(allPlayers)
        props.sendPlayer(playerSearched)
    }, [playerSearched])


    return <>
        <h5>
            <form onSelect={filterPlayer}>
                <input list="playersAuto" placeholder="Search Player" type="text" />
                <datalist id="playersAuto">
                    {activePlayers.map(player =>
                        <option key={player.id}>
                            {player.label}
                        </option>
                    )}
                </datalist>
                <button type="reset" onClick={handleClear}>Clear</button>
            </form>
        </h5>
    </>
}

export default SearchPlayer;