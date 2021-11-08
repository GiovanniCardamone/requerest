import type RequeRest from './index'
import type { QueryObject } from './index'

import { buildQuery } from './query'

export function buildUrl(requerest: RequeRest): string {
	return `${clearBaseUrl(requerest.baseUrl)}${buildQuery(
		requerest,
		requerest.options.query
	)}`
}

export function clearBaseUrl(baseUrl: string) {
	return baseUrl.endsWith('/') ? baseUrl.substr(0, baseUrl.length - 1) : baseUrl
}

export function clearPath(path?: string | number): string {
	return typeof path === 'undefined'
		? ''
		: typeof path === 'number'
		? clearPath(String(path))
		: path.startsWith('/')
		? path
		: `/${path}`
}
