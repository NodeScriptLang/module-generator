export async function compute(params, ctx) {
  let url = new URL(
    "https://api.xero.com/api.xro/2.0/Payments"
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
  body["Invoice"] = params["invoice"];
  body["CreditNote"] = params["creditNote"];
  body["Prepayment"] = params["prepayment"];
  body["Overpayment"] = params["overpayment"];
  body["InvoiceNumber"] = params["invoiceNumber"];
  body["CreditNoteNumber"] = params["creditNoteNumber"];
  body["BatchPayment"] = params["batchPayment"];
  body["Account"] = params["account"];
  body["Code"] = params["code"];
  body["Date"] = params["date"];
  body["CurrencyRate"] = params["currencyRate"];
  body["Amount"] = params["amount"];
  body["BankAmount"] = params["bankAmount"];
  body["Reference"] = params["reference"];
  body["IsReconciled"] = params["isReconciled"];
  body["Status"] = params["status"];
  body["PaymentType"] = params["paymentType"];
  body["UpdatedDateUTC"] = params["updatedDateUtc"];
  body["PaymentID"] = params["paymentId"];
  body["BatchPaymentID"] = params["batchPaymentId"];
  body["BankAccountNumber"] = params["bankAccountNumber"];
  body["Particulars"] = params["particulars"];
  body["Details"] = params["details"];
  body["HasAccount"] = params["hasAccount"];
  body["HasValidationErrors"] = params["hasValidationErrors"];
  body["StatusAttributeString"] = params["statusAttributeString"];
  body["ValidationErrors"] = params["validationErrors"];
  body["Warnings"] = params["warnings"];
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
      service: "Xero",
      method: "post",
      url: url.href,
      ...details,
    };
    throw error;
  }
  return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;
}
