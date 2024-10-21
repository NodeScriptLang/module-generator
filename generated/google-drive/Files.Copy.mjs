export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/drive/v3/files/{fileId}/copy"
      .replace("{fileId}", params["fileId"])
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
  addQueryParam("enforceSingleParent", params["enforceSingleParent"]);
  addQueryParam("ignoreDefaultVisibility", params["ignoreDefaultVisibility"]);
  addQueryParam("includeLabels", params["includeLabels"]);
  addQueryParam("includePermissionsForView", params["includePermissionsForView"]);
  addQueryParam("keepRevisionForever", params["keepRevisionForever"]);
  addQueryParam("ocrLanguage", params["ocrLanguage"]);
  addQueryParam("supportsAllDrives", params["supportsAllDrives"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["appProperties"] = params["appProperties"];
  body["capabilities"] = params["capabilities"];
  body["contentHints"] = params["contentHints"];
  body["contentRestrictions"] = params["contentRestrictions"];
  body["copyRequiresWriterPermission"] = params["copyRequiresWriterPermission"];
  body["createdTime"] = params["createdTime"];
  body["description"] = params["description"];
  body["driveId"] = params["driveId"];
  body["explicitlyTrashed"] = params["explicitlyTrashed"];
  body["exportLinks"] = params["exportLinks"];
  body["fileExtension"] = params["fileExtension"];
  body["folderColorRgb"] = params["folderColorRgb"];
  body["fullFileExtension"] = params["fullFileExtension"];
  body["hasAugmentedPermissions"] = params["hasAugmentedPermissions"];
  body["hasThumbnail"] = params["hasThumbnail"];
  body["headRevisionId"] = params["headRevisionId"];
  body["iconLink"] = params["iconLink"];
  body["id"] = params["id"];
  body["imageMediaMetadata"] = params["imageMediaMetadata"];
  body["isAppAuthorized"] = params["isAppAuthorized"];
  body["kind"] = params["kind"];
  body["labelInfo"] = params["labelInfo"];
  body["lastModifyingUser"] = params["lastModifyingUser"];
  body["linkShareMetadata"] = params["linkShareMetadata"];
  body["md5Checksum"] = params["md5Checksum"];
  body["mimeType"] = params["mimeType"];
  body["modifiedByMe"] = params["modifiedByMe"];
  body["modifiedByMeTime"] = params["modifiedByMeTime"];
  body["modifiedTime"] = params["modifiedTime"];
  body["name"] = params["name"];
  body["originalFilename"] = params["originalFilename"];
  body["ownedByMe"] = params["ownedByMe"];
  body["owners"] = params["owners"];
  body["parents"] = params["parents"];
  body["permissionIds"] = params["permissionIds"];
  body["permissions"] = params["permissions"];
  body["properties"] = params["properties"];
  body["quotaBytesUsed"] = params["quotaBytesUsed"];
  body["resourceKey"] = params["resourceKey"];
  body["sha1Checksum"] = params["sha1Checksum"];
  body["sha256Checksum"] = params["sha256Checksum"];
  body["shared"] = params["shared"];
  body["sharedWithMeTime"] = params["sharedWithMeTime"];
  body["sharingUser"] = params["sharingUser"];
  body["shortcutDetails"] = params["shortcutDetails"];
  body["size"] = params["size"];
  body["spaces"] = params["spaces"];
  body["starred"] = params["starred"];
  body["teamDriveId"] = params["teamDriveId"];
  body["thumbnailLink"] = params["thumbnailLink"];
  body["thumbnailVersion"] = params["thumbnailVersion"];
  body["trashed"] = params["trashed"];
  body["trashedTime"] = params["trashedTime"];
  body["trashingUser"] = params["trashingUser"];
  body["version"] = params["version"];
  body["videoMediaMetadata"] = params["videoMediaMetadata"];
  body["viewedByMe"] = params["viewedByMe"];
  body["viewedByMeTime"] = params["viewedByMeTime"];
  body["viewersCanCopyContent"] = params["viewersCanCopyContent"];
  body["webContentLink"] = params["webContentLink"];
  body["webViewLink"] = params["webViewLink"];
  body["writersCanShare"] = params["writersCanShare"];
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
      service: "Google Drive",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
