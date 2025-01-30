export async function compute(params, ctx) {
  let url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/tunedModels/{model}:generateContent"
      .replace("{model}", params["model"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("oauth_token", params["accessToken"]);
  addQueryParam("key", params["apiKey"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["cachedContent"] = params["cachedContent"];
  body["contents"] = params["contents"];
  body["generationConfig"] = params["generationConfig"];
  body["model"] = params["model"];
  body["safetySettings"] = params["safetySettings"];
  body["systemInstruction"] = params["systemInstruction"];
  body["toolConfig"] = params["toolConfig"];
  body["tools"] = params["tools"];
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
