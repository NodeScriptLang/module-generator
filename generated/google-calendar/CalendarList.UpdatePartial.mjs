export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList/{calendarId}"
      .replace("{calendarId}", params["calendarId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("colorRgbFormat", params["colorRgbFormat"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["accessRole"] = params["accessRole"];
  body["backgroundColor"] = params["backgroundColor"];
  body["colorId"] = params["colorId"];
  body["conferenceProperties"] = params["conferenceProperties"];
  body["defaultReminders"] = params["defaultReminders"];
  body["deleted"] = params["deleted"];
  body["description"] = params["description"];
  body["etag"] = params["etag"];
  body["foregroundColor"] = params["foregroundColor"];
  body["hidden"] = params["hidden"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["location"] = params["location"];
  body["notificationSettings"] = params["notificationSettings"];
  body["primary"] = params["primary"];
  body["selected"] = params["selected"];
  body["summary"] = params["summary"];
  body["summaryOverride"] = params["summaryOverride"];
  body["timeZone"] = params["timeZone"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PATCH",
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
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
