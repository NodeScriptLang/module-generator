export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/drive/v3/files/{fileId}/permissions/{permissionId}"
      .replace("{fileId}", params["fileId"])
      .replace("{permissionId}", params["permissionId"])
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
  addQueryParam("removeExpiration", params["removeExpiration"]);
  addQueryParam("supportsAllDrives", params["supportsAllDrives"]);
  addQueryParam("transferOwnership", params["transferOwnership"]);
  addQueryParam("useDomainAdminAccess", params["useDomainAdminAccess"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["allowFileDiscovery"] = params["allowFileDiscovery"];
  body["deleted"] = params["deleted"];
  body["displayName"] = params["displayName"];
  body["domain"] = params["domain"];
  body["emailAddress"] = params["emailAddress"];
  body["expirationTime"] = params["expirationTime"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["pendingOwner"] = params["pendingOwner"];
  body["permissionDetails"] = params["permissionDetails"];
  body["photoLink"] = params["photoLink"];
  body["role"] = params["role"];
  body["teamDrivePermissionDetails"] = params["teamDrivePermissionDetails"];
  body["type"] = params["type"];
  body["view"] = params["view"];
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
