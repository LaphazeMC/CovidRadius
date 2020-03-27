var defaultLat = 45.1667;
var defaultLong = 5.7167;
var map = null;
function initMap() {
    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });
    satellite = L.tileLayer(mbUrl, { id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
        dark = L.tileLayer(mbUrl, { id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

    map = L.map('map', {
        center: [defaultLat, defaultLong],
        center: [defaultLat, defaultLong],
        zoom: 10,
        layers: [streets]
    });

    var baseLayers = {
        "Satellite": satellite,
        "Streets": streets,
        "Night": dark
    };
    L.control.layers(baseLayers).addTo(map);
}
window.onload = function () {
    initMap();
};

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let currentUserLocation = [
                position.coords.latitude,
                position.coords.longitude
            ];
            var currentPosition = L.marker(currentUserLocation).addTo(map);
            map.setView(currentUserLocation, 13);
            L.circle(currentUserLocation, { radius: 1000, color: "green" }).addTo(map);

            /*var checkmark = L.tooltip({
                permanent: true,
                direction: 'center',
                className: 'text'
            })
                .setContent("✔️")
                .setLatLng(currentUserLocation);
            checkmark.addTo(map);*/

        })
    }
}