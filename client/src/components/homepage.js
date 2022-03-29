import { useState, useEffect } from 'react';
import emoji from '../emoji.png';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Homepage = () => {
    const [username, setUsername] = useState(null)
    const [season, setSeason] = useState(0)

    const getUser = async (e) => {
        const user = await axios.get(`/user`, {
            params: {
                username: e.target.value
            }
        })
        if (typeof (user.data) === 'object') {
            setUsername(e.target.value)
        } else {
            setUsername(null)
            alert('Username Not Found')
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const getNfl = async () => {
                const nfl = await axios.get('/nfl')
                setSeason(nfl.data.league_season)
            }
            await getNfl()
        }
        fetchData()
    })

    return <>
        <div className="App">
            <h1>Dynasty Dashboard</h1>
            <div className='searchwrapper'>
                <div className="search">
                    <div className="searchitem">
                        <label>Username:</label>
                        <input
                            type="text"
                            onBlur={getUser} />
                    </div>
                    <Link to={username === null ? '/' : `/${username}`}>
                        <button type="submit">Submit</button>
                    </Link>
                </div>
                <div className="imgcontainer"><img alt="emoji" className="main" src={emoji} /></div>
            </div>

        </div>
    </>
}
export default Homepage;