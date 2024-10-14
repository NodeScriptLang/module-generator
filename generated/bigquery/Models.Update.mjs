export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/datasets/{datasetId}/models/{modelId}"
      .replace("{projectId}", params["projectId"])
      .replace("{datasetId}", params["datasetId"])
      .replace("{modelId}", params["modelId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["bestTrialId"] = params["bestTrialId"];
  body["creationTime"] = params["creationTime"];
  body["defaultTrialId"] = params["defaultTrialId"];
  body["description"] = params["description"];
  body["encryptionConfiguration"] = params["encryptionConfiguration"];
  body["etag"] = params["etag"];
  body["expirationTime"] = params["expirationTime"];
  body["featureColumns"] = params["featureColumns"];
  body["friendlyName"] = params["friendlyName"];
  body["hparamSearchSpaces"] = params["hparamSearchSpaces"];
  body["hparamTrials"] = params["hparamTrials"];
  body["labelColumns"] = params["labelColumns"];
  body["labels"] = params["labels"];
  body["lastModifiedTime"] = params["lastModifiedTime"];
  body["location"] = params["location"];
  body["modelReference"] = params["modelReference"];
  body["modelType"] = params["modelType"];
  body["optimalTrialIds"] = params["optimalTrialIds"];
  body["trainingRuns"] = params["trainingRuns"];
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
      service: "BigQuery",
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
