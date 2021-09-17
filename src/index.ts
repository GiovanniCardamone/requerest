import { MissingDecoderError, MissingEncoderError } from './errors'
import { parseResponse } from './response'
import { buildUrl, clearBaseUrl, clearPath } from './url'

const f =
	typeof window !== 'undefined'
		? window.fetch
		: typeof global.fetch !== 'undefined'
		? global.fetch
		: require('node-fetch')

export interface RequeRestOptions {
	queryArrayEncoding?: 'none' | 'brackets' | 'comma'
	headers?: HeadersObject
	query?: QueryObject
	encode?: string
	decode?: string
	encoders?: {
		[key: string]: (stream: ReadableStream) => any
	}
	decoders?: {
		[key: string]: (stream: ReadableStream) => any
	}
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
	text: String,
	json: JSON.stringify,
}

const defaultDecoders: RequeRestOptions['decoders'] = {
	text: String,
	json: JSON.stringify,
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

	query(query: QueryObject) {
		return new RequeRest(this.baseUrl, {
			...this.options,
			query: { ...this.query, ...query },
		})
	}

	encode(type: NonNullable<RequeRestOptions['encode']>) {
		if (type in this.options.encoders === false) {
			throw new MissingEncoderError(this, type)
		}

		return new RequeRest(this.baseUrl, {
			...this.options,
			encode: type,
		})
	}

	decode(type: NonNullable<RequeRestOptions['decode']>) {
		if (type in this.options.decoders === false) {
			throw new MissingDecoderError(this, type)
		}

		return new RequeRest(this.baseUrl, {
			...this.options,
			decode: type,
		})
	}

	path(path: UrlPath) {
		return new RequeRest(
			`${clearBaseUrl(this.baseUrl)}${clearPath(path)}` as BaseUrl,
			{ ...this.options }
		)
	}

	async get<T = unknown>(urlPath: UrlPath): Promise<T> {
		return await parseResponse<T>(this, await f(buildUrl(this, urlPath)))
	}

	// put<T>(path: UrlPath, body: unknown): T {}
	// patch<T>(path: UrlPath, body: unknown): T {}
	// post<T>(path: UrlPath, body: unknown): T {}
	// delete<T>(path: UrlPath, body: unknown): T {}
	// call<T>(method: string, path: UrlPath, body: unknkiwn): T {}
}
