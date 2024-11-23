export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/drive/v3/files"
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
  addQueryParam("corpora", params["corpora"]);
  addQueryParam("driveId", params["driveId"]);
  addQueryParam("includeItemsFromAllDrives", params["includeItemsFromAllDrives"]);
  addQueryParam("includeLabels", params["includeLabels"]);
  addQueryParam("includePermissionsForView", params["includePermissionsForView"]);
  addQueryParam("orderBy", params["orderBy"]);
  addQueryParam("pageSize", params["pageSize"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("q", params["q"]);
  addQueryParam("spaces", params["spaces"]);
  addQueryParam("supportsAllDrives", params["supportsAllDrives"]);
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "GET",
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
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
