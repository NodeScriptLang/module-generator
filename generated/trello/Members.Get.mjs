export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/members/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("actions", params["actions"]);
  addQueryParam("boards", params["boards"]);
  addQueryParam("boardBackgrounds", params["boardBackgrounds"]);
  addQueryParam("boardsInvited", params["boardsInvited"]);
  addQueryParam("boardsInvited_fields", params["boardsInvitedFields"]);
  addQueryParam("boardStars", params["boardStars"]);
  addQueryParam("cards", params["cards"]);
  addQueryParam("customBoardBackgrounds", params["customBoardBackgrounds"]);
  addQueryParam("customEmoji", params["customEmoji"]);
  addQueryParam("customStickers", params["customStickers"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("notifications", params["notifications"]);
  addQueryParam("organizations", params["organizations"]);
  addQueryParam("organization_fields", params["organizationFields"]);
  addQueryParam("organization_paid_account", params["organizationPaidAccount"]);
  addQueryParam("organizationsInvited", params["organizationsInvited"]);
  addQueryParam("organizationsInvited_fields", params["organizationsInvitedFields"]);
  addQueryParam("paid_account", params["paidAccount"]);
  addQueryParam("savedSearches", params["savedSearches"]);
  addQueryParam("tokens", params["tokens"]);
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
      service: "Trello",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
