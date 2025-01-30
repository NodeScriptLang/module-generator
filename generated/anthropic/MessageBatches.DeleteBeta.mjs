export async function compute(params, ctx) {
  let url = new URL(
    "https://api.anthropic.com/v1/messages/batches/{message_batch_id}?beta=true"
      .replace("{message_batch_id}", params["messageBatchId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["xApiKey"] != null) {
    headers["x-api-key"] = ("Bearer" + " " + params["xApiKey"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["anthropicBeta"] != null) {
    headers["anthropic-beta"] = params["anthropicBeta"];
  }
  if (params["anthropicVersion"] != null) {
    headers["anthropic-version"] = params["anthropicVersion"];
  }
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "DELETE",
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
      service: "Anthropic",
      method: "delete",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
