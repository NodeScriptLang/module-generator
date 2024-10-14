export async function compute(params, ctx) {
  let url = new URL(
    "https://youtube.googleapis.com/youtube/v3/videos"
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
  body["ageGating"] = params["ageGating"];
  body["contentDetails"] = params["contentDetails"];
  body["etag"] = params["etag"];
  body["fileDetails"] = params["fileDetails"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["liveStreamingDetails"] = params["liveStreamingDetails"];
  body["localizations"] = params["localizations"];
  body["monetizationDetails"] = params["monetizationDetails"];
  body["player"] = params["player"];
  body["processingDetails"] = params["processingDetails"];
  body["projectDetails"] = params["projectDetails"];
  body["recordingDetails"] = params["recordingDetails"];
  body["snippet"] = params["snippet"];
  body["statistics"] = params["statistics"];
  body["status"] = params["status"];
  body["suggestions"] = params["suggestions"];
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
