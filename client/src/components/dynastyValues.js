import { useState, useEffect } from 'react';
import allPlayers from '../allplayers.json';
import axios from 'axios';
import player_default from '../player_default.png';
import { read, utils } from 'xlsx';
import exportFromJSON from 'export-from-json';
import startup_values from '../startup_values.json';

const DynastyValues = (props) => {
    const [dynastyValues, setDynastyValues] = useState({ players: [], picks: [] })
    const [dvFile, setDVFile] = useState(null)
    const [dv_display, setDV_display] = useState({ players: [], picks: [] })
    const [activeTab, setActiveTab] = useState('Players')

    const updateValue = (player_id, updated_value, type) => {
        const dv = type === 'players' ? dv_display.players : dv_display.picks
        dv.filter(x => x.id === player_id).map(player => {
            player.updated_value = updated_value
        })
        setDV_display({ ...dv_display, [type]: dv })
    }
    const clearFile = () => {
        let f = document.getElementById("fileupload")
        f.value = null
        setDVFile(null)
        setDV_display(dynastyValues)
    }
    const sortPlayers = () => {
        const players = dv_display.players
        const sorted = players.sort((a, b) => a.name > b.name ? 1 : -1)
        setDV_display({ ...dv_display, players: [...sorted] })
    }
    const sortPicks = () => {
        const picks = dv_display.picks
        const sorted = picks.sort((a, b) => parseInt(a.name.slice(0, 4)) - parseInt(b.name.slice(0, 4)) ||
            parseInt(a.name.slice(-3, -2)) - parseInt(b.name.slice(-3, -2)))
        setDV_display({ ...dv_display, picks: sorted })
    }
    const sortKTC = (type) => {
        const d = type === 'players' ? dv_display.players : dv_display.picks
        const sorted = d.sort((a, b) => parseInt(b.value) - parseInt(a.value))
        setDV_display({ ...dv_display, [type]: sorted })
    }
    const sortUser = (type) => {
        const d = type === 'players' ? dv_display.players : dv_display.picks
        const sorted = d.sort((a, b) => parseInt(b.updated_value) - parseInt(a.updated_value))
        setDV_display({ ...dv_display, [type]: sorted })
    }
    const readFile = (e) => {
        if (e.target.files) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let json = utils.sheet_to_json(worksheet);
                let max = Math.max(...json.map(player => player.value))
                let min = Math.min(...json.map(player => player.value))
                json.map(player => {
                    const value = player.value > 0 ? parseInt((player.value - min) / (max - min) * 10000) : startup_values.find(x => x.Rank === player.Rank).Value
                    const searchName = player.name.replace(/[^0-9a-z]/gi, '').toLowerCase()
                    const id = Object.keys(allPlayers).find(x => allPlayers[x].position === player.position &&
                        (allPlayers[x].search_full_name === searchName ||
                            (allPlayers[x].search_full_name.slice(-5, -2) === searchName.slice(-5, -2) &&
                                allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3)
                            )
                        )
                    )
                    player.id = id
                    player.value = value === undefined ? 0 : value
                    player.updated_value = value === undefined ? 0 : value
                    player.searchName = player.name.replace(/[^0-9a-z]/gi, '').toLowerCase()
                })
                setDVFile(json)
                setDV_display({ ...dv_display, players: json })
                props.sendDV({ ...dv_display, players: json })
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        } else {
            setDVFile(null)
            setDV_display({ ...dv_display, players: dynastyValues })
            props.sendDV({ ...dv_display, players: dynastyValues })
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            const getDynastyValues = async () => {
                const dynasty_values = await axios.get('/dynastyvalues')
                return dynasty_values.data
            }
            const dv = await getDynastyValues()
            setDynastyValues({ players: dv.filter(x => x.position !== 'PI'), picks: dv.filter(x => x.position === 'PI') })
            setDV_display({ players: dv.filter(x => x.position !== 'PI'), picks: dv.filter(x => x.position === 'PI') })
            props.sendDV({ players: dv.filter(x => x.position !== 'PI'), picks: dv.filter(x => x.position === 'PI') })

        }
        fetchData()

    }, [])

    console.log(dv_display)

    return <>
        <br/>
        <div className='page_nav'>
            <button className={activeTab === 'Players' ? 'page_toggle active' : 'page_toggle'} onClick={() => setActiveTab('Players')}>Players</button>
            <button className={activeTab === 'Picks' ? 'page_toggle active' : 'page_toggle'} onClick={() => setActiveTab('Picks')}>Picks</button>
        </div>


        {activeTab === 'Players' ?
            <table className='main'>
                <caption>
                    <button>
                        <label for="fileupload" className='clickable'>
                            Upload
                            <input
                                id='fileupload'
                                type='file'
                                onChange={readFile}
                            />
                        </label>
                    </button>
                    <button onClick={() => clearFile()}>Clear File</button>
                </caption>
                <tbody>
                    <tr>
                        <th></th>
                        <th className='clickable' onClick={() => sortPlayers()}>Player</th>
                        <th>Position</th>
                        <th className='clickable' onClick={() => sortKTC('players')}>{dvFile !== null ? 'Upload' : 'KTC'}</th>
                        {dvFile !== null ? null :
                            <th className='clickable' onClick={() => sortUser('players')}>You</th>
                        }
                    </tr>
                    {dv_display.players.map(dv =>
                        <tr className='hover' key={dv.name}>
                            <td>
                                <img
                                    className='thumbnail'
                                    alt={dv.id} src={`https://sleepercdn.com/content/nfl/players/thumb/${dv.id}.jpg`}
                                    onError={(e) => { return e.target.src = player_default }}
                                />
                            </td>
                            <td>{dv.name}</td>
                            <td>{dv.position}</td>
                            <td>{dv.value}</td>
                            {dvFile !== null ? null :
                                <td>
                                    <input
                                        type="number"
                                        className={dv.updated_value === dv.value ? 'updated_dv' : 'updated_dv modified'}
                                        defaultValue={dv.updated_value}
                                        onBlur={(e) => updateValue(dv.id, e.target.value, 'players')}
                                    />
                                </td>
                            }
                        </tr>
                    )}
                </tbody>
            </table>
            :
            <table className='main'>
                <tbody>
                    <tr>
                        <th className='clickable' onClick={() => sortPicks()}>Pick</th>
                        <th className='clickable' onClick={() => sortKTC('picks')}>KTC</th>
                        <th className='clickable' onClick={() => sortUser('picks')}>You</th>
                    </tr>
                    {dv_display.picks.map(dv =>
                        <tr className='hover' key={dv.id}>
                            <td>{dv.name}</td>
                            <td>{dv.value}</td>
                            <td>
                                <input
                                    type="number"
                                    className={dv.updated_value === dv.value ? 'updated_dv' : 'updated_dv modified'}
                                    defaultValue={dv.updated_value}
                                    onBlur={(e) => updateValue(dv.id, e.target.value, 'picks')}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        }

    </>
}
export default DynastyValues;