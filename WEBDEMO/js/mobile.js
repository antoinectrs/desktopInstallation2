class MOBILE {
    constructor(myMap, point, noPoint) {
        this.myMap = myMap;
        this.mapDom = searchHtml("#map");
        // hideBlur(this.mapDom, "add");
        this.targetMap = null;

        this.point = point;
        this.noPoint = noPoint;
        this.vocalPoint;
        this.quickSample = {
            guitarPoint: null,
            aurorePoint: null
        }
        this.preset;
        this.myCompass;
        this.myPosition();
        this.catchCloserPoint = null;
        this.autorisePlay = false;
        // this.myConsole();
        // this.spaceRadius = 50;
        this.spaceRadius = 20;
        this.createMap = false;
        this.inPath = false;
        this.dzm = {
            bt: searchHtmlArray(".arrow"),
            wheel: searchHtml("#board"),
            psh: false,
            lst: null,
            zoom: 15,
            loading: true,
        }
        this.dzmListener(this.dzm)
        this.sndBtn = {
            bt: searchHtmlArray(".soundButton"),

        }
        this.sndBtnListener(this.sndBtn)
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
    }
    dzmListener(dzm) {


        dzm.bt.forEach((e) => {
            e.addEventListener('click', () => {
                dzm.bt[0].classList.toggle("dzm");
                this.dzm.psh = !this.dzm.psh;
                if (this.dzm.psh) {
                    this.myMap.map.flyTo({ lat: 46.528, lng: 6.615 }, this.dzm.zoom, { animate: true, duration: 2.5 });
                    this.myMap.changeOrientation(5);
                    this.releasePoint();
                }
                else
                    this.myMap.map.flyTo(this.dzm.lst, 21, { animate: true, duration: 2.5 });
                console.log(this.dzm.psh);
            })
        })
    }
    sndBtnListener(sndBtn) {
        sndBtn.bt.forEach((e, index) => {
            e.addEventListener('click', () => {
                e.classList.toggle("actv");
                //   console.log(index*120);
                const idx = index * 120;
                this.point.forEach(ele => {
                    // switch (idx) {
                    //     case 0:
                    //         break;
                    //     case 120:
                    //         break;
                    //     case 240:
                    //         break;
                    // }
                    // && ele.sample.actv
                    if (idx == ele.sample.rack.binaural.default && ele.sample.actv) {
                        // console.log(ele.sample.rack.binaural.default,);
                        //     console.log(ele);
                        if (e.classList.contains('actv')) {
                            console.log("render");
                            ele.sample.render(1, false)
                        }
                        else
                            ele.sample.render(0, false)
                    }
                })
            })
        }
        )
    }
    myPosition() {
        navigator.geolocation.watchPosition(pos => {
            if (this.autorisePlay) this.manager(pos);
        })
    }
    manager(pos) {
        if (this.createMap == false) {
            this.initMap(pos);
            this.loading();
        }
        if (this.dzm.psh) return;
        this.centerMap(pos);
        const myLatlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.catchCloserPoint = this.closerPoint(myLatlng, this.spaceRadius); // / console.log(this.myMap.distance*4000);
        if (this.catchCloserPoint != "tofar")
            this.inPathAction(this.catchCloserPoint)
        else
            this.outPathAction(this.catchCloserPoint)


    }
    initMap(pos) {
        this.myMap.init(pos.coords.latitude, pos.coords.longitude, 10);
        this.myMap.addGlobalMap(); //ajouter la carte dezoom
        this.myMap.boxTest();
        this.listenMyCompass(pos);
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

        if (this.dzm.wheel.classList.contains("soft-transition"))
            setTimeout(() => { this.dzm.wheel.classList.remove("soft-transition") }, 3000)

        this.partition.title.rotateDiv.classList.add("soft-transition");
        myRotate(this.partition.title.rotateDiv, 0);
        // searchHtml("#arrow").style.height = "0px";
        // this.myMove();

        // this.listenMyCompass(catchCloserPoint.hitBoxNear);
        // hideBlur(this.mapDom, "remove");
    }
    outPathAction(catchCloserPoint) {
        this.inPath = false;
        this.releasePoint();
        // hideBlur(this.mapDom, "add")

        this.dzm.wheel.classList.add("soft-transition");
        this.dzm.wheel.style.transform = "rotate(0deg)";
        if (this.partition.title.rotateDiv.classList.contains("soft-transition"))
            setTimeout(() => { this.partition.title.rotateDiv.classList.remove("soft-transition") }, 3000)
    }
    centerMap(pos) {
        const convertPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        }
        this.dzm.lst = convertPos;
        this.myMap.map.flyTo(convertPos, 21, {
            // this.myMap.map.flyTo(convertPos, 18, {
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
                if (find.presetVolume > 0.9)
                    element.sample.actv = true; //-------tag actif sample
                else
                    element.sample.actv = false
            };
        })
        this.noPoint.sample.render(0);
    }
    releasePoint() {
        console.log("outside");
        this.noPoint.sample.render(1);
        this.point.forEach(element => {
            element.sample.render(0)
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
        if (element.sample.actv) {
            // this.myDebug("range", scale);
            // console.log(presetVolume);
            element.sample.render(presetVolume);
            element.sample.initSpeed(presetSpeed)
        }
    }
    listenMyCompass(hitBoxNear) {
        const search = () => {
            setTimeout(() => {
                const deg = this.myCompass.compassLoad();
                if (this.myCompass.compassLoad() != undefined) {
                    if (this.dzm.psh == false)
                        this.myMap.changeOrientation(deg);

                    if (this.noPoint.sample.rack.volume.audioNode.gain.value > 0.1)
                        this.noPoint.sample.setOrientation(this.convert360Value(deg + 200));

                    // this.noPoint.sample.initOrientation(this.convert360Value(deg+200))
                    this.point.forEach(element => {
                        if (element.sample.rack.volume.audioNode.gain.value > 0.1)
                            element.sample.setOrientation(deg)
                        //         console.log(deg);
                    })
                    // console.log(this.inPath);
                    if (this.inPath == false) this.outPathOrientation(hitBoxNear);
                    else
                        myRotate(this.dzm.wheel, deg);
                    // else
                    //     this.inPathOrientation();
                };
                requestAnimationFrame(search)
            }, 1000 / 25);
            // }, 1000 );
        }
        search();
    }
    convert360Value(value) {
        if (value > 360)
            return value - 360;
        else return value;
    }
    // inPathOrientation() { myRotate(this.partition.title.rotateDiv, 0) } // rest to 0 DOM
    outPathOrientation(hitBoxNear) {
        const targetAngle = this.rotValue(hitBoxNear);
        myRotate(this.partition.title.rotateDiv, targetAngle); //DOM
        // this.noPoint.sample.setOrientation(targetAngle)
    }
    rotValue(hitBoxNear) {
        const compassP = this.myCompass.myCompass.position.coords
        const currentPosition = { lat: compassP.latitude, lng: compassP.longitude };
        return this.myCompass.myCompass.getBearingToDestination(currentPosition, { lat: hitBoxNear.coords.latitude, lng: hitBoxNear.coords.longitude });
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
            // this.manager(pos);
        })
    }
    setTitlePartition(indexZone) {
        const changeDom = this.preset[indexZone].title;
        console.log(changeDom);
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
        //         // this.vocalPoint[this.iteration].sample.render(DEFAULT_FREQUENCY, 1);

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
        if (this.dzm.loading) {
            this.dzm.wheel.classList.add("linear-transition")
            myRotate(this.dzm.wheel, 360);
            setTimeout(() => {
                myRotate(this.dzm.wheel, 0);
                this.dzm.wheel.classList.remove("linear-transition");
            }, 3400)
        }


        if (this.autorisePlay) {
            const i = this.wordAnimation();
            if (this.catchCloserPoint != null) {
                if (this.catchCloserPoint.index <= 10) {
                    if (this.partition.verse.activeTop) {

                        // console.log(this.quickSample.aurorePoint[i]);


                        // console.log(this.catchCloserPoint);

                        this.partition.verse.moveElement.classList.add("long-transition");
                        this.partition.verse.moveElement.style.transform = "translateY(110vh)";
                        const myRot = mapRange(i, 0, 4, 0, 360);
                        console.log("inside aurore zone");
                        setTimeout(() => {
                            this.quickSample.aurorePoint[i].sample.playSample(0);
                            this.quickSample.aurorePoint[i].sample.initOrientation(myRot);
                            this.quickSample.aurorePoint[i].sample.render(1, false);
                        }, 3000)
                        this.quickSample.guitarPoint[i].sample.playSample(0);
                        this.quickSample.guitarPoint[i].sample.initOrientation(myRot);
                        this.quickSample.guitarPoint[i].sample.render(1, false);


                        // this.vocalPoint[i].sample.playSample(0);
                        // this.vocalPoint[i].sample.initOrientation(myRot);
                        // this.vocalPoint[i].sample.render(DEFAULT_FREQUENCY, 1);
                        this.partition.verse.contentElement.textContent = this.preset[0].voice[i].content

                    } else {
                        // this.partition.verse.moveElement.classList.remove("long-transition");
                        // this.partition.verse.moveElement.style.transform = "translateY(-30vh)";
                        // this.partition.verse.moveElement.style.justifyContent = this.preset[0].voice[i].position;
                    }
                    this.partition.verse.activeTop = !this.partition.verse.activeTop;
                }
            }
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
        console.log("loading");
        this.dzm.wheel.classList.add("soft-transition");
        // this.dzm.wheel.classList.add("rotatingDone");
        this.dzm.wheel.classList.remove("rotating");
        // searchHtml(".description").style.display = "flex";
        setTimeout(() => {
            this.dzm.wheel.classList.remove("soft-transition");
            this.partition.title.rotateDiv.classList.remove("soft-transition");

            this.mapDom.classList.remove("filterActive");
        }, 3000)
    }

}
