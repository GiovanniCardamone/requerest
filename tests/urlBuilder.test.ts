import { expect } from 'chai'
import urlBuilder from '../src/urlBuilder'

describe('urlBuilder', () => {
	it('baseUrl', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url()).to.be.equal('http://localhost')

		done()
	})

	it('baseUrl with query', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url({ foo: 'bar' })).to.be.equal('http://localhost?foo=bar')

		done()
	})

	it('baseUrl final / with query', (done) => {
		const url = urlBuilder('http://localhost/')

		expect(url({ foo: 'bar' })).to.be.equal('http://localhost?foo=bar')

		done()
	})

	it('baseUrl with path', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url('foo')).to.be.equal('http://localhost/foo')

		done()
	})

	it('baseUrl final / with path', (done) => {
		const url = urlBuilder('http://localhost/')

		expect(url('foo')).to.be.equal('http://localhost/foo')

		done()
	})

	it('baseUrl with path initial /', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url('/foo')).to.be.equal('http://localhost/foo')

		done()
	})

	it('baseUrl final / with path initial /', (done) => {
		const url = urlBuilder('http://localhost/')

		expect(url('/foo')).to.be.equal('http://localhost/foo')

		done()
	})

	it('url with query string', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url('foo', { name: 'bar' })).to.be.equal(
			'http://localhost/foo?name=bar'
		)

		done()
	})

	it('url with query number', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url('foo', { name: 42 })).to.be.equal('http://localhost/foo?name=42')

		done()
	})

	it('url with query boolean', (done) => {
		const url = urlBuilder('http://localhost')

		expect(url('foo', { name: true })).to.be.equal(
			'http://localhost/foo?name=true'
		)

		done()
	})

	it('url with query boolean #2', (done) => {
		const url = urlBuilder('http://localhost/')

		expect(url('foo', { name: false })).to.be.equal(
			'http://localhost/foo?name=false'
		)

		done()
	})

	it('url with query array', (done) => {
		const url = urlBuilder('http://localhost/')

		expect(
			url('foo', {
				strings: ['a', 'b'],
				numbers: [1, 2],
				booleans: [true, false],
			})
		).to.be.equal(
			'http://localhost/foo?strings=a&strings=b&numbers=1&numbers=2&booleans=true&booleans=false'
		)

		done()
	})

	it('url with query invalid type', (done) => {
		const url = urlBuilder('http://localhost/')

		// @ts-expect-error date isn't parsable by library
		expect(() => url('foo', { name: new Date() })).to.throw(TypeError)

		done()
	})
})
