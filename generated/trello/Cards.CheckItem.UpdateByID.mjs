export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/cards/{id}/checkItem/{idCheckItem}"
      .replace("{id}", params["id"])
      .replace("{idCheckItem}", params["idCheckItem"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("name", params["name"]);
  addQueryParam("state", params["state"]);
  addQueryParam("idChecklist", params["idChecklist"]);
  addQueryParam("pos", params["pos"]);
  addQueryParam("due", params["due"]);
  addQueryParam("dueReminder", params["dueReminder"]);
  addQueryParam("idMember", params["idMember"]);
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
