import { useState, useEffect } from "react";

const url = "https://restcountries.com/";

function App() {
  const [country, setCountry] = useState([]);

  async function getCountry() {
    const response = await fetch(url);
    const countryData = await response.json;

    setCountry(countryData);
    console.log(country);
  }

  useEffect(() => {
    getCountry();
  }, []);

  return (
    <div>
      <h1> Country </h1>
    </div>
  );
}

export default App;
