import {
	MissingDecoderError,
	MissingEncoderError,
	UnparsableResponseError,
} from './errors'

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

interface HeadersObject {
	[key: string]: string | number
}

interface QueryObject {
	[key: string]: QueryParamValue | QueryParamArrayValue
}

type QueryParamValue = string | number | boolean | null | undefined
type QueryParamArrayValue = Array<QueryParamValue>

type BaseUrl = `http://${string}` | `https://${string}`
type UrlPath = string

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

export function buildUrl(
	requerest: RequeRest,
	path?: string,
	query?: QueryObject
): string {
	return `${clearBaseUrl(requerest.baseUrl)}${clearPath(path)}${buildQuery(
		requerest,
		query
	)}`
}

function clearBaseUrl(baseUrl: string) {
	return baseUrl.endsWith('/') ? baseUrl.substr(0, baseUrl.length - 1) : baseUrl
}

function clearPath(path?: string) {
	return typeof path === 'undefined'
		? ''
		: path.startsWith('/')
		? path
		: `/${path}`
}

export function buildQuery(requerest: RequeRest, query?: QueryObject): string {
	if (query === undefined || Object.keys(query).length === 0) return ''

	const q = Object.entries(query).reduce<string>(
		(a, [k, v]) =>
			`${a}${a.length === 0 ? '?' : '&'}${encodeQueryParam(
				requerest.options.queryArrayEncoding,
				k,
				v
			)}`,
		''
	)

	return q.length === 1 ? '' : q
}

function encodeQueryParam(
	arrayEncoding: RequeRestOptions['queryArrayEncoding'],
	k: string,
	v: QueryParamValue | QueryParamArrayValue
): string {
	return Array.isArray(v)
		? encodeQueryParamArrayValue(arrayEncoding, k, v)
		: encodeQueryParamValue(k, v)
}

function encodeQueryParamValue(k: string, v: QueryParamValue): string {
	return v !== undefined ? `${k}=${String(v)}` : ''
}

function encodeQueryParamArrayValue(
	arrayEncoding: RequeRestOptions['queryArrayEncoding'],
	k: string,
	v: QueryParamArrayValue
): string {
	switch (arrayEncoding) {
		default:
		case 'none': {
			return v
				.filter((e) => e !== undefined)
				.map((e) => `${k}=${e}`)
				.join('&')
		}

		case 'brackets': {
			return v
				.filter((e) => e !== undefined)
				.map((e) => `${k}[]=${String(e)}`)
				.join('&')
		}

		case 'comma': {
			return `${k}=${v
				.filter((e) => e !== undefined)
				.map(String)
				.join(',')}`
		}
	}
}

export async function parseResponse<T>(
	requerest: RequeRest,
	response: Response
): Promise<T> {
	if (response.status >= 200 && response.status < 300) {
		if (
			requerest.options.decode === undefined ||
			response.headers
				.get('content-type')
				?.toLowerCase()
				.startsWith(requerest.options.decode?.toLocaleLowerCase()) === false
		) {
			throw new UnparsableResponseError(requerest, response)
		}

		return requerest.options.decoders[requerest.options.decode] as unknown as T
	}

	throw new Error(await response.text())
}
