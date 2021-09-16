export type Protocol = 'http' | 'https'
export type BaseUrl = `${Protocol}://${string}`

export type Query = { [key: string]: QueryValue | QueryValue[] }
export type QueryValue = string | number | boolean

export type Url = `${BaseUrl}${string}`

function clearBase(base: string): Url {
	return (base.endsWith('/') ? base.substr(0, base.length - 1) : base) as Url
}

function joinPath(base: string, path?: string): Url {
	const b = clearBase(base)

	return path === undefined
		? b
		: path.startsWith('/')
		? `${b}${path}`
		: `${b}/${path}`
}

function createQuery(query?: Query): string {
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
	return function url(path?: string | Query, query?: Query) {
		return path === undefined
			? joinPath(baseUrl)
			: typeof path === 'string'
			? (`${joinPath(baseUrl, path)}${createQuery(query)}` as Url)
			: typeof path === 'object'
			? (`${joinPath(baseUrl)}${createQuery(path)}` as Url)
			: (`${joinPath(baseUrl)}${createQuery(query)}` as Url)
	}
}
