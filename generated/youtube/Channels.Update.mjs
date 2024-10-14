export async function compute(params, ctx) {
  let url = new URL(
    "https://youtube.googleapis.com/youtube/v3/channels"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  for (const item of params["part"] ?? []) {
    addQueryParam("part", item);
  }
  addQueryParam("onBehalfOfContentOwner", params["onBehalfOfContentOwner"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["auditDetails"] = params["auditDetails"];
  body["brandingSettings"] = params["brandingSettings"];
  body["contentDetails"] = params["contentDetails"];
  body["contentOwnerDetails"] = params["contentOwnerDetails"];
  body["conversionPings"] = params["conversionPings"];
  body["etag"] = params["etag"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["localizations"] = params["localizations"];
  body["snippet"] = params["snippet"];
  body["statistics"] = params["statistics"];
  body["status"] = params["status"];
  body["topicDetails"] = params["topicDetails"];
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
      service: "YouTube",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
