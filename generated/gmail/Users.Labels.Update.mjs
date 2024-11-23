export async function compute(params, ctx) {
  let url = new URL(
    "https://gmail.googleapis.com/gmail/v1/users/{userId}/labels/{id}"
      .replace("{userId}", params["userId"])
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["color"] = params["color"];
  body["id"] = params["id"];
  body["labelListVisibility"] = params["labelListVisibility"];
  body["messageListVisibility"] = params["messageListVisibility"];
  body["messagesTotal"] = params["messagesTotal"];
  body["messagesUnread"] = params["messagesUnread"];
  body["name"] = params["name"];
  body["threadsTotal"] = params["threadsTotal"];
  body["threadsUnread"] = params["threadsUnread"];
  body["type"] = params["type"];
  body = JSON.stringify(body);
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
      service: "Gmail",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
