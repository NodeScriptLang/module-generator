export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}/comments"
      .replace("{owner}", params["owner"])
      .replace("{repo}", params["repo"])
      .replace("{pull_number}", params["pullNumber"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["body"] = params["body"];
  body["commit_id"] = params["commitId"];
  body["path"] = params["path"];
  body["position"] = params["position"];
  body["side"] = params["side"];
  body["line"] = params["line"];
  body["start_line"] = params["startLine"];
  body["start_side"] = params["startSide"];
  body["in_reply_to"] = params["inReplyTo"];
  body["subject_type"] = params["subjectType"];
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
