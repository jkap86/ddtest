const workerpool = require('workerpool')
const axios = require('axios')
const cheerio = require('cheerio')

const get_QB_proj = async (allPlayers) => {
    let projections = []
    const page_QB = await axios.get('https://www.fantasypros.com/nfl/projections/qb.php')

    let $ = cheerio.load(page_QB.data)
    $('.js-tr-game-select').each((index, element) => {
        let name = $(element).find("td").first().text().trim().split(' ')
        let team = name.pop()
        let fpts = $(element).find("td").last().text()
        let position = 'QB'
        name = name.join(' ')
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().toLowerCase().replace('jr', '').replace('iii', '').replace('ii', '').trim()
        const id = Object.keys(allPlayers).find(x => allPlayers[x].position === position &&
            (allPlayers[x].search_full_name === searchName ||
                (allPlayers[x].search_full_name.slice(allPlayers[x].search_full_name.length - 5, allPlayers[x].search_full_name.length - 1) === searchName.slice(searchName.length - 5, searchName.length - 1) &&
                    allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3) && 
                        (allPlayers[x].team === null || allPlayers[x].team.slice(0, 1) === team.slice(0, 1))
                )
            )
        )

        projections.push({
            id: id,
            name: name,
            searchName: searchName,
            search_full_name: allPlayers[id] === undefined ? name : allPlayers[id].search_full_name,
            team: team,
            fpts: Number((parseFloat(fpts)/17).toFixed(2)),
            updated_fpts: Number((parseFloat(fpts)/17).toFixed(2)),
            position: position
        })
    })

    return projections
}

const get_flex_proj = async (allPlayers) => {
    let projections = []
    const page_FLEX = await axios.get('https://www.fantasypros.com/nfl/projections/flex.php?scoring=PPR')

    let $ = cheerio.load(page_FLEX.data)
    $('.js-tr-game-select').each((index, element) => {
        let name = $(element).find("td").first().text().trim().split(' ')
        let team = name.pop()
        let fpts = $(element).find("td").last().text()
        let position = $(element).find("td").eq(1).text().slice(0, 2).trim()
        name = name.join(' ')
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().replace('jr', '').replace('iii', '').replace('ii', '').trim()
        const id = Object.keys(allPlayers).find(x => allPlayers[x].position === position &&
            (allPlayers[x].search_full_name === searchName ||
                (allPlayers[x].search_full_name.slice(allPlayers[x].search_full_name.length - 5, allPlayers[x].search_full_name.length - 1) === searchName.slice(searchName.length - 5, searchName.length - 1) &&
                    allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3) && 
                        (allPlayers[x].team === null || allPlayers[x].team.slice(0, 1) === team.slice(0, 1))
                )
            )
        )
        
        projections.push({
            id: id,
            name: name,
            searchName: searchName,
            search_full_name: allPlayers[id] === undefined ? name : allPlayers[id].search_full_name,
            team: team,
            fpts: Number((parseFloat(fpts)/17).toFixed(2)),
            updated_fpts: Number((parseFloat(fpts)/17).toFixed(2)),
            position: position
        })
    })
    return projections
}

const get_dv = async (allPlayers) => {
    let dynastyvalues = []
    const page = await axios.get('https://keeptradecut.com/dynasty-rankings')

    let $ = cheerio.load(page.data)
    $('.onePlayer').each((index, element) => {
        let name = $(element).find('.player-name a').text()
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().replace('jr', '').replace('iii', '').replace('ii', '').trim()
        let value = $(element).find('.value p').text()
        let team = $(element).find('.player-name span.player-team').text()
        let position = $(element).find('div.position-team p.position').text().slice(0, 2)
        const id = Object.keys(allPlayers).find(x => allPlayers[x].position === position &&
            (allPlayers[x].search_full_name === searchName ||
                (allPlayers[x].search_full_name.slice(allPlayers[x].search_full_name.length - 5, allPlayers[x].search_full_name.length - 1) === searchName.slice(searchName.length - 5, searchName.length - 1) &&
                    allPlayers[x].search_full_name.slice(0, 3) === searchName.slice(0, 3) && 
                        (allPlayers[x].team === null || allPlayers[x].team.slice(0, 1) === team.slice(0, 1))
                )
            )
        )

        dynastyvalues.push({
            id: position === 'PI' ? searchName : id,
            name: name,
            position: position,
            team: team,
            value: parseInt(value),
            updated_value: parseInt(value)
        })
    })
    return dynastyvalues
}

workerpool.worker({
    get_QB_proj: get_QB_proj,
    get_flex_proj: get_flex_proj,
    get_dv: get_dv
})