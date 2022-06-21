const DEFAULT_FREQUENCY = 1;

class APP {
    constructor(statut) {
        this.startListening = false;
        this.statut = statut;
        // this.mobile,
        this.demo = null;
        console.log("vous êtes sur " + this.statut);
        this.myMap;
        this.point = [];

        this.musicList = ["00_synth", "01_perc", "02_fx", "03_drum", "04_longSynth", "05_high", "06_machine", "07_japan", "08_bass", "08_bass", "08_bass", "08_bass", "08_bass"];
        // this.musicList = ["00_lead", "01_low", "02_bass", "03_clap", "04_galo", "05_high", "06_machine", "07_japan", "08_bass"];
        // this.musicList = ["00_lead", "01_low", "02_bass", "03_clap"];
        // this.musicList = ["01_lead", "02_low", "03_bass", "04_clap"];
        this.noise = "waitLoop";
        // this.noise = "breakbeat";
        // this.vocalList = ["lechemin", "quidescend", "enface", "quimonte"];
        this.auroreList = ["01_hermitage", "02_rumine", "03_plateforme"];
        this.guitarList = ["01", "02", "03"];

        this.noPoint;
        this.guitarPoint;
        this.vocalPoint;
        this.preset;
        this.setUp();
    }
    setUp() {
        this.loadData();
        this.loadPreset();
        this.initPoint(this.musicList, this.preset);
        this.dom();
    }
    // -------------------------- DOM --------------------------------
    dom(target = "#playTrack", trigger = 'click') {
        document.querySelector(target).addEventListener(trigger, (event) => {
            console.log("clic");
            if (this.startListening == false) this.activeApp()

            this.startListening = true;
        });
    }
    // -------------------------- LOAD SOUND --------------------------------
    initPoint(musicList, preset) {
        let delay = 3;

        if (this.statut == "mobile")
            delay = 8

        this.point = musicList.map(function (music, preset) {
            return {
                "sample": new Sample({
                    folder: "track03",
                    path: music,
                    isLooping: true,
                    delay: delay,
                })
            }
        });
        // this.loadTrack(this.point.sample);
        this.point.forEach(element => { element.sample.requestTrack() });
        this.noPoint = {
            "sample": new Sample({
                path: this.noise,
                isLooping: true,
                folder: "track01",
                delay: delay,
            })
        };
        this.noPoint.sample.requestTrack();

        if (this.statut == "mobile") {
            // this.initVocals();
            this.loadSample();
            // this.aurorePoint = await this.initMusic(this.auroreList, "vocal");

            // this.guitarPoint = this.initMusic(this.guitarList, "guitar");
        }
    }
    activeApp() {
        if (this.statut == "mobile") {
            // this.aurorePoint.forEach((element, index) => {
            //     element.sample.playSample(0);
            // });
            this.guitarPoint.forEach((element, index) => {
                element.sample.playSample(0);
            });
            // this.vocalPoint.forEach((element, index) => {
            //     element.sample.playSample(0);
            // });
        }
        console.log(this.point);
        this.point.forEach((element, index) => {
            element.sample.playSample(0);
            element.sample.initOrientation(this.preset[index].binaural);
        });
        this.noPoint.sample.playSample(0);
        this.noPoint.sample.initOrientation(0);
        this.demo.preset = this.preset;
        this.demo.checkRoad();
    }
    initVocals() {
        setTimeout(() => {
            if (this.preset != undefined) {
                this.vocalPoint = this.preset[0].voice.map(e => {
                    return {
                        "sample": new Sample({
                            path: e.content,
                            isLooping: false,
                            folder: "vocal"
                        })
                    }
                })
                this.vocalPoint.forEach(element => {
                    element.sample.requestTrack()
                });
                this.demo.vocalPoint = this.vocalPoint;
            }
        }, 500);
    }
    initMusic(presetPath, path) {
        return new Promise(resolve => {
            setTimeout(() => {
                const musicBox = presetPath.map(e => {
                    return {
                        "sample": new Sample({
                            path: e,
                            isLooping: false,
                            folder: path
                        })
                    }
                })
                musicBox.forEach(element => {
                    element.sample.requestTrack()
                });
                resolve(musicBox);
            }, 500);
        });
    }
    async loadSample() {
        this.aurorePoint = await this.initMusic(this.auroreList, "vocal");
        this.guitarPoint = await this.initMusic(this.guitarList, "guitar");
        setTimeout(() => {
            this.demo.quickSample.guitarPoint = this.guitarPoint;
            this.demo.quickSample.aurorePoint = this.aurorePoint;
        }, 500);
    }
    // -------------------------- LOAD DATA --------------------------------
    loadData() {
        fetch('./DATA/data.JSON')
            // fetch('./DATA/prelaz.JSON')
            // fetch('./DATA/lemont.JSON')
            .then(response => response.json())
            .then(data => {
                const JSdata = data;
                this.myMap = new MapDebug(JSdata, this.statut);

                this.newStatut(this.statut)
            })
            .catch(error => console.log(error));
    }
    loadPreset() {
        fetch('./DATA/presets.JSON')
            .then(response => response.json())
            .then(data => {
                this.preset = data.tracks;
            })
            .catch(error => console.log(error));
    }
    // -------------------------- STATUT --------------------------------
    newStatut(statut) {
        if (statut == "mobile") {
            // this.myMap.init();
            // this.myMap.boxTest();
            this.demo = new MOBILE(this.myMap, this.point, this.noPoint);
        } else {
            this.myMap.init();
            this.myMap.boxTest();
            this.demo = new DEMO(this.myMap, this.point, this.noPoint);
        }
    }


}