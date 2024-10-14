export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/products"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  addQueryParam("limit", params["limit"]);
  addQueryParam("offset", params["offset"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("ids", params["ids"].join(","));
  addQueryParam("name", params["name"]);
  addQueryParam("price[lte]", params["price[lte]"]);
  addQueryParam("price[gte]", params["price[gte]"]);
  addQueryParam("price[lt]", params["price[lt]"]);
  addQueryParam("price[gt]", params["price[gt]"]);
  addQueryParam("price[eq]", params["price[eq]"]);
  addQueryParam("price[ne]", params["price[ne]"]);
  addQueryParam("categories", params["categories"].join(","));
  addQueryParam("modifiedSince", params["modifiedSince"]);
  addQueryParam("createdSince", params["createdSince"]);
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
