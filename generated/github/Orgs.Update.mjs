export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/orgs/{org}"
      .replace("{org}", params["org"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["billing_email"] = params["billingEmail"];
  body["company"] = params["company"];
  body["email"] = params["email"];
  body["twitter_username"] = params["twitterUsername"];
  body["location"] = params["location"];
  body["name"] = params["name"];
  body["description"] = params["description"];
  body["has_organization_projects"] = params["hasOrganizationProjects"];
  body["has_repository_projects"] = params["hasRepositoryProjects"];
  body["default_repository_permission"] = params["defaultRepositoryPermission"];
  body["members_can_create_repositories"] = params["membersCanCreateRepositories"];
  body["members_can_create_internal_repositories"] = params["membersCanCreateInternalRepositories"];
  body["members_can_create_private_repositories"] = params["membersCanCreatePrivateRepositories"];
  body["members_can_create_public_repositories"] = params["membersCanCreatePublicRepositories"];
  body["members_allowed_repository_creation_type"] = params["membersAllowedRepositoryCreationType"];
  body["members_can_create_pages"] = params["membersCanCreatePages"];
  body["members_can_create_public_pages"] = params["membersCanCreatePublicPages"];
  body["members_can_create_private_pages"] = params["membersCanCreatePrivatePages"];
  body["members_can_fork_private_repositories"] = params["membersCanForkPrivateRepositories"];
  body["web_commit_signoff_required"] = params["webCommitSignoffRequired"];
  body["blog"] = params["blog"];
  body["advanced_security_enabled_for_new_repositories"] = params["advancedSecurityEnabledForNewRepositories"];
  body["dependabot_alerts_enabled_for_new_repositories"] = params["dependabotAlertsEnabledForNewRepositories"];
  body["dependabot_security_updates_enabled_for_new_repositories"] = params["dependabotSecurityUpdatesEnabledForNewRepositories"];
  body["dependency_graph_enabled_for_new_repositories"] = params["dependencyGraphEnabledForNewRepositories"];
  body["secret_scanning_enabled_for_new_repositories"] = params["secretScanningEnabledForNewRepositories"];
  body["secret_scanning_push_protection_enabled_for_new_repositories"] = params["secretScanningPushProtectionEnabledForNewRepositories"];
  body["secret_scanning_push_protection_custom_link_enabled"] = params["secretScanningPushProtectionCustomLinkEnabled"];
  body["secret_scanning_push_protection_custom_link"] = params["secretScanningPushProtectionCustomLink"];
  body["deploy_keys_enabled_for_repositories"] = params["deployKeysEnabledForRepositories"];
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
