export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/boards/"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("defaultLabels", params["defaultLabels"]);
  addQueryParam("defaultLists", params["defaultLists"]);
  addQueryParam("desc", params["desc"]);
  addQueryParam("idOrganization", params["idOrganization"]);
  addQueryParam("idBoardSource", params["idBoardSource"]);
  addQueryParam("keepFromSource", params["keepFromSource"]);
  addQueryParam("powerUps", params["powerUps"]);
  addQueryParam("prefs_permissionLevel", params["prefsPermissionLevel"]);
  addQueryParam("prefs_voting", params["prefsVoting"]);
  addQueryParam("prefs_comments", params["prefsComments"]);
  addQueryParam("prefs_invitations", params["prefsInvitations"]);
  addQueryParam("prefs_selfJoin", params["prefsSelfJoin"]);
  addQueryParam("prefs_cardCovers", params["prefsCardCovers"]);
  addQueryParam("prefs_background", params["prefsBackground"]);
  addQueryParam("prefs_cardAging", params["prefsCardAging"]);
  const body = undefined;
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
      service: "Trello",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
