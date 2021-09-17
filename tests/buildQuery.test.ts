import { expect } from 'chai'
import RequeRest from '../src'
import { buildQuery } from '../src/query'

describe('buildQuery', () => {
	const http = new RequeRest('http://localhost')

	it('none', async () => {
		expect(buildQuery(http)).to.be.eq('')
	})

	it('string', async () => {
		expect(buildQuery(http, { a: 'a', b: 'b' })).to.be.eq('?a=a&b=b')
	})

	it('numbers', async () => {
		expect(buildQuery(http, { a: 1, b: 2 })).to.be.eq('?a=1&b=2')
	})

	it('booleans', async () => {
		expect(buildQuery(http, { a: true, b: false })).to.be.eq('?a=true&b=false')
	})

	it('multiple', async () => {
		expect(buildQuery(http, { a: 1, b: 'b', c: true })).to.be.eq(
			'?a=1&b=b&c=true'
		)
	})

	it('undefined', async () => {
		expect(buildQuery(http, { a: undefined })).to.be.eq('')
	})

	it('null', async () => {
		expect(buildQuery(http, { a: null })).to.be.eq('?a=null')
	})

	describe('array', () => {
		describe('brackets', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'brackets',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).to.be.eq('?a[]=b&a[]=c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).to.be.eq('?a[]=1&a[]=2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).to.be.eq(
					'?a[]=true&a[]=false'
				)
			})

			it('mixed', async () => {
				expect(
					buildQuery(http, { a: ['a', 1, true, undefined, null] })
				).to.be.eq('?a[]=a&a[]=1&a[]=true&a[]=null')
			})
		})

		describe('comma', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'comma',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).to.be.eq('?a=b,c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).to.be.eq('?a=1,2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).to.be.eq('?a=true,false')
			})

			it('mixed', async () => {
				expect(
					buildQuery(http, { a: ['a', 1, true, undefined, null] })
				).to.be.eq('?a=a,1,true,null')
			})
		})

		describe('none', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'none',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).to.be.eq('?a=b&a=c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).to.be.eq('?a=1&a=2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).to.be.eq(
					'?a=true&a=false'
				)
			})

			it('mixed', async () => {
				expect(
					buildQuery(http, { a: ['a', 1, true, undefined, null] })
				).to.be.eq('?a=a&a=1&a=true&a=null')
			})
		})
	})
})
