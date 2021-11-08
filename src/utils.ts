/**
 * retrive from window or npm module
 *
 * @param name window object name
 * @param moduleName module name
 * @returns module from Window[name] or require(name)
 */
export function fromWindowOrNode<K extends keyof Window>(
	name: K,
	moduleName: string
): Window[K] | never {
	if (typeof window !== 'undefined') {
		// browser
		if (typeof window[name] === 'undefined') {
			throw new Error(
				`(Browser): 'window.${name}' is not in browser, should be polyfilled ?`
			)
		}

		return window[name]
	} else {
		// node

		// @ts-expect-error node cannot infer this
		if (typeof global[name] !== 'undefined') {
			// @ts-expect-error node cannot infer this
			return global[name] as Window[K]
		}

		try {
			return require(moduleName)
		} catch (e) {
			console.error(e)
			throw new Error(`(Node): did you forget to install '${moduleName}' ?`)
		}
	}
}
