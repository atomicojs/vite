/**
 *
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 * @returns
 */
export default async function handler(request, response) {
  if (!request.query.id || !request.query.use || request.method != "POST")
    return response.status(404).json({ notFound: true });

  const file = Buffer.from(request.query.id.toString(), "base64").toString(
    "ascii"
  );

  const module = await import(`./_/${file}`);

  return response.status(200).json({
    ...(await module[request.query.use.toString()](
      JSON.parse(request.body || "{}")
    )),
  });
}
