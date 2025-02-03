export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/organization/projects/{project_id}/rate_limits/{rate_limit_id}"
      .replace("{project_id}", params["projectId"])
      .replace("{rate_limit_id}", params["rateLimitId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["betaAccess"] != null) {
    headers["OpenAI-Beta"] = params["betaAccess"];
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["max_requests_per_1_minute"] = params["maxRequestsPer1Minute"];
  body["max_tokens_per_1_minute"] = params["maxTokensPer1Minute"];
  body["max_images_per_1_minute"] = params["maxImagesPer1Minute"];
  body["max_audio_megabytes_per_1_minute"] = params["maxAudioMegabytesPer1Minute"];
  body["max_requests_per_1_day"] = params["maxRequestsPer1Day"];
  body["batch_1_day_max_input_tokens"] = params["batch1DayMaxInputTokens"];
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
      service: "OpenAI",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
