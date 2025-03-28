export async function compute(params, ctx) {
  let url = new URL(
    "https://api.hubapi.com/integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}/tokens"
      .replace("{eventTemplateId}", params["eventTemplateId"])
      .replace("{appId}", params["appId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["createdAt"] = params["createdAt"];
  body["options"] = params["options"];
  body["name"] = params["name"];
  body["label"] = params["label"];
  body["objectPropertyName"] = params["objectPropertyName"];
  body["type"] = params["type"];
  body["updatedAt"] = params["updatedAt"];
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
      service: "Hubspot CRM",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
