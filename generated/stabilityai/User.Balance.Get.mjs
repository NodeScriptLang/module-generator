export async function compute(params, ctx) {
  let url = new URL(
    "https://api.stability.ai/v1/user/balance"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["authorization"] = params["auth"];
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
