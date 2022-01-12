export function encode_xwwwformurlencoded(data: {
	[key: string]: string | number
}): string {
	const formBody: string[] = []

	for (const [key, value] of Object.entries(data)) {
		formBody.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
	}

	return formBody.join('&')
}
