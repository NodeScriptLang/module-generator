export async function compute(params, ctx) {
  let url = new URL(
    "https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/datasets/{datasetId}/tables/{tableId}"
      .replace("{projectId}", params["projectId"])
      .replace("{datasetId}", params["datasetId"])
      .replace("{tableId}", params["tableId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("autodetect_schema", params["autodetectSchema"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["cloneDefinition"] = params["cloneDefinition"];
  body["clustering"] = params["clustering"];
  body["creationTime"] = params["creationTime"];
  body["defaultCollation"] = params["defaultCollation"];
  body["defaultRoundingMode"] = params["defaultRoundingMode"];
  body["description"] = params["description"];
  body["encryptionConfiguration"] = params["encryptionConfiguration"];
  body["etag"] = params["etag"];
  body["expirationTime"] = params["expirationTime"];
  body["externalDataConfiguration"] = params["externalDataConfiguration"];
  body["friendlyName"] = params["friendlyName"];
  body["id"] = params["id"];
  body["kind"] = params["kind"];
  body["labels"] = params["labels"];
  body["lastModifiedTime"] = params["lastModifiedTime"];
  body["location"] = params["location"];
  body["materializedView"] = params["materializedView"];
  body["maxStaleness"] = params["maxStaleness"];
  body["model"] = params["model"];
  body["numBytes"] = params["numBytes"];
  body["numLongTermBytes"] = params["numLongTermBytes"];
  body["numPhysicalBytes"] = params["numPhysicalBytes"];
  body["numRows"] = params["numRows"];
  body["num_active_logical_bytes"] = params["numActiveLogicalBytes"];
  body["num_active_physical_bytes"] = params["numActivePhysicalBytes"];
  body["num_long_term_logical_bytes"] = params["numLongTermLogicalBytes"];
  body["num_long_term_physical_bytes"] = params["numLongTermPhysicalBytes"];
  body["num_partitions"] = params["numPartitions"];
  body["num_time_travel_physical_bytes"] = params["numTimeTravelPhysicalBytes"];
  body["num_total_logical_bytes"] = params["numTotalLogicalBytes"];
  body["num_total_physical_bytes"] = params["numTotalPhysicalBytes"];
  body["rangePartitioning"] = params["rangePartitioning"];
  body["requirePartitionFilter"] = params["requirePartitionFilter"];
  body["schema"] = params["schema"];
  body["selfLink"] = params["selfLink"];
  body["snapshotDefinition"] = params["snapshotDefinition"];
  body["streamingBuffer"] = params["streamingBuffer"];
  body["tableReference"] = params["tableReference"];
  body["timePartitioning"] = params["timePartitioning"];
  body["type"] = params["type"];
  body["view"] = params["view"];
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
