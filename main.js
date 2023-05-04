/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

// Karte initialisieren
let map = L.map("map").setView([
    stephansdom.lat, stephansdom.lng
], 15);

map.addControl(new L.Control.Fullscreen());

// thematische Layer 
let themaLayer = {
    stops: L.featureGroup(),
    lines: L.featureGroup(),
    zones: L.featureGroup(),
    sights: L.featureGroup(),
    hotels: L.markerClusterGroup({
        disableClusteringAtZoom:17
    })
}

// Hintergrundlayer (add to map bei dem Layer, der zuerst angezeigt werden soll)
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau"),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto").addTo(map),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
}, {
    "Wien Haltestellen": themaLayer.stops,
    "Wien Linien": themaLayer.lines,
    "Wien Fußgängerzonen": themaLayer.zones,
    "Wien Sehenswürdigkeiten": themaLayer.sights,
    "Wien Hotels": themaLayer.hotels.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Funktion für Bushaltestellen
async function showStops(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/busstop_${feature.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4><b> <i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</b></h4>
            <p> ${prop.STAT_ID} ${prop.STAT_NAME}</p>`);
        }
    }).addTo(themaLayer.stops);
}
showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Buslinien 
async function showLines(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    let lineNames = {};
    let lineColours = {
        1: "#FF4136",//Red Line
        2: "#FFDC00",//Yellow Line
        3: "#0074D9",//Blue Line
        4: "#2ECC40", //Green Line
        5: "#AAAAAA",//Grey Line
        6: "#FF851B" //Orange Line
    }
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: lineColours[feature.properties.LINE_ID],
                weight: 3,
                dashArray: [10, 6]
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4> <b><i class="fa-solid fa-bus"></i> ${prop.LINE_NAME} </b> </h4>
            <p> <i class="fa-regular fa-circle-stop"></i> ${prop.FROM_NAME} <br> <i class="fa-solid fa-arrow-down"></i><br><i class="fa-regular fa-circle-stop"></i> ${prop.TO_NAME}</p>
            `);
            lineNames[prop.LINE_ID] = prop.LINE_NAME
        }
    }).addTo(themaLayer.lines);
}
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Fußgängerzonen 
async function showZones(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: "#F012BE ",
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0.1
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4> <b>Fußgängerzone ${prop.ADRESSE}</b> </h4>
            <p> <i class="fa-sharp fa-regular fa-clock"></i> ${prop.ZEITRAUM || "dauerhaft geöffnet"} <br><br>
            <i class="fa-solid fa-circle-info"></i> ${prop.AUSN_TEXT || "keine Ausnahmen"}</p>
            `);
        }
    }).addTo(themaLayer.zones);
}
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Sehenswürdigkeiten
async function showSights(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/photo.png',
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <img src="${prop.THUMBNAIL}" alt="*">
            <h4> <a href="${prop.WEITERE_INF}" target="blank">${prop.NAME}</a></h4>
            <address>${prop.ADRESSE}</address>
            `);
        }
    }).addTo(themaLayer.sights);
}
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Hotels und Unterkünfte 
async function showHotels(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            //alternative Variante für den for Loop 
            //let prop = feature.properties
            //let hotelIcon = ""
            //jetzt werden die if else statements formuliert und die let hotelIcon festgestellt
            if (feature.properties.KATEGORIE_TXT === "nicht kategorisiert") {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/hotel.png',
                    //iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            })
            }
            else if (feature.properties.KATEGORIE_TXT === '1*') {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_1star.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                })
                } else if (feature.properties.KATEGORIE_TXT === '2*') {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_2stars.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                })
                } else if (feature.properties.KATEGORIE_TXT === '3*') {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_3stars.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                })
                } else if (feature.properties.KATEGORIE_TXT === '4*') {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_4stars.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                })
                } else {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_5stars.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                })
                };

        },
        onEachFeature: function (feature, layer) {
        let prop = feature.properties;
        layer.bindPopup(`
                <h3> ${prop.BETRIEB}</h3>
                <h4> ${prop.BETRIEBSART_TXT} und ${prop.KATEGORIE_TXT} </h4>
                <hr>
                Addr.:${prop.ADRESSE} <br>
                Tel.: <a href ="tel:${prop.KONTAKT_TEL}" >${prop.KONTAKT_TEL} </a> <br>
                Email: <a href="mailto:${prop.KONTAKT_EMAIL}"> ${prop.KONTAKT_EMAIL} </a> <br>
                Website: <a href="${prop.WEBLINK1}"> ${prop.WEBLINK1}</a>
                `);
        }
    }).addTo(themaLayer.hotels);


} 
showHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")

//Hash hinzzufügen 
let hash = new L.Hash(map);

//add Mini Map 
let miniMap = new L.Control.MiniMap(L.tileLayer.provider("OpenStreetMap.DE")).addTo(map);