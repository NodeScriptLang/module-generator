export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/feeds"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  addQueryParam("search", params["search"]);
  addQueryParam("startDate", params["startDate"]);
  addQueryParam("endDate", params["endDate"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("authType", params["authType"]);
  addQueryParam("limit", params["limit"]);
  addQueryParam("offset", params["offset"]);
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
      service: "Brevo",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}