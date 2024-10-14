export async function compute(params, ctx) {
  let url = new URL(
    "https://slack.com/api/calls.add"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/x-www-form-urlencoded";
  let body = new URLSearchParams();
  const addBodyParam = (key, val) => { if (val !== undefined) body.append(key, val) };
  addBodyParam("created_by", params["createdBy"]);
  addBodyParam("date_start", params["dateStart"]);
  addBodyParam("desktop_app_join_url", params["desktopAppJoinUrl"]);
  addBodyParam("external_display_id", params["externalDisplayId"]);
  addBodyParam("external_unique_id", params["externalUniqueId"]);
  addBodyParam("join_url", params["joinUrl"]);
  addBodyParam("title", params["title"]);
  addBodyParam("users", params["users"]);
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
