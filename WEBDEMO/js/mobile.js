// ---------------- MOBILE -----------------    
class MOBILE {
    constructor(myMap, point, noPoint) {
        this.myMap = myMap;
        // this.mapDom = searchHtml("#map .leaflet-pane");
        // hideBlur(this.mapDom, "add");
        this.targetMap = null;

        this.point = point;
        this.noPoint = noPoint;
        this.vocalPoint;
        this.quickSample = {
            guitarPoint:null,
            aurorePoint:null
        }
        this.preset;
        this.myCompass;
        this.myPosition();
        this.autorisePlay = false;
        // this.myConsole();
        this.spaceRadius = 40;
        this.createMap = false;
        this.inPath = false;
        this.partition = {
            title: {
                element: searchHtml("#title"),
                rotateDiv: searchHtml("#rotateDiv"),
                content: null,
            },
            verse: {
                element: searchHtmlArray(".dynamic p"),
                content: null,
                moveElement: searchHtml("#content"),
                contentElement: searchHtml("#target p"),
                activeTop: false,
                interval: setInterval(this.secFrame.bind(this), 3500),
            },
        }
        this.iteration = 0;
        this.myCompass = new myCompass();
    }
    checkRoad() {
        this.autorisePlay = true;
        this.loading();
    }
    myPosition() {
        navigator.geolocation.watchPosition(pos => {
            if (this.autorisePlay) this.manager(pos);
        })
    }
    manager(pos) {
        if (this.createMap == false) {
            this.initMap(pos);
        }
        this.getAltittude(pos);
        this.centerMap(pos);
        const myLatlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        const catchCloserPoint = this.closerPoint(myLatlng, this.spaceRadius); // / console.log(this.myMap.distance*4000);

        if (catchCloserPoint != "tofar")
            this.inPathAction(catchCloserPoint)
        else
            this.outPathAction(catchCloserPoint)


    }
    initMap(pos) {
        this.myMap.init(pos.coords.latitude, pos.coords.longitude, 10);
        this.myMap.boxTest();
        this.listenMyCompass(pos);
        console.log("initMaps");
        this.createMap = true;
        this.verseAnimation();
    }
    inPathAction(catchCloserPoint) {
        this.inPath = true;
        myDebug("path", this.inPath);
        myDebug("range", catchCloserPoint.index);
        this.renderPoint(catchCloserPoint.index);

        const iScale = this.scale(catchCloserPoint.index, this.preset.length); //map for preset
        this.setTitlePartition(iScale);
        this.setVersePartition(iScale);

        myRotate(this.partition.title.rotateDiv, 0);
        searchHtml(".description .content img").style.height = "0px";
        // this.myMove();

        // this.listenMyCompass(catchCloserPoint.hitBoxNear);
        // hideBlur(this.mapDom, "remove");
    }
    outPathAction(catchCloserPoint) {
        this.inPath = false;
        this.releasePoint();
        // hideBlur(this.mapDom, "add")
    }
    getAltittude(pos) {
        // console.log(pos.coords.accuracy);
        const altitude = pos.coords.altitude
        if (altitude) {
            // this.myDebug("alt", altitude)
            return altitude;
        }
    }
    centerMap(pos) {
        const convertPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        }
        this.myMap.map.flyTo(convertPos, 18, {
            animate: true,
            duration: 1.5
        });
    }
    closerPoint(myLatlng, spaceRadius) {
        const hitBoxArray = this.myMap.hitBox.map(element => this.syncDistance(element, myLatlng, 70))
        const closer = Math.min(...hitBoxArray);
        const index = hitBoxArray.indexOf(closer);
        const centerHitBoxNear = this.centerBox(this.myMap.hitBox, index);
        if (closer <= spaceRadius)
            return { index: index, value: closer, hitBoxNear: centerHitBoxNear };
        return "tofar";
    }
    centerBox(element, index) {
        if (element[index] != undefined)
            return element[index].getBounds().getCenter()
    }
    syncDistance(box, myPos) {
        const centerL = box.getBounds().getCenter();
        return myPos.distanceTo(centerL);
    }
    renderPoint(boxIndex) {
        this.point.forEach((element, index) => {
            if (element.sample.audio.state != "suspended") {
                const find = this.findPreset(index, boxIndex);
                this.asignPreset(element, find.presetVolume, find.presetSpeed);
            };
        })
        if (this.noPoint.sample.audio.state != "suspended") this.noPoint.sample.render(0, 1);
    }
    releasePoint() {
        if (this.noPoint.sample.audio.state != "suspended") this.noPoint.sample.render(5000, 1);
        this.point.forEach(element => {
            if (element.sample.audio.state != "suspended") element.sample.render(0, 0)
        })
    }
    findPreset(index, boxIndex) {
        const targetVolume = this.preset[index].volume;
        const scale = Math.round(mapRange(boxIndex, 0, this.myMap.hitBox.length, 0, targetVolume.length));
        const i = this.scale(boxIndex, targetVolume.length);
        const presetVolume = targetVolume[i];
        const targetSpeed = this.preset[index].mySpeed;
        const presetSpeed = targetSpeed[i];
        return { presetVolume, presetSpeed }
    }
    scale(boxIndex, boxes) {
        return Math.round(mapRange(boxIndex, 0, this.myMap.hitBox.length, 0, boxes));
    }
    asignPreset(element, presetVolume, presetSpeed) {
        // this.myDebug("range", scale);
        element.sample.render(presetVolume, 1);
        element.sample.initSpeed(presetSpeed)
    }

    listenMyCompass(hitBoxNear) {
        const search = () => {
            setTimeout(() => {
                if (this.myCompass.compassLoad() != undefined) {
                    this.myMap.changeOrientation(this.myCompass.compassLoad());
                    // console.log(this.inPath);
                    if (this.inPath == false) this.outPathOrientation(hitBoxNear);
                    // else
                    //     this.inPathOrientation();
                };
                requestAnimationFrame(search)
            }, 1000 / 25);
        }
        search();
    }
    // inPathOrientation() { myRotate(this.partition.title.rotateDiv, 0) } // rest to 0 DOM
    outPathOrientation(hitBoxNear) {
        const targetAngle = this.rotValue(hitBoxNear);
        myRotate(this.partition.title.rotateDiv, targetAngle); //DOM
        this.noPoint.sample.setOrientation(targetAngle)
    }
    rotValue(hitBoxNear) {
        const compassP = this.myCompass.myCompass.position.coords
        const currentPosition = { lat: compassP.latitude, lng: compassP.longitude };
        return this.myCompass.myCompass.getBearingToDestination(currentPosition, { lat: hitBoxNear.coords.latitude, lng: hitBoxNear.coords.longitude });
    }
    rotateTitle(hitBoxNear) {
        //CHECK THE ORIENTATION POINT
    }
  
     // -------------------------- DOM --------------------------------
     myConsole() {
        const myButton = document.querySelector("#myConsole");
        myButton.addEventListener("click", e => {
            const myConsol = document.querySelector(".console input");
            const wordData = myConsol.value.split(',')
            const pos = {
                coords: {
                    latitude: wordData[0],
                    longitude: wordData[1]
                }
            };
            this.manager(pos);
        })
    }
    setTitlePartition(indexZone) {
        const changeDom = this.preset[indexZone].title;
        this.partition.title.element.innerHTML = changeDom;
    };
    checkContentText(e, index) {
        const myString = String(e.verse);
        const pointHtml = this.partition.verse.element[index];
        const htmlString = pointHtml.textContent;
        if (myString != htmlString)      //REMPLACE TEXT 
            pointHtml.innerHTML = e.verse;
    };
    setVersePartition(indexZone) {

    };
    verseAnimation() {
        let id = null;
        const elem = document.getElementById("content");
        const pElement = document.querySelector("#target p");
        let pos = -10;
        let activeTop = false;
        // clearInterval(this.id);
        // id = setInterval(frame.bind(this), 100);
        // this.interval = setInterval(this.secFrame.bind(this), 1000);
        // function frame() {

        //     if (activeTop == true) {
        //         const i = this.wordAnimation()
        //         console.log(i);
        //         // const myRot = mapRange(i, 0, 4, 0, 360);
        //         // elem.style.justifyContent = this.preset[0].voice[i].position;
        //         // pElement.textContent = this.preset[0].voice[i].content

        //         // this.vocalPoint[this.iteration].sample.playSample(0);
        //         // this.vocalPoint[this.iteration].sample.initOrientation(myRot);
        //         // this.vocalPoint[this.iteration].sample.render(5000, 1);

        //         // clearInterval(id);
        //         // this.myMove()
        //         // console.log(i);
        //     } else {
        //         // pos++;
        //         // elem.style.transform = "translate(" + 0 + "vh," + pos + "vh)";
        //     }
        //     activeTop=!activeTop;
        //     console.log(activeTop);
        // }
    }
    secFrame() {
        if (this.autorisePlay) {
            const i = this.wordAnimation();
            if (this.partition.verse.activeTop) {
                this.partition.verse.moveElement.classList.add("long-transition");
                this.partition.verse.moveElement.style.transform = "translateY(110vh)";
                const myRot = mapRange(i, 0, 4, 0, 360);
                console.log(this.quickSample.aurorePoint[i]);
                this.quickSample.aurorePoint[i].sample.playSample(0);
                this.quickSample.aurorePoint[i].sample.initOrientation(myRot);
                this.quickSample.aurorePoint[i].sample.render(5000, 1);

                // console.log(this.quickSample.guitarPoint[0].sample);

                this.quickSample.guitarPoint[i].sample.playSample(0);
                this.quickSample.guitarPoint[i].sample.initOrientation(myRot);
                this.quickSample.guitarPoint[i].sample.render(5000, 1);

                // this.vocalPoint[i].sample.playSample(0);
                // this.vocalPoint[i].sample.initOrientation(myRot);
                // this.vocalPoint[i].sample.render(5000, 1);
                this.partition.verse.contentElement.textContent = this.preset[0].voice[i].content

            } else {
                this.partition.verse.moveElement.classList.remove("long-transition");
                this.partition.verse.moveElement.style.transform = "translateY(-30vh)";

                this.partition.verse.moveElement.style.justifyContent = this.preset[0].voice[i].position;
            }
            this.partition.verse.activeTop = !this.partition.verse.activeTop;
        }
    }
    wordAnimation() {
        if (this.iteration < this.vocalPoint.length - 1)
            return this.iteration++;
        else
            return this.iteration = 0;
    }
    loading() {
        searchHtml("#playTrack").style.display = "none";
        searchHtml(".description").style.display = "flex";
    }

}
