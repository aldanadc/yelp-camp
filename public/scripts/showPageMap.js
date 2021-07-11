const mapCampground = JSON.parse(campground);
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/outdoors-v11", // style URL
  center: mapCampground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

const marker = new mapboxgl.Marker()
  .setLngLat(mapCampground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
      `<h3>${mapCampground.title}</h3><p>${mapCampground.location}</p>`
    )
  )
  .addTo(map);