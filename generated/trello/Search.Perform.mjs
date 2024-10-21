export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/search"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("query", params["query"]);
  addQueryParam("idBoards", params["idBoards"]);
  addQueryParam("idOrganizations", params["idOrganizations"]);
  addQueryParam("idCards", params["idCards"]);
  addQueryParam("modelTypes", params["modelTypes"]);
  addQueryParam("board_fields", params["boardFields"]);
  addQueryParam("boards_limit", params["boardsLimit"]);
  addQueryParam("board_organization", params["boardOrganization"]);
  addQueryParam("card_fields", params["cardFields"]);
  addQueryParam("cards_limit", params["cardsLimit"]);
  addQueryParam("cards_page", params["cardsPage"]);
  addQueryParam("card_board", params["cardBoard"]);
  addQueryParam("card_list", params["cardList"]);
  addQueryParam("card_members", params["cardMembers"]);
  addQueryParam("card_stickers", params["cardStickers"]);
  addQueryParam("card_attachments", params["cardAttachments"]);
  addQueryParam("organization_fields", params["organizationFields"]);
  addQueryParam("organizations_limit", params["organizationsLimit"]);
  addQueryParam("member_fields", params["memberFields"]);
  addQueryParam("members_limit", params["membersLimit"]);
  addQueryParam("partial", params["partial"]);
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
