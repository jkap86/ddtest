const workerpool = require('workerpool')
const axios = require('axios')
const cheerio = require('cheerio')
const allPlayers = require('./allplayers.json')

const getDynastyValues = async () => {
    let elements = []
    const page = await axios.get('https://keeptradecut.com/dynasty-rankings')
    let $ = cheerio.load(page.data)
    $('.onePlayer').each((index, element) => {
        let name = $(element).find('.player-name a').text()
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().replace('jr', '').replace('iii', '')
        let value = $(element).find('.value p').text()
        let team = $(element).find('.player-name span.player-team').text()
        let position = $(element).find('div.position-team p.position').text().slice(0, 2)
        const id = Object.keys(allPlayers).find(x => allPlayers[x].position === position &&
            (allPlayers[x].search_full_name === searchName ||
                (allPlayers[x].search_full_name.slice(-5, -2) === searchName.slice(-5, -2) &&
                    allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3)
                )
            )
        )
        elements.push({
            id: position === 'PI' ? searchName : id,
            name: name,
            searchName: searchName,
            position: position,
            team: team,
            value: value,
            updated_value: value
        })

    })
    return elements
}

workerpool.worker({
    getDynastyValues: getDynastyValues
})