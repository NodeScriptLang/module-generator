export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/orders/status"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["id"] = params["id"];
  body["createdAt"] = params["createdAt"];
  body["updatedAt"] = params["updatedAt"];
  body["status"] = params["status"];
  body["amount"] = params["amount"];
  body["storeId"] = params["storeId"];
  body["identifiers"] = params["identifiers"];
  body["products"] = params["products"];
  body["email"] = params["email"];
  body["billing"] = params["billing"];
  body["coupons"] = params["coupons"];
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
      service: "Brevo",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
