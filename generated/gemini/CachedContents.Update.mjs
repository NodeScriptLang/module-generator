export async function compute(params, ctx) {
  let url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/cachedContents/{name}"
      .replace("{name}", params["name"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("oauth_token", params["accessToken"]);
  addQueryParam("key", params["apiKey"]);
  addQueryParam("updateMask", params["updateMask"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["contents"] = params["contents"];
  body["createTime"] = params["createTime"];
  body["displayName"] = params["displayName"];
  body["expireTime"] = params["expireTime"];
  body["model"] = params["model"];
  body["name"] = params["name"];
  body["systemInstruction"] = params["systemInstruction"];
  body["toolConfig"] = params["toolConfig"];
  body["tools"] = params["tools"];
  body["ttl"] = params["ttl"];
  body["updateTime"] = params["updateTime"];
  body["usageMetadata"] = params["usageMetadata"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PATCH",
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
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
