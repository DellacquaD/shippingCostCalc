import React, { useState, useEffect } from "react";
import jsonShippingCost from "./shippingCost.json";



function Home({ styles }) {
  const [userLength, setUserLength] = useState("")
  const [userWidth, setUserWidth] = useState("")
  const [userHeight, setUserHeight] = useState("")
  const [userWeight, setUserWeight] = useState("")
  const [systemLength, setSystemLength] = useState("")
  const [systemWidth, setSystemWidth] = useState("")
  const [systemHeight, setSystemHeight] = useState("")
  const [systemWeight, setSystemWeight] = useState("")
  const [weightDenominator, setWeightDenominator] = useState(4000)
  const [site, setSite] = useState("MLM")
  const [tarifa, setTarifa] = useState({});

  useEffect(() => {
    const findTarifa = (peso, site) => {
      const tarifas = jsonShippingCost[site]?.Tarifas;
      if (tarifas) {
        for (const rango in tarifas) {
          if (rango.startsWith("Hasta")) {
            const limiteSuperior = parseFloat(rango.split(" ")[2].replace(",", "").replace("Kg", ""));
            if (peso <= limiteSuperior) {
              return {
                clave: rango,
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim())
              };
            }
          } else if (rango.startsWith("Más de")) {
            const limiteInferior = parseFloat(rango.split(" ")[2].replace(",", "").replace("Kg", ""));
            if (peso >= limiteInferior) {
              return {
                clave: rango,
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim())
              };
            }
          } else {
            const [limiteInferior, limiteSuperior] = rango
              .split(" a ")
              .map(valor => parseFloat(valor.replace(",", "").replace("Kg", "").trim()));
            if (peso > limiteInferior && peso <= limiteSuperior) {
              return {
                clave: rango,
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim())
              };
            }
          }
        }
        // Si no se encuentra ninguna coincidencia, regresa el valor de la primera tarifa
        return {
          clave: Object.keys(tarifas)[0],
          valor: parseFloat(tarifas[Object.keys(tarifas)[0]].replace(",", "").replace("$", "").trim())
        };
      }
      return null;
    };    

    const userPeso = (userLength * userWidth * userHeight) / weightDenominator;
    const systemPeso = (systemLength * systemWidth * systemHeight) / weightDenominator;

    
    const usedWeightUser = userPeso > userWeight ? userPeso : userWeight;
    const usedWeightSystem = systemPeso > systemWeight ? systemPeso : systemWeight;
    
    const userTarifa = findTarifa(usedWeightUser, site);
    const systemTarifa = findTarifa(usedWeightSystem, site);
    
    // Actualizar las tarifas en el estado
    setTarifa({
      user: userTarifa,
      system: systemTarifa,
    });
  }, [
    userLength,
    userWidth,
    userHeight,
    userWeight,
    systemLength,
    systemWidth,
    systemHeight,
    systemWeight,
    weightDenominator,
  ]);
  
  const processUserWeight = (value) => {
    // Reemplaza comas por puntos para asegurarte de que el número sea válido
    const processedValue = value.replace(/,/g, ".");
    // Convierte el valor en un número decimal
    const weight = parseFloat(processedValue);
    return !isNaN(weight) ? parseFloat(weight.toFixed(2)) : 0; // Redondea a 2 decimales y luego convierte a número
  };

  const processSystemWeight = (value) => {
    // Reemplaza comas por puntos para asegurarte de que el número sea válido
    const processedValue = value.replace(/,/g, ".");
    // Convierte el valor en un número decimal
    const weight = parseFloat(processedValue);
    return !isNaN(weight) ? parseFloat(weight.toFixed(2)) : 0; // Si no es un número válido, usa 0
  };

  return (
    <div className={styles.home}>
      <h2>Costos de envío</h2>
      <div className={styles.sites}>
        <button onClick={() => { setWeightDenominator(5000); setSite("MLM"); }}>MLM</button>
        <button onClick={() => { setWeightDenominator(4000); setSite("MLA"); }}>MLA</button>
        <button onClick={() => { setWeightDenominator(4000); setSite("MLC"); }}>MLC</button>
        <button onClick={() => { setWeightDenominator(4505); setSite("MCO"); }}>MCO</button>
      </div>
      <section className={styles.calculator}>

      <article className={styles.whDimention}>
          <p></p>
          <p>Largo (cm)</p>
          <p>Ancho (cm)</p>
          <p>Alto (cm)</p>
          <p>Peso (gr)</p>
        </article>
        <article className={styles.userDimention}>
          <p>Usuario</p>
          <input
            type="number"
            value={userLength}
            onChange={(e) => setUserLength(Math.ceil(e.target.value))}
            onClick={() => setUserLength("")}
            step="1"
          />
          <input
            type="number"
            value={userWidth}
            onChange={(e) => setUserWidth(Math.ceil(e.target.value))}
            onClick={() => setUserWidth("")}
            step="1"
          />

          <input
            type="number"
            value={userHeight}
            onChange={(e) => setUserHeight(Math.ceil(e.target.value))}
            onClick={() => setUserHeight("")}
            step="1"

          />

          <input
            type="text"
            value={userWeight}
            onChange={(e) => {setUserWeight(e.target.value) ; processUserWeight(e.target.value) }}
            onClick={() => setUserWeight("")}
            step="0.01"
          />
        </article>
        <article className={styles.whDimention}>
          <p>Sistema</p>
          <input
            type="number"
            value={systemLength}
            onChange={(e) => setSystemLength(Math.ceil(e.target.value))}
            onClick={() => setSystemLength("")}
            step="1"
          />
          <input
            type="number"
            value={systemWidth}
            onChange={(e) => setSystemWidth(Math.ceil(e.target.value))}
            onClick={() => setSystemWidth("")}
            step="1"
          />
          <input
            type="number"
            value={systemHeight}
            onChange={(e) => setSystemHeight(Math.ceil(e.target.value))}
            onClick={() => setSystemHeight("")}
            step="1"
          />
          <input
            type="text"
            value={systemWeight}
            onChange={(e) => {setSystemWeight(e.target.value) ; processSystemWeight(e.target.value) }}
            onClick={() => setSystemWeight("")}
            step="0.01"
          />
        </article>
        <article className={styles.dimentionDetails}>
          <p>Peso volumétrico</p>
          <p>Peso utilizado</p>
          <p>Categoria: </p>
          <p>Costo de envío</p>
        </article>
        <article className={styles.whDimention}>
          <p>{(userLength * userWidth * userHeight) / weightDenominator}</p>
          <p>{(userLength * userWidth * userHeight) / weightDenominator > userWeight ? "Peso volumétrico" : "Peso físico"}</p>
          <p>{tarifa.user ? tarifa.user.clave : "-"}</p>
          <p>{tarifa.user ? tarifa.user.valor : "-"}</p>
          <p></p>
        </article>
        <article className={styles.whDimention}>
          <p>{(systemLength * systemWidth * systemHeight) / weightDenominator}</p>
          <p>{(systemLength * systemWidth * systemHeight) / weightDenominator > systemWeight ? "Peso volumétrico" : "Peso físico"}</p>
          <p>{tarifa.system ? tarifa.system.clave : "-"}</p>
          <p>{tarifa.system ? tarifa.system.valor : "-"}</p>
          <p></p>
        </article>
      </section>
    </div>
  );
}

export default Home;
