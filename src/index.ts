import { encodeBody } from './encode'
import { UnprocessableRequestError } from './errors'
import type { RequeRestResponse } from './response'
import { parseResponse } from './response'
import { buildUrl, clearBaseUrl, clearPath } from './url'
import { fromWindowOrNode } from './utils'

const f = fromWindowOrNode<typeof fetch>('fetch', 'node-fetch')

type CheckBeforeFn = () => Error | string | false | undefined

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

	checkBefore?: CheckBeforeFn
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

type PickOmitOptions<K extends keyof RequeRestOptions> = Omit<
	Required<RequeRestOptions>,
	K
> &
	Pick<RequeRestOptions, K>

export default class RequeRest {
	readonly options: PickOmitOptions<'checkBefore'>

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
				checkBefore: options?.checkBefore,
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

	checkBefore(checkBeforeFn: CheckBeforeFn) {
		return new RequeRest(this.baseUrl, {
			...this.options,
			checkBefore: checkBeforeFn,
		})
	}

	/**
	 *
	 * @param urlPath
	 * @returns
	 */
	async get<T = unknown>(): Promise<RequeRestResponse<T>> {
		return await this.call('get', this.options.headers)
	}

	async put<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await this.call('put', this.options.headers, body)
	}

	async patch<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await this.call('patch', this.options.headers, body)
	}

	async post<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await this.call('post', this.options.headers, body)
	}

	async delete<T = unknown>(body?: unknown): Promise<RequeRestResponse<T>> {
		return await this.call('delete', this.options.headers, body)
	}

	private async call<T = unknown>(
		method: string,
		headers: HeadersObject,
		body?: any
	): Promise<RequeRestResponse<T>> {
		if (this.options.checkBefore !== undefined) {
			const check = this.options.checkBefore()

			if (typeof check === 'string' && check.length) {
				throw new UnprocessableRequestError(
					typeof check === 'string' ? check : 'did not passs checkBefore'
				)
			} else if (check instanceof Error) {
				throw check
			}
		}

		return await parseResponse<T>(
			this,
			await f(buildUrl(this), {
				method,
				headers,
				body: encodeBody(this, body),
			})
		)
	}
}

export { RequeRestResponse }
