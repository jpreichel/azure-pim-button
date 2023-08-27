import browser, { WebRequest } from 'webextension-polyfill';

const attemptedTokens = {};
const pimSearchUrl = `https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/azureResources/resources?$select=id,displayName,type,externalId&$expand=parent&$top=1`;

function getAuthorizationPayload(authorizationHeader: WebRequest.HttpHeadersItemType): any {
  const [, token] = (authorizationHeader.value || "").split(' ');
  const [, payload] = token.split('.');

  return JSON.parse(atob(payload));
}

function captureAuthorizationHeader(event: WebRequest.OnSendHeadersDetailsType): void {
  const [authorizationHeader] = event.requestHeaders?.filter(header => header.name.toLowerCase() === "authorization") || [];

  if (authorizationHeader?.value && getAuthorizationPayload(authorizationHeader)["groups"]) {
    if (attemptedTokens[authorizationHeader.value]) {
      return;
    }

    attemptedTokens[authorizationHeader.value] = new Date();

    fetch(pimSearchUrl, { headers: { "Authorization": authorizationHeader.value || "" } })
      .then(() => browser.tabs.query({ status: "complete", active: true }))
      .then((tabs) => {
        for (const tab of tabs.filter(t => t.url?.includes("azure.com"))) {
          if (tab.id) {
            browser.tabs.sendMessage(tab.id, { authorizationHeader });
          }
        }
      })
      .catch(e => console.log(e));
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    browser.webRequest.onSendHeaders.addListener(
      captureAuthorizationHeader,
      { urls: ["https://*.azure.com/*"] },
      ["requestHeaders"]
    );
  }
});
