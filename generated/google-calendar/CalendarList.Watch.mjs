export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList/watch"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("maxResults", params["maxResults"]);
  addQueryParam("minAccessRole", params["minAccessRole"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("showDeleted", params["showDeleted"]);
  addQueryParam("showHidden", params["showHidden"]);
  addQueryParam("syncToken", params["syncToken"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["address"] = params["address"];
  body["expiration"] = params["expiration"];
  body["id"] = params["channelId"];
  body["kind"] = params["kind"];
  body["params"] = params["params"];
  body["payload"] = params["payload"];
  body["resourceId"] = params["resourceId"];
  body["resourceUri"] = params["resourceUri"];
  body["token"] = params["token"];
  body["type"] = params["type"];
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
      service: "Google Calendar",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
