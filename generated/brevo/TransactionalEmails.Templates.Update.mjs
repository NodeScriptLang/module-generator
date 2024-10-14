export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/smtp/templates/{templateId}"
      .replace("{templateId}", params["templateId"])
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["tag"] = params["tag"];
  body["sender"] = params["sender"];
  body["templateName"] = params["templateName"];
  body["htmlContent"] = params["htmlContent"];
  body["htmlUrl"] = params["htmlUrl"];
  body["subject"] = params["subject"];
  body["replyTo"] = params["replyTo"];
  body["toField"] = params["toField"];
  body["attachmentUrl"] = params["attachmentUrl"];
  body["isActive"] = params["isActive"];
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
