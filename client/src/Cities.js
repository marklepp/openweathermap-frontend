import "./Cities.css";
import { useState } from "react";
import City from "./City";

const allCities = ["Espoo", "Jyväskylä", "Kuopio", "Tampere"];

function Cities() {
  const [selectedCities, setCities] = useState(allCities);
  function handleCitySelect(event) {
    const value = event.target.value;
    if (value === "all") {
      setCities(allCities);
    } else {
      setCities([event.target.value]);
    }
  }
  return (
    <div className="Cities">
      <select className="Cities-selector" defaultValue="all" onChange={handleCitySelect}>
        <option value="all">Kaikki kaupungit</option>
        {allCities.map((cityName) => (
          <option key={cityName} value={cityName}>
            {cityName}
          </option>
        ))}
      </select>
      <div className="Cities-list">
        {allCities.map((cityName) => (
          <City key={cityName} cityName={cityName} show={selectedCities.includes(cityName)} />
        ))}
      </div>
    </div>
  );
}

export default Cities;
