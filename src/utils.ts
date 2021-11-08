/**
 * retrive from window or npm module
 *
 * @param name window object name
 * @param moduleName module name
 * @returns module from Window[name] or require(name)
 */
export function fromWindowOrNode<K>(
	name: string,
	moduleName: string,
	moduleItem?: string
): K | never {
	if (typeof window !== 'undefined') {
		// browser
		if (typeof window[name as keyof Window] === 'undefined') {
			throw new Error(
				`(Browser): 'window.${name}' is not in browser, should be polyfilled ?`
			)
		}

		return window[name as keyof Window]
	} else {
		// node

		// @ts-expect-error node cannot infer this
		if (typeof global[name] !== 'undefined') {
			// @ts-expect-error node cannot infer this
			return global[name] as Window[K]
		}

		try {
			// eslint-disable-next-line
			const module = require(moduleName)
			return moduleItem ? module[moduleItem] : module
		} catch (e) {
			console.error(e)
			throw new Error(`(Node): did you forget to install '${moduleName}' ?`)
		}
	}
}
