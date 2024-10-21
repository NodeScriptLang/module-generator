export async function compute(params, ctx) {
  let url = new URL(
    "https://api.hubapi.com/crm/v3/properties/{objectType}/{propertyName}"
      .replace("{objectType}", params["objectType"])
      .replace("{propertyName}", params["propertyName"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["groupName"] = params["groupName"];
  body["hidden"] = params["hidden"];
  body["options"] = params["options"];
  body["displayOrder"] = params["displayOrder"];
  body["description"] = params["description"];
  body["calculationFormula"] = params["calculationFormula"];
  body["label"] = params["label"];
  body["type"] = params["type"];
  body["fieldType"] = params["fieldType"];
  body["formField"] = params["formField"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PATCH",
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
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
