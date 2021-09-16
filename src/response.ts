import { errors } from 'http-class'

export async function validate(response: Response): Promise<void> {
	if (response.status >= 400) {
		const HttpErrorClass = errors.find(
			(klass) => klass.CODE === response.status
		)

		if (HttpErrorClass !== undefined) {
			throw new HttpErrorClass(await response.json())
		}

		throw new TypeError(await response.text())
	}
}

export async function jsonResponse<T>(response: Response): Promise<T> {
	await validate(response)

	return await response.json()
}

export async function blobResponse(response: Response): Promise<Blob> {
	await validate(response)

	return await response.blob()
}

export async function textResponse(response: Response): Promise<string> {
	await validate(response)

	return await response.text()
}

export async function emtyResponse(response: Response): Promise<void> {
	await validate(response)
}
