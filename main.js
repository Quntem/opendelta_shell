var processes = []
currentpid = 0

class QDProcess {
    constructor(name, iframe) {
        this.name = name
        this.iframe = iframe
        this.element = $(this.iframe).closest("deltashell-window")
        this.init()
        this.pid = currentpid
        currentpid += 1
    }

    init() {
        console.log('QDAplication init')
        processes.push(this)
    }
}

window.addEventListener("message", function(event) {
    try {
        if(JSON.parse(event.data).sender == "deltaapp") {
            if(JSON.parse(event.data).fn == "quit") {
                openwins = Array.from(document.getElementById("winarea").children)
                openwins.forEach(win => {
                    if($(win).attr("linkedpid") == JSON.parse(event.data).id) {
                        win.remove()
                    }
                    processes.forEach(proc => {
                        if (proc.pid == JSON.parse(event.data).id) {
                            processes.splice(processes.indexOf(proc), 1)
                        }
                    })
                })
            }
            if(JSON.parse(event.data).fn == "listfiles") {
                files.list(JSON.parse(event.data).pos).then(files => {
                    event.source.postMessage(JSON.stringify({
                        "sender": "qudelta",
                        "fn": "return",
                        "type": "listfiles",
                        "files": files
                    }), event.origin)
                    console.log(files)
                })
            }
            if(JSON.parse(event.data).fn == "dragstart") {
                var foundwin = false
                console.log("dragstart")
                console.log(event.source.frameElement)
                winitem = $(event.source.frameElement).closest("deltashell-window")
                console.log(winitem)
                openwins = Array.from(document.getElementById("winarea").children)
                // dragactive = true
                openwins.forEach(win => {
                    if($(win).attr("winid") == $(winitem[0]).attr("winid")) {
                        currentmovewin = win
                        foundwin = true
                    }
                })
                if(foundwin) {
                    console.log("found")
                    window.offsetx = mousex - $(currentmovewin).offset().left
                    window.offsety = mousey - $(currentmovewin).offset().top
                    window.dragactive = true
                    console.log(winitem)
                    $(currentmovewin).find(".rscover").css("width", "100%")
                    $(currentmovewin).find(".rscover").css("height", "100%")
                }
            }
            if(JSON.parse(event.data).fn == "dragend") {
                console.log("dragend")
                $(currentmovewin).find(".rscover").css("width", "0%")
                $(currentmovewin).find(".rscover").css("height", "0%")
                dragactive = false
            }
        }
    } catch {

    }
})



var files = {
    list: function(pos) {
        return new Promise(async (resolve, reject) => {
            console.log(baseurl + '/service/dfs/mount/system_volume/list?pos=' + encodeURIComponent(pos))
            try {
                const response = await fetch(baseurl + '/service/dfs/mount/system_volume/list?pos=' + encodeURIComponent(pos));
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                const data = await response.json();
                console.log('Files fetched:', data);
                resolve(data); // Resolve the promise with the files array
            } catch (error) {
                reject(error); // Reject the promise if an error occurs
            }
        });
    }
}