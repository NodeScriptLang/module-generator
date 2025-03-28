export async function compute(params, ctx) {
  let url = new URL(
    "https://api.xero.com/api.xro/2.0/TrackingCategories/{TrackingCategoryID}"
      .replace("{TrackingCategoryID}", params["trackingCategoryId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["xeroTenantId"] != null) {
    headers["xero-tenant-id"] = params["xeroTenantId"];
  }
  if (params["idempotencyKey"] != null) {
    headers["Idempotency-Key"] = params["idempotencyKey"];
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["TrackingCategoryID"] = params["trackingCategoryId"];
  body["TrackingOptionID"] = params["trackingOptionId"];
  body["Name"] = params["name"];
  body["Option"] = params["option"];
  body["Status"] = params["status"];
  body["Options"] = params["options"];
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
      service: "Xero",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
