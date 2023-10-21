chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getShippingData") {
      fetch('https://raw.githubusercontent.com/DellacquaD/shippingCostCalc/main/src/shippingCost.json')
        .then(response => response.json())
        .then(data => {
          sendResponse({ data });
        })
        .catch(error => {
          sendResponse({ error: 'Error al obtener el JSON' });
        });

      return true;
    }
  });