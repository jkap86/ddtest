import axios from "axios";
import { read, utils } from 'xlsx';
import React, { useState, useEffect } from "react";
import player_default from '../player_default.png';
import { motion } from 'framer-motion';

const PlayerInfo = (props) => {
    const [sortBy, setSortBy] = useState('value')
    const [sortToggle, setSortToggle] = useState(false)
    const [file, setFile] = useState(null)
    const [allPlayers, setAllPlayers] = useState({})
    const [players, setPlayers] = useState([])
    const [playersDisplay, setPlayersDisplay] = useState([])
    const [filters, setFilters] = useState({
        positions: [],
        types: []
    })

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

    const sortPlayer = (key) => {
        let t = sortToggle
        let s = sortBy
        const toggle = !t
        if (key === s) {
            setSortToggle(toggle)
        } else {
            setSortBy(key)
        }
        let pd;
        let p = players
        if (toggle) {
            pd = p.sort((a, b) => b[key] > a[key] ? 1 : -1)
        } else {
            pd = p.sort((a, b) => b[key] < a[key] ? 1 : -1)
        }
        setPlayersDisplay(pd)
    }

    useEffect(() => {
        const fetchData = async () => {
            const p = await axios.get('/playerinfo')
            p.data.map(player => {
                if (player.fpts === undefined) {
                    player.fpts = 0
                    player.updateFpts = 0
                }
            })
            setPlayers(p.data)
            setPlayersDisplay(p.data)
            setAllPlayers(props.allPlayers)
            props.sendPlayers(p.data)
            setPlayersDisplay(p.data.sort((a, b) => b[sortBy] > a[sortBy] ? 1 : -1))
            console.log(p.data)
        }
        fetchData()

    }, [props.allPlayers])

    const updateValue = (player_id, updated_value) => {
        const p = playersDisplay
        p.filter(x => x.id === player_id).map(player => {
            player.updated_value = updated_value
        })
        setPlayersDisplay([...p])
        props.sendPlayers([...p])
    }
    const updateFpts = (player_id, updated_value) => {
        const p = playersDisplay
        p.filter(x => x.id === player_id).map(player => {
            player.updated_fpts = updated_value
        })
        setPlayersDisplay([...p])
        props.sendPlayers([...p])
    }

    const readFile = (e) => {
        if (e.target.files) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const data = e.target.result
                const workbook = read(data, { type: "array" })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                let json = utils.sheet_to_json(worksheet)
                let max_dv = Math.max(...json.map(player => player.value))
                let min_dv = Math.min(...json.map(player => player.value))
                json.map(player => {
                    const searchName = player.name.replace(/[^0-9a-z]/gi, '').toLowerCase().trim()
                    const value = parseInt((player.value - min_dv) / (max_dv - min_dv) * 10000)
                    const id = Object.keys(allPlayers).find(x => allPlayers[x].position === player.position &&
                        (allPlayers[x].search_full_name === searchName ||
                            (allPlayers[x].search_full_name.slice(-5, -1) === searchName.slice(-5, -1) &&
                                allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3)
                            )
                        )

                    )
                    player.id = id
                    player.value = value === undefined ? 0 : value
                    player.updated_value = value === undefined ? 0 : value
                    player.fpts = player.fpts
                    player.updated_fpts = player.fpts
                })
                setPlayersDisplay(json)
                props.sendPlayers(json)
            }
            setFile(e.target.files[0].name)
            reader.readAsArrayBuffer(e.target.files[0])
        } else {
            setFile(null)
        }

    }
    const clearFile = () => {
        setFile(null)
        let f = document.getElementById("fileupload")
        f.value = null
        let p = players
        setPlayersDisplay(p)
    }

    return <>
        <table className="main">
            <caption>
                {file === null ? 
                <button className="file">
                    <label for="fileupload" className='file clickable'>
                        Upload File
                        <input
                            id='fileupload'
                            className="fileupload"
                            type='file'
                            onChange={readFile}
                        />
                    </label>
                </button>
                :
                <button className="clear clickable" onClick={() => clearFile()}>Clear</button>
}
                <h3>{file}</h3>
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
                    <label className="script">
                        Picks
                        <input className="clickable" name="PI" onChange={filterPosition} defaultChecked type="checkbox" />
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
            </caption>
            <tbody>
                <tr>
                    <th colSpan={4} className="clickable" onClick={() => sortPlayer('name')}>Player</th>
                    <th>Position</th>
                    <th>Team</th>
                    <th className="clickable" onClick={() => sortPlayer('value')}>KTC Value</th>
                    <th className="clickable" onClick={() => sortPlayer('updated_value')}>User Value</th>
                    <th className="clickable" onClick={() => sortPlayer('fpts')}>FP Projection</th>
                    <th className="clickable" onClick={() => sortPlayer('updated_fpts')}>User Projection</th>
                </tr>
                {playersDisplay.filter(x => !filters.types.includes(x.type) && !filters.positions.includes(x.position)).map((player, index) =>
                    <tr key={index}>
                        <td>
                            <motion.img
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: Math.random() * 10 + 2 }}
                                className="thumbnail"
                                alt="headshot"
                                src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                                onError={(e) => { return e.target.src = player_default }}
                            />
                        </td>
                        <td colSpan={3} className="left">{player.name}</td>
                        <td>{player.position}</td>
                        <td>{player.team}</td>
                        <td>{player.value}</td>
                        <td>
                            <input
                                type="text"
                                className={parseInt(player.updated_value) === parseInt(player.value) ? 'updated_value' : 'updated_value modified'}
                                value={player.updated_value}
                                onChange={(e) => updateValue(player.id, e.target.value)}
                            />
                        </td>
                        {player.position === 'PI' ? null :
                            <>
                                <td>{player.fpts}</td>
                                <td>
                                    <input
                                        type="text"
                                        className={parseFloat(player.updated_fpts) === parseFloat(player.fpts) ? 'updated_value' : 'updated_value modified'}
                                        value={player.updated_fpts}
                                        onChange={(e) => updateFpts(player.id, e.target.value)}
                                    />
                                </td>
                            </>
                        }
                    </tr>
                )}
            </tbody>
        </table>
    </>
}
export default PlayerInfo;