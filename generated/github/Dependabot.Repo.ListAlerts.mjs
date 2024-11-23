export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/repos/{owner}/{repo}/dependabot/alerts"
      .replace("{owner}", params["owner"])
      .replace("{repo}", params["repo"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("state", params["state"]);
  addQueryParam("severity", params["severity"]);
  addQueryParam("ecosystem", params["ecosystem"]);
  addQueryParam("package", params["package"]);
  addQueryParam("manifest", params["manifest"]);
  addQueryParam("scope", params["scope"]);
  addQueryParam("sort", params["sort"]);
  addQueryParam("direction", params["direction"]);
  addQueryParam("page", params["page"]);
  addQueryParam("per_page", params["perPage"]);
  addQueryParam("before", params["before"]);
  addQueryParam("after", params["after"]);
  addQueryParam("first", params["first"]);
  addQueryParam("last", params["last"]);
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
      service: "GitHub",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
