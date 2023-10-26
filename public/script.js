// chrome.webstore.extension.onInstalled.addListener(function(details) {
//     // Obtener el dominio de la cuenta de Google del usuario actual.
//     const username = chrome.identity.getActiveUsername();
  
//     // Crear una expresión regular para el dominio que deseas restringir.
//     const domainRegex = new RegExp("@dominioespecifico.com$");
  
//     // Comprobar si el dominio coincide con el dominio restringido.
//     if (!domainRegex.match(username)) {
//       // Desinstalar la extensión automáticamente.
//       chrome.webstore.extension.uninstall(details.id);
//     }
//   });