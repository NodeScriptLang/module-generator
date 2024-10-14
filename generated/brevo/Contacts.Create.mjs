export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/contacts"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["email"] = params["email"];
  body["ext_id"] = params["extId"];
  body["attributes"] = params["attributes"];
  body["emailBlacklisted"] = params["emailBlacklisted"];
  body["smsBlacklisted"] = params["smsBlacklisted"];
  body["listIds"] = params["listIds"];
  body["updateEnabled"] = params["updateEnabled"];
  body["smtpBlacklistSender"] = params["smtpBlacklistSender"];
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
