export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/emailCampaigns"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["tag"] = params["tag"];
  body["sender"] = params["sender"];
  body["name"] = params["name"];
  body["htmlContent"] = params["htmlContent"];
  body["htmlUrl"] = params["htmlUrl"];
  body["templateId"] = params["templateId"];
  body["scheduledAt"] = params["scheduledAt"];
  body["subject"] = params["subject"];
  body["previewText"] = params["previewText"];
  body["replyTo"] = params["replyTo"];
  body["toField"] = params["toField"];
  body["recipients"] = params["recipients"];
  body["attachmentUrl"] = params["attachmentUrl"];
  body["inlineImageActivation"] = params["inlineImageActivation"];
  body["mirrorActive"] = params["mirrorActive"];
  body["footer"] = params["footer"];
  body["header"] = params["header"];
  body["utmCampaign"] = params["utmCampaign"];
  body["params"] = params["params"];
  body["sendAtBestTime"] = params["sendAtBestTime"];
  body["abTesting"] = params["abTesting"];
  body["subjectA"] = params["subjectA"];
  body["subjectB"] = params["subjectB"];
  body["splitRule"] = params["splitRule"];
  body["winnerCriteria"] = params["winnerCriteria"];
  body["winnerDelay"] = params["winnerDelay"];
  body["ipWarmupEnable"] = params["ipWarmupEnable"];
  body["initialQuota"] = params["initialQuota"];
  body["increaseRate"] = params["increaseRate"];
  body["unsubscriptionPageId"] = params["unsubscriptionPageId"];
  body["updateFormId"] = params["updateFormId"];
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
