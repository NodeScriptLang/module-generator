export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/datasets"
      .replace("{projectId}", params["projectId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["access"] = params["access"];
  body["creationTime"] = params["creationTime"];
  body["datasetReference"] = params["datasetReference"];
  body["defaultCollation"] = params["defaultCollation"];
  body["defaultEncryptionConfiguration"] = params["defaultEncryptionConfiguration"];
  body["defaultPartitionExpirationMs"] = params["defaultPartitionExpirationMs"];
  body["defaultRoundingMode"] = params["defaultRoundingMode"];
  body["defaultTableExpirationMs"] = params["defaultTableExpirationMs"];
  body["description"] = params["description"];
  body["etag"] = params["etag"];
  body["friendlyName"] = params["friendlyName"];
  body["id"] = params["id"];
  body["isCaseInsensitive"] = params["isCaseInsensitive"];
  body["kind"] = params["kind"];
  body["labels"] = params["labels"];
  body["lastModifiedTime"] = params["lastModifiedTime"];
  body["location"] = params["location"];
  body["maxTimeTravelHours"] = params["maxTimeTravelHours"];
  body["satisfiesPzs"] = params["satisfiesPzs"];
  body["selfLink"] = params["selfLink"];
  body["storageBillingModel"] = params["storageBillingModel"];
  body["tags"] = params["tags"];
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
