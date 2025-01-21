export async function compute(params, ctx) {
  let url = new URL(
    "https://api.notion.com/v1/comments"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["auth"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["auth"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["notionVersion"] != null) {
    headers["Notion-Version"] = params["notionVersion"];
  }
  addQueryParam("block_id", params["blockId"]);
  addQueryParam("page_size", params["pageSize"]);
  headers["content-type"] = "application/x-www-form-urlencoded";
  let body = new URLSearchParams();
  const addBodyParam = (key, val) => { if (val !== undefined) body.append(key, val) };
  body = body.toString()
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
      service: "Notion",
      method: "get",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
