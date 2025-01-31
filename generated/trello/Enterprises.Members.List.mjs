export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/enterprises/{id}/members"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("filter", params["filter"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("sortBy", params["sortBy"]);
  addQueryParam("sortOrder", params["sortOrder"]);
  addQueryParam("startIndex", params["startIndex"]);
  addQueryParam("count", params["count"]);
  addQueryParam("organization_fields", params["organizationFields"]);
  addQueryParam("board_fields", params["boardFields"]);
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
      service: "Trello",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
