export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/chat/completions"
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
  body["messages"] = params["messages"];
  body["model"] = params["model"];
  body["frequency_penalty"] = params["frequencyPenalty"];
  body["logit_bias"] = params["logitBias"];
  body["logprobs"] = params["logprobs"];
  body["top_logprobs"] = params["topLogprobs"];
  body["max_tokens"] = params["maxTokens"];
  body["n"] = params["n"];
  body["presence_penalty"] = params["presencePenalty"];
  body["response_format"] = params["responseFormat"];
  body["seed"] = params["seed"];
  body["service_tier"] = params["serviceTier"];
  body["stop"] = params["stop"];
  body["temperature"] = params["temperature"];
  body["top_p"] = params["topP"];
  body["tools"] = params["tools"];
  body["tool_choice"] = params["toolChoice"];
  body["parallel_tool_calls"] = params["parallelToolCalls"];
  body["user"] = params["user"];
  body["function_call"] = params["functionCall"];
  body["functions"] = params["functions"];
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
