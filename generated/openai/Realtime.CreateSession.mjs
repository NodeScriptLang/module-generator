export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/realtime/sessions"
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
  body["modalities"] = params["modalities"];
  body["model"] = params["model"];
  body["instructions"] = params["instructions"];
  body["voice"] = params["voice"];
  body["input_audio_format"] = params["inputAudioFormat"];
  body["output_audio_format"] = params["outputAudioFormat"];
  body["input_audio_transcription"] = params["inputAudioTranscription"];
  body["turn_detection"] = params["turnDetection"];
  body["tools"] = params["tools"];
  body["tool_choice"] = params["toolChoice"];
  body["temperature"] = params["temperature"];
  body["max_response_output_tokens"] = params["maxResponseOutputTokens"];
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
