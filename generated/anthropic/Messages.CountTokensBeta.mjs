export async function compute(params, ctx) {
  let url = new URL(
    "https://api.anthropic.com/v1/messages/count_tokens?beta=true"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["anthropicBeta"] != null) {
    headers["anthropic-beta"] = params["anthropicBeta"];
  }
  if (params["anthropicVersion"] != null) {
    headers["anthropic-version"] = params["anthropicVersion"];
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["tool_choice"] = params["toolChoice"];
  body["tools"] = params["tools"];
  body["messages"] = params["messages"];
  body["system"] = params["system"];
  body["model"] = params["model"];
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
