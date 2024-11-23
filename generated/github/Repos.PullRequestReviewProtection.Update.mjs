export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
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
  body["dismissal_restrictions"] = params["dismissalRestrictions"];
  body["dismiss_stale_reviews"] = params["dismissStaleReviews"];
  body["require_code_owner_reviews"] = params["requireCodeOwnerReviews"];
  body["required_approving_review_count"] = params["requiredApprovingReviewCount"];
  body["require_last_push_approval"] = params["requireLastPushApproval"];
  body["bypass_pull_request_allowances"] = params["bypassPullRequestAllowances"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PATCH",
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
      method: "patch",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
