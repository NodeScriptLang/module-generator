export async function compute(params, ctx) {
  let url = new URL(
    "https://www.googleapis.com/drive/v3/files/{fileId}/revisions/{revisionId}"
      .replace("{fileId}", params["fileId"])
      .replace("{revisionId}", params["revisionId"])
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
  headers["content-type"] = "application/json";
  let body = {};
  body["exportLinks"] = params["exportLinks"];
  body["id"] = params["id"];
  body["keepForever"] = params["keepForever"];
  body["kind"] = params["kind"];
  body["lastModifyingUser"] = params["lastModifyingUser"];
  body["md5Checksum"] = params["md5Checksum"];
  body["mimeType"] = params["mimeType"];
  body["modifiedTime"] = params["modifiedTime"];
  body["originalFilename"] = params["originalFilename"];
  body["publishAuto"] = params["publishAuto"];
  body["published"] = params["published"];
  body["publishedLink"] = params["publishedLink"];
  body["publishedOutsideDomain"] = params["publishedOutsideDomain"];
  body["size"] = params["size"];
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
