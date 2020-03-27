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

// autoComplete.js on typing event emitter
document.querySelector("#searchAddresses").addEventListener("autoComplete", event => {
    console.log(event);
});

const autocompleteJs = new autoComplete({
    data: {                              // Data src [Array, Function, Async] | (REQUIRED)
        src: async () => {
            // User search query
            const query = document.querySelector("#searchAddresses").value;
            // Fetch External Data Source
            const source = await fetch('https://api-adresse.data.gouv.fr/search/?q=' + query);
            var data = await source.json();
            // Format data into JSON
            var reformattedAddresses = [];
            for (var i = 0; i < data.features.length; i++) {
                reformattedAddresses.push({
                    lat: data.features[i].geometry.coordinates[0],
                    long: data.features[i].geometry.coordinates[1],
                    city: data.features[i].properties.city,
                    context: data.features[i].properties.context,
                    postCode: data.features[i].properties.postcode,
                    name: data.features[i].properties.name
                })
            }
            console.log(reformattedAddresses);

            // Return Fetched data
            return reformattedAddresses;
        },
        key: ["name", "city", "context", "postcode"],
        cache: false
    },
    sort: (a, b) => {                    // Sort rendered results ascendingly | (Optional)
        if (a.match < b.match) return -1;
        if (a.match > b.match) return 1;
        return 0;
    },
    placeHolder: "Adresse de votre domicile",     // Place Holder text                 | (Optional)
    selector: "#searchAddresses",           // Input field selector              | (Optional)
    threshold: 3,                        // Min. Chars length to start Engine | (Optional)
    debounce: 300,                       // Post duration for engine to start | (Optional)
    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
    resultsList: {                       // Rendered results list object      | (Optional)
        render: true,
        container: source => {
            source.setAttribute("id", "searchAddressesList");
        },
        destination: document.querySelector("#searchAddresses"),
        position: "afterend",
        element: "ul"
    },
    maxResults: 5,                         // Max. number of rendered results | (Optional)
    highlight: true,                       // Highlight matching results      | (Optional)
    resultItem: {                          // Rendered result item            | (Optional)
        content: (data, source) => {
            source.innerHTML = data.match;
        },
        element: "li"
    },
    noResults: () => {                     // Action script on noResults      | (Optional)
        const result = document.createElement("li");
        result.setAttribute("class", "no_result");
        result.setAttribute("tabindex", "1");
        result.innerHTML = "No Results";
        document.querySelector("#searchAddressesList").appendChild(result);
    },
    onSelection: feedback => {             // Action script onSelection event | (Optional)
        console.log(feedback.selection.value.image_url);
    }
});

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