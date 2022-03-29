const express = require('express')
const path = require('path')
const app = express()
const compression = require('compression')
const cors = require('cors')
const axios = require('axios')
const workerpool = require('workerpool')
const axiosRetry = require('axios-retry')

app.use(compression())
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

axiosRetry(axios, { 
	retries: 3,
	retryCondition: (error) => {
		return error.response.status === 404
	} 
});

app.get('/nfl', async (req, res) => {
	const nfl = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 }).catch(err => console.log(err))
	res.send(nfl.data)
})

app.get('/user', async (req, res) => {
	const username = req.query.username
	try {
		const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`, { timeout: 3000 }).catch(err => console.log(err))
		res.send(user.data)
	} catch (error) {
		res.send(error)
	}
})

app.get('/dynastyvalues', async (req, res) => {
	const pool = workerpool.pool(__dirname + '/workerDV.js')
	const result = await pool.exec('getDynastyValues')
	res.send(result)
})

app.get('/leagues', async (req, res) => {
	const username = req.query.username
	const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 }).catch(err => console.log(err))
	const season = state.data.league_season
	const poolLeagues = workerpool.pool(__dirname + '/workerLeagues.js')
	const result = await poolLeagues.exec('getLeagues', [username, season])
	res.send(result)
})

app.get('/drafts', async (req, res) => {
	const username = req.query.username
	const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 }).catch(err => console.log(err))
	const season = state.data.league_season
	const poolDrafts = workerpool.pool(__dirname + '/workerDrafts.js')
	const result = await poolDrafts.exec('getDrafts', [username, season])
	res.send(result)
})

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`server running on port ${port}`);
});