export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/organization/usage/audio_speeches"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["betaAccess"] != null) {
    headers["OpenAI-Beta"] = params["betaAccess"];
  }
  addQueryParam("start_time", params["startTime"]);
  addQueryParam("end_time", params["endTime"]);
  addQueryParam("bucket_width", params["bucketWidth"]);
  addQueryParam("project_ids", params["projectIds"]?.join(","));
  addQueryParam("user_ids", params["userIds"]?.join(","));
  addQueryParam("api_key_ids", params["apiKeyIds"]?.join(","));
  addQueryParam("models", params["models"]?.join(","));
  addQueryParam("group_by", params["groupBy"]?.join(","));
  addQueryParam("limit", params["limit"]);
  addQueryParam("page", params["page"]);
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
      service: "OpenAI",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
