import { useState } from "react";
import emoji from '../emoji.png';
import { motion } from "framer-motion";

const Lineups = (props) => {
    const [leagues, setLeagues] = useState([])
    if (props.leagues !== leagues) setLeagues(props.leagues)


    return <>
        <h2>Lineups</h2>
        <table className="main">
            <tbody>
                <tr>
                    <th colSpan={4}>League</th>
                    <th>Empty</th>
                    <th>0 projection</th>
                </tr>
                {leagues.sort((a, b) => a.index - b.index).map((league, index) =>
                    <tr key={index}>
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
                        <td colSpan={3} className="left">{league.name}</td>
                        <td>{league.starters.filter(x => x === 0).length}</td>
                        <td>{league.starters.filter(x => props.getProjection(x) === 0).length}</td>
                    </tr>
                )}
            </tbody>
        </table>


    </>
}
export default Lineups;