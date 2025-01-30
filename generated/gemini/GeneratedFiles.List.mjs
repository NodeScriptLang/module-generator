export async function compute(params, ctx) {
  let url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/generatedFiles"
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
  addQueryParam("pageSize", params["pageSize"]);
  addQueryParam("pageToken", params["pageToken"]);
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
      service: "Gemini",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
