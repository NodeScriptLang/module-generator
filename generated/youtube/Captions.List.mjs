export async function compute(params, ctx) {
  let url = new URL(
    "https://youtube.googleapis.com/youtube/v3/captions"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  for (const item of params["part"] ?? []) {
    addQueryParam("part", item);
  }
  addQueryParam("videoId", params["videoId"]);
  for (const item of params["id"] ?? []) {
    addQueryParam("id", item);
  }
  addQueryParam("onBehalfOf", params["onBehalfOf"]);
  addQueryParam("onBehalfOfContentOwner", params["onBehalfOfContentOwner"]);
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "GET",
    url: url.href,
    headers,
  }, body);
  if (res.status == 204) {
    return undefined;
  }
  const responseBodyText = await res.body.text();
  if (res.status >= 400) {
    const details = ctx.lib.parseJson(responseBodyText) ?? { response: responseBodyText };
    const error = new Error("Service returned an error " + res.status);
    error.name = "ServiceRequestError";
    error.status = res.status;
    error.stack = "";
    error.details = {
      service: "YouTube",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}