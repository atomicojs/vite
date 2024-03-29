import { load } from "@atomico/cloudflare";
/**
 *
 * @param {import("@cloudflare/workers-types").EventContext<any,any,any>} context
 * @returns
 */
export async function onRequestPost(context) {
	const { request } = context;
	const [, search] = request.url.split("?");
	const params = Object.fromEntries(new URLSearchParams(search));

	if (!params.id || !params.use)
		return new Response("{}", {
			status: 404,
			headers: { "Content-Type": "application/json;charset=utf-8" },
		});

	const file = atob(params.id.toString());

	const module = await import(`./_/${file}`);

	const isFormData = request.headers
		.get("Content-Type")
		.includes("/form-data");

	const data = {};

	if (isFormData) {
		const formData = await request.formData();
		formData.forEach((value, prop) => {
			data[prop] = value instanceof File ? value : JSON.parse(value);
		});
	} else {
		Object.assign(data, await request.json());
	}

	return new Response(
		JSON.stringify({
			...(await load(() => module[params.use](data), context)),
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		},
	);
}
