import { HttpError, GenericHttpError, errors } from 'http-class'
import type { Url } from './urlBuilder'

type RequestInfoNoMode = Omit<RequestInfo, 'mode'>

function buildHttpError(error: HttpError): HttpError {
	const klass = errors.find(e => e.CODE === error.code)

	if (klass) {
		return new klass(error.mesg, error.data)
	}

	return new GenericHttpError(error.code, error.name, error.mesg, error.data)
}

async function call(input: RequestInfo, init?: RequestInit) {
	try {
		return await fetch(input, init)
	} catch (error) {
		throw (error instanceof TypeError)
			? error
			: buildHttpError(await error.json())
}

export default {
	async get(url: Url) {
		return fetch(url)
	},
	async put(url: Url) {},
	async post(url: Url) {},
	async patch(url: Url) {},
	async delete(url: Url) {},
	async head(url: Url) {},
	async options(url: Url) {},
	async call(method: string, url: Url) {},
}
