/**
 * @param {(request:Request)=>any} callback
 */
export const middleware = (callback) => {
	middleware.current = callback;
};
/**
 *
 * @param {Request} request
 * @returns {Promise<any>}
 */
middleware.current = (request) => {
	request;
};
/**
 *
 * @param {string} path
 * @param {*} data
 * @param {bool} isForm
 * @returns
 */
export const action = async (path, data, isForm) => {
	const request = new Request(path, {
		method: "POST",
		body: isForm
			? Object.entries(data).reduce((form, [prop, value]) => {
					form.append(prop, value);
					return form;
			  }, new FormData())
			: JSON.stringify(data),
	});

	await middleware.current(request);

	return fetch(request).then((res) => res.json());
};
