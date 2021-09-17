import { expect } from 'chai'
import RequeRest from '../src'
import { buildUrl } from '../src/url'

describe('buildUrl', () => {
	it('no path', async () => {
		const http = new RequeRest('http://localhost')

		expect(buildUrl(http)).to.be.eq('http://localhost')
	})

	it('no path, final /', async () => {
		const http = new RequeRest('http://localhost/')

		expect(buildUrl(http)).to.be.eq('http://localhost')
	})

	it('path final /', async () => {
		const http = new RequeRest('http://localhost/')

		expect(buildUrl(http, 'hello')).to.be.eq('http://localhost/hello')
	})

	it('path initial /', async () => {
		const http = new RequeRest('http://localhost')

		expect(buildUrl(http, '/hello')).to.be.eq('http://localhost/hello')
	})

	it('path initial,final /', async () => {
		const http = new RequeRest('http://localhost/')

		expect(buildUrl(http, '/hello')).to.be.eq('http://localhost/hello')
	})

	it('path no initial,final /', async () => {
		const http = new RequeRest('http://localhost')

		expect(buildUrl(http, 'hello')).to.be.eq('http://localhost/hello')
	})

	it('whatever with query', async () => {
		const http = new RequeRest('http://localhost')

		expect(buildUrl(http, 'hello', { a: 1, b: 2 })).to.be.eq(
			'http://localhost/hello?a=1&b=2'
		)
	})
})
