var defaultLat = 45.1667;
var defaultLong = 5.7167;
var map = null;
var markersLayer = L.featureGroup();
var currentUserLocation = [];
var isCurrentHomeLocationActive = false;
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

var $select = $('#searchAddresses').selectize({
    valueField: 'latLong',
    labelField: 'name',
    searchField: 'name',
    maxItems: 1,
    create: false,
    render: {
        option: function (item, escape) {
            return '<div>' +
                '<span class="title">' +
                '<span class="name">' + escape(item.name) + '</span>' +
                '<span class="name">' + escape(item.context) + '</span>' +
                '</span>' +
                '<span class="description">' + escape(item.city) + '</span>' +
                '<span class="description">' + escape(item.postCode) + '</span>' +
                '</div>';
        }
    },
    score: function () { return function () { return 1; }; }, // only filtering is done server side
    load: function (query, callback) {
        var self = this;
        if (!query.length) return callback();
        $.ajax({
            url: 'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(query),
            type: 'GET',
            error: function () {
                callback();
            },
            success: function (res) {
                var reformattedAddresses = [];
                for (var i = 0; i < res.features.length; i++) {
                    reformattedAddresses.push({
                        lat: res.features[i].geometry.coordinates[0],
                        long: res.features[i].geometry.coordinates[1],
                        city: res.features[i].properties.city,
                        context: res.features[i].properties.context,
                        postCode: res.features[i].properties.postcode,
                        name: res.features[i].properties.name,
                        latLong: res.features[i].geometry.coordinates[1] + "|" + res.features[i].geometry.coordinates[0]
                    })
                }
                self.clearOptions();
                isCurrentHomeLocationActive = false;
                callback(reformattedAddresses);
            }
        });
    },
    onChange: function (value, isOnInitialize) {
        if (value) {
            drawCircleOnMap(parseLatLongFromSelect(value));
        }
    }
});

function parseLatLongFromSelect(formattedValue) {
    var lat = formattedValue.split("|")[0];
    var long = formattedValue.split("|")[1];
    return [lat, long];
}

function unitOrRangeChanged() {
    if (!isCurrentHomeLocationActive) {
        var selectizeControl = $select[0].selectize;
        drawCircleOnMap(parseLatLongFromSelect(selectizeControl.getValue()));
    }
    else {
        drawCircleOnMap(currentUserLocation);
    }
}

function drawCircleOnMap(latLong) {
    markersLayer.clearLayers();
    var currentPosition = L.marker(latLong).addTo(markersLayer);
    map.setView(latLong, 14);
    L.circle(latLong, { radius: getRadius(), color: "green" }).addTo(markersLayer);
    map.addLayer(markersLayer);
}

function getRadius() {
    var isKm = (document.getElementById("unit").value == "km") ? true : false;
    var range = document.getElementById("range").value;
    if (range < 0 || range > 1000) {
        range = 1;
    }
    if (isKm) {
        return range * 1000;
    }
    return range;
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currentUserLocation = [
                position.coords.latitude,
                position.coords.longitude
            ];
            isCurrentHomeLocationActive = true;
            drawCircleOnMap(currentUserLocation);

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