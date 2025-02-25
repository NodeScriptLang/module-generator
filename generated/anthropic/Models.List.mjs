export async function compute(params, ctx) {
  let url = new URL(
    "https://api.anthropic.com/v1/models"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["apiKey"] != null) {
    headers["x-api-key"] = params["apiKey"];
  }
  addQueryParam("before_id", params["beforeId"]);
  addQueryParam("after_id", params["afterId"]);
  addQueryParam("limit", params["limit"]);
  if (params["anthropicVersion"] != null) {
    headers["anthropic-version"] = params["anthropicVersion"];
  }
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
      service: "Anthropic",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
