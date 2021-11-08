import { encodeBody } from './encode'
import type { RequeRestResponse } from './response'
import { parseResponse } from './response'
import { buildUrl, clearBaseUrl, clearPath } from './url'
import { fromWindowOrNode } from './utils'

const f = fromWindowOrNode('fetch', 'node-fetch')

export class MissingEncoderError extends Error {
	constructor(requerest: RequeRest, type: RequeRestOptions['encode']) {
		super(
			`parser error: no encoder "${type}", availables: ${Object.keys(
				requerest.options.decoders ?? []
			)}`
		)
	}
}

export class MissingDecoderError extends Error {
	constructor(requerest: RequeRest, type: RequeRestOptions['encode']) {
		super(
			`parser error: no decoder ${type}, availables: ${Object.keys(
				requerest.options.encoders ?? []
			)}`
		)
	}
}

export interface RequeRestOptions {
	/**
	 * test
	 */
	queryArrayEncoding?: 'none' | 'brackets' | 'comma'

	/**
	 *
	 */
	headers?: HeadersObject

	/**
	 *
	 */
	query?: QueryObject

	/**
	 *
	 */
	encode?: string

	/**
	 *
	 */
	decode?: string

	/**
	 *
	 */
	encoders?: {
		[key: string]: (data: any) => RequestInit['body']
	}

	/**
	 *
	 */
	decoders?: {
		[key: string]: (response: Response) => any
	}

	errorDecode?: string
}

export interface HeadersObject {
	[key: string]: string
}

export interface QueryObject {
	[key: string]: QueryParamValue | QueryParamArrayValue
}

export type QueryParamValue = string | number | boolean | null | undefined
export type QueryParamArrayValue = Array<QueryParamValue>

export type BaseUrl = `http://${string}` | `https://${string}`
export type UrlPath = string

const defaultEncoders: RequeRestOptions['encoders'] = {
	'text/plain': String,
	'application/json': JSON.stringify,
}

const defaultDecoders: RequeRestOptions['decoders'] = {
	'text/plain': async (data) => await data.text(),
	'application/json': async (data) => await data.json(),
}

export default class RequeRest {
	readonly options: Required<RequeRestOptions>

	constructor(readonly baseUrl: string, options?: RequeRestOptions) {
		this.options = {
			...{
				queryArrayEncoding: options?.queryArrayEncoding || 'none',
				headers: {
					...options?.headers,
				},
				query: {
					...options?.query,
				},
				encode: options?.encode || 'application/json',
				decode: options?.decode || 'application/json',
				encoders: { ...defaultEncoders },
				decoders: { ...defaultDecoders },
				errorDecode: options?.errorDecode || 'application/json',
			},
			...{
				...options,
				encoders: {
					...defaultEncoders,
					...options?.encoders,
				},
				decoders: {
					...defaultDecoders,
					...options?.decoders,
				},
			},
		}
	}

	/**
	 *
	 * @returns
	 */
	config(options: RequeRestOptions) {
		return new RequeRest(this.baseUrl, {
			...this.options,
			...options,
		})
	}

	/**
	 *
	 * @param headers
	 * @returns
	 */
	with(...headers: Array<HeadersObject | (() => HeadersObject)>) {
		const resolvedHeaders = headers
			.map((h) => (typeof h === 'function' ? h() : h))
			.reduce(
				(a, h) => ({
					...a,
					...h,
				}),
				{} as HeadersObject
			)

		return new RequeRest(this.baseUrl, {
			...this.options,
			headers: {
				...this.options.headers,
				...resolvedHeaders,
			},
		})
	}

	/**
	 *
	 * @param query
	 * @returns
	 */
	query(query: QueryObject) {
		return new RequeRest(this.baseUrl, {
			...this.options,
			query: { ...this.query, ...query },
		})
	}

	/**
	 *
	 * @param type
	 * @returns
	 */
	encode(type: NonNullable<RequeRestOptions['encode']>) {
		if (type in this.options.encoders === false) {
			throw new MissingEncoderError(this, type)
		}

		return new RequeRest(this.baseUrl, {
			...this.options,
			encode: type,
			headers: {
				...this.options.headers,
				'Content-Type': type,
			},
		})
	}

	/**
	 *
	 * @param type
	 * @returns
	 */
	decode(type: NonNullable<RequeRestOptions['decode']>) {
		if (type in this.options.decoders === false) {
			throw new MissingDecoderError(this, type)
		}

		return new RequeRest(this.baseUrl, {
			...this.options,
			decode: type,
			headers: {
				...this.options.headers,
				Accept: type,
			},
		})
	}

	/**
	 *
	 * @param path
	 * @returns
	 */
	path(path: UrlPath) {
		return new RequeRest(
			`${clearBaseUrl(this.baseUrl)}${clearPath(path)}` as BaseUrl,
			{ ...this.options }
		)
	}

	/**
	 *
	 * @param urlPath
	 * @returns
	 */
	async get<T = unknown>(): Promise<RequeRestResponse<T>> {
		return await parseResponse<T>(
			this,
			await f(buildUrl(this), {
				method: 'get',
				headers: this.options.headers,
			})
		)
	}

	async put<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await parseResponse<T>(
			this,
			await f(this.baseUrl, {
				method: 'put',
				headers: this.options.headers,
				body: encodeBody(this, body),
			})
		)
	}

	async patch<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await parseResponse<T>(
			this,
			await f(this.baseUrl, {
				method: 'patch',
				headers: this.options.headers,
				body: encodeBody(this, body),
			})
		)
	}

	async post<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await parseResponse<T>(
			this,
			await f(this.baseUrl, {
				method: 'post',
				headers: this.options.headers,
				body: encodeBody(this, body),
			})
		)
	}

	async delete<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await parseResponse<T>(
			this,
			await f(this.baseUrl, {
				method: 'delete',
				headers: this.options.headers,
				body: encodeBody(this, body),
			})
		)
	}

	// async call<T = unknown>(
	// 	method: string,
	// 	path: UrlPath,
	// 	body: unknown
	// ): Promise<RequeRestResponse<T>> {}
}

export { RequeRestResponse }
