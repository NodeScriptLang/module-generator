export async function compute(params, ctx) {
  let url = new URL(
    "https://api.openai.com/v1/audio/translations"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["betaAccess"] != null) {
    headers["OpenAI-Beta"] = params["betaAccess"];
  }
  const formData = new FormData();
  const addFormDataParam = (key, val, filename) => {
    if (val === undefined) { return; }
    if (filename === undefined) {
        formData.append(key, val);
    } else {
        if (typeof val === "string") {
           val = new Blob([val]);
        }
        formData.append(key, val, filename);
    }
  };
  addFormDataParam("file", params["file"]);
  addFormDataParam("model", params["model"]);
  addFormDataParam("prompt", params["prompt"]);
  addFormDataParam("response_format", params["responseFormat"]);
  addFormDataParam("temperature", params["temperature"]);
  const body = formData;
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
