import RequeRest from '../src'
import { parseResponse } from '../src/response'

import { Readable } from 'stream'
import { STATUS_CODES } from 'http'
import { fromWindowOrNode } from '../src/utils'

const D = fromWindowOrNode<typeof window.DOMParser>(
	'DOMParser',
	'xmldom',
	'DOMParser'
)
const H = fromWindowOrNode<typeof window.Headers>(
	'Headers',
	'node-fetch',
	'Headers'
)

console.log({ D, H })

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

	// function arrayBuffer(): Promise<ArrayBuffer> {
	// 	useBody()

	// 	const arrayBuffer = new ArrayBuffer(data.length)

	// 	for (let i = 0; i < data.length; i++) {
	// 		// @ts-check
	// 		arrayBuffer[i] = data.charCodeAt(i)
	// 	}

	// 	return Promise.resolve(arrayBuffer)
	// }

	// function blob(): Promise<Blob> {
	// 	useBody()

	// 	return Promise.resolve()
	// }

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
		statusText: STATUS_CODES[status] as string,
		redirected: false,
		headers: new H(),
		url,
		ok: status >= 200 && status < 300,
		type: 'basic',
		bodyUsed,
		// @ts-expect-error oka
		body,
		// arrayBuffer,
		// blob,
		clone,
		formData,
		json,
		text,
	}
}

// function createMockResponseError() {}

describe('parseResponse', () => {
	describe('valid', () => {
		it('application/json', async () => {
			const http = new RequeRest('http://localhost')
			const resp = await parseResponse<any>(
				http,
				createMockResponse(http.baseUrl, 200, '{ "status": "ok" }')
			)

			expect(resp.status).toBe(200)
			expect(resp.data).toEqual({ status: 'ok' })
		})

		it('text/plain', async () => {
			const http = new RequeRest('http://localhost').decode('text/plain')

			const resp = await parseResponse<string>(
				http,
				createMockResponse(http.baseUrl, 200, '{ "status": "ok" }')
			)

			expect(resp.status).toBe(200)
			expect(resp.data).toBe('{ "status": "ok" }')
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

			expect(resp.status).toBe(200)
			expect(resp.data.firstChild?.nodeValue).toBe('{ "status": "ok" }')
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
