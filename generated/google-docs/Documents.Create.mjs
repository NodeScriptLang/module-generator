export async function compute(params, ctx) {
  let url = new URL(
    "https://docs.googleapis.com/v1/documents"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("upload_protocol", params["uploadProtocol"]);
  addQueryParam("uploadType", params["uploadType"]);
  headers["content-type"] = "application/json";
  let body = {};
  body["body"] = params["body"];
  body["documentId"] = params["documentId"];
  body["documentStyle"] = params["documentStyle"];
  body["footers"] = params["footers"];
  body["footnotes"] = params["footnotes"];
  body["headers"] = params["headers"];
  body["inlineObjects"] = params["inlineObjects"];
  body["lists"] = params["lists"];
  body["namedRanges"] = params["namedRanges"];
  body["namedStyles"] = params["namedStyles"];
  body["positionedObjects"] = params["positionedObjects"];
  body["revisionId"] = params["revisionId"];
  body["suggestedDocumentStyleChanges"] = params["suggestedDocumentStyleChanges"];
  body["suggestedNamedStylesChanges"] = params["suggestedNamedStylesChanges"];
  body["suggestionsViewMode"] = params["suggestionsViewMode"];
  body["title"] = params["title"];
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
      service: "Google Docs",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
