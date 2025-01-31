export async function compute(params, ctx) {
  let url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/tunedModels"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("oauth_token", params["accessToken"]);
  addQueryParam("key", params["apiKey"]);
  addQueryParam("tunedModelId", params["tunedModelId"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["baseModel"] = params["baseModel"];
  body["createTime"] = params["createTime"];
  body["description"] = params["description"];
  body["displayName"] = params["displayName"];
  body["name"] = params["name"];
  body["readerProjectNumbers"] = params["readerProjectNumbers"];
  body["state"] = params["state"];
  body["temperature"] = params["temperature"];
  body["topK"] = params["topK"];
  body["topP"] = params["topP"];
  body["tunedModelSource"] = params["tunedModelSource"];
  body["tuningTask"] = params["tuningTask"];
  body["updateTime"] = params["updateTime"];
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
