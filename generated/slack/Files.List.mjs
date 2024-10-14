export async function compute(params, ctx) {
  let url = new URL(
    "https://slack.com/api/files.list"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("user", params["user"]);
  addQueryParam("channel", params["channel"]);
  addQueryParam("ts_from", params["tsFrom"]);
  addQueryParam("ts_to", params["tsTo"]);
  addQueryParam("types", params["types"]);
  addQueryParam("count", params["count"]);
  addQueryParam("page", params["page"]);
  addQueryParam("show_files_hidden_by_limit", params["showFilesHiddenByLimit"]);
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
      service: "Slack",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
