export async function compute(params, ctx) {
  let url = new URL(
    "https://api.brevo.com/v3/crm/tasks"
  );
  const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };
  const headers = {};
  headers["api-key"] = params["apiKey"];
  headers["content-type"] = "application/json";
  let body = {};
  body["name"] = params["name"];
  body["duration"] = params["duration"];
  body["taskTypeId"] = params["taskTypeId"];
  body["date"] = params["date"];
  body["notes"] = params["notes"];
  body["done"] = params["done"];
  body["assignToId"] = params["assignToId"];
  body["contactsIds"] = params["contactsIds"];
  body["dealsIds"] = params["dealsIds"];
  body["companiesIds"] = params["companiesIds"];
  body["reminder"] = params["reminder"];
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
      service: "Brevo",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
