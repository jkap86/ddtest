import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import axios from 'axios';
import { motion } from 'framer-motion';

const Homepage = () => {
    const [username, setUsername] = useState('')

    const getUser = async (e) => {
        const user = await axios.get('/user', {
            params: {
                username: e.target.value
            }
        })
        if (typeof (user.data) === 'object') {
            setUsername(e.target.value)
        } else {
            setUsername('')
        }
    }

    return <>
        <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 5 }}
        >
            Dynasty Dashboard
        </motion.h1>
        <br /><br />
        <div className="search_wrapper">
            <input 
                type="text"
                placeholder="username"
                onChange={getUser}
            />
            <br /><br />
            {username === '' ? null : 
                <Link to={`/${username}`}>
                    <button type="submit">Submit</button>
                </Link>
            }
        </div>
    </>
}
export default Homepage;