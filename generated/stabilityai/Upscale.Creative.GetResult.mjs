export async function compute(params, ctx) {
  let url = new URL(
    "https://api.stability.ai/v2beta/stable-image/upscale/creative/result/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["authorization"] = params["auth"];
  }
  if (params["authorization"] != null) {
    headers["authorization"] = params["authorization"];
  }
  if (params["accept"] != null) {
    headers["accept"] = params["accept"];
  }
  if (params["stabilityClientId"] != null) {
    headers["stability-client-id"] = params["stabilityClientId"];
  }
  if (params["stabilityClientUserId"] != null) {
    headers["stability-client-user-id"] = params["stabilityClientUserId"];
  }
  if (params["stabilityClientVersion"] != null) {
    headers["stability-client-version"] = params["stabilityClientVersion"];
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
      service: "StabilityAI",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
