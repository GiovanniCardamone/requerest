import express, { Express } from 'express'
import { findFreePorts } from 'find-free-ports'
import { Server } from 'http'

import RequeRest, { RequeRestResponse } from '../src'

function buildWebApp(app: Express) {
	//
	app.get('/route/json/ok', (req, res) => {
		res.json({ test: 'ok' })
	})

	app.get('/route/json/err404', (req, res) => {
		res.status(404).json({ err: 'notfound' })
	})
}

describe('integration', () => {
	const port = 9898

	const app = express()

	buildWebApp(app)
	var server: Server | undefined = undefined

	beforeAll(() => {
		server = app.listen(port)
	})

	afterAll(() => {
		server && server.close()
	})

	describe('/route/json', () => {
		const client = new RequeRest(`http://localhost:${port}`).path('route/json')

		it('/ok get 200', async () => {
			//
			const response = await client.path('ok').get()

			expect(response.data).toEqual({ test: 'ok' })
		})

		it('/err404 get 404', async () => {
			//
			try {
				await client.path('err404').get()
			} catch (err) {
				expect((err as RequeRestResponse<any>).status)
			}
		})
	})
})
