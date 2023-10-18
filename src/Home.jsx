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

    
    const usedWeightUser = userPeso > processUserWeight(userWeight) ? userPeso : processUserWeight(userWeight);
    const usedWeightSystem = systemPeso > processSystemWeight(systemWeight) ? systemPeso : processSystemWeight(systemWeight);
    
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

  // // Obtén el costo de envío basado en tarifas
  //   const userCostoEnvio = tarifa.user ? tarifa.user.clave : "-";
  //   const systemCostoEnvio = tarifa.system ? tarifa.system.clave : "-";

  const getColorDiscount = (site, color, valorCompra) => {
    const descuentos = jsonShippingCost[site]?.Descuentos;
  
    if (descuentos) {
      const colorDescuentos = descuentos[color];
      if (colorDescuentos) {
        if (valorCompra < 299) {
          return parseFloat(colorDescuentos["Menor a $299"]);
        } else {
          return parseFloat(colorDescuentos["Mayor a $299"]);
        }
      }
    }
  
    return 0;
  };
  const calculateShippingCostWithDiscount = (costoEnvio, site, colorRepu) => {
    const descuento = getColorDiscount(site, colorRepu);
    const descuentoFactor = 1 - descuento / 100;
  
    return costoEnvio * descuentoFactor;
  };
  

  return (
    <div className={styles.home}>
      <h2>Costos de envío</h2>
      <div className={styles.sites}>
        <button onClick={() => { setWeightDenominator(5000); setSite("MLM"); }} style={{ backgroundImage: "url('/flags/mexico_ico.png')" , filter: site === "MLM" ? "brightness(1)" : "opacity(0.2)"}}></button>
        <button onClick={() => { setWeightDenominator(4000); setSite("MLA"); }} style={{ backgroundImage: "url('/flags/argentina_ico.png')", filter: site === "MLA" ? "brightness(1)" : "opacity(0.2)" }}></button>
        <button onClick={() => { setWeightDenominator(4000); setSite("MLC"); }} style={{ backgroundImage: "url('/flags/chile_ico.png')", filter: site === "MLC" ? "brightness(1)" : "opacity(0.2)" }}></button>
        <button onClick={() => { setWeightDenominator(4505); setSite("MCO"); }} style={{ backgroundImage: "url('/flags/colombia_ico.png')", filter: site === "MCO" ? "brightness(1)" : "opacity(0.2)" }}></button>
      </div>
      <table className={styles.calculator}>
        <thead>
          <tr>
            <th></th>
            <th>Usuario</th>
            <th>Sistema</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Largo (cm)</td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={userLength}
                onChange={(e) => setUserLength(Math.ceil(e.target.value))}
                onClick={() => setUserLength("")}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={systemLength}
                onChange={(e) => setSystemLength(Math.ceil(e.target.value))}
                onClick={() => setSystemLength("")}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Ancho (cm)</td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={userWidth}
                onChange={(e) => setUserWidth(Math.ceil(e.target.value))}
                onClick={() => setUserWidth("")}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={systemWidth}
                onChange={(e) => setSystemWidth(Math.ceil(e.target.value))}
                onClick={() => setSystemWidth("")}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Alto (cm)</td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={userHeight}
                onChange={(e) => setUserHeight(Math.ceil(e.target.value))}
                onClick={() => setUserHeight("")}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={systemHeight}
                onChange={(e) => setSystemHeight(Math.ceil(e.target.value))}
                onClick={() => setSystemHeight("")}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Peso (Kg)</td>
            <td>
              <input
                type="text"
                placeholder="0"
                value={userWeight}
                onChange={(e) => {setUserWeight(e.target.value) ; processUserWeight(e.target.value) }}
                onClick={() => setUserWeight("")}
                step="0.01"
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="0"
                value={systemWeight}
                onChange={(e) => {setSystemWeight(e.target.value) ; processSystemWeight(e.target.value) }}
                onClick={() => setSystemWeight("")}
                step="0.01"
              />
            </td>
          </tr>
          <tr>
            <td>Peso volumétrico</td>
            <td>{(userLength * userWidth * userHeight) / weightDenominator}</td>
            <td>{(systemLength * systemWidth * systemHeight) / weightDenominator}</td>
          </tr>
          <tr>
            <td>Peso utilizado</td>
            <td>{(userLength * userWidth * userHeight) / weightDenominator > userWeight ? "Peso volumétrico" : "Peso físico"}</td>
            <td>{(systemLength * systemWidth * systemHeight) / weightDenominator > systemWeight ? "Peso volumétrico" : "Peso físico"}</td>
          </tr>
          <tr>
            <td>Categoria:</td>
            <td>{tarifa.user ? tarifa.user.clave : "-"}</td>
            <td>{tarifa.system ? tarifa.system.clave : "-"}</td>
          </tr>
          <tr>
            <td>Costo de envío</td>
            <td>
              <tr>
                <td className={styles.greenRepu}> Verde ({getColorDiscount(site, "verde")})</td>
                <td className={styles.yellowRepu}> Amarillo ({getColorDiscount(site, "amarillo")})</td>
                <td className={styles.redsRepu}> Rojo ({getColorDiscount(site, "rojo")})</td>
              </tr>
              <tr>
                <td>{calculateShippingCostWithDiscount(tarifa.user?.valor, site, "verde")}</td>
                <td>{calculateShippingCostWithDiscount(tarifa.user?.valor, site, "amarillo")}</td>
                <td>{calculateShippingCostWithDiscount(tarifa.user?.valor, site, "rojo")}</td>
              </tr>
            </td>
            <td>
            <tr>
                <td className={styles.greenRepu}> Verde ({getColorDiscount(site, "verde")}) </td>
                <td className={styles.yellowRepu}> Amarillo ({getColorDiscount(site, "amarillo")})</td>
                <td className={styles.redsRepu}> Rojo ({getColorDiscount(site, "rojo")})</td>
              </tr>
              <tr>
                <td >{calculateShippingCostWithDiscount(tarifa.system?.valor, site, "verde")}</td>
                <td >{calculateShippingCostWithDiscount(tarifa.system?.valor, site, "amarillo")}</td>
                <td >{calculateShippingCostWithDiscount(tarifa.system?.valor, site, "rojo")}</td>
              </tr>
            </td>
            {/* <td>{tarifa.system ? tarifa.system.valor : "-"}</td> */}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Home;
