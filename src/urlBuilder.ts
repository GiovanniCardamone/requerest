export type Protocol = 'http' | 'https'
export type BaseUrl = `${Protocol}://${string}`

export type Query = { [key: string]: QueryValue | QueryValue[] }
export type QueryValue = string | number | boolean

function joinPath(base: string, path?: string) {
	return path === undefined
		? base
		: base.endsWith('/') && path.startsWith('/')
		? `${base}${path.substr(1)}`
		: base.endsWith('/') || path.startsWith('/')
		? `${base}${path}`
		: `${base}/${path}`
}

function createQuery(query?: Query) {
	return query === undefined
		? ''
		: Object.entries(query).reduce((acc, [key, value]) => {
				return Array.isArray(value)
					? joinQuery(
							acc,
							value.map((v) => `${key}=${queryValue(v)}`).join('&')
					  )
					: joinQuery(acc, `${key}=${queryValue(value)}`)
		  }, '?')
}

function queryValue(value: QueryValue): string {
	switch (typeof value) {
		case 'string':
			return value
		case 'number':
			return value.toString()
		case 'boolean':
			return value ? 'true' : 'false'
		default:
			throw new TypeError(
				`unable to parse value ${value} of type ${typeof value}`
			)
	}
}

function joinQuery(prev: string, curr: string) {
	return `${prev}${prev === '?' ? '' : '&'}${curr}`
}

export default function urlBuilder(baseUrl: BaseUrl) {
	return function url(path?: string, query?: Query) {
		return `${joinPath(baseUrl, path)}${createQuery(query)}`
	}
}
