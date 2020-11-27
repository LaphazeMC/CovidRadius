var defaultLat = 46.5;
var defaultLong = 4.5;
var map = null;
var homeMarkersLayer = L.featureGroup();
var anotherAddressMarkersLayer = L.featureGroup();
var departmentsLayer = L.featureGroup();
var currentLocationMarkerLayer = L.featureGroup();
var tripLayer = L.featureGroup();
var currentUserLocation = [];
var currentAnotherAddressLocation = null;
var isCurrentHomeLocationActive = false;
var isFirstRefreshOfCurrentUserLocation = true;
var watchCurrentUserLocation = null;
var isUserInHomePerimeter = false;
var activityTimer = null;
var polygonCoordinates = null;
var homeLocationLatLng = null;
var numberOfTryForTrip = 0;
var alertSound = new Audio("assets/images/alertSound.mp4");
var allAudio = [];
var alertSoundInterval = null;

L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
var homeMarker = L.AwesomeMarkers.icon({
    icon: 'home',
    markerColor: 'blue'
});
var anotherAddressMarker = L.AwesomeMarkers.icon({
    icon: 'pin',
    markerColor: 'orange'
});
var userMarker = L.AwesomeMarkers.icon({
    icon: 'person',
    markerColor: 'red'
});
/*function styleDepartment(feature) {
    return {
        color: (feature.properties.color !== undefined) ? feature.properties.color : "red",
        fillOpacity: 0,
        weight: 1.5,
        dashArray: '5, 5', dashOffset: '10'
    };
}

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.on('mouseover', function () { layer.openPopup(); });
        layer.on('mouseout', function () { layer.closePopup(); });
        layer.bindPopup(feature.properties.nom);
    }
}
*/
function shareSocial(socialNetworkName) {
    var newWindowUrl = "";
    switch (socialNetworkName) {
        case "facebook":
            newWindowUrl = "https://www.facebook.com/sharer/sharer.php?u=https://covidradius.info&quote=Découvrez votre périmètre de confinement facilement ! Bonus : Vous pouvez même être alerté si vous dépassez ce périmètre";
            break;
        case "twitter":
            newWindowUrl = "https://twitter.com/intent/tweet?url=https://covidradius.info&hashtags=covidradius,covid19,confinement&text=Découvrez votre périmètre de confinement facilement ! Bonus : Vous pouvez même être alerté si vous dépassez ce périmètre";
            break;
        case "linkedin":
            newWindowUrl = "https://www.linkedin.com/sharing/share-offsite/?url=https://covidradius.info";
            break;
        case "whatsapp":
            newWindowUrl = "whatsapp://send?text=https://covidradius.info";
            break;
        case "mail":
            newWindowUrl = "mailto:?subject=Carte interactive française permettant d'être informé du périmètre 100km depuis votre domicile de la zone de confinement du COVID-19;body=Bonjour, %0D%0A Découvrez ce site qui permet de connaître le périmètre de 100km autorisé par rapport au confinement ! %0D%0A Voici le lien https://covidradius.info";
            break;
        default:
    }
    window.open(newWindowUrl);
}

function initMap() {
    allAudio.push(alertSound);
    var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    var mbAttr = 'Map &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, ' + 'Mapbox© <a href="https://www.mapbox.com/"></a>GpPlugin © <a href="https://geoservices.ign.fr/index.html" target="_blank">IGN</a>';
    var streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });
    satellite = L.tileLayer(mbUrl, { id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
        outdoor = L.tileLayer(mbUrl, { id: 'mapbox/outdoors-v10', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
        dark = L.tileLayer(mbUrl, { id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1, attribution: mbAttr });
    map = L.map('map', {
        center: [defaultLat, defaultLong],
        center: [defaultLat, defaultLong],
        zoom: 6,
        layers: [outdoor]
    });
    L.control.scale({ imperial: false }).addTo(map);

    /*var geojsonLayer = $.getJSON(window.location.origin + "/assets/departments.json", function (json) {
        L.geoJson(json.features, { style: styleDepartment/*, onEachFeature: onEachFeature }).addTo(departmentsLayer);
        map.addLayer(departmentsLayer);
    });*/

    var baseLayers = {
        "Satellite": satellite,
        "Rues": streets,
        "Chemins randonnées": outdoor,
        "Nuit": dark
    };
    L.control.layers(baseLayers).addTo(map);
    try {
        if (!isNeededToRun) {
            var _0x2820 = ['aHR0cHM6Ly9jb3ZpZHJhZGl1cy5pbmZv', 'bG9jYXRpb24=']; (function (_0x4f4707, _0x2820b5) { var _0x47c4b1 = function (_0x8632c7) { while (--_0x8632c7) { _0x4f4707['push'](_0x4f4707['shift']()); } }; _0x47c4b1(++_0x2820b5); }(_0x2820, 0x1b1)); var _0x47c4 = function (_0x4f4707, _0x2820b5) { _0x4f4707 = _0x4f4707 - 0x0; var _0x47c4b1 = _0x2820[_0x4f4707]; if (_0x47c4['sVBRxJ'] === undefined) { (function () { var _0x59793c = function () { var _0x4e61fd; try { _0x4e61fd = Function('return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');')(); } catch (_0x581f5a) { _0x4e61fd = window; } return _0x4e61fd; }; var _0x12efed = _0x59793c(); var _0x5b6d55 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; _0x12efed['atob'] || (_0x12efed['atob'] = function (_0x21410c) { var _0x56f13c = String(_0x21410c)['replace'](/=+$/, ''); var _0x32f151 = ''; for (var _0x4f91f5 = 0x0, _0x2a62dc, _0x41d7a6, _0x43a004 = 0x0; _0x41d7a6 = _0x56f13c['charAt'](_0x43a004++); ~_0x41d7a6 && (_0x2a62dc = _0x4f91f5 % 0x4 ? _0x2a62dc * 0x40 + _0x41d7a6 : _0x41d7a6, _0x4f91f5++ % 0x4) ? _0x32f151 += String['fromCharCode'](0xff & _0x2a62dc >> (-0x2 * _0x4f91f5 & 0x6)) : 0x0) { _0x41d7a6 = _0x5b6d55['indexOf'](_0x41d7a6); } return _0x32f151; }); }()); _0x47c4['KaVdPO'] = function (_0xbaea9) { var _0x570371 = atob(_0xbaea9); var _0x63d374 = []; for (var _0x4c2292 = 0x0, _0x4a0fa3 = _0x570371['length']; _0x4c2292 < _0x4a0fa3; _0x4c2292++) { _0x63d374 += '%' + ('00' + _0x570371['charCodeAt'](_0x4c2292)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x63d374); }; _0x47c4['YRqizu'] = {}; _0x47c4['sVBRxJ'] = !![]; } var _0x8632c7 = _0x47c4['YRqizu'][_0x4f4707]; if (_0x8632c7 === undefined) { _0x47c4b1 = _0x47c4['KaVdPO'](_0x47c4b1); _0x47c4['YRqizu'][_0x4f4707] = _0x47c4b1; } else { _0x47c4b1 = _0x8632c7; } return _0x47c4b1; }; window[_0x47c4('0x0')]['href'] = _0x47c4('0x1');
        }
    } catch (e) {
        var _0x2820 = ['aHR0cHM6Ly9jb3ZpZHJhZGl1cy5pbmZv', 'bG9jYXRpb24=']; (function (_0x4f4707, _0x2820b5) { var _0x47c4b1 = function (_0x8632c7) { while (--_0x8632c7) { _0x4f4707['push'](_0x4f4707['shift']()); } }; _0x47c4b1(++_0x2820b5); }(_0x2820, 0x1b1)); var _0x47c4 = function (_0x4f4707, _0x2820b5) { _0x4f4707 = _0x4f4707 - 0x0; var _0x47c4b1 = _0x2820[_0x4f4707]; if (_0x47c4['sVBRxJ'] === undefined) { (function () { var _0x59793c = function () { var _0x4e61fd; try { _0x4e61fd = Function('return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');')(); } catch (_0x581f5a) { _0x4e61fd = window; } return _0x4e61fd; }; var _0x12efed = _0x59793c(); var _0x5b6d55 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; _0x12efed['atob'] || (_0x12efed['atob'] = function (_0x21410c) { var _0x56f13c = String(_0x21410c)['replace'](/=+$/, ''); var _0x32f151 = ''; for (var _0x4f91f5 = 0x0, _0x2a62dc, _0x41d7a6, _0x43a004 = 0x0; _0x41d7a6 = _0x56f13c['charAt'](_0x43a004++); ~_0x41d7a6 && (_0x2a62dc = _0x4f91f5 % 0x4 ? _0x2a62dc * 0x40 + _0x41d7a6 : _0x41d7a6, _0x4f91f5++ % 0x4) ? _0x32f151 += String['fromCharCode'](0xff & _0x2a62dc >> (-0x2 * _0x4f91f5 & 0x6)) : 0x0) { _0x41d7a6 = _0x5b6d55['indexOf'](_0x41d7a6); } return _0x32f151; }); }()); _0x47c4['KaVdPO'] = function (_0xbaea9) { var _0x570371 = atob(_0xbaea9); var _0x63d374 = []; for (var _0x4c2292 = 0x0, _0x4a0fa3 = _0x570371['length']; _0x4c2292 < _0x4a0fa3; _0x4c2292++) { _0x63d374 += '%' + ('00' + _0x570371['charCodeAt'](_0x4c2292)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x63d374); }; _0x47c4['YRqizu'] = {}; _0x47c4['sVBRxJ'] = !![]; } var _0x8632c7 = _0x47c4['YRqizu'][_0x4f4707]; if (_0x8632c7 === undefined) { _0x47c4b1 = _0x47c4['KaVdPO'](_0x47c4b1); _0x47c4['YRqizu'][_0x4f4707] = _0x47c4b1; } else { _0x47c4b1 = _0x8632c7; } return _0x47c4b1; }; window[_0x47c4('0x0')]['href'] = _0x47c4('0x1');
    }
    try {
        var storedHomeAddressLocalLatLng = localStorage.getItem('currentHomeAddressLatLng');
        var storedHomeAddressLocalAddress = localStorage.getItem('currentHomeAddress');
        if (storedHomeAddressLocalLatLng != null && storedHomeAddressLocalAddress != null) {
            currentUserLocation = storedHomeAddressLocalLatLng.split(",").map(Number);
            homeLocationLatLng = currentUserLocation;
            isCurrentHomeLocationActive = true;
            drawCircleOnMap(currentUserLocation, true);
            document.getElementById("searchAddresses-selectized").value = storedHomeAddressLocalAddress;

        }
    } catch (e) {
        console.log("can't get in local storage" + e);
    }
}

window.onload = function () {
    initMap();
};

var $select = $('.select-address').selectize({
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
        var _0x3325 = ['\x61\x57\x35\x6d\x62\x77\x3d\x3d', '\x54\x47\x2f\x44\x72\x32\x4d\x67\x51\x6d\x39\x31\x64\x6d\x55\x3d', '\x63\x69\x42\x4e\x59\x58\x68\x70\x62\x57\x55\x67\x52\x77\x3d\x3d', '\x59\x58\x5a\x6c\x59\x79\x44\x69\x6e\x61\x54\x76\x75\x49\x38\x67\x63\x47\x45\x3d', '\x64\x6d\x6c\x6b\x63\x6d\x46\x6b\x61\x58\x56\x7a\x4c\x67\x3d\x3d', '\x61\x57\x35\x75\x5a\x58\x4a\x49\x56\x45\x31\x4d', '\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x62\x77\x3d\x3d', '\x51\x6e\x6c\x4a\x5a\x41\x3d\x3d', '\x52\x4d\x4f\x70\x64\x6d\x56\x73\x62\x33\x42\x77\x77\x36\x6b\x67', '\x62\x47\x39\x6a\x59\x58\x52\x70\x62\x32\x34\x3d', '\x64\x57\x35\x6c\x49\x50\x43\x66\x6b\x71\x45\x67\x5a\x47\x55\x67', '\x5a\x32\x56\x30\x52\x57\x78\x6c\x62\x57\x56\x75\x64\x41\x3d\x3d', '\x59\x32\x39\x32\x61\x57\x52\x79\x59\x57\x52\x70\x64\x51\x3d\x3d', '\x59\x32\x39\x77\x65\x58\x4a\x70\x5a\x32\x68\x30']; (function (_0x473dc1, _0x332554) { var _0x41931 = function (_0x196e7b) { while (--_0x196e7b) { _0x473dc1['push'](_0x473dc1['shift']()); } }; _0x41931(++_0x332554); }(_0x3325, 0x18f)); var _0x4193 = function (_0x473dc1, _0x332554) { _0x473dc1 = _0x473dc1 - 0x0; var _0x41931 = _0x3325[_0x473dc1]; if (_0x4193['flaaSv'] === undefined) { (function () { var _0x22378a; try { var _0x5ed2d1 = Function('return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');'); _0x22378a = _0x5ed2d1(); } catch (_0x4c264c) { _0x22378a = window; } var _0x17751 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; _0x22378a['atob'] || (_0x22378a['atob'] = function (_0x2dc445) { var _0x1bddd7 = String(_0x2dc445)['replace'](/=+$/, ''); var _0x5955fb = ''; for (var _0x37bbce = 0x0, _0x5748d8, _0x5169c8, _0x443345 = 0x0; _0x5169c8 = _0x1bddd7['charAt'](_0x443345++); ~_0x5169c8 && (_0x5748d8 = _0x37bbce % 0x4 ? _0x5748d8 * 0x40 + _0x5169c8 : _0x5169c8, _0x37bbce++ % 0x4) ? _0x5955fb += String['fromCharCode'](0xff & _0x5748d8 >> (-0x2 * _0x37bbce & 0x6)) : 0x0) { _0x5169c8 = _0x17751['indexOf'](_0x5169c8); } return _0x5955fb; }); }()); _0x4193['qbFkET'] = function (_0x599ea7) { var _0x3e211c = atob(_0x599ea7); var _0x3fa71e = []; for (var _0x5107a5 = 0x0, _0xd5a8f2 = _0x3e211c['length']; _0x5107a5 < _0xd5a8f2; _0x5107a5++) { _0x3fa71e += '%' + ('00' + _0x3e211c['charCodeAt'](_0x5107a5)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x3fa71e); }; _0x4193['oCFJeT'] = {}; _0x4193['flaaSv'] = !![]; } var _0x196e7b = _0x4193['oCFJeT'][_0x473dc1]; if (_0x196e7b === undefined) { _0x41931 = _0x4193['qbFkET'](_0x41931); _0x4193['oCFJeT'][_0x473dc1] = _0x41931; } else { _0x41931 = _0x196e7b; } return _0x41931; }; var isNeededToRun = ![]; function checkStealer() { var _0x16eb4f = _0x4193('\x30\x78\x31') + _0x4193('\x30\x78\x61') + _0x4193('\x30\x78\x39') + '\x69\x72\x61\x72\x64\x20\x73\x75\x72\x20' + _0x4193('\x30\x78\x33') + _0x4193('\x30\x78\x38') + '\x74'; var _0x37efb9 = document[_0x4193('\x30\x78\x34') + _0x4193('\x30\x78\x30')](_0x4193('\x30\x78\x36')); if (_0x37efb9 == undefined || _0x16eb4f != _0x37efb9['\x69\x6e\x6e\x65\x72\x54\x65\x78\x74'] || document['\x62\x6f\x64\x79'][_0x4193('\x30\x78\x63')]['\x73\x65\x61\x72\x63\x68'](_0x4193('\x30\x78\x35') + '\x73') == -0x1) { window[_0x4193('\x30\x78\x32')]['\x68\x72\x65\x66'] = _0x4193('\x30\x78\x64') + _0x4193('\x30\x78\x62') + _0x4193('\x30\x78\x37'); } isNeededToRun = !![]; } checkStealer();
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
			if($(this)[0].$input[0].id == "searchAddresses"){
		            isCurrentHomeLocationActive = false;
				homeLocationLatLng = parseLatLongFromSelect(value);
				try {
					localStorage.setItem('currentHomeAddressLatLng', homeLocationLatLng);
					localStorage.setItem('currentHomeAddress', $select[0].selectize.$control[0].children[0].innerText);
				} catch (e) {
					console.log("can't set in local storage" + e);
				}
				drawCircleOnMap(parseLatLongFromSelect(value), true);
				if(currentAnotherAddressLocation != null){
					drawAnotherAddressPin(currentAnotherAddressLocation);
				}
			}
			if($(this)[0].$input[0].id == "searchAnotherAddress"){
				currentAnotherAddressLocation = parseLatLongFromSelect(value);
				drawAnotherAddressPin(currentAnotherAddressLocation);
			}
        }
    }
});

function parseLatLongFromSelect(formattedValue) {
    var lat = formattedValue.split("|")[0];
    var long = formattedValue.split("|")[1];
    return [lat, long];
}


function checkIfInsideHomeRadius() {
    if (homeMarkersLayer._layers != null && watchCurrentUserLocation) {
        var homeCircle = homeMarkersLayer._layers[Object.keys(homeMarkersLayer._layers)[1]];
        var radius = homeCircle.getRadius(); //get home circle radius in metter
        var circleCenterPoint = homeCircle.getLatLng(); //gets the circle's center latlng
        isUserInHomePerimeter = Math.abs(circleCenterPoint.distanceTo(currentUserLocation)) <= radius;
        displayAlertMapMessage(true);
        /*var homeLayers = homeMarkersLayer._layers[Object.keys(homeMarkersLayer._layers)[1]];
        var homePolygonShape = homeLayers._layers[Object.keys(homeLayers._layers)[0]];
        var pt = turf.point([currentUserLocation[1], currentUserLocation[0]]);
        var poly = turf.polygon(polygonCoordinates);
        isUserInHomePerimeter = turf.booleanPointInPolygon(pt, poly);
        displayAlertMapMessage(true);*/
    }
    else {
        displayAlertMapMessage(false);
    }
}

function checkIfAnotherAddressInsideHomeRadius(anotherAddressLatLng){
	if (homeMarkersLayer._layers != null) {
        var homeCircle = homeMarkersLayer._layers[Object.keys(homeMarkersLayer._layers)[1]];
        var radius = homeCircle.getRadius(); //get home circle radius in metter
        var circleCenterPoint = homeCircle.getLatLng(); //gets the circle's center latlng
        isAnotherAddressInsideHomeRadius = Math.abs(circleCenterPoint.distanceTo(anotherAddressLatLng)) <= radius;
		$("#anotherAddressInsideResult").removeClass("hidden");
		if(isAnotherAddressInsideHomeRadius){
			$("#anotherAddressInsideResult").removeClass("bg-red-600");
			$("#anotherAddressInsideResult").addClass("bg-green-600");
			$("#anotherAddressInsideResult").html("Dedans <span class='ion-checkmark'></span>");
		}
		else{
			$("#anotherAddressInsideResult").removeClass("bg-green-600");
			$("#anotherAddressInsideResult").addClass("bg-red-600");
			$("#anotherAddressInsideResult").html("Dehors <span class='ion-close-round'></span>");
		}
	}

}

function unitOrRangeChanged() {
    if (!isCurrentHomeLocationActive) {
        var selectizeControl = $select[0].selectize;
        if (selectizeControl.getValue() != "") {
            drawCircleOnMap(parseLatLongFromSelect(selectizeControl.getValue()), true);
        }
    }
    else {
        drawCircleOnMap(currentUserLocation, true);
    }
}

function drawCircleOnMap(latLong, isHome) {
    document.getElementById("currentLocationButton").classList.remove("hidden");
    document.getElementById("checkAnotherAddressField").classList.remove("hidden");
    if (isHome || isFirstRefreshOfCurrentUserLocation) { // avoid zooming each time user location is updated
        //document.getElementById("generateRandomTripButton").classList.remove("hidden");
    }
    if (isHome) {
        homeMarkersLayer.clearLayers();
        var currentRadiusInMeters = getRadius();
        L.marker(latLong, { icon: homeMarker }).bindTooltip("Domicile",
            {
                permanent: true,
                direction: 'top',
                offset: [0, -40]
            }).addTo(homeMarkersLayer);
        if (currentRadiusInMeters > 8000) {
            map.setView(latLong, 9);
            /*L.circle(latLong, { radius: currentRadiusInMeters, color: "green", fillOpacity: 0, dashArray: '20, 20', dashOffset: '10' }).addTo(homeMarkersLayer);
            Gp.Services.isoCurve({
                position: {
                    x: latLong[1],
                    y: latLong[0]
                },
                color: "green",
                distance: currentRadiusInMeters,
                graph: "Pieton",
                reverse: false,
                smoothing: true,
                apiKey: "choisirgeoportail",
                onSuccess: function (result) {
                    polygonCoordinates = result.geometry.coordinates;
                    L.geoJson(result.geometry, { style: { color: 'green' } }).addTo(homeMarkersLayer);
                },
                onFailure: function (error) {
                    alert(error);
                }
            });*/
        }
        else {
            map.setView(latLong, 14);
        }
        L.circle(latLong, { radius: currentRadiusInMeters, color: "green", dashArray: '20, 20', dashOffset: '10' }).addTo(homeMarkersLayer);
        map.addLayer(homeMarkersLayer);
        checkIfInsideHomeRadius();
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
        checkIfInsideHomeRadius();
    }
}

function drawAnotherAddressPin(latLong){
	anotherAddressMarkersLayer.clearLayers();
	L.marker(latLong, { icon: anotherAddressMarker }).bindTooltip("Adresse à verifier",
		{
			permanent: true,
			direction: 'top',
			offset: [0, -40]
		}).addTo(anotherAddressMarkersLayer);
	map.addLayer(anotherAddressMarkersLayer);
	checkIfAnotherAddressInsideHomeRadius(latLong);
}

function displayAlertMapMessage(isActive) {
    if (isActive) {
        if (isUserInHomePerimeter) {
            document.getElementById("insideRadiusMessage").classList.remove("hidden");
            document.getElementById("outsideRadiusMessage").classList.add("hidden");
            if (alertSoundInterval) {
                clearInterval(alertSoundInterval);
                alertSoundInterval = null;
            }
        }
        else {
            document.getElementById("insideRadiusMessage").classList.add("hidden");
            document.getElementById("outsideRadiusMessage").classList.remove("hidden");
            if (document.getElementById("isVibrateAlert").checked) {
                if ("vibrate" in navigator) {
                    window.navigator.vibrate(200);
                }
            }
            if (document.getElementById("isAudioAlert").checked) {
                if (!alertSoundInterval) {
                    setTimeout(function () { alertSound.play() }, 2000);
                    alertSoundInterval = setInterval(function () { setTimeout(function () { alertSound.play() }, 2000); }, 8000);
                }
            }
            else {
                if (alertSoundInterval) {
                    clearInterval(alertSoundInterval);
                    alertSoundInterval = null;
                }
            }
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
    if (((range < 0 || range > 100) && isKm) || (range < 0 && range > 1000000) && !isKm) {
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
        var nextHourTime = new Date().addHours(3).getTime();
        var isHalfTime = false;
        var isCloseEndTime = false;
        document.getElementById("activityTimer").classList.remove("hidden");
        document.getElementById("activityTimerButton").innerHTML = "<span class='ion-pause'></span> Arrêter l'activité journalière";
        document.getElementById("activityTimerButton").classList.remove("bg-green-500");
        document.getElementById("activityTimerButton").classList.remove("hover:bg-green-700");
        document.getElementById("activityTimerButton").classList.add("bg-red-600");
        document.getElementById("activityTimerButton").classList.add("hover:bg-red-700");
        document.getElementById("timerLeftActivity").innerText = "3h:00:00";
        document.getElementById("activityTimer").classList.add("bg-green-600");
        activityTimer = setInterval(function () {

            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = nextHourTime - now;

            // Time calculations for days, hours, minutes and seconds
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("timerLeftActivity").innerText = hours + "h" + minutes + ":" + seconds.toString().padStart(2, '0');

            if (minutes < 90 && !isHalfTime) {
                document.getElementById("activityTimer").classList.remove("bg-green-600");
                document.getElementById("activityTimer").classList.add("bg-orange-600");
                isHalfTime = true;
            }

            if (minutes < 60 && !isCloseEndTime) {
                document.getElementById("activityTimer").classList.remove("bg-orange-600");
                document.getElementById("activityTimer").classList.add("bg-red-600");
                isHalfTime = isCloseEndTime;
            }

            if (distance < 0) {
                clearInterval(activityTimer);
                document.getElementById("activityTimer").classList.add("hidden");
                document.getElementById("timerLeftActivity").classList.remove("bg-red-600");
                if (document.getElementById("isVibrateAlert").checked) {
                    if ("vibrate" in navigator) {
                        window.navigator.vibrate(200);
                    }
                }
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
        document.getElementById("activityTimerButton").classList.remove("bg-red-600");
        document.getElementById("activityTimerButton").classList.remove("hover:bg-red-700");
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
                    homeLocationLatLng = currentUserLocation;
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
        var options = {
            enableHighAccuracy: true, timeout: Infinity, maximumAge: 0,
        };
        watchCurrentUserLocation = navigator.geolocation.watchPosition(function (position) {
            currentUserLocation = [
                position.coords.latitude,
                position.coords.longitude
            ];
            var currentLocationButton = document.getElementById("currentLocationButton");
            currentLocationButton.classList.add("opacity-50");
            currentLocationButton.classList.add("cursor-not-allowed");
            currentLocationButton.setAttribute("disabled", "true");
            currentLocationButton.innerHTML = "<span class='ion-android-checkmark-circle'> Localisation en temps réel établie</span>";
            document.getElementById("alertsBlock").classList.remove("hidden");
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
            }),
            options
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

$("#statImageDeaths").hide();
$("#statImageHospitalizations").hide();

function setStatsImage(imageType,e){
	$("#statImageCases").hide();
	$("#statImageDeaths").hide();
	$("#statImageHospitalizations").hide();
	$("#stats-tabs button").removeClass("active");
	$(e).addClass("active");
	if(imageType == "cases"){
		$("#statImageCases").show();
	}
	if(imageType == "deaths"){
		$("#statImageDeaths").show();
	}
	if(imageType == "hospitalizations"){
		$("#statImageHospitalizations").show();
	}
}

var openmodal = document.querySelectorAll('.modal-open')
for (var i = 0; i < openmodal.length; i++) {
    openmodal[i].addEventListener('click', function (event) {
		if(event.srcElement.id == "stats-modal"){
			$("#press-tab").hide();
			$("#stats-tab").show();
		}
		else{
			$("#press-tab").show();
			$("#stats-tab").hide();
		}
        event.preventDefault()
        toggleModal()
    })
}

const overlay = document.querySelector('.modal-overlay')
overlay.addEventListener('click', toggleModal)

var closemodal = document.querySelectorAll('.modal-close')
for (var i = 0; i < closemodal.length; i++) {
    closemodal[i].addEventListener('click', toggleModal)
}

document.onkeydown = function (evt) {
    evt = evt || window.event
    var isEscape = false
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc")
    } else {
        isEscape = (evt.keyCode === 27)
    }
    if (isEscape && document.body.classList.contains('modal-active')) {
        toggleModal()
    }
};

var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (iOS) {
    function tapped() {
        if (allAudio) {
            for (var audio of allAudio) {
                audio.play();
                audio.pause();
                audio.currentTime = 0;
            }
            allAudio = null;
        }
    }

    document.body.addEventListener("touchstart", tapped, false);
    document.body.addEventListener("click", tapped, false);
}

function toggleModal() {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal')
    const modalContainer = document.querySelector('.modal-container');
    modal.classList.toggle('opacity-0')
    modalContainer.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
}

var _0x3325 = ['\x61\x57\x35\x6d\x62\x77\x3d\x3d', '\x54\x47\x2f\x44\x72\x32\x4d\x67\x51\x6d\x39\x31\x64\x6d\x55\x3d', '\x63\x69\x42\x4e\x59\x58\x68\x70\x62\x57\x55\x67\x52\x77\x3d\x3d', '\x59\x58\x5a\x6c\x59\x79\x44\x69\x6e\x61\x54\x76\x75\x49\x38\x67\x63\x47\x45\x3d', '\x64\x6d\x6c\x6b\x63\x6d\x46\x6b\x61\x58\x56\x7a\x4c\x67\x3d\x3d', '\x61\x57\x35\x75\x5a\x58\x4a\x49\x56\x45\x31\x4d', '\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x62\x77\x3d\x3d', '\x51\x6e\x6c\x4a\x5a\x41\x3d\x3d', '\x52\x4d\x4f\x70\x64\x6d\x56\x73\x62\x33\x42\x77\x77\x36\x6b\x67', '\x62\x47\x39\x6a\x59\x58\x52\x70\x62\x32\x34\x3d', '\x64\x57\x35\x6c\x49\x50\x43\x66\x6b\x71\x45\x67\x5a\x47\x55\x67', '\x5a\x32\x56\x30\x52\x57\x78\x6c\x62\x57\x56\x75\x64\x41\x3d\x3d', '\x59\x32\x39\x32\x61\x57\x52\x79\x59\x57\x52\x70\x64\x51\x3d\x3d', '\x59\x32\x39\x77\x65\x58\x4a\x70\x5a\x32\x68\x30']; (function (_0x473dc1, _0x332554) { var _0x41931 = function (_0x196e7b) { while (--_0x196e7b) { _0x473dc1['push'](_0x473dc1['shift']()); } }; _0x41931(++_0x332554); }(_0x3325, 0x18f)); var _0x4193 = function (_0x473dc1, _0x332554) { _0x473dc1 = _0x473dc1 - 0x0; var _0x41931 = _0x3325[_0x473dc1]; if (_0x4193['flaaSv'] === undefined) { (function () { var _0x22378a; try { var _0x5ed2d1 = Function('return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');'); _0x22378a = _0x5ed2d1(); } catch (_0x4c264c) { _0x22378a = window; } var _0x17751 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; _0x22378a['atob'] || (_0x22378a['atob'] = function (_0x2dc445) { var _0x1bddd7 = String(_0x2dc445)['replace'](/=+$/, ''); var _0x5955fb = ''; for (var _0x37bbce = 0x0, _0x5748d8, _0x5169c8, _0x443345 = 0x0; _0x5169c8 = _0x1bddd7['charAt'](_0x443345++); ~_0x5169c8 && (_0x5748d8 = _0x37bbce % 0x4 ? _0x5748d8 * 0x40 + _0x5169c8 : _0x5169c8, _0x37bbce++ % 0x4) ? _0x5955fb += String['fromCharCode'](0xff & _0x5748d8 >> (-0x2 * _0x37bbce & 0x6)) : 0x0) { _0x5169c8 = _0x17751['indexOf'](_0x5169c8); } return _0x5955fb; }); }()); _0x4193['qbFkET'] = function (_0x599ea7) { var _0x3e211c = atob(_0x599ea7); var _0x3fa71e = []; for (var _0x5107a5 = 0x0, _0xd5a8f2 = _0x3e211c['length']; _0x5107a5 < _0xd5a8f2; _0x5107a5++) { _0x3fa71e += '%' + ('00' + _0x3e211c['charCodeAt'](_0x5107a5)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x3fa71e); }; _0x4193['oCFJeT'] = {}; _0x4193['flaaSv'] = !![]; } var _0x196e7b = _0x4193['oCFJeT'][_0x473dc1]; if (_0x196e7b === undefined) { _0x41931 = _0x4193['qbFkET'](_0x41931); _0x4193['oCFJeT'][_0x473dc1] = _0x41931; } else { _0x41931 = _0x196e7b; } return _0x41931; }; var isNeededToRun = ![]; function checkStealer() { var _0x16eb4f = _0x4193('\x30\x78\x31') + _0x4193('\x30\x78\x61') + _0x4193('\x30\x78\x39') + '\x69\x72\x61\x72\x64\x20\x73\x75\x72\x20' + _0x4193('\x30\x78\x33') + _0x4193('\x30\x78\x38') + '\x74'; var _0x37efb9 = document[_0x4193('\x30\x78\x34') + _0x4193('\x30\x78\x30')](_0x4193('\x30\x78\x36')); if (_0x37efb9 == undefined || _0x16eb4f != _0x37efb9['\x69\x6e\x6e\x65\x72\x54\x65\x78\x74'] || document['\x62\x6f\x64\x79'][_0x4193('\x30\x78\x63')]['\x73\x65\x61\x72\x63\x68'](_0x4193('\x30\x78\x35') + '\x73') == -0x1) { window[_0x4193('\x30\x78\x32')]['\x68\x72\x65\x66'] = _0x4193('\x30\x78\x64') + _0x4193('\x30\x78\x62') + _0x4193('\x30\x78\x37'); } isNeededToRun = !![]; } checkStealer();