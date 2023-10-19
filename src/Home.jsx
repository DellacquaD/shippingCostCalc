import React, { useState, useEffect } from "react";
import jsonShippingCost from "./shippingCost.json";

function Home({ styles }) {
  const [userLength, setUserLength] = useState(0)
  const [userWidth, setUserWidth] = useState(0)
  const [userHeight, setUserHeight] = useState(0)
  const [userWeight, setUserWeight] = useState("")
  const [systemLength, setSystemLength] = useState(0)
  const [systemWidth, setSystemWidth] = useState(0)
  const [systemHeight, setSystemHeight] = useState(0)
  const [systemWeight, setSystemWeight] = useState("")
  const [weightDenominator, setWeightDenominator] = useState(4000)
  const [site, setSite] = useState("MLM")
  const [tarifa, setTarifa] = useState({})

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
    site,
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

  const getColorDiscount = (site, tipoDescuento) => {
    const descuentos = jsonShippingCost[site]?.Descuentos;
    
    if (descuentos && descuentos[tipoDescuento]) {
      return descuentos[tipoDescuento];
    }
    
    return 0;
  };

  const getUniqueKeys = (site) => {
    const descuentos = jsonShippingCost[site]?.Descuentos;
    if (!descuentos) return [];
    
    const keys = Object.keys(descuentos);
    const uniqueKeys = new Set();
  
    keys.forEach((tipoDescuento) => {
      Object.keys(descuentos[tipoDescuento]).forEach((clave) => {
        uniqueKeys.add(clave);
      });
    });
  
    return Array.from(uniqueKeys);
  };
  
  const uniqueKeys = getUniqueKeys(site);
  

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
              value={userLength}
              onChange={(e) => setUserLength(e.target.value)}
              onMouseDown={() => setUserLength("")}
              onBlur={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setUserLength(Math.ceil(value));
                }
              }}
            />
            </td>
            <td>
              <input
                type="number"
                value={systemLength}
                onChange={(e) => setSystemLength(e.target.value)}
                onClick={() => setSystemLength("")}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setSystemLength(Math.ceil(value));
                  }
                }}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Ancho (cm)</td>
            <td>
              <input
                type="number"
                value={userWidth}
                onChange={(e) => setUserWidth(e.target.value)}
                onClick={() => setUserWidth("")}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setUserWidth(Math.ceil(value));
                  }
                }}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={systemWidth}
                onChange={(e) => setSystemWidth(e.target.value)}
                onClick={() => setSystemWidth("")}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setSystemWidth(Math.ceil(value));
                  }
                }}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Alto (cm)</td>
            <td>
              <input
                type="number"
                value={userHeight}
                onChange={(e) => setUserHeight(e.target.value)}
                onClick={() => setUserHeight("")}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setUserHeight(Math.ceil(value));
                  }
                }}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={systemHeight}
                onChange={(e) => setSystemHeight(e.target.value)}
                onClick={() => setSystemHeight("")}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setSystemHeight(Math.ceil(value));
                  }
                }}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Peso (Kg)</td>
            <td>
              <input
                type="number"
                placeholder="0.0"
                value={userWeight}
                onChange={(e) => {setUserWeight(e.target.value) ; processUserWeight(e.target.value) }}
                onClick={() => setUserWeight("")}
                step="0.01"
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0.0"
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
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {uniqueKeys.map((clave) => (
                      <th key={clave}>{clave}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {Object.keys(jsonShippingCost[site]?.Descuentos || {}).map((tipoDescuento, index) => (
                  <tr key={tipoDescuento}>
                    <td className={styles[`class${index}`]}> {tipoDescuento}</td>
                    {uniqueKeys.map((clave) => (
                      <td className={styles[`class${index}`]} key={clave}>
                        {tarifa.user ? "$" + (tarifa.user.valor * (1 - (jsonShippingCost[site]?.Descuentos[tipoDescuento][clave] ? jsonShippingCost[site]?.Descuentos[tipoDescuento][clave] / 100 : 0))).toFixed(2) : '0.00'}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </td>
            <td>
            <table>
                <thead>
                  <tr>
                    <th></th>
                    {uniqueKeys.map((clave) => (
                      <th key={clave}>{clave}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(jsonShippingCost[site]?.Descuentos || {}).map((tipoDescuento, index) => (
                    <tr className={styles[tipoDescuento]} key={tipoDescuento}>
                      <td className={styles[`class${index}`]} >{tipoDescuento}</td>
                      {uniqueKeys.map((clave) => (
                        <td className={styles[`class${index}`]} key={clave}>
                          {tarifa.system ? "$" + (tarifa.system.valor * (1 - (jsonShippingCost[site]?.Descuentos[tipoDescuento][clave] ? jsonShippingCost[site]?.Descuentos[tipoDescuento][clave] / 100 : 0))).toFixed(2) : '0.00'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>     
        </tbody>
      </table>
    </div>
  );
}

export default Home;
