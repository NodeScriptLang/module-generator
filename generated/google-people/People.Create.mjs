export async function compute(params, ctx) {
  let url = new URL(
    "https://people.googleapis.com/v1/people:createContact"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  addQueryParam("key", params["apiKey"]);
  addQueryParam("fields", params["fields"]);
  addQueryParam("personFields", params["personFields"]);
  for (const item of params["sources"] ?? []) {
    addQueryParam("sources", item);
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["addresses"] = params["addresses"];
  body["ageRanges"] = params["ageRanges"];
  body["biographies"] = params["biographies"];
  body["birthdays"] = params["birthdays"];
  body["calendarUrls"] = params["calendarUrls"];
  body["clientData"] = params["clientData"];
  body["coverPhotos"] = params["coverPhotos"];
  body["emailAddresses"] = params["emailAddresses"];
  body["etag"] = params["etag"];
  body["events"] = params["events"];
  body["externalIds"] = params["externalIds"];
  body["fileAses"] = params["fileAses"];
  body["genders"] = params["genders"];
  body["imClients"] = params["imClients"];
  body["interests"] = params["interests"];
  body["locales"] = params["locales"];
  body["locations"] = params["locations"];
  body["memberships"] = params["memberships"];
  body["metadata"] = params["metadata"];
  body["miscKeywords"] = params["miscKeywords"];
  body["names"] = params["names"];
  body["nicknames"] = params["nicknames"];
  body["occupations"] = params["occupations"];
  body["organizations"] = params["organizations"];
  body["phoneNumbers"] = params["phoneNumbers"];
  body["photos"] = params["photos"];
  body["relations"] = params["relations"];
  body["resourceName"] = params["resourceName"];
  body["sipAddresses"] = params["sipAddresses"];
  body["skills"] = params["skills"];
  body["urls"] = params["urls"];
  body["userDefined"] = params["userDefined"];
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
      service: "Google People",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
