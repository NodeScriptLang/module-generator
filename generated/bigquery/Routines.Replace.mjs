export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/datasets/{datasetId}/routines/{routineId}"
      .replace("{projectId}", params["projectId"])
      .replace("{datasetId}", params["datasetId"])
      .replace("{routineId}", params["routineId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["arguments"] = params["arguments"];
  body["creationTime"] = params["creationTime"];
  body["definitionBody"] = params["definitionBody"];
  body["description"] = params["description"];
  body["determinismLevel"] = params["determinismLevel"];
  body["etag"] = params["etag"];
  body["importedLibraries"] = params["importedLibraries"];
  body["language"] = params["language"];
  body["lastModifiedTime"] = params["lastModifiedTime"];
  body["remoteFunctionOptions"] = params["remoteFunctionOptions"];
  body["returnTableType"] = params["returnTableType"];
  body["returnType"] = params["returnType"];
  body["routineReference"] = params["routineReference"];
  body["routineType"] = params["routineType"];
  body["sparkOptions"] = params["sparkOptions"];
  body["strictMode"] = params["strictMode"];
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
      service: "BigQuery",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
