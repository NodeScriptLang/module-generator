export async function compute(params, ctx) {
  let url = new URL(
    "https://api.stability.ai/v1/generation/{engine_id}/text-to-image"
      .replace("{engine_id}", params["engineId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["authorization"] = params["auth"];
  }
  if (params["accept"] != null) {
    headers["Accept"] = params["accept"];
  }
  if (params["organization"] != null) {
    headers["Organization"] = params["organization"];
  }
  if (params["stabilityClientId"] != null) {
    headers["Stability-Client-ID"] = params["stabilityClientId"];
  }
  if (params["stabilityClientVersion"] != null) {
    headers["Stability-Client-Version"] = params["stabilityClientVersion"];
  }
  headers["content-type"] = "application/json";
  let body = {};
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
      service: "StabilityAI",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
