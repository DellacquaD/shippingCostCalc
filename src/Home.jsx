import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-regular-svg-icons'

function copyToClipboard(message) {

  const textArea = document.createElement('textarea');
  textArea.value = message;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  alert('Mensaje copiado al portapapeles');
}

function Home({ styles }) {
  const [measurements, setMeasurements] = useState({
    site: "",
    denominator: 1,
    userLength: 0,
    userWidth: 0,
    userHeight: 0,
    userWeight: "",
    systemLength: 0,
    systemWidth: 0,
    systemHeight: 0,
    systemWeight: "",
    userTarifa: null,
    systemTarifa: null,
  });
  const [allInputsComplete, setAllInputsComplete] = useState(false);
  const [jsonShippingCost, setJsonShippingCost] = useState({})
  const [message, setMessage] = useState("")
  
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getShippingData" }, response => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else if (response.error) {
        console.error(response.error);
      } else {
        setJsonShippingCost(response.data);
      }
    });
  }, []);

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
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim()),
                index: Object.keys(tarifas).indexOf(rango),
              };
            }
          } else if (rango.startsWith("Más de")) {
            const limiteInferior = parseFloat(rango.split(" ")[2].replace(",", "").replace("Kg", ""));
            if (peso >= limiteInferior) {
              return {
                clave: rango,
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim()),
                index: Object.keys(tarifas).indexOf(rango),
              };
            }
          } else {
            const [limiteInferior, limiteSuperior] = rango
              .split(" a ")
              .map(valor => parseFloat(valor.replace(",", "").replace("Kg", "").trim()));
            if (peso > limiteInferior && peso <= limiteSuperior) {
              return {
                clave: rango,
                valor: parseFloat(tarifas[rango].replace(",", "").replace("$", "").trim()),
                index: Object.keys(tarifas).indexOf(rango),
              };
            }
          }
        }
        const primeraClave = Object.keys(tarifas)[0];
        return {
          clave: primeraClave,
          valor: parseFloat(tarifas[primeraClave].replace(",", "").replace("$", "").trim()),
          index: Object.keys(tarifas).indexOf(primeraClave),
        };
      }
      return null;
    };  
    const userPeso = (measurements.userLength * measurements.userWidth * measurements.userHeight) / measurements.denominator;
    const systemPeso = (measurements.systemLength * measurements.systemWidth * measurements.systemHeight) / measurements.denominator;
    const usedWeightUser = measurements.userWeight > 2 ? userPeso > processUserWeight(measurements.userWeight) ? userPeso : processUserWeight(measurements.userWeight) : measurements.site === "MLA" ? measurements.userWeight : userPeso > processUserWeight(measurements.userWeight) ? userPeso : processUserWeight(measurements.userWeight);
    const usedWeightSystem = measurements.systemWeight > 2 ? systemPeso > processSystemWeight(measurements.systemWeight) ? systemPeso : processSystemWeight(measurements.systemWeight) : measurements.site === "MLA" ? measurements.systemWeight : systemPeso > processSystemWeight(measurements.systemWeight) ? systemPeso : processSystemWeight(measurements.systemWeight);
    const userTarifa = findTarifa(usedWeightUser, measurements.site);
    const systemTarifa = findTarifa(usedWeightSystem, measurements.site);
    
    setMeasurements((prevMeasurements) => ({
      ...prevMeasurements,
      userTarifa,
      systemTarifa,
    }));

    const allInputsComplete = 
    measurements.userLength > 0 &&
    measurements.userWidth > 0 &&
    measurements.userHeight > 0 &&
    measurements.userWeight !== "" &&
    measurements.systemLength > 0 &&
    measurements.systemWidth > 0 &&
    measurements.systemHeight > 0 &&
    measurements.systemWeight !== "";
    setAllInputsComplete(allInputsComplete);
    const message = "Medidas del usuario: " + measurements.userLength + "cm x " + measurements.userWidth + "cm x " + measurements.userHeight + "cm, " + measurements.userWeight + "kg. "  + "\n" + "Medidas del sistema: " + measurements.systemLength + "cm x " + measurements.systemWidth + "cm x" + measurements.systemHeight + "cm, " + measurements.systemWeight + "kg.";
    setMessage(allInputsComplete ? message : "")
  }, [
    measurements,
  ]);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getLocalStorage", keys: ["site", "denominator", "userLength", "userWidth", "userHeight", "userWeight", "systemLength", "systemWidth", "systemHeight", "systemWeight"] }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response && response.data) {
        setMeasurements((prevMeasurements) => ({
          ...prevMeasurements,
          ...response.data,
        }));
      }
    });
  }, []);

  
  const processUserWeight = (value) => {
    const processedValue = value.replace(/,/g, ".");
    const weight = parseFloat(processedValue);
    return !isNaN(weight) ? parseFloat(weight.toFixed(2)) : 0;
  };

  const processSystemWeight = (value) => {
    const processedValue = value.replace(/,/g, ".");
    const weight = parseFloat(processedValue);
    return !isNaN(weight) ? parseFloat(weight.toFixed(2)) : 0;
  };


  const handleMeasurementChange = (key, value) => {
    setMeasurements((prevMeasurements) => ({
      ...prevMeasurements,
      [key]: value,
    }));
    chrome.runtime.sendMessage({ action: "setLocalStorage", key, value });
  };

  const handleSiteSelect = (key, value) => {
    setMeasurements((prevMeasurements) => ({
      ...prevMeasurements,
      [key]: value,
    }));
    chrome.runtime.sendMessage({ action: "setLocalStorage", key, value });
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
  
  const uniqueKeys = getUniqueKeys(measurements.site);
  
  return (
    <div className={styles.home}>
      {measurements.site ? "" : <h2>Site</h2>}
      <div className={styles.sitesContainer}>
        {Object.keys(jsonShippingCost).map(siteKey => (
          <div className={styles.sites}>
            <button
              key={siteKey}
              onClick={() => {
                const denominator = jsonShippingCost[siteKey].Denominator;
                handleSiteSelect("site", siteKey);
                handleSiteSelect("denominator", denominator);
              }}
              style={{
                backgroundImage: `url(${jsonShippingCost[siteKey].imgUrl})`,
                filter: measurements.site === siteKey ? "brightness(1)" : "opacity(0.2)"
              }}
            >
            </button>          
            <a
              href={jsonShippingCost[siteKey].tyc}
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteKey}
            </a>
          </div>
        ))}
      </div>
      {measurements.site ? 
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
            <td>{measurements.site === "MLB" ? "Comprimento (cm)" : "Largo (cm)"}</td>
            <td>
              <input
                type="number"
                value={measurements.userLength}
                onChange={e => {
                  handleMeasurementChange("userLength", e.target.value);
                }}
                onMouseDown={() => handleMeasurementChange("userLength", "")}
                onBlur={() => handleMeasurementChange("userLength", Math.ceil(measurements.userLength))}
              />
            </td>
            <td>
              <input
                type="number"
                value={measurements.systemLength}
                onChange={e => handleMeasurementChange("systemLength", e.target.value)}
                onClick={() => handleMeasurementChange("systemLength", "")}
                onBlur={() => handleMeasurementChange("systemLength", Math.ceil(measurements.systemLength))}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>{measurements.site === "MLB" ? "Largura (cm)" : "Ancho (cm)"}</td>
            <td>
              <input
                type="number"
                value={measurements.userWidth}
                onChange={e => handleMeasurementChange("userWidth", e.target.value)}
                onClick={() => handleMeasurementChange("userWidth", "")}
                onBlur={() => handleMeasurementChange("userWidth", Math.ceil(measurements.userWidth))}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={measurements.systemWidth}
                onChange={e => handleMeasurementChange("systemWidth", e.target.value)}
                onClick={() => handleMeasurementChange("systemWidth", "")}
                onBlur={() => handleMeasurementChange("systemWidth", Math.ceil(measurements.systemWidth))}
                step="1"
              />
            </td>
          </tr>
          <tr>
            <td>Altura (cm)</td>
            <td>
              <input
                type="number"
                value={measurements.userHeight}
                onChange={e => handleMeasurementChange("userHeight", e.target.value)}
                onClick={() => handleMeasurementChange("userHeight", "")}
                onBlur={() => handleMeasurementChange("userHeight", Math.ceil(measurements.userHeight))}
                step="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={measurements.systemHeight}
                onChange={e => handleMeasurementChange("systemHeight", e.target.value)}
                onClick={() => handleMeasurementChange("systemHeight", "")}
                onBlur={() => handleMeasurementChange("systemHeight", Math.ceil(measurements.systemHeight))}
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
                value={measurements.userWeight}
                onChange={e => handleMeasurementChange("userWeight", e.target.value)}
                onClick={() => handleMeasurementChange("userWeight", "")}
                step="0.01"
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0.0"
                value={measurements.systemWeight}
                onChange={e => handleMeasurementChange("systemWeight", e.target.value)}
                onClick={() => handleMeasurementChange("systemWeight", "")}
                step="0.01"
              />
            </td>
          </tr>
          <tr>
            <td>Peso volumétrico</td>
            <td>
            {measurements.userLength && measurements.userWidth && measurements.userHeight ? 
            (measurements.userLength * measurements.userWidth * measurements.userHeight) / measurements.denominator :
            "-"}
            </td>
            <td>
            {measurements.systemLength && measurements.systemWidth && measurements.systemHeight ? 
            (measurements.systemLength * measurements.systemWidth * measurements.systemHeight) / measurements.denominator : 
            "-"}
            </td>
          </tr>
          <tr>
            <td>Peso utilizado</td>
            <td>
            { measurements.site === "MLA" ?
            measurements.userWeight > 2 ? (measurements.userLength * measurements.userWidth * measurements.userHeight) / measurements.denominator > measurements.userWeight ? "Peso volumétrico > físico" : "Peso físico > volumétrico" : "Peso Físico < 2kg" : 
            (measurements.userLength * measurements.userWidth * measurements.userHeight) / measurements.denominator > measurements.userWeight ? "Peso volumétrico > físico" : "Peso físico > volumétrico"}
            </td>
            <td>
            { measurements.site === "MLA" ?
            measurements.systemWeight > 2 ? (measurements.systemLength * measurements.systemWidth * measurements.systemHeight) / measurements.denominator > measurements.systemWeight ? "Peso volumétrico > físico" : "Peso físico > volumétrico" : "Peso Físico < 2kg" : 
            (measurements.systemLength * measurements.systemWidth * measurements.systemHeight) / measurements.denominator > measurements.systemWeight ? "Peso volumétrico > físico" : "Peso físico > volumétrico"}
            </td>
          </tr>
          <tr>
            <td>Categoria:</td>
            <td>{measurements.userTarifa ? `${measurements.userTarifa.clave} ($${measurements.userTarifa.valor})` : "-"}</td>
            <td>{measurements.systemTarifa ? `${measurements.systemTarifa.clave} ($${measurements.systemTarifa.valor})` : "-"}</td>
          </tr>
          <tr className={allInputsComplete && measurements.systemTarifa && measurements.userTarifa ? measurements.systemTarifa.index > measurements.userTarifa.index ? styles.createTask : styles.noCreateTask : styles.noDisplay}>
            <td colspan="3">
              {allInputsComplete && measurements.systemTarifa && measurements.userTarifa ? 
              measurements.systemTarifa.index > measurements.userTarifa.index ? 
              <div className={styles.messageText}>Crear tarea de oneTask para la bodega con stock.<FontAwesomeIcon onClick={() => copyToClipboard(message)}icon={faCopy}/></div>:
              measurements.systemTarifa.index === measurements.userTarifa.index ? 
                "No crear tarea, no hay cambio en el valor." :
              "No crear tarea, las medidas del sistema son menores que las del usuario." : 
            ""}
            </td>
          </tr>
          <tr>
          <td className={styles.shippingCost}>Costos de envío</td>
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
                {Object.keys(jsonShippingCost[measurements.site]?.Descuentos || {}).map((tipoDescuento, index) => (
                  <tr key={tipoDescuento}>
                    <td className={styles[`class${index}`]}> {tipoDescuento}</td>
                    {uniqueKeys.map((clave) => (
                      <td className={styles[`class${index}`]} key={clave}>
                        {measurements.userTarifa ? "$" + (measurements.userTarifa.valor * (1 - (jsonShippingCost[measurements.site]?.Descuentos[tipoDescuento][clave] ? jsonShippingCost[measurements.site]?.Descuentos[tipoDescuento][clave] / 100 : 0))).toFixed(2) : '0.00'}
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
                  {Object.keys(jsonShippingCost[measurements.site]?.Descuentos || {}).map((tipoDescuento, index) => (
                    <tr className={styles[tipoDescuento]} key={tipoDescuento}>
                      <td className={styles[`class${index}`]} >{tipoDescuento}</td>
                      {uniqueKeys.map((clave) => (
                        <td className={styles[`class${index}`]} key={clave}>
                          {measurements.systemTarifa ? "$" + (measurements.systemTarifa.valor * (1 - (jsonShippingCost[measurements.site]?.Descuentos[tipoDescuento][clave] ? jsonShippingCost[measurements.site]?.Descuentos[tipoDescuento][clave] / 100 : 0))).toFixed(2) : '0.00'}
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
      : ""}
    </div>
  );
}

export default Home;
