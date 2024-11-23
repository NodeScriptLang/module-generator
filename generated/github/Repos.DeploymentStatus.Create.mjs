export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
      .replace("{owner}", params["owner"])
      .replace("{repo}", params["repo"])
      .replace("{deployment_id}", params["deploymentId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["state"] = params["state"];
  body["target_url"] = params["targetUrl"];
  body["log_url"] = params["logUrl"];
  body["description"] = params["description"];
  body["environment"] = params["environment"];
  body["environment_url"] = params["environmentUrl"];
  body["auto_inactive"] = params["autoInactive"];
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
      service: "GitHub",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
