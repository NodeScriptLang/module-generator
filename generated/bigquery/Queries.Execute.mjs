export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/queries"
      .replace("{projectId}", params["projectId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["connectionProperties"] = params["connectionProperties"];
  body["continuous"] = params["continuous"];
  body["createSession"] = params["createSession"];
  body["defaultDataset"] = params["defaultDataset"];
  body["dryRun"] = params["dryRun"];
  body["kind"] = params["kind"];
  body["labels"] = params["labels"];
  body["location"] = params["location"];
  body["maxResults"] = params["maxResults"];
  body["maximumBytesBilled"] = params["maximumBytesBilled"];
  body["parameterMode"] = params["parameterMode"];
  body["preserveNulls"] = params["preserveNulls"];
  body["query"] = params["query"];
  body["queryParameters"] = params["queryParameters"];
  body["requestId"] = params["requestId"];
  body["timeoutMs"] = params["timeoutMs"];
  body["useLegacySql"] = params["useLegacySql"];
  body["useQueryCache"] = params["useQueryCache"];
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
      service: "BigQuery",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
