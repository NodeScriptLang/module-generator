export async function compute(params, ctx) {
  let url = new URL(
    "https://api.github.com/user/packages/{package_type}/{package_name}/versions/{package_version_id}"
      .replace("{package_type}", params["packageType"])
      .replace("{package_name}", params["packageName"])
      .replace("{package_version_id}", params["packageVersionId"])
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  const body = undefined;
  const res = await ctx.lib.fetch({
    method: "DELETE",
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
      method: "delete",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
