import browser, { WebRequest } from 'webextension-polyfill';

let authorizationHeader: WebRequest.HttpHeadersItemType;

browser.runtime.onMessage.addListener((message) => {
  if (message.authorizationHeader) {
    authorizationHeader = message.authorizationHeader;
  }

  return Promise.resolve();
});

async function getElement(root: ParentNode, selector: string, maxAttempts = 0): Promise<ParentNode> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (maxAttempts && attempts++ > maxAttempts) {
        reject();
      }

      const element = root.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
}

async function getBladeTitleElement() {
  return await getElement(document, ".fxs-blade-title", 20);
}

async function getResourceName(titleElement: ParentNode) {
  const element = await getElement(titleElement, ".fxs-blade-title .fxs-blade-title-titleText");

  return element?.textContent;
}

async function getResourceType(titleElement: ParentNode) {
  const element = await getElement(titleElement, ".fxs-blade-title .fxs-blade-title-subtitle");

  return element?.textContent;
}

async function getActionsContainerElement(titleElement: ParentNode) {
  return await getElement(titleElement, ".fxs-blade-title .fxs-blade-actions");
}

async function openPimTab(resourceName: string) {
  const pimSearchUrl = `https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/azureResources/resources?$select=id,displayName,type,externalId&$expand=parent&$filter=((type%20ne%20%27resourcegroup%27%20and%20type%20ne%20%27subscription%27%20and%20type%20ne%20%27managementgroup%27)%20and%20(contains(tolower(displayName),%20%27${encodeURIComponent(resourceName)}%27)))&$top=10`;
  const pimSearchResponse = await fetch(pimSearchUrl, { headers: { "Authorization": authorizationHeader.value || "" } });
  const results = await pimSearchResponse.json();

  const resource = results.value[0];
  const pimResourceUrl = `https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/ResourceMenuBlade/~/MyActions/resourceId/${resource.id}/resourceType/${encodeURIComponent(resource.type)}/provider/azurerbac/resourceDisplayName/${encodeURIComponent(resourceName)}/resourceExternalId/${encodeURIComponent(resource.externalId)}`;

  window.open(pimResourceUrl, "_blank");
}


async function addPimButton() {
  const titleElement = await getBladeTitleElement();

  const resourceName = await getResourceName(titleElement);
  const resourceType = await getResourceType(titleElement);

  const actionsContainerElement = await getActionsContainerElement(titleElement);
  const pimElement = document.createElement("button");
  pimElement.type = "button";
  pimElement.classList.add("pim-extension-button");
  pimElement.classList.add("fxs-blade-button");
  pimElement.classList.add("fxs-portal-hover");
  pimElement.classList.add("msportalfx-hideonactivated");
  pimElement.title = `Open ${resourceName} (${resourceType}) in PIM`;
  pimElement.addEventListener("click", () => openPimTab(resourceName || ""));

  const imageElement = document.createElement("img");
  imageElement.src = browser.runtime.getURL("images/icon.png");

  pimElement.appendChild(imageElement);

  actionsContainerElement.insertBefore(pimElement, actionsContainerElement.firstChild);
}

window.addEventListener("load", addPimButton);
window.addEventListener("hashchange", addPimButton);
