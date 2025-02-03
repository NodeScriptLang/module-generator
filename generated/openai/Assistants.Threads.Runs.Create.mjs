export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/threads/{thread_id}/runs"
      .replace("{thread_id}", params["threadId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["betaAccess"] != null) {
    headers["OpenAI-Beta"] = params["betaAccess"];
  }
  addQueryParam("include[]", params["include[]"].join(","));
  headers["content-type"] = "application/json";
  let body = {};
  body["assistant_id"] = params["assistantId"];
  body["model"] = params["model"];
  body["instructions"] = params["instructions"];
  body["additional_instructions"] = params["additionalInstructions"];
  body["additional_messages"] = params["additionalMessages"];
  body["tools"] = params["tools"];
  body["metadata"] = params["metadata"];
  body["temperature"] = params["temperature"];
  body["top_p"] = params["topP"];
  body["stream"] = params["stream"];
  body["max_prompt_tokens"] = params["maxPromptTokens"];
  body["max_completion_tokens"] = params["maxCompletionTokens"];
  body["truncation_strategy"] = params["truncationStrategy"];
  body["tool_choice"] = params["toolChoice"];
  body["parallel_tool_calls"] = params["parallelToolCalls"];
  body["response_format"] = params["responseFormat"];
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
