import browser from 'webextension-polyfill';

async function captureAuthorizationHeader(event) {
  try{
  const [authorizationHeader] = event.requestHeaders.filter(header => header.name.toLowerCase() === "authorization");

  if (authorizationHeader) {
    const queryOptions = { currentWindow: true, active: true };
    const [currentTab] = await browser.tabs.query(queryOptions);

    if (currentTab) {
      console.log(currentTab);
      await browser.tabs.sendMessage(currentTab.id, { authorizationHeader });
    }
  }}
  catch(e) {
    console.log(e);
  }
}

browser.webRequest.onBeforeSendHeaders.addListener(
  captureAuthorizationHeader,
  { urls: ["https://api.azrbac.mspim.azure.com/*", "https://portal.azure.com/*"] },
  ["requestHeaders"]
);
