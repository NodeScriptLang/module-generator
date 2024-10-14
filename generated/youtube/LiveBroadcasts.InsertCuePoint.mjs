export async function compute(params, ctx) {
  let url = new URL(
    "https://youtube.googleapis.com/youtube/v3/liveBroadcasts/cuepoint"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("id", params["id"]);
  addQueryParam("onBehalfOfContentOwner", params["onBehalfOfContentOwner"]);
  addQueryParam("onBehalfOfContentOwnerChannel", params["onBehalfOfContentOwnerChannel"]);
  for (const item of params["part"] ?? []) {
    addQueryParam("part", item);
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["cueType"] = params["cueType"];
  body["durationSecs"] = params["durationSecs"];
  body["etag"] = params["etag"];
  body["id"] = params["id"];
  body["insertionOffsetTimeMs"] = params["insertionOffsetTimeMs"];
  body["walltimeMs"] = params["walltimeMs"];
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
      service: "YouTube",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
