export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/notifications/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("board", params["board"]);
  addQueryParam("board_fields", params["boardFields"]);
  addQueryParam("card", params["card"]);
  addQueryParam("card_fields", params["cardFields"]);
  addQueryParam("display", params["display"]);
  addQueryParam("entities", params["entities"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("list", params["list"]);
  addQueryParam("member", params["member"]);
  addQueryParam("member_fields", params["memberFields"]);
  addQueryParam("memberCreator", params["memberCreator"]);
  addQueryParam("memberCreator_fields", params["memberCreatorFields"]);
  addQueryParam("organization", params["organization"]);
  addQueryParam("organization_fields", params["organizationFields"]);
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
