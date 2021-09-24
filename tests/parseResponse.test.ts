import { expect } from 'chai'
import RequeRest from '../src'
import { parseResponse } from '../src/response'

import { Readable } from 'stream'
import { STATUS_CODES } from 'http'
import { Headers } from 'node-fetch'

const D =
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	typeof window !== 'undefined' ? window.DOMParser : require('xmldom').DOMParser

function createMockResponse(
	url: string,
	status: number,
	data: string
): Response {
	let bodyUsed = false

	function useBody() {
		if (bodyUsed) {
			throw new Error('cannot clone body after it is used')
		}

		bodyUsed = true
	}

	function body(): ReadableStream<Uint8Array> {
		useBody()

		const stream = new Readable()
		// eslint-disable-next-line
		stream._read = function () {}
		stream.push(data)
		stream.push(null)

		return stream as unknown as ReadableStream<Uint8Array>
	}

	function arrayBuffer(): Promise<ArrayBuffer> {
		useBody()

		const arrayBuffer = new ArrayBuffer(data.length)

		for (let i = 0; i < data.length; i++) {
			arrayBuffer[i] = data.charCodeAt(i)
		}

		return Promise.resolve(arrayBuffer)
	}

	function blob(): Promise<Blob> {
		useBody()

		return
	}

	function clone() {
		return createMockResponse(url, status, data)
	}

	function formData(): Promise<FormData> {
		useBody()

		const formData = new FormData()

		return Promise.resolve(formData)
	}

	function json(): Promise<any> {
		useBody()

		return Promise.resolve(JSON.parse(data))
	}

	function text(): Promise<string> {
		useBody()

		return Promise.resolve(data)
	}

	return {
		status,
		statusText: STATUS_CODES[status],
		redirected: false,
		headers: new Headers(),
		url,
		ok: status >= 200 && status < 300,
		type: 'basic',
		bodyUsed,
		// @ts-expect-error oka
		body,
		arrayBuffer,
		blob,
		clone,
		formData,
		json,
		text,
	}
}

describe('parseResponse', () => {
	describe('valid', () => {
		it('application/json', async () => {
			const http = new RequeRest('http://localhost')
			const resp = await parseResponse<any>(
				http,
				createMockResponse(http.baseUrl, 200, '{ "status": "ok" }')
			)

			expect(resp.status).to.be.equal(200)
			expect(resp.data).to.deep.equal({ status: 'ok' })
		})

		it('text/plain', async () => {
			const http = new RequeRest('http://localhost').decode('text/plain')

			const resp = await parseResponse<string>(
				http,
				createMockResponse(http.baseUrl, 200, '{ "status": "ok" }')
			)

			expect(resp.status).to.be.equal(200)
			expect(resp.data).to.deep.equal('{ "status": "ok" }')
		})

		it('application/xml', async () => {
			const http = new RequeRest('http://localhost', {
				decode: 'application/xml',
				decoders: {
					'application/xml': async (data) =>
						new D().parseFromString(await data.text(), 'application/xml'),
				},
			})

			const resp = await parseResponse<
				ReturnType<DOMParser['parseFromString']>
			>(http, createMockResponse(http.baseUrl, 200, '{ "status": "ok" }'))

			expect(resp.status).to.be.equal(200)
			expect(resp.data.firstChild.nodeValue).to.deep.equal('{ "status": "ok" }')
		})
	})

	describe('errors', () => {
		// const http = new RequeRest('http://localhost')
		// it('should throw error on Http status !== 200', async () => {
		// 	expect(
		// 		async () => await parseResponse(http, { status: 400 } as Response)
		// 	).to.throw(Error)
		// })
	})
})
