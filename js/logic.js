// grayscale background.
var graymap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYXJlbnRheWxvciIsImEiOiJjancxOHRncjgwamRtNGFxamM1anI3amxiIn0.6wgpUWvFc3aSu3HtstL-Ew");

// satellite background.
var satellitemap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYXJlbnRheWxvciIsImEiOiJjancxOHRncjgwamRtNGFxamM1anI3amxiIn0.6wgpUWvFc3aSu3HtstL-Ew");

// outdoors background.
var outdoors_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYXJlbnRheWxvciIsImEiOiJjancxOHRncjgwamRtNGFxamM1anI3amxiIn0.6wgpUWvFc3aSu3HtstL-Ew");

// map object to an array of layers we created.
var map = L.map("mapid", {
  center: [29.09, -15.71],
  zoom: 3,
  layers: [graymap_background, satellitemap_background, outdoors_background]
});

// adding one 'graymap' tile layer to the map.
graymap_background.addTo(map);

// layers for two different sets of data, earthquakes and tectonicplates.
var plates = new L.LayerGroup();
var quakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Satellite: satellitemap_background,
  Grayscale: graymap_background,
  Outdoors: outdoors_background
};

// overlays 
var overlayMaps = {
  "Tectonic Plates": plates,
  "Earthquakes": quakes
};

// control which layers are visible.
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Marker color
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#DA2B1B";
      case magnitude > 4:
        return "#F4A734";
      case magnitude > 3:
        return "#FCE972";
      case magnitude > 2:
        return "#95EC9C";
      case magnitude > 1:
        return "#00CCBC";
      default:
        return "#2A7DB7";
    }
  }

  // Marker size

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // add GeoJSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(quakes);

  quakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#2A7DB7",
      "#00CCBC",
      "#95EC9C",
      "#FCE972",
      "#F4A734",
      "#DA2B1B"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "red",
        weight: 3
      })
      .addTo(plates);

      // add the tectonicplates layer to the map.
      plates.addTo(map);
    });
});
