export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/jobs"
      .replace("{projectId}", params["projectId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("allUsers", params["allUsers"]);
  addQueryParam("maxCreationTime", params["maxCreationTime"]);
  addQueryParam("maxResults", params["maxResults"]);
  addQueryParam("minCreationTime", params["minCreationTime"]);
  addQueryParam("pageToken", params["pageToken"]);
  addQueryParam("parentJobId", params["parentJobId"]);
  addQueryParam("projection", params["projection"]);
  for (const item of params["stateFilter"] ?? []) {
    addQueryParam("stateFilter", item);
  }
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
      service: "BigQuery",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
