export async function compute(params, ctx) {
  let url = new URL(
    "https://api.xero.com/api.xro/2.0/Accounts"
  );
  const headers = {};
  const addQueryParam = (key, val) => { if (val != null) url.searchParams.append(key, val) };
  if (params["accessToken"] != null) {
    headers["Authorization"] = ("Bearer" + " " + params["accessToken"].replace(/^Bearer\s*/gi, ''));
  }
  if (params["xeroTenantId"] != null) {
    headers["xero-tenant-id"] = params["xeroTenantId"];
  }
  if (params["idempotencyKey"] != null) {
    headers["Idempotency-Key"] = params["idempotencyKey"];
  }
  headers["content-type"] = "application/json";
  let body = {};
  body["Code"] = params["code"];
  body["Name"] = params["name"];
  body["AccountID"] = params["accountId"];
  body["Type"] = params["type"];
  body["BankAccountNumber"] = params["bankAccountNumber"];
  body["Status"] = params["status"];
  body["Description"] = params["description"];
  body["BankAccountType"] = params["bankAccountType"];
  body["CurrencyCode"] = params["currencyCode"];
  body["TaxType"] = params["taxType"];
  body["EnablePaymentsToAccount"] = params["enablePaymentsToAccount"];
  body["ShowInExpenseClaims"] = params["showInExpenseClaims"];
  body["Class"] = params["class"];
  body["SystemAccount"] = params["systemAccount"];
  body["ReportingCode"] = params["reportingCode"];
  body["ReportingCodeName"] = params["reportingCodeName"];
  body["HasAttachments"] = params["hasAttachments"];
  body["UpdatedDateUTC"] = params["updatedDateUtc"];
  body["AddToWatchlist"] = params["addToWatchlist"];
  body["ValidationErrors"] = params["validationErrors"];
  body = JSON.stringify(body);
  const res = await ctx.lib.fetch({
    method: "PUT",
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
      service: "Xero",
      method: "put",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
