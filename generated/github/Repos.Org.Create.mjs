export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/orgs/{org}/repos"
      .replace("{org}", params["org"])
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
  body["has_issues"] = params["hasIssues"];
  body["has_projects"] = params["hasProjects"];
  body["has_wiki"] = params["hasWiki"];
  body["has_downloads"] = params["hasDownloads"];
  body["is_template"] = params["isTemplate"];
  body["team_id"] = params["teamId"];
  body["auto_init"] = params["autoInit"];
  body["gitignore_template"] = params["gitignoreTemplate"];
  body["license_template"] = params["licenseTemplate"];
  body["allow_squash_merge"] = params["allowSquashMerge"];
  body["allow_merge_commit"] = params["allowMergeCommit"];
  body["allow_rebase_merge"] = params["allowRebaseMerge"];
  body["allow_auto_merge"] = params["allowAutoMerge"];
  body["delete_branch_on_merge"] = params["deleteBranchOnMerge"];
  body["use_squash_pr_title_as_default"] = params["useSquashPrTitleAsDefault"];
  body["squash_merge_commit_title"] = params["squashMergeCommitTitle"];
  body["squash_merge_commit_message"] = params["squashMergeCommitMessage"];
  body["merge_commit_title"] = params["mergeCommitTitle"];
  body["merge_commit_message"] = params["mergeCommitMessage"];
  body["custom_properties"] = params["customProperties"];
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
