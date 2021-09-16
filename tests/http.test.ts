import urlBuilder from '../src/urlBuilder'
import http from '../src/http'

// @ts-expect-error injecting node
global.fetch = require('node-fetch')

// describe('http', () => {
// 	describe('get', () => {
// 		it('should fails on unexistings url', async (done) => {
// 			const url = urlBuilder('http://unexistent')

// 			await http.get(url())

// 			done()
// 		})
// 	})
// })
