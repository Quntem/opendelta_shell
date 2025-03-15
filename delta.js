class delta {
    constructor() {
        this.appid = ""
        this.launchcontext = ""
    }

    init(appid) {
        this.appid = appid
    }

    quit() {
        window.top.postMessage(JSON.stringify({
            "sender": "deltaapp",
            "fn": "quit",
            "id": this.appid
        }))
    }

    dragstop() {
        window.top.postMessage(JSON.stringify({
            "sender": "deltaapp",
            "fn": "dragend",
            "id": this.appid
        }))
    }

    dragstart() {
        window.top.postMessage(JSON.stringify({
            "sender": "deltaapp",
            "fn": "dragstart",
            "id": this.appid
        }))
    }

    files = {
        list: function(pos) {
            window.top.postMessage(JSON.stringify({
                "sender": "deltaapp",
                "fn": "listfiles",
                "pos": pos,
                "id": this.appid
            }))
            return new Promise((resolve, reject) => {
                window.addEventListener("message", function(event) {
                    if(JSON.parse(event.data).sender == "qudelta") {
                        if(JSON.parse(event.data).fn == "return") {
                            if(JSON.parse(event.data).type == "listfiles") {
                                resolve(JSON.parse(event.data).files)
                            }
                        }
                    }
                })
            })
        }
    }
}

window.Delta = new delta()

window.addEventListener("message", function(event) {
    try {
        if(JSON.parse(event.data).sender == "qudelta") {
            if(JSON.parse(event.data).fn == "initapp") {
                Delta.init(JSON.parse(event.data).appid)
                console.log("Delta App Initialized, id: " + JSON.parse(event.data).appid)
            }
        }
    } catch {

    }
})