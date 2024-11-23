export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}/branches/{branch}/protection"
      .replace("{owner}", params["owner"])
      .replace("{repo}", params["repo"])
      .replace("{branch}", params["branch"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["required_status_checks"] = params["requiredStatusChecks"];
  body["enforce_admins"] = params["enforceAdmins"];
  body["required_pull_request_reviews"] = params["requiredPullRequestReviews"];
  body["restrictions"] = params["restrictions"];
  body["required_linear_history"] = params["requiredLinearHistory"];
  body["allow_force_pushes"] = params["allowForcePushes"];
  body["allow_deletions"] = params["allowDeletions"];
  body["block_creations"] = params["blockCreations"];
  body["required_conversation_resolution"] = params["requiredConversationResolution"];
  body["lock_branch"] = params["lockBranch"];
  body["allow_fork_syncing"] = params["allowForkSyncing"];
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
      service: "GitHub",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
