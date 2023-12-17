/**
 *
 * @param {string[]} src;
 * @returns {RegExp}
 */
export const getExtensions = (src) => {
	const files = src
		.filter((src) => !src.startsWith("!"))
		.map((src) => {
			const [, value] = src.match(/{([^}]+)}$/) || [];
			return value;
		})
		.filter((value) => value)
		.map((types) => types.split(","))
		.flat(2)
		.map((value) => `${value}`);
	return files.length ? RegExp(`\\.(${files.join("|")})$`) : null;
};
