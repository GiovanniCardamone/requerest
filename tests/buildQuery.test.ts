import RequeRest from '../src'
import { buildQuery } from '../src/query'

describe('buildQuery', () => {
	const http = new RequeRest('http://localhost')

	it('none', async () => {
		expect(buildQuery(http)).toBe('')
	})

	it('string', async () => {
		expect(buildQuery(http, { a: 'a', b: 'b' })).toBe('?a=a&b=b')
	})

	it('numbers', async () => {
		expect(buildQuery(http, { a: 1, b: 2 })).toBe('?a=1&b=2')
	})

	it('booleans', async () => {
		expect(buildQuery(http, { a: true, b: false })).toBe('?a=true&b=false')
	})

	it('multiple', async () => {
		expect(buildQuery(http, { a: 1, b: 'b', c: true })).toBe('?a=1&b=b&c=true')
	})

	it('undefined', async () => {
		expect(buildQuery(http, { a: undefined })).toBe('')
	})

	it('multiple undefined', async () => {
		expect(buildQuery(http, { a: undefined, b: undefined })).toBe('')
	})

	it('null', async () => {
		expect(buildQuery(http, { a: null })).toBe('?a=null')
	})

	describe('array', () => {
		describe('brackets', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'brackets',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).toBe('?a[]=b&a[]=c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).toBe('?a[]=1&a[]=2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).toBe(
					'?a[]=true&a[]=false'
				)
			})

			it('mixed', async () => {
				expect(buildQuery(http, { a: ['a', 1, true, undefined, null] })).toBe(
					'?a[]=a&a[]=1&a[]=true&a[]=null'
				)
			})
		})

		describe('comma', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'comma',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).toBe('?a=b,c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).toBe('?a=1,2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).toBe('?a=true,false')
			})

			it('mixed', async () => {
				expect(buildQuery(http, { a: ['a', 1, true, undefined, null] })).toBe(
					'?a=a,1,true,null'
				)
			})
		})

		describe('none', () => {
			const http = new RequeRest('http://localhost', {
				queryArrayEncoding: 'none',
			})

			it('string', async () => {
				expect(buildQuery(http, { a: ['b', 'c'] })).toBe('?a=b&a=c')
			})

			it('numbers', async () => {
				expect(buildQuery(http, { a: [1, 2] })).toBe('?a=1&a=2')
			})

			it('booleans', async () => {
				expect(buildQuery(http, { a: [true, false] })).toBe('?a=true&a=false')
			})

			it('mixed', async () => {
				expect(buildQuery(http, { a: ['a', 1, true, undefined, null] })).toBe(
					'?a=a&a=1&a=true&a=null'
				)
			})
		})
	})
})
