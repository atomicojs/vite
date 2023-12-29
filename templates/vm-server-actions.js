export const serverAction = (path, data, isForm) =>
	fetch(path, {
		method: "POST",
		body: isForm
			? Object.entries(data).reduce((form, [prop, value]) => {
					form.append(prop, value);
					return form;
			  }, new FormData())
			: JSON.stringify(data),
	}).then((res) => res.json());
