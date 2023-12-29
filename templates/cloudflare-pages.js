/**
 *
 * @param {{request: Request, next:()=>Promise<Response>}} context
 * @returns
 */
export async function onRequestPost(context) {
    const [, search] = context.request.url.split("?");
    const params = Object.fromEntries(new URLSearchParams(search));
  
    if (!params.id || !params.use)
      return new Response("{}", {
        status: 404,
        headers: {   'Content-Type': 'application/json;charset=utf-8', },
      });
    

    const file = atob(params.id.toString());
  
    const module = await import(`./_/${file}`);

    return new Response(
      JSON.stringify({
        ...await module[params.use]({})
      }),
      { status: 200, headers: { 
            'Content-Type': 'application/json;charset=utf-8',
        } }
    );
  }
  