import React, { useState } from "react";




function Home({ styles }) {
  const [userLength, setUserLength] = useState(0)
  const [userWidth, setUserWidth] = useState(0)
  const [userHeight, setUserHeight] = useState(0)
  const [userWeight, setUserWeight] = useState(0)
  const [sistemLength, setSistemLength] = useState(0)
  const [sistemWidth, setSistemWidth] = useState(0)
  const [sistemHeight, setSistemHeight] = useState(0)
  const [sistemWeight, setSistemWeight] = useState(0)
  const [weightDenominator, setWeightDenominator] = useState(1)
 
  return (
    <div className={styles.home}>
      <h2>Costos de envío</h2>
      <div className={styles.sites}>
        <button onClick={() => setWeightDenominator(10)}>MLA</button>
        <button onClick={() => setWeightDenominator(20)}>MLM</button>
        <button onClick={() => setWeightDenominator(30)}>MLC</button>
        <button onClick={() => setWeightDenominator(40)}>MCO</button>
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
          <input type="text" value={userLength} onChange={(e) => setUserLength(e.target.value)}/>
          <input type="text" value={userWidth} onChange={(e) => setUserWidth(e.target.value)}/>
          <input type="text" value={userHeight} onChange={(e) => setUserHeight(e.target.value)}/>
          <input type="text" value={userWeight} onChange={(e) => setUserWeight(e.target.value)}/>
        </article>
        <article className={styles.whDimention}>
          <p>Sistema</p>
          <input type="text" value={sistemLength} onChange={(e) => setSistemLength(e.target.value)}/>
          <input type="text" value={sistemWidth} onChange={(e) => setSistemWidth(e.target.value)}/>
          <input type="text" value={sistemHeight} onChange={(e) => setSistemHeight(e.target.value)}/>
          <input type="text" value={sistemWeight} onChange={(e) => setSistemWeight(e.target.value)}/>
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
          <p></p>
          <p></p>
        </article>
        <article className={styles.whDimention}>
          <p>{(sistemLength * sistemWidth * sistemHeight) / weightDenominator}</p>
          <p>{(userLength * userWidth * userHeight) / weightDenominator > userWeight ? "Peso volumétrico" : "Peso físico"}</p>
          <p></p>
          <p></p>
        </article>
      </section>
    </div>
  );
}

export default Home;
