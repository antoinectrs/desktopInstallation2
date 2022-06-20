class MapDebug {
    constructor(myData, statut) {
        this.statut = statut;
        this.myData = myData;
        this.map;
        this.zoom = 2;
        this.origine = {
            lat: 46.53675134341545,
            lng: 6.588325489076967,
        }
        this.pointPath = [];
        this.pointRoadBox = [];
        this.variation;
        this.hitBox = [];
        this.route;
        this.inRoute = false;
        this.idRoute = null;
        this.change = false;
        this.distance = 0.02;
        this.hotlineLayer;



        // 
    }
    convertToPointPath() {
        this.myData.point.forEach(element => {
            this.pointPath.push(element.position);
        });
    }
    // newControl(){
    //     this.lausPath.forEach(element => {
    //         const content = [element.lat, element.lng]
    //         this.pointRoadBox.push(content);
    //     });
    //     this.drawHitBox(this.pointRoadBox);
    // }
    convertToPointRoadBox(e) {
        var routing = e.route.coordinates;
        // console.log(routing);
        routing.forEach(element => {
            const content = [element.lat, element.lng]
            this.pointRoadBox.push(content);
        });
        // this.variation = this.pointRoadBox;
        // this.setColorVariation(this.variation);

        this.drawHitBox(this.pointRoadBox);
        // for (let index = 0; index <4; index++) {
        //   const data=  mapRange(index,20,0,0,900);
        //   const color=  mapRange(index,0,20,40,100);
        //   console.log(color);
        //     this.createHotline(this.variation, { intensity: color, weightValue:data, glow: 0 });
        // }
        // this.variation.forEach(e=>{
        // L.polyline(this.variation);
        // L.polyline(this.variation, {color: 'red'}).addTo(this.map);
        // L.circle([e[0], e[1]], {radius: 20}).addTo(this.map);
        // })
        // this.hotlineLayer = [
        //     this.createHotline(this.variation, { intensity: 0, weightValue: 565, glow: 200 }),
        //     this.createHotline(this.variation, { intensity: 10, weightValue: 365, glow: 0 })
        // ].addTo(this.map);

    }
    drawHitBox(array) {
        let polyline = L.polyline(array);
        let data = polyline.encodePath();
        let route = new L.Polyline(array);
        let boxes;
        if (this.statut == "mobile") {
            const latlngs = [
                [46.53646, 6.58841],
                [46.5366, 6.58896],
                [46.53663, 6.58908],
                [46.53661, 6.5891],
                [46.5366, 6.58912],
                [46.5366, 6.58915],
                [46.5366, 6.58917],
                [46.5366, 6.5892],
                [46.53661, 6.58922],
                [46.53663, 6.58924],
                [46.53664, 6.58925],
                [46.53666, 6.58925],
                [46.53668, 6.58924],
                [46.53671, 6.58934],
                [46.53676, 6.58956],
                [46.53686, 6.58993],
                [46.53693, 6.59021],
                [46.53705, 6.59068],
                [46.53709, 6.59084],
                [46.537217821833764, 6.5907825160861],
                [46.53729844663685, 6.5906735853334135],
                [46.537563425801196, 6.590342402680614],
                [46.53764880073016, 6.590118366605308],
                [46.53763786329065, 6.589994677317259],
                [46.537753406020364, 6.58992449120311],
                [46.538069478750316, 6.589746406572084],
                // [46.53828895007725, 6.589490319150933],
                // [46.53815429898116, 6.58897455824847],
                [46.53851169888246, 6.588243532567393],
            ];

            let routeT = new L.Polyline(latlngs);
            boxes = L.RouteBoxer.box(routeT, this.distance / 10);
        } else {
            boxes = L.RouteBoxer.box(route, this.distance * 4);

            this.map.flyTo({ lat: 46.535, lng: 6.629 }, 14.4, {
                animate: false,
                
            });
        }


        boxes.forEach(element => {
            this.hitBox.push(L.rectangle(element, { weight: 1 }).addTo(this.map));
            // this.hitBox.push(L.rectangle(element, { stroke: false, fillOpacity: 0, weight: 1 }).addTo(this.map));
            // this.hitBox.push(L.rectangle(element, {  fillOpacity: 0.1, weight: 1 }).addTo(this.map));
        });

        // let copyBox = this.hitBox;
        // let heightsPoint= this.hitBox.map(e => {
        //     const centerBox = e.getBounds().getCenter();
        //     return [centerBox.lat, centerBox.lng];
        // })

        //  this.setColorVariation(heightsPoint);
        var gradientLine = L.RouteBoxer.box(route, this.distance / 100);
        let heightsPoint = [];
        gradientLine.forEach(element => {
            heightsPoint.push(L.rectangle(element, { color: "#ff7800", opacity: 0, weight: 1 }));
        });
        const coordsLine = heightsPoint.map(e => {
            const centerBox = e.getBounds().getCenter();
            // console.log(centerBox);
            return [centerBox.lat, centerBox.lng, 0.9];
        })
        //  var heatmap = L.heatLayer(coordsLine, {
        //     radius: 100,
        //     max: 2.0,
        //     blur: 30,
        //     gradient: {
        //       0.0: 'blue',
        //       1.0: 'white'
        //     },
        //     minOpacity: 0.7
        //   }).addTo(this.map);
        var imageUrl = './img/short2.svg',
            // imageBounds = [[46.5359, 6.5884], [46.53884, 6.59096]];
            imageBounds = [[46.5361, 6.5882], [46.5389, 6.59098]];
        // imageBounds = [[46.53424, 6.5880], [46.54111, 6.5952]];

        L.imageOverlay(imageUrl, imageBounds, { className: "hello" }).addTo(this.map);

        // // 1) Convert LatLng into container pixel position.
        // var originPoint = this.map.latLngToContainerPoint([46.53693422080351, 6.589272225762318]);
        // // 2) Add the image pixel dimensions.
        // // Positive x to go right (East).
        // // Negative y to go up (North).
        // var nextCornerPoint = originPoint.add({ x: 24, y: -24 });
        // // 3) Convert back into LatLng.
        // var nextCornerLatLng = this.map.containerPointToLatLng(nextCornerPoint);

        // var imageOverlay = L.imageOverlay(
        //     'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
        //     [[46.53693422080351, 6.589272225762318], nextCornerLatLng]
        // ).addTo(this.map);

        // console.log(imageUrl, imageBounds);
    }
    // setColorVariation(array) {
    //     array.map((e, index) => {
    //         let value = mapRange(index, 0, array.length, 0, 0.4);
    //         e.push(value);
    //     })
    // }
    init(lat = this.origine.lat, lng = this.origine.lng, zoom = 21) {
        const token = "pk.eyJ1IjoiYW50b2luZTk4IiwiYSI6ImNrMXVxemtrNzBjbTczaXBhb2I3amJ5YncifQ.EqRwzHSuwtW2sp615mvCAQ";
        this.map = L.map('map', {
            rotate: true,
            touchRotate: false,
            rotateControl: {
                closeOnZeroBearing: false
            },
            // renderer: L.canvas(),
            bearing: 0,
        }).setView([lat, this.origine.lng], zoom);
        // var gl = L.mapboxGL({
        //     accessToken: token,
        //     style: 'mapbox://styles/antoine98/cl33nrlno000g14s9v1c2z1ew'
        // }).addTo(this.map);
        // this.addHotline();
        // L.Rotate.debug(this.map);
        this.convertToPointPath();
        this.layer();
        this.pattern();
    }
    layer() {
        // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        //     attribution: `Map data &copy; <a href="https://www.openstreetmap.org/copyright">
        //     OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
        //     maxZoom: 23,
        //     maxNativeZoom: 23,
        //     id: 'mapbox/streets-v11',
        //     tileSize: 512,
        //     fillOpacity: 0,
        //     zoomOffset: -1,
        //     accessToken: 'pk.eyJ1IjoiYW50b2luZTk4IiwiYSI6ImNsMGprazdncDAxYzYzZWxhbzRlcWk2NDkifQ.JM4Xgke091LLntRvk9UbrA'
        // }).addTo(this.map);
        this.control();
        // this.newControl()
    }
    createHotline(array, option) {
        const hotlineLayer = L.hotline(array, {
            min: 0,
            max: 1,
            palette: {
                0.0: `hsl(151,33%,${option.intensity}%)`,
                0.5: `hsl(237,41%,${option.intensity}%)`,
                1.0: `hsl(199,100%,${option.intensity}%)`,
            },
            weight: option.weightValue,
            outlineColor: '#FFFFFF',
            outlineWidth: option.glow,
        })
        return hotlineLayer
    }
    pattern() {
        var poly1 = [
            [46.5, 6],
            [46.6, 6],
            [46.6, 6.7],
            [46.5, 6.7]
        ];
        L.polygon(poly1, { stroke: "false", fill: 'url(./img/checkerboad.png)' }).addTo(this.map);
    }
    control() {
        this.route = L.Routing.control({
            routeWhileDragging: false,
            createMarker: function () { return null; },
            geocoder: L.Control.Geocoder.nominatim(),
            router: new L.Routing.osrmv1({
                language: "fr",
                profile: 'foot',
            }),
            fitSelectedRoutes: false, //desactivate zoom routing
        }).addTo(this.map);
        this.route.setWaypoints(this.pointPath);
        this.routeListener();
        // route.addEventListener('routeselected', (buffer) => {
        //     this.convertToPointRoadBox(buffer)
        // });
    }

    routeListener() {
        this.route.addEventListener('routeselected', (buffer) => { this.convertToPointRoadBox(buffer) });
    }
    boxTest() {
        // define rectangle geographical bounds
        var bounds = [[46.53678, 6.58923], [46.53879, 6.58834]];
        // create an orange rectangle
        // const rectb =L.rectangle(bounds, { color: "red", weight: 1 }).addTo( this.map);

        // zoom the map to the rectangle bounds
        this.map.fitBounds(bounds);
        // this.map.on('click', this.onMapClick);
        this.map.on('locationfound', this.onMapClick);
    }
    onMapClick(e) {
        console.log(e);
    }
    // MOBILE 
    changeOrientation(value) {
        this.map.setBearing(value);
    }
    addGlobalMap() {
        var imageUrl = './img/globalMap.png',
            imageBounds = [[46.49, 6.64], [46.566, 6.59]];
        L.imageOverlay(imageUrl, imageBounds, { className: "globalMap" }).addTo(this.map);
    }
    // listenerArray(array=this.hitBox) {

    // array.forEach((element, index) => {
    //     element.addEventListener("mouseover", e => {
    //         console.log("onsode");
    //         this.idRoute = index;
    //         return this.inRoute=true;
    //     });
    //     element.addEventListener("mouseout", e => {
    //         return this.inRoute=false;;
    //     });
    // });
    // }
}

