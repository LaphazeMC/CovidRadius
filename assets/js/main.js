var defaultLat = 46.5;
var defaultLong = 4.5;
var map = null;
var homeMarkersLayer = L.featureGroup();
var currentLocationMarkerLayer = L.featureGroup();
var currentUserLocation = [];
var isCurrentHomeLocationActive = false;
var isFirstRefreshOfCurrentUserLocation = true;
var watchCurrentUserLocation = null;

L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
var homeMarker = L.AwesomeMarkers.icon({
    icon: 'home',
    markerColor: 'blue'
});
var userMarker = L.AwesomeMarkers.icon({
    icon: 'person',
    markerColor: 'red'
});

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
        zoom: 6,
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
                // GOV API return data in nested child, so it's needed to reformat the data property in one level only for selectize
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
                callback(reformattedAddresses);
            }
        });
    },
    onChange: function (value, isOnInitialize) {
        if (value) {
            isCurrentHomeLocationActive = false;
            drawCircleOnMap(parseLatLongFromSelect(value), true);
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
        drawCircleOnMap(parseLatLongFromSelect(selectizeControl.getValue()), true);
    }
    else {
        drawCircleOnMap(currentUserLocation, true);
    }
}

function drawCircleOnMap(latLong, isHome) {
    if (isHome || isFirstRefreshOfCurrentUserLocation) { // avoid zooming each time user location is updated
        map.setView(latLong, 14);
    }
    if (isHome) {
        homeMarkersLayer.clearLayers();
        L.marker(latLong, { icon: homeMarker }).bindTooltip("Domicile",
            {
                permanent: true,
                direction: 'top',
                offset: [0, -40]
            }).addTo(homeMarkersLayer);
        L.circle(latLong, { radius: getRadius(), color: "green" }).addTo(homeMarkersLayer);
        map.addLayer(homeMarkersLayer);
    }
    else { // current user location 
        currentLocationMarkerLayer.clearLayers();
        L.marker(latLong, { icon: userMarker }).bindTooltip("Vous",
            {
                permanent: true,
                direction: 'top',
                offset: [0, -40]
            }).addTo(currentLocationMarkerLayer);
        map.addLayer(currentLocationMarkerLayer);
    }
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

function getCurrentLocation(isHome) {
    if (isHome) {
        if (watchCurrentUserLocation == null) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    currentUserLocation = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    isCurrentHomeLocationActive = true;
                    var selectizeControl = $select[0].selectize;
                    selectizeControl.clear()
                    document.getElementById("searchAddresses-selectized").value = "Position actuelle";
                    drawCircleOnMap(currentUserLocation, isHome);
                },
                    function (error) {
                        handleLocationRequestError(error);
                    }),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 50000 }
            }
        }
        else { // If current user location was already requested by watchPosition, just take latLong from there
            var selectizeControl = $select[0].selectize;
            selectizeControl.clear()
            document.getElementById("searchAddresses-selectized").value = "Position actuelle";
            drawCircleOnMap(currentUserLocation, isHome);
        }
    }
    else {
        watchCurrentUserLocation = navigator.geolocation.watchPosition(function (position) {
            currentUserLocation = [
                position.coords.latitude,
                position.coords.longitude
            ];
            // don't blame me for this :(
            var currentLocationButton = document.getElementById("currentLocationButton");
            currentLocationButton.classList.remove("bg-blue-500");
            currentLocationButton.classList.remove("hover:bg-blue-700");
            currentLocationButton.classList.add("opacity-50");
            currentLocationButton.classList.add("cursor-not-allowed");
            currentLocationButton.classList.add("bg-green-500");
            currentLocationButton.classList.add("hover:bg-green-700");
            currentLocationButton.innerHTML = "Position actuelle récupérée";
            drawCircleOnMap(currentUserLocation, isHome);
            if (isFirstRefreshOfCurrentUserLocation) {
                isFirstRefreshOfCurrentUserLocation = false;
            }
        },
            function (error) {
                handleLocationRequestError(error);
            })
    }

    function handleLocationRequestError(error) {
        if (error.code == 1) {
            alert("La permission de localisation n'a pas été autorisée");
        }
        else if (error.code == 2) {
            alert("Impossible de récupérer la position")
        }
        else {
            alert(error + " | " + error.message + " | " + error.code);
        }
    }
}