import type RequeRest from './index'
import type {
	RequeRestOptions,
	QueryObject,
	QueryParamValue,
	QueryParamArrayValue,
} from './index'

export function buildQuery(requerest: RequeRest, query?: QueryObject): string {
	if (query === undefined || Object.keys(query).length === 0) return ''

	const q = Object.entries(query)
		.filter(([k, v]) => v !== undefined)
		.reduce<string>(
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

export function encodeQueryParam(
	arrayEncoding: RequeRestOptions['queryArrayEncoding'],
	k: string,
	v: QueryParamValue | QueryParamArrayValue
): string {
	return Array.isArray(v)
		? encodeQueryParamArrayValue(arrayEncoding, k, v)
		: encodeQueryParamValue(k, v)
}

export function encodeQueryParamValue(k: string, v: QueryParamValue): string {
	return v !== undefined
		? v === null
			? `${k}=null`
			: `${k}=${encodeURIComponent(v)}`
		: ''
}

export function encodeQueryParamArrayValue(
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
