export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/organizations/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("displayName", params["displayName"]);
  addQueryParam("desc", params["desc"]);
  addQueryParam("website", params["website"]);
  addQueryParam("prefs/associatedDomain", params["prefs/associatedDomain"]);
  addQueryParam("prefs/externalMembersDisabled", params["prefs/externalMembersDisabled"]);
  addQueryParam("prefs/googleAppsVersion", params["prefs/googleAppsVersion"]);
  addQueryParam("prefs/boardVisibilityRestrict/org", params["prefs/boardVisibilityRestrict/org"]);
  addQueryParam("prefs/boardVisibilityRestrict/private", params["prefs/boardVisibilityRestrict/private"]);
  addQueryParam("prefs/boardVisibilityRestrict/public", params["prefs/boardVisibilityRestrict/public"]);
  addQueryParam("prefs/orgInviteRestrict", params["prefs/orgInviteRestrict"]);
  addQueryParam("prefs/permissionLevel", params["prefs/permissionLevel"]);
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
