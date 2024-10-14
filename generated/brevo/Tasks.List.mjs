export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/crm/tasks"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  addQueryParam("filter[type]", params["filter[type]"]);
  addQueryParam("filter[status]", params["filter[status]"]);
  addQueryParam("filter[date]", params["filter[date]"]);
  addQueryParam("filter[assignTo]", params["filter[assignTo]"]);
  addQueryParam("filter[contacts]", params["filter[contacts]"]);
  addQueryParam("filter[deals]", params["filter[deals]"]);
  addQueryParam("filter[companies]", params["filter[companies]"]);
  addQueryParam("dateFrom", params["dateFrom"]);
  addQueryParam("dateTo", params["dateTo"]);
  addQueryParam("offset", params["offset"]);
  addQueryParam("limit", params["limit"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("sortBy", params["sortBy"]);
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
