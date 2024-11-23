export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}"
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
  addQueryParam("conferenceDataVersion", params["conferenceDataVersion"]);
  addQueryParam("maxAttendees", params["maxAttendees"]);
  addQueryParam("sendUpdates", params["sendUpdates"]);
  addQueryParam("supportsAttachments", params["supportsAttachments"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["anyoneCanAddSelf"] = params["anyoneCanAddSelf"];
  body["attachments"] = params["attachments"];
  body["attendees"] = params["attendees"];
  body["attendeesOmitted"] = params["attendeesOmitted"];
  body["colorId"] = params["colorId"];
  body["conferenceData"] = params["conferenceData"];
  body["created"] = params["created"];
  body["creator"] = params["creator"];
  body["description"] = params["description"];
  body["end"] = params["end"];
  body["endTimeUnspecified"] = params["endTimeUnspecified"];
  body["etag"] = params["etag"];
  body["eventType"] = params["eventType"];
  body["extendedProperties"] = params["extendedProperties"];
  body["gadget"] = params["gadget"];
  body["guestsCanInviteOthers"] = params["guestsCanInviteOthers"];
  body["guestsCanModify"] = params["guestsCanModify"];
  body["guestsCanSeeOtherGuests"] = params["guestsCanSeeOtherGuests"];
  body["hangoutLink"] = params["hangoutLink"];
  body["htmlLink"] = params["htmlLink"];
  body["iCalUID"] = params["iCalUid"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["location"] = params["location"];
  body["locked"] = params["locked"];
  body["organizer"] = params["organizer"];
  body["originalStartTime"] = params["originalStartTime"];
  body["privateCopy"] = params["privateCopy"];
  body["recurrence"] = params["recurrence"];
  body["recurringEventId"] = params["recurringEventId"];
  body["reminders"] = params["reminders"];
  body["sequence"] = params["sequence"];
  body["source"] = params["source"];
  body["start"] = params["start"];
  body["status"] = params["status"];
  body["summary"] = params["summary"];
  body["transparency"] = params["transparency"];
  body["updated"] = params["updated"];
  body["visibility"] = params["visibility"];
  body["workingLocationProperties"] = params["workingLocationProperties"];
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
