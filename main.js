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
], 12);

// thematische Layer 
let themaLayer = {
    stops:L.featureGroup(),
    lines:L.featureGroup(),
    zones:L.featureGroup(),
    sights:L.featureGroup().addTo(map)
}

// Hintergrundlayer (add to map bei dem Layer, der zuerst angezeigt werden soll)
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau"),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap").addTo(map),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
},{
    "Wien Haltestellen":themaLayer.stops,
    "Wien Linien":themaLayer.lines,
    "Wien Fußgängerzonen":themaLayer.zones,
    "Wien Sehenswürdigkeiten":themaLayer.sights
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Funktion für Bushaltestellen
async function showStops(url) {
    let response = await fetch(url);
    console.log(response)
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.stops);
}
showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Buslinien 
async function showLines(url) {
    let response = await fetch(url);
    console.log(response)
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.lines);
}
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Fußgängerzonen 
async function showZones(url) {
    let response = await fetch(url);
    console.log(response)
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.zones);
}
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")

//Funktion für Sehenswürdigkeiten
async function showSights(url) {
    let response = await fetch(url);
    console.log(response)
    let jsondata = await response.json();
    L.geoJSON(jsondata,{
        onEachFeature: function(feature,layer){
            let prop = feature.properties;
            layer.bindPopup(prop.NAME);
            console.log(feature.properties)
        }
    }).addTo(themaLayer.sights);
}
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")

