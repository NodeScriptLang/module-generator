export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/customFields"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["idModel"] = params["idModel"];
  body["modelType"] = params["modelType"];
  body["name"] = params["name"];
  body["type"] = params["type"];
  body["options"] = params["options"];
  body["pos"] = params["pos"];
  body["display_cardFront"] = params["displayCardFront"];
  body = JSON.stringify(body);
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
