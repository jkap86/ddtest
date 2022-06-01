const workerpool = require('workerpool')
const axios = require('axios')
const cheerio = require('cheerio')
const Fuse = require('fuse.js')

const get_proj = async (allPlayers) => {
    const ap = Object.keys(allPlayers).map(player => {
        if (['QB', 'RB', 'WR', 'TE'].includes(allPlayers[player].position)) {
            return allPlayers[player]
        }
    })
    const options = {
        includeScore: true,
        keys: ['search_full_name', 'position', 'team']
    }
    const fuse = new Fuse(ap, options)
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

        const id_qb = fuse.search({
            $or: [{ search_full_name: searchName }, { position: position }, { team: team }]
        })
        projections.push({
            id: id_qb[0].item.player_id,
            name: name,
            searchName: searchName,
            search_full_name: allPlayers[id_qb] === undefined ? name : allPlayers[id_qb].search_full_name,
            team: team,
            fpts: Number((parseFloat(fpts) / 17).toFixed(2)),
            updated_fpts: Number((parseFloat(fpts) / 17).toFixed(2)),
            position: position
        })
    })




    const page_FLEX = await axios.get('https://www.fantasypros.com/nfl/projections/flex.php?scoring=PPR')

    $ = cheerio.load(page_FLEX.data)
    $('.js-tr-game-select').each((index, element) => {
        let name = $(element).find("td").first().text().trim().split(' ')
        let team = name.pop()
        let fpts = $(element).find("td").last().text()
        let position = $(element).find("td").eq(1).text().slice(0, 2).trim()
        name = name.join(' ')
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().replace('jr', '').replace('iii', '').replace('ii', '').trim()
        const id_flex = fuse.search({
            $or: [{ search_full_name: searchName }, { team: team }]
        })

        projections.push({
            id: id_flex[0].item.player_id,
            name: name,
            searchName: searchName,
            search_full_name: allPlayers[id_flex] === undefined ? name : allPlayers[id_flex].search_full_name,
            team: team,
            fpts: Number((parseFloat(fpts) / 17).toFixed(2)),
            updated_fpts: Number((parseFloat(fpts) / 17).toFixed(2)),
            position: position
        })
    })
    return projections
}

const get_dv = async (allPlayers) => {
    const ap = Object.keys(allPlayers).map(player => {
        if (allPlayers[player].status === 'Active' &&
            ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[player].position)) {
            return allPlayers[player]
        }
    })
    const options = {
        includeScore: true,
        keys: ['search_full_name', 'position', 'team']
    }
    const fuse = new Fuse(ap, options)

    let dynastyvalues = []
    const page = await axios.get('https://keeptradecut.com/dynasty-rankings')

    let $ = cheerio.load(page.data)
    $('.onePlayer').each((index, element) => {
        let name = $(element).find('.player-name a').text()
        let searchName = name.replace(/[^0-9a-z]/gi, '').toLowerCase().replace('jr', '').replace('iii', '').replace('ii', '').trim()
        let value = $(element).find('.value p').text()
        let team = $(element).find('.player-name span.player-team').text()
        let position = $(element).find('div.position-team p.position').text().slice(0, 2)

        const dv = fuse.search({
            $or: [{ search_full_name: searchName }, { position: position }, { team: team }]
        })

            dynastyvalues.push({
                id: position === 'PI' ? searchName : dv[0].item.player_id,
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
    get_proj: get_proj,
    get_dv: get_dv
})