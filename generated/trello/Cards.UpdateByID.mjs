export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/cards/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("desc", params["desc"]);
  addQueryParam("closed", params["closed"]);
  addQueryParam("idMembers", params["idMembers"]);
  addQueryParam("idAttachmentCover", params["idAttachmentCover"]);
  addQueryParam("idList", params["idList"]);
  addQueryParam("idLabels", params["idLabels"]);
  addQueryParam("idBoard", params["idBoard"]);
  addQueryParam("pos", params["pos"]);
  addQueryParam("due", params["due"]);
  addQueryParam("start", params["start"]);
  addQueryParam("dueComplete", params["dueComplete"]);
  addQueryParam("subscribed", params["subscribed"]);
  addQueryParam("address", params["address"]);
  addQueryParam("locationName", params["locationName"]);
  addQueryParam("coordinates", params["coordinates"]);
  addQueryParam("cover", params["cover"]);
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
