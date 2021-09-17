import sinon from 'sinon'
import { expect } from 'chai'
import RequeRest from '../src'
import { MissingDecoderError, MissingEncoderError } from '../src/errors'

before(async () => {
	global.fetch = require('node-fetch')
	sinon.stub(global, 'fetch')
})

describe('ResqueRest', () => {
	describe('basic', () => {
		it('base encode application/json', async () => {
			const http = new RequeRest('http://localhost', {})

			expect(http.options.encode).to.be.eq('application/json')
		})

		it('base decode application/json', async () => {
			const http = new RequeRest('http://localhost', {})

			expect(http.options.decode).to.be.eq('application/json')
		})
	})

	describe('with', () => {
		const http = new RequeRest('http://localhost')

		it('one object', async () => {
			const t = http.with({ a: '1' })

			expect(t.options.headers).to.deep.equal({
				a: '1',
			})
		})

		it('multiple object', async () => {
			const t = http.with({ a: '1' }, { b: '2' })

			expect(t.options.headers).to.deep.equal({
				a: '1',
				b: '2',
			})
		})

		it('one function', async () => {
			const t = http.with(() => ({ a: '1' }))

			expect(t.options.headers).to.deep.equal({
				a: '1',
			})
		})

		it('multiple function', async () => {
			const t = http.with(
				() => ({ a: '1' }),
				() => ({ b: '2' })
			)

			expect(t.options.headers).to.deep.equal({
				a: '1',
				b: '2',
			})
		})

		it('object, function mixed', async () => {
			const t = http.with({ a: '1' }, () => ({ b: '2' }))

			expect(t.options.headers).to.deep.equal({
				a: '1',
				b: '2',
			})
		})

		describe('query', () => {
			const http = new RequeRest('http://localhost')

			it('no query', async () => {
				const t = http

				expect(t.options.query).to.deep.eq({})
			})

			it('one query', async () => {
				const t = http.query({ a: 1 })

				expect(t.options.query).to.deep.eq({ a: 1 })
			})
		})

		describe('encode', () => {
			const http = new RequeRest('http://localhost', {
				encoders: {
					'application/xml': String,
				},
			})

			it('should raise exception on missing encoder', async () => {
				expect(() => http.encode('application/doesnotexists')).to.throws(
					MissingEncoderError
				)
			})

			it('should let use custom encoder', async () => {
				const t = http.encode('application/xml')

				expect(t.options.encode).to.be.eq('application/xml')
			})
		})

		describe('decode', () => {
			const http = new RequeRest('http://localhost', {
				decoders: {
					'application/xml': String,
				},
			})

			it('should raise exception on missing decoder', async () => {
				expect(() => http.decode('application/doesnotexists')).to.throws(
					MissingDecoderError
				)
			})

			it('should let use custom decoder', async () => {
				const t = http.decode('application/xml')

				expect(t.options.decode).to.be.eq('application/xml')
			})
		})

		describe('path', () => {
			const http = new RequeRest('http://localhost')

			it('single', async () => {
				const t = http.path('test')
				expect(t.baseUrl).to.be.eq('http://localhost/test')
			})

			it('multiple', async () => {
				const t = http.path('test')
				const tt = t.path('test')

				expect(tt.baseUrl).to.be.eq('http://localhost/test/test')
			})

			it('single slash', async () => {
				const t = http.path('/test')

				expect(t.baseUrl).to.be.eq('http://localhost/test')
			})

			it('multiple slash', async () => {
				const t = http.path('/test')
				const tt = t.path('/test')

				expect(tt.baseUrl).to.be.eq('http://localhost/test/test')
			})
		})
	})

	// describe('parser', () => {
	// 	const http = new RequeRest('http://myserver.com', {
	// 		encoders: {
	// 			'application/xml': console.log,
	// 		},
	// 		decoders: {
	// 			'application/xml': (stream) => console.log,
	// 		},
	// 	})
	// })

	// describe('combined', () => {
	// 	it('combined url path query headers', async () => {
	// 		const http = new RequeRest('http://server.com')

	// 		// const resp = await http
	// 		// 	.with({ Authorization: 'X' })
	// 		// 	.query({ a: 1 })
	// 		// 	.get('foo')
	// 	})
	// })
})
