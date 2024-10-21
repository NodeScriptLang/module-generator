export async function compute(params, ctx) {
  let url = new URL(
    "https://api.trello.com/1/enterprises/{id}"
      .replace("{id}", params["id"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  addQueryParam("key", params["apiKey"]);
  addQueryParam("token", params["accessToken"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("members", params["members"]);
  addQueryParam("member_fields", params["memberFields"]);
  addQueryParam("member_filter", params["memberFilter"]);
  addQueryParam("member_sort", params["memberSort"]);
  addQueryParam("member_sortBy", params["memberSortBy"]);
  addQueryParam("member_sortOrder", params["memberSortOrder"]);
  addQueryParam("member_startIndex", params["memberStartIndex"]);
  addQueryParam("member_count", params["memberCount"]);
  addQueryParam("organizations", params["organizations"]);
  addQueryParam("organization_fields", params["organizationFields"]);
  addQueryParam("organization_paid_accounts", params["organizationPaidAccounts"]);
  addQueryParam("organization_memberships", params["organizationMemberships"]);
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "GET",
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
      service: "Trello",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
