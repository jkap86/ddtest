const express = require('express')
const path = require('path')
const app = express()
const compression = require('compression')
const cors = require('cors')
const axios = require('axios')
const workerpool = require('workerpool')
const axiosRetry = require('axios-retry')
const Fuse = require('fuse.js')

app.use(compression())
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

const getAllPlayers = async () => {
    let allplayers = await axios.get('https://api.sleeper.app/v1/players/nfl', { timeout: 3000 })
    
	app.set('allplayers', allplayers.data)
}
getAllPlayers()
setInterval(getAllPlayers, 1000 * 60 * 60 * 24)
app.get('/allplayers', async (req, res) => {
    res.send(app.settings.allplayers)
})

app.get('/user', async (req, res) => {
	const username = req.query.username
	try {
		const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`, { timeout: 3000 })
		res.send(user.data)
	} catch (error) {
		res.send(error)
	}
})
app.get('/playerinfo', async (req, res) => {
    const pool_qb_proj = workerpool.pool(__dirname + '/workerPlayerInfo.js')
	
    const [result_proj, result_dv] = await Promise.all([
		await pool_qb_proj.exec('get_proj', [app.settings.allplayers]),
		await pool_qb_proj.exec('get_dv', [app.settings.allplayers])
	])
	let result = result_proj.map(proj => {
		const value = result_dv.find(x => x.id === proj.id)
		return {
			...proj,
			value: value === undefined ? 0 : value.value,
			updated_value: value === undefined ? 0 : value.value
		}
	})
	result_dv.map(dv => {
		if (result.find(x => x.id === dv.id) === undefined) {
			result.push({
				...dv,
				fpts: 0,
				updated_fpts: 0
			})
		}
	})
    res.send(result)
})

app.get('/leagues', async (req, res) => {
	const username = req.query.username
	const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 })
	const season = state.data.league_season
	const poolLeagues = workerpool.pool(__dirname + '/workerLeagues.js')
	const result = await poolLeagues.exec('getLeagues', [username, season])
	res.send(result)
})

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`server running on port ${port}`);
});