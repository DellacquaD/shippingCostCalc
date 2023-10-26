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
  } else if (request.action === "setLocalStorage") {
    if (request.key && request.value) {
      const dataToStore = { [request.key]: request.value };
      chrome.storage.local.set(dataToStore, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: "Error al guardar en el almacenamiento local" });
        } else {
          sendResponse({ success: true });
        }
      });
    } else {
      sendResponse({ error: "La clave y el valor son obligatorios para setLocalStorage" });
    }
  } else if (request.action === "getLocalStorage") {
    if (request.keys && Array.isArray(request.keys)) {
      chrome.storage.local.get(request.keys, (data) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: "Error al recuperar datos del almacenamiento local" });
        } else {
          sendResponse({ data });
        }
      });
    } else {
      sendResponse({ error: "Se requiere una matriz de claves para getLocalStorage" });
    }
  } else {
    sendResponse({ error: "Acción no válida" });
  }
  return true; // Importante para mantener abierta la conexión del puerto de mensajes
});
