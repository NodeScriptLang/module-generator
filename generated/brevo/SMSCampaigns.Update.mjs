export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/smsCampaigns/{campaignId}"
      .replace("{campaignId}", params["campaignId"])
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["name"] = params["name"];
  body["sender"] = params["sender"];
  body["content"] = params["content"];
  body["recipients"] = params["recipients"];
  body["scheduledAt"] = params["scheduledAt"];
  body["unicodeEnabled"] = params["unicodeEnabled"];
  body["organisationPrefix"] = params["organisationPrefix"];
  body["unsubscribeInstruction"] = params["unsubscribeInstruction"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PUT",
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
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}