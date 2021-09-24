import { parseError } from './errors'
import { parseResponse } from './response'
import { buildUrl, clearBaseUrl, clearPath } from './url'
import type { RequeRestResponse } from './response'

const f =
	typeof window !== 'undefined'
		? window.fetch
		: typeof global.fetch !== 'undefined'
		? global.fetch
		: require('node-fetch')

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
			`parser error: no decoder "${type}", availables: ${Object.keys(
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
	[key: string]: string | number
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

	constructor(readonly baseUrl: BaseUrl, options?: RequeRestOptions) {
		this.options = {
			...{
				queryArrayEncoding: 'none',
				headers: {},
				query: {},
				encode: 'application/json',
				decode: 'application/json',
				encoders: { ...defaultEncoders },
				decoders: { ...defaultDecoders },
				errorDecode: 'application/json',
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
	async get<T = unknown>(urlPath?: UrlPath): Promise<RequeRestResponse<T>> {
		try {
			return await parseResponse<T>(this, await f(buildUrl(this, urlPath)))
		} catch (error) {
			return await parseError(this, error)
		}
	}

	// put<T>(path: UrlPath, body: unknown): T {}
	// patch<T>(path: UrlPath, body: unknown): T {}
	// post<T>(path: UrlPath, body: unknown): T {}
	// delete<T>(path: UrlPath, body: unknown): T {}
	// call<T>(method: string, path: UrlPath, body: unknkiwn): T {}
}
