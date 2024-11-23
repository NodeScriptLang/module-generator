export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/boards/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("actions", params["actions"]);
  addQueryParam("boardStars", params["boardStars"]);
  addQueryParam("cards", params["cards"]);
  addQueryParam("card_pluginData", params["cardPluginData"]);
  addQueryParam("checklists", params["checklists"]);
  addQueryParam("customFields", params["customFields"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("labels", params["labels"]);
  addQueryParam("lists", params["lists"]);
  addQueryParam("members", params["members"]);
  addQueryParam("memberships", params["memberships"]);
  addQueryParam("pluginData", params["pluginData"]);
  addQueryParam("organization", params["organization"]);
  addQueryParam("organization_pluginData", params["organizationPluginData"]);
  addQueryParam("myPrefs", params["myPrefs"]);
  addQueryParam("tags", params["tags"]);
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
