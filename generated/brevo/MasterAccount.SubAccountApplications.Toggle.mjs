export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/corporate/subAccount/{id}/applications/toggle"
      .replace("{id}", params["id"])
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["inbox"] = params["inbox"];
  body["whatsapp"] = params["whatsapp"];
  body["automation"] = params["automation"];
  body["email-campaigns"] = params["emailCampaigns"];
  body["sms-campaigns"] = params["smsCampaigns"];
  body["landing-pages"] = params["landingPages"];
  body["transactional-emails"] = params["transactionalEmails"];
  body["transactional-sms"] = params["transactionalSms"];
  body["facebook-ads"] = params["facebookAds"];
  body["web-push"] = params["webPush"];
  body["meetings"] = params["meetings"];
  body["conversations"] = params["conversations"];
  body["crm"] = params["crm"];
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
