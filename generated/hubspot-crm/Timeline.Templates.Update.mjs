export async function compute(params, ctx) {
  let url = new URL(
    "https://api.hubapi.com/integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}"
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
  body["detailTemplate"] = params["detailTemplate"];
  body["name"] = params["name"];
  body["tokens"] = params["tokens"];
  body["id"] = params["id"];
  body["headerTemplate"] = params["headerTemplate"];
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
      service: "Hubspot CRM",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}