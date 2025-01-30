export async function compute(params, ctx) {
  let url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/corpora/{name}:query"
      .replace("{name}", params["name"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("oauth_token", params["accessToken"]);
  addQueryParam("key", params["apiKey"]);
  addQueryParam("$.xgafv", params["$Xgafv"]);
  addQueryParam("access_token", params["accessToken"]);
  addQueryParam("alt", params["alt"]);
  addQueryParam("callback", params["callback"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("key", params["key"]);
  addQueryParam("oauth_token", params["oauthToken"]);
  addQueryParam("prettyPrint", params["prettyPrint"]);
  addQueryParam("quotaUser", params["quotaUser"]);
  addQueryParam("upload_protocol", params["uploadProtocol"]);
  addQueryParam("uploadType", params["uploadType"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["metadataFilters"] = params["metadataFilters"];
  body["query"] = params["query"];
  body["resultsCount"] = params["resultsCount"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "POST",
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
      service: "Gemini",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
