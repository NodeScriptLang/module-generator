export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/user/repos"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("visibility", params["visibility"]);
  addQueryParam("affiliation", params["affiliation"]);
  addQueryParam("type", params["type"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("direction", params["direction"]);
  addQueryParam("per_page", params["perPage"]);
  addQueryParam("page", params["page"]);
  addQueryParam("since", params["since"]);
  addQueryParam("before", params["before"]);
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
      service: "GitHub",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}