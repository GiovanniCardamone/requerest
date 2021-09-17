import type RequeRest from '.'
import type { QueryObject } from '.'

import { buildQuery } from './query'

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

export function clearBaseUrl(baseUrl: string) {
	return baseUrl.endsWith('/') ? baseUrl.substr(0, baseUrl.length - 1) : baseUrl
}

export function clearPath(path?: string) {
	return typeof path === 'undefined'
		? ''
		: path.startsWith('/')
		? path
		: `/${path}`
}
