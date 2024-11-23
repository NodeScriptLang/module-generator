export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/members/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("fullName", params["fullName"]);
  addQueryParam("initials", params["initials"]);
  addQueryParam("username", params["username"]);
  addQueryParam("bio", params["bio"]);
  addQueryParam("avatarSource", params["avatarSource"]);
  addQueryParam("prefs/colorBlind", params["prefs/colorBlind"]);
  addQueryParam("prefs/locale", params["prefs/locale"]);
  addQueryParam("prefs/minutesBetweenSummaries", params["prefs/minutesBetweenSummaries"]);
  const body = undefined;
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
      service: "Trello",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
