export async function compute(params, ctx) {
  let url = new URL(
    "https://youtube.googleapis.com/youtube/v3/search"
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
  addQueryParam("channelId", params["channelId"]);
  addQueryParam("channelType", params["channelType"]);
  addQueryParam("eventType", params["eventType"]);
  addQueryParam("forContentOwner", params["forContentOwner"]);
  addQueryParam("forDeveloper", params["forDeveloper"]);
  addQueryParam("forMine", params["forMine"]);
  addQueryParam("location", params["location"]);
  addQueryParam("locationRadius", params["locationRadius"]);
  addQueryParam("maxResults", params["maxResults"]);
  addQueryParam("onBehalfOfContentOwner", params["onBehalfOfContentOwner"]);
  addQueryParam("order", params["order"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("publishedAfter", params["publishedAfter"]);
  addQueryParam("publishedBefore", params["publishedBefore"]);
  addQueryParam("q", params["q"]);
  addQueryParam("regionCode", params["regionCode"]);
  addQueryParam("relatedToVideoId", params["relatedToVideoId"]);
  addQueryParam("relevanceLanguage", params["relevanceLanguage"]);
  addQueryParam("safeSearch", params["safeSearch"]);
  addQueryParam("topicId", params["topicId"]);
  for (const item of params["type"] ?? []) {
    addQueryParam("type", item);
  }
  addQueryParam("videoCaption", params["videoCaption"]);
  addQueryParam("videoCategoryId", params["videoCategoryId"]);
  addQueryParam("videoDefinition", params["videoDefinition"]);
  addQueryParam("videoDimension", params["videoDimension"]);
  addQueryParam("videoDuration", params["videoDuration"]);
  addQueryParam("videoEmbeddable", params["videoEmbeddable"]);
  addQueryParam("videoLicense", params["videoLicense"]);
  addQueryParam("videoSyndicated", params["videoSyndicated"]);
  addQueryParam("videoType", params["videoType"]);
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
      service: "YouTube",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
