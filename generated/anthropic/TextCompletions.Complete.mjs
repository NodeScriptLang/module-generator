export async function compute(params, ctx) {
  let url = new URL(
    "https://api.anthropic.com/v1/complete"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["xApiKey"] != null) {
    headers["x-api-key"] = ("Bearer" + " " + params["xApiKey"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["anthropicVersion"] != null) {
    headers["anthropic-version"] = params["anthropicVersion"];
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["model"] = params["model"];
  body["prompt"] = params["prompt"];
  body["max_tokens_to_sample"] = params["maxTokensToSample"];
  body["stop_sequences"] = params["stopSequences"];
  body["temperature"] = params["temperature"];
  body["top_p"] = params["topP"];
  body["top_k"] = params["topK"];
  body["metadata"] = params["metadata"];
  body["stream"] = params["stream"];
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
      service: "Anthropic",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
