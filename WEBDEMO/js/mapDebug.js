class MapDebug {
    constructor(myData, statu) {
        this.statut;
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
    convertToPointRoadBox(e) {
        var routing = e.route.coordinates;
        routing.forEach(element => {
            const content = [element.lat, element.lng]
            this.pointRoadBox.push(content);
        });
        this.variation = this.pointRoadBox;
        this.setColorVariation(this.variation);
        this.drawHitBox(this.pointRoadBox);
        this.hotlineLayer = this.createHotline(this.variation);
    }
    drawHitBox(array) {
        var polyline = L.polyline(array);
        const data = polyline.encodePath();
        let route = new L.Polyline(array);
        var boxes = L.RouteBoxer.box(route, this.distance / 10);
        boxes.forEach(element => {
            this.hitBox.push(L.rectangle(element, { color: "#ff7800", opacity: 0, weight: 1 }).addTo(this.map));
        });
    }
    setColorVariation(array) {
        array.map((e, index) => {
            let value = mapRange(index, 0, array.length, 0, 1);
            e.push(value);
        })

    }
    init(lat = this.origine.lat, lng = this.origine.lng, zoom = 20) {
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
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: `Map data &copy; <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
            maxZoom: 20,
            maxNativeZoom: 20,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiYW50b2luZTk4IiwiYSI6ImNsMGprazdncDAxYzYzZWxhbzRlcWk2NDkifQ.JM4Xgke091LLntRvk9UbrA'
        }).addTo(this.map);
        this.control();
    }
    createHotline(array){
        const hotlineLayer = L.hotline(array, {
            min: 0,
            max: 1,
            palette: {
                0.0: '#008800',
                0.5: '#ffff00',
                1.0: '#ff0000'
            },
            weight: 565,
            outlineColor: '#FFFFFF',
            outlineWidth: 80
        }).addTo(this.map);
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

