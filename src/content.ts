import browser, { WebRequest } from 'webextension-polyfill';

let authorizationHeader: WebRequest.HttpHeadersItemType;

browser.runtime.onMessage.addListener((message) => {
  if (message.authorizationHeader) {
    authorizationHeader = message.authorizationHeader;
  }

  return Promise.resolve();
});

async function getElement(root: ParentNode, selector: string, maxAttempts = 20): Promise<ParentNode> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    if (attempts++ > maxAttempts) {
      reject();
    }

    const element = root.querySelector(selector);
    if (element) {
      resolve(element);
    }
  });
}

async function getResourceName(titleElement: ParentNode) {
  const element = await getElement(titleElement, ".fxs-blade-title .fxs-blade-title-titleText");

  return element?.textContent || "";
}

async function getResourceType(titleElement: ParentNode) {
  const element = await getElement(titleElement, ".fxs-blade-title .fxs-blade-title-subtitleText");

  return element?.textContent || "";
}

async function getActionsContainerElement(titleElement: ParentNode) {
  return await getElement(titleElement, ".fxs-blade-title .fxs-blade-actions");
}

async function openPimTab(titleElement: ParentNode) {
  const resourceName = await getResourceName(titleElement);
  const resourceType = await getResourceType(titleElement);

  let resourceTypeFilter = "";
  switch (resourceType.toLocaleLowerCase()) {
    case "resource group":
      resourceTypeFilter = `type eq 'resourcegroup'`;
      break;
    case "subscription":
      resourceTypeFilter = `type eq 'subscription'`;
      break;
    default:
      resourceTypeFilter = `type ne 'resourcegroup' and type ne 'subscription' and type ne 'managementgroup'`;
  }

  const resourceNameFilter = `tolower(displayName) eq '${resourceName.toLocaleLowerCase()}'`;

  const pimSearchUrl = `https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/azureResources/resources?$select=id,displayName,type,externalId&$expand=parent&$filter=((${encodeURIComponent(resourceTypeFilter)})%20and%20(${encodeURIComponent(resourceNameFilter)}))&$top=10`;
  const pimSearchResponse = await fetch(pimSearchUrl, { headers: { "Authorization": authorizationHeader.value || "" } });
  const results = await pimSearchResponse.json();

  const resource = results.value[0];
  const pimResourceUrl = `https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/ResourceMenuBlade/~/MyActions/resourceId/${resource.id}/resourceType/${encodeURIComponent(resource.type)}/provider/azurerbac/resourceDisplayName/${encodeURIComponent(resourceName)}/resourceExternalId/${encodeURIComponent(resource.externalId)}`;

  window.open(pimResourceUrl, "_blank");
}

async function addPimButton(titleElement: ParentNode) {
  const actionsContainerElement = await getActionsContainerElement(titleElement);
  const pimElement = document.createElement("button");
  pimElement.type = "button";
  pimElement.classList.add("pim-extension-button");
  pimElement.classList.add("fxs-blade-button");
  pimElement.classList.add("fxs-portal-hover");
  pimElement.classList.add("msportalfx-hideonactivated");
  pimElement.title = `Open in PIM`;
  pimElement.addEventListener("click", () => openPimTab(titleElement));

  const imageElement = document.createElement("img");
  imageElement.src = browser.runtime.getURL("images/icon.png");

  pimElement.appendChild(imageElement);

  actionsContainerElement?.insertBefore(pimElement, actionsContainerElement.firstChild);
}

async function triggerAddPimButton() {
  let intervalCount = 0;
  const interval = setInterval(async () => {
    if (intervalCount++ > 100) {
      clearInterval(interval);
    }

    const bladeTitleElements = document.querySelectorAll(".fxs-blade-title");
    for (const bladeTitleElement of bladeTitleElements) {
      if (bladeTitleElement.querySelector(".pim-extension-button")) {
        continue;
      }

      await addPimButton(bladeTitleElement);
    }
  }, 100);
}

window.addEventListener("load", triggerAddPimButton);
window.addEventListener("hashchange", triggerAddPimButton);
