export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/boards/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("desc", params["desc"]);
  addQueryParam("closed", params["closed"]);
  addQueryParam("subscribed", params["subscribed"]);
  addQueryParam("idOrganization", params["idOrganization"]);
  addQueryParam("prefs/permissionLevel", params["prefs/permissionLevel"]);
  addQueryParam("prefs/selfJoin", params["prefs/selfJoin"]);
  addQueryParam("prefs/cardCovers", params["prefs/cardCovers"]);
  addQueryParam("prefs/hideVotes", params["prefs/hideVotes"]);
  addQueryParam("prefs/invitations", params["prefs/invitations"]);
  addQueryParam("prefs/voting", params["prefs/voting"]);
  addQueryParam("prefs/comments", params["prefs/comments"]);
  addQueryParam("prefs/background", params["prefs/background"]);
  addQueryParam("prefs/cardAging", params["prefs/cardAging"]);
  addQueryParam("prefs/calendarFeedEnabled", params["prefs/calendarFeedEnabled"]);
  addQueryParam("labelNames/green", params["labelNames/green"]);
  addQueryParam("labelNames/yellow", params["labelNames/yellow"]);
  addQueryParam("labelNames/orange", params["labelNames/orange"]);
  addQueryParam("labelNames/red", params["labelNames/red"]);
  addQueryParam("labelNames/purple", params["labelNames/purple"]);
  addQueryParam("labelNames/blue", params["labelNames/blue"]);
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
