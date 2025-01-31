export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/drive/v3/drives/{driveId}"
      .replace("{driveId}", params["driveId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("alt", params["alt"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("quotaUser", params["quotaUser"]);
  addQueryParam("useDomainAdminAccess", params["useDomainAdminAccess"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["backgroundImageFile"] = params["backgroundImageFile"];
  body["backgroundImageLink"] = params["backgroundImageLink"];
  body["capabilities"] = params["capabilities"];
  body["colorRgb"] = params["colorRgb"];
  body["createdTime"] = params["createdTime"];
  body["hidden"] = params["hidden"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["name"] = params["name"];
  body["orgUnitId"] = params["orgUnitId"];
  body["restrictions"] = params["restrictions"];
  body["themeId"] = params["themeId"];
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
      service: "Google Drive",
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
