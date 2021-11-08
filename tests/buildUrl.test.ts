import RequeRest from '../src'
import { buildUrl } from '../src/url'

describe('buildUrl', () => {
	it('no path', async () => {
		const http = new RequeRest('http://localhost')

		expect(buildUrl(http)).toBe('http://localhost')
	})

	it('no path, final /', async () => {
		const http = new RequeRest('http://localhost/')

		expect(buildUrl(http)).toBe('http://localhost')
	})

	it('path final /', async () => {
		const http = new RequeRest('http://localhost/').path('hello')

		expect(buildUrl(http)).toBe('http://localhost/hello')
	})

	it('path initial /', async () => {
		const http = new RequeRest('http://localhost').path('hello')

		expect(buildUrl(http)).toBe('http://localhost/hello')
	})

	it('path initial,final /', async () => {
		const http = new RequeRest('http://localhost/').path('hello')

		expect(buildUrl(http)).toBe('http://localhost/hello')
	})

	it('path no initial,final /', async () => {
		const http = new RequeRest('http://localhost').path('hello')

		expect(buildUrl(http)).toBe('http://localhost/hello')
	})

	it('whatever with query', async () => {
		const http = new RequeRest('http://localhost')
			.path('hello')
			.query({ a: 1, b: 2 })

		expect(buildUrl(http)).toBe('http://localhost/hello?a=1&b=2')
	})
})
