export async function compute(params, ctx) {
  let url = new URL(
    "https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append"
      .replace("{spreadsheetId}", params["spreadsheetId"])
      .replace("{range}", params["range"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("includeValuesInResponse", params["includeValuesInResponse"]);
  addQueryParam("insertDataOption", params["insertDataOption"]);
  addQueryParam("responseDateTimeRenderOption", params["responseDateTimeRenderOption"]);
  addQueryParam("responseValueRenderOption", params["responseValueRenderOption"]);
  addQueryParam("valueInputOption", params["valueInputOption"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["majorDimension"] = params["majorDimension"];
  body["range"] = params["range"];
  body["values"] = params["values"];
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
      service: "Google Sheets",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
