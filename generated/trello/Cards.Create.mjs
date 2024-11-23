export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/cards"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("desc", params["desc"]);
  addQueryParam("pos", params["pos"]);
  addQueryParam("due", params["due"]);
  addQueryParam("start", params["start"]);
  addQueryParam("dueComplete", params["dueComplete"]);
  addQueryParam("idList", params["idList"]);
  addQueryParam("idLabels", params["idLabels"]);
  addQueryParam("urlSource", params["urlSource"]);
  addQueryParam("fileSource", params["fileSource"]);
  addQueryParam("mimeType", params["mimeType"]);
  addQueryParam("idCardSource", params["idCardSource"]);
  addQueryParam("keepFromSource", params["keepFromSource"]);
  addQueryParam("address", params["address"]);
  addQueryParam("locationName", params["locationName"]);
  addQueryParam("coordinates", params["coordinates"]);
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
