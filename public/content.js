import 'simplebar'; // Importa SimpleBar
import 'simplebar/dist/simplebar.css'; // Importa los estilos de SimpleBar

const container = document.querySelector('.styles.home');
if (container) {
  new SimpleBar(container); // Inicializa SimpleBar en el contenedor
}