export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}/instances"
      .replace("{calendarId}", params["calendarId"])
      .replace("{eventId}", params["eventId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("maxAttendees", params["maxAttendees"]);
  addQueryParam("maxResults", params["maxResults"]);
  addQueryParam("originalStart", params["originalStart"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("showDeleted", params["showDeleted"]);
  addQueryParam("timeMax", params["timeMax"]);
  addQueryParam("timeMin", params["timeMin"]);
  addQueryParam("timeZone", params["timeZone"]);
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "GET",
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
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
