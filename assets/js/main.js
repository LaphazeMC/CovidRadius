var defaultLat = 46.5;
var defaultLong = 4.5;
var map = null;
var homeMarkersLayer = L.featureGroup();
var currentLocationMarkerLayer = L.featureGroup();
var currentUserLocation = [];
var isCurrentHomeLocationActive = false;
var isFirstRefreshOfCurrentUserLocation = true;
var watchCurrentUserLocation = null;
var isUserInHomePerimeter = false;
var activityTimer = null;

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
    var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1 });
    satellite = L.tileLayer(mbUrl, { id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1 }),
        dark = L.tileLayer(mbUrl, { id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1 });
    map = L.map('map', {
        center: [defaultLat, defaultLong],
        center: [defaultLat, defaultLong],
        zoom: 6,
        layers: [streets]
    });
    L.control.scale({ imperial: false }).addTo(map);

    var baseLayers = {
        "Satellite": satellite,
        "Streets": streets,
        "Night": dark
    };
    L.control.layers(baseLayers).addTo(map);
    document.getElementsByClassName("leaflet-control-attribution")[0].remove();
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
            document.getElementById("currentLocationButton").classList.remove("hidden");
            drawCircleOnMap(parseLatLongFromSelect(value), true);
        }
    }
});

function parseLatLongFromSelect(formattedValue) {
    var lat = formattedValue.split("|")[0];
    var long = formattedValue.split("|")[1];
    return [lat, long];
}

function updateUserLocationIsInsideHomeRadius() {
    if (homeMarkersLayer._layers != null && watchCurrentUserLocation) {
        var homeLayers = homeMarkersLayer._layers[Object.keys(homeMarkersLayer._layers)[1]];
        var homePolygonShape = homeLayers._layers[Object.keys(homeLayers._layers)[0]];
        isUserInHomePerimeter = homePolygonShape.getBounds().contains(currentUserLocation);
        displayAlertMapMessage(true);
    }
    else {
        displayAlertMapMessage(false);
    }
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
        Gp.Services.isoCurve({
            position: {
                x: latLong[1],
                y: latLong[0]
            },
            color: "green",
            distance: getRadius(),
            graph: "Pieton",
            reverse: false,
            smoothing: true,
            apiKey: "choisirgeoportail",
            onSuccess: function (result) {
                L.geoJson(result.geometry, { style: { color: 'green' } }).addTo(homeMarkersLayer);
                L.circle(latLong, { radius: getRadius(), color: "green", fillOpacity: 0, dashArray: '20, 20', dashOffset: '10' }).addTo(homeMarkersLayer);
                updateUserLocationIsInsideHomeRadius();
            },
            onFailure: function (error) {
                alert(error);
            }
        });
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
        updateUserLocationIsInsideHomeRadius();
    }
}

function displayAlertMapMessage(isActive) {
    if (isActive) {
        if (isUserInHomePerimeter) {
            document.getElementById("insideRadiusMessage").classList.remove("hidden");
            document.getElementById("outsideRadiusMessage").classList.add("hidden");
        }
        else {
            document.getElementById("insideRadiusMessage").classList.add("hidden");
            document.getElementById("outsideRadiusMessage").classList.remove("hidden");
            window.navigator.vibrate(200);
        }
    }
    else {
        document.getElementById("insideRadiusMessage").classList.add("hidden");
        document.getElementById("outsideRadiusMessage").classList.add("hidden");
    }
}

function getRadius() {
    var isKm = (document.getElementById("unit").value == "km") ? true : false;
    var range = document.getElementById("range").value;
    if (((range < 0 || range > 1000) && isKm) || (range < 0 && range > 1000000) && !isKm) {
        document.getElementById("range").value = 1;
        range = 1;
    }
    if (isKm) {
        return range * 1000;
    }
    return range;
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

function startActivityTimer() {
    if (!activityTimer) {
        var nextHourTime = new Date().addHours(1).getTime();
        var isHalfTime = false;
        var isCloseEndTime = false;
        document.getElementById("activityTimer").classList.remove("hidden");
        document.getElementById("activityTimerButton").innerHTML = "<span class='ion-pause'></span> Arrêter l'activité journalière";
        document.getElementById("activityTimerButton").classList.remove("bg-green-500");
        document.getElementById("activityTimerButton").classList.remove("hover:bg-green-700");
        document.getElementById("activityTimerButton").classList.add("bg-orange-600");
        document.getElementById("activityTimerButton").classList.add("hover:bg-orange-700");
        document.getElementById("timerLeftActivity").innerText = "1h:00:00";
        document.getElementById("activityTimer").classList.add("bg-green-600");
        activityTimer = setInterval(function () {

            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = nextHourTime - now;

            // Time calculations for days, hours, minutes and seconds
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("timerLeftActivity").innerText = minutes + ":" + seconds.toString().padStart(2, '0');

            if (minutes < 30 && !isHalfTime) {
                document.getElementById("activityTimer").classList.remove("bg-green-600");
                document.getElementById("activityTimer").classList.add("bg-orange-600");
                isHalfTime = true;
            }

            if (minutes < 15 && !isCloseEndTime) {
                document.getElementById("activityTimer").classList.remove("bg-orange-600");
                document.getElementById("activityTimer").classList.add("bg-red-600");
                isHalfTime = isCloseEndTime;
            }

            if (distance < 0) {
                clearInterval(activityTimer);
                document.getElementById("activityTimer").classList.add("hidden");
                document.getElementById("timerLeftActivity").classList.remove("bg-red-600");
                window.navigator.vibrate(200);
            }
        }, 1000);
    }
    else {
        clearInterval(activityTimer);
        activityTimer = null;
        document.getElementById("activityTimer").classList.add("hidden");
        document.getElementById("activityTimerButton").innerHTML = "<span class='ion-play'></span> Démarrer l'activité journalière (1H)";
        document.getElementById("activityTimerButton").classList.add("bg-green-500");
        document.getElementById("activityTimerButton").classList.add("hover:bg-green-700");
        document.getElementById("activityTimerButton").classList.remove("bg-orange-600");
        document.getElementById("activityTimerButton").classList.remove("hover:bg-orange-700");
    }
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
                    document.getElementById("currentLocationButton").classList.remove("hidden");
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
            document.getElementById("currentLocationButton").classList.remove("hidden");
            drawCircleOnMap(currentUserLocation, isHome);
        }
    }
    else {
        watchCurrentUserLocation = navigator.geolocation.watchPosition(function (position) {
            currentUserLocation = [
                position.coords.latitude,
                position.coords.longitude
            ];
            var currentLocationButton = document.getElementById("currentLocationButton");
            currentLocationButton.classList.add("opacity-50");
            currentLocationButton.classList.add("cursor-not-allowed");
            currentLocationButton.innerHTML = "<span class='ion-android-checkmark-circle'> Localisation en temps réel établie</span>";
            drawCircleOnMap(currentUserLocation, isHome);
            document.getElementById("activityTimerButton").classList.remove("hidden");
            if (isFirstRefreshOfCurrentUserLocation) {
                isFirstRefreshOfCurrentUserLocation = false;
                if (isBrowserMobile()) {
                    window.scrollTo(0, document.body.scrollHeight);
                }
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

function isBrowserMobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

scrollTopButton = document.getElementById("scrollTopButton");

// When the user scrolls down 60px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 60 || document.documentElement.scrollTop > 60) {
        scrollTopButton.style.display = "block";
    } else {
        scrollTopButton.style.display = "none";
    }
}

scrollTopButton.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: 'smooth',
}));