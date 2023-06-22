// Create the map
let mymap = L.map("map").setView([0, 0], 2);

// Create the tile layer with the OpenStreetMap tile provider
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

// Fetch the earthquake data from the USGS GeoJSON feed
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url)
  .then(data => {
    // Iterate through each earthquake feature and add markers to the map
    data.features.forEach(feature => {
      const properties = feature.properties;
      const geometry = feature.geometry;
      const magnitude = properties.mag;
      const depth = geometry.coordinates[2];

      // Check if coordinates are valid and within range
      let validCoordinates = true;
      for (let i = 0; i < geometry.coordinates.length; i++) {
        if (isNaN(geometry.coordinates[i]) || Math.abs(geometry.coordinates[i]) > 180) {
          validCoordinates = false;
          break;
        }
      }

      if (validCoordinates) {
        // Define marker size based on magnitude
        const markerSize = Math.sqrt(magnitude) * 5;

        // Define marker color based on depth
        const markerColor = getColor(depth);

        L.circleMarker([geometry.coordinates[1], geometry.coordinates[0]], {
          radius: markerSize,
          fillColor: markerColor,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
          .bindPopup(
            `<h3>${properties.place}</h3>
            <p>Magnitude: ${magnitude}</p>
            <p>Depth: ${depth} km</p>`
          )
          .addTo(mymap);
      }
    });

    // Create a legend for depth colors
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "legend");
      const depths = [10, 30, 70];
      const colors = ["#1a9850", "#ffffbf", "#d73027", "#bdbdbd"];
      const labels = ["<10 km", "10-30 km", "30-70 km", ">70 km"];

      div.innerHTML += "<h4>Depth</h4>";
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<div class="legend-item"><div class="legend-color" style="background-color: ' +
          colors[i] +
          '"></div>' +
          labels[i] +
          "</div>";
      }

      return div;
    };

    legend.addTo(mymap);
  })
  .catch(error => {
    console.log("Error fetching data:", error);
  });

// Function to determine color based on earthquake depth
function getColor(depth) {
  if (depth < 10) {
    return "#1a9850"; // Green
  } else if (depth < 30) {
    return "#ffffbf"; // Yellow
  } else if (depth < 70) {
    return "#d73027"; // Red
  } else {
    return "#bdbdb"
  }
}
   
