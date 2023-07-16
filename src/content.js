import browser from 'webextension-polyfill';

let authorizationHeader;

browser.runtime.onMessage.addListener((message) => {
  if (message.authorizationHeader) {
    authorizationHeader = message.authorizationHeader;
  }

  return Promise.resolve();
});

async function getResourceName() {
  return new Promise((resolve) => {
    const resourceNameInterval = setInterval(() => {
      const [resourceNameElement] = document.querySelectorAll(".fxs-blade-title-titleText");
      if (resourceNameElement.innerText) {
        clearInterval(resourceNameInterval);
        resolve(resourceNameElement.innerText);
      }
    }, 50);
   });
}

async function getResourceType() {
  return new Promise((resolve) => {
    const resourceTypeInterval = setInterval(() => {
      const [resourceTypeElement] = document.querySelectorAll(".fxs-blade-title-subtitle");
      if (resourceTypeElement.innerText) {
        clearInterval(resourceTypeInterval);
        resolve(resourceTypeElement.innerText);
      }
    }, 50);
   });
}

async function getActionsContainerElement() {
  return new Promise((resolve) => {
    const actionsInterval = setInterval(() => {
      const [actionsElement] = document.querySelectorAll(".fxs-blade-actions");
      if (actionsElement) {
        clearInterval(actionsInterval);
        resolve(actionsElement);
      }
    }, 50);
   });
}

async function openPimTab(resourceName) {
  const pimSearchUrl = `https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/azureResources/resources?$select=id,displayName,type,externalId&$expand=parent&$filter=((type%20ne%20%27resourcegroup%27%20and%20type%20ne%20%27subscription%27%20and%20type%20ne%20%27managementgroup%27%20and%20type%20ne%20%27resourcegroup%27%20and%20type%20ne%20%27subscription%27%20and%20type%20ne%20%27managementgroup%27)%20and%20(contains(tolower(displayName),%20%27${encodeURIComponent(resourceName)}%27)))&$top=10`;
  const pimSearchResponse = await fetch(pimSearchUrl, { headers: { authorization: authorizationHeader.value }});
  const results = await pimSearchResponse.json();

  const resource = results.value[0];
  const pimResourceUrl = `https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/ResourceMenuBlade/~/MyActions/resourceId/${resource.id}/resourceType/${encodeURIComponent(resource.type)}/provider/azurerbac/resourceDisplayName/${encodeURIComponent(resourceName)}/resourceExternalId/${encodeURIComponent(resource.externalId)}`;

  window.open(pimResourceUrl, "_blank");
}

window.addEventListener("load", async function() {
  const resourceName = await getResourceName();
  const resourceType = await getResourceType();

  const actionsContainerElement = await getActionsContainerElement();
  const pimElement = document.createElement("button");
  pimElement.type = "button";
  pimElement.classList.add("fxs-blade-button");
  pimElement.classList.add("fxs-portal-hover");
  pimElement.classList.add("msportalfx-hideonactivated");
  pimElement.title = `Open ${resourceName} (${resourceType}) in PIM`;
  pimElement.addEventListener("click", () => openPimTab(resourceName));

  const iconElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconElement.role = "presentation";
  iconElement.focusable = "false";

  const useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
  useElement.setAttribute("href", "#FxSymbol0-03b");
  useElement.setAttributeNS("http://www.w3.org/1999/href", "xlink:href", "#FxSymbol0-03b");

  iconElement.appendChild(useElement);
  pimElement.appendChild(iconElement);

  actionsContainerElement.insertBefore(pimElement, actionsContainerElement.firstChild);
});
