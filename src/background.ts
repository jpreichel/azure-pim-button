import browser, { WebRequest } from 'webextension-polyfill';

function getAuthorizationPayload(authorizationHeader: WebRequest.HttpHeadersItemType): any {
  const [, token] = (authorizationHeader.value || "").split(' ');
  const [, payload] = token.split('.');

  return JSON.parse(atob(payload));
}

function captureAuthorizationHeader(event: WebRequest.OnSendHeadersDetailsType): void {
  try {
    const [authorizationHeader] = event.requestHeaders?.filter(header => header.name.toLowerCase() === "authorization") || [];

    if (authorizationHeader) {
      const payload = getAuthorizationPayload(authorizationHeader);
      if (payload?.groups) {
        const queryOptions = { currentWindow: true, active: true };
        browser.tabs.query(queryOptions)
          .then(([currentTab]) => {
            if (currentTab?.id) {
              browser.tabs.sendMessage(currentTab.id, { authorizationHeader });
            }
          });
      }
    }
  }
  catch (e) {
    console.log(e);
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    browser.webRequest.onSendHeaders.addListener(
      captureAuthorizationHeader,
      { urls: ["https://api.azrbac.mspim.azure.com/*", "https://portal.azure.com/*"] },
      ["requestHeaders"]
    );
  }
});
