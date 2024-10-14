export async function compute(params, ctx) {
  let url = new URL(
    "https://slack.com/api/chat.scheduleMessage"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/x-www-form-urlencoded";
  let body = new URLSearchParams();
  const addBodyParam = (key, val) => { if (val !== undefined) body.append(key, val) };
  addBodyParam("as_user", params["asUser"]);
  addBodyParam("attachments", params["attachments"]);
  addBodyParam("blocks", params["blocks"]);
  addBodyParam("channel", params["channel"]);
  addBodyParam("link_names", params["linkNames"]);
  addBodyParam("parse", params["parse"]);
  addBodyParam("post_at", params["postAt"]);
  addBodyParam("reply_broadcast", params["replyBroadcast"]);
  addBodyParam("text", params["text"]);
  addBodyParam("thread_ts", params["threadTs"]);
  addBodyParam("unfurl_links", params["unfurlLinks"]);
  addBodyParam("unfurl_media", params["unfurlMedia"]);
  body = body.toString()
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
      service: "Slack",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
