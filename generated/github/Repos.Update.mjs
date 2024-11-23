export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}"
      .replace("{owner}", params["owner"])
      .replace("{repo}", params["repo"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["name"] = params["name"];
  body["description"] = params["description"];
  body["homepage"] = params["homepage"];
  body["private"] = params["private"];
  body["visibility"] = params["visibility"];
  body["security_and_analysis"] = params["securityAndAnalysis"];
  body["has_issues"] = params["hasIssues"];
  body["has_projects"] = params["hasProjects"];
  body["has_wiki"] = params["hasWiki"];
  body["is_template"] = params["isTemplate"];
  body["default_branch"] = params["defaultBranch"];
  body["allow_squash_merge"] = params["allowSquashMerge"];
  body["allow_merge_commit"] = params["allowMergeCommit"];
  body["allow_rebase_merge"] = params["allowRebaseMerge"];
  body["allow_auto_merge"] = params["allowAutoMerge"];
  body["delete_branch_on_merge"] = params["deleteBranchOnMerge"];
  body["allow_update_branch"] = params["allowUpdateBranch"];
  body["use_squash_pr_title_as_default"] = params["useSquashPrTitleAsDefault"];
  body["squash_merge_commit_title"] = params["squashMergeCommitTitle"];
  body["squash_merge_commit_message"] = params["squashMergeCommitMessage"];
  body["merge_commit_title"] = params["mergeCommitTitle"];
  body["merge_commit_message"] = params["mergeCommitMessage"];
  body["archived"] = params["archived"];
  body["allow_forking"] = params["allowForking"];
  body["web_commit_signoff_required"] = params["webCommitSignoffRequired"];
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
