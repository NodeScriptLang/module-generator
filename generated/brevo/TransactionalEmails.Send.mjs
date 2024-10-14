export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/smtp/email"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["sender"] = params["sender"];
  body["to"] = params["to"];
  body["bcc"] = params["bcc"];
  body["cc"] = params["cc"];
  body["htmlContent"] = params["htmlContent"];
  body["textContent"] = params["textContent"];
  body["subject"] = params["subject"];
  body["replyTo"] = params["replyTo"];
  body["attachment"] = params["attachment"];
  body["headers"] = params["headers"];
  body["templateId"] = params["templateId"];
  body["params"] = params["params"];
  body["messageVersions"] = params["messageVersions"];
  body["tags"] = params["tags"];
  body["scheduledAt"] = params["scheduledAt"];
  body["batchId"] = params["batchId"];
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
