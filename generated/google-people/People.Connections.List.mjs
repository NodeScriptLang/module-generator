export async function compute(params, ctx) {
  let url = new URL(
    "https://people.googleapis.com/v1/{resourceName}/connections"
      .replace("{resourceName}", params["resourceName"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("pageSize", params["pageSize"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("personFields", params["personFields"]);
  addQueryParam("requestMask.includeField", params["requestMaskIncludeField"]);
  addQueryParam("requestSyncToken", params["requestSyncToken"]);
  addQueryParam("sortOrder", params["sortOrder"]);
  for (const item of params["sources"] ?? []) {
    addQueryParam("sources", item);
  }
  addQueryParam("syncToken", params["syncToken"]);
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
      service: "Google People",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
