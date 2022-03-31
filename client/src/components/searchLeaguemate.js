import { useState, useEffect } from 'react';
import './searchPlayer.css';

const SearchPlayer = (props) => {
    const [leaguematesList, setLeaguematesList] = useState([])
    const [leaguemateSearched, setLeaguemateSearched] = useState(null)

    const getLeaguemates = (leaguemates) => {
        setLeaguematesList(leaguemates)
    }
    const filterLeaguemates = (e) => {
        const leaguemate = leaguematesList.find(x => x === e.target.value)
        setLeaguemateSearched(leaguemate)
    }
    const handleClear = () => {
        let leaguemate = null
        setLeaguemateSearched(leaguemate)
    }

    useEffect(() => {
        getLeaguemates(props.leaguemates)
        props.sendLeaguemate(leaguemateSearched)
    }, [leaguemateSearched])

    return <>
        <h5>
            <form onSelect={filterLeaguemates}>
                <input list="leaguemates" placeholder="Search Leaguemate" type="text" />
                <datalist id="leaguemates">
                    {leaguematesList.sort((a, b) => a > b ? 1 : -1).map(leaguemate =>
                        <option>{leaguemate}</option>
                    )}
                </datalist>
                <button onClick={handleClear} type="reset">Clear</button>
            </form>
        </h5>
    </>
}

export default SearchPlayer;