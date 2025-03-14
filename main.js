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
            })
        }
        if(JSON.parse(event.data).fn == "dragstart") {
            openwins = Array.from(document.getElementById("winarea").children)
            openwins.forEach(win => {
                if($(win).attr("winid") == JSON.parse(event.data).id) {
                    currentmovewin = win
                }
            })
            offsetx = mousex - $(currentwin).offset().left
            offsety = mousey - $(currentwin).offset().top
            dragactive = true
        }
        if(JSON.parse(event.data).fn == "dragend") {
            openwins = Array.from(document.getElementById("winarea").children)
            openwins.forEach(win => {
                if($(win).attr("winid") == JSON.parse(event.data).id) {
                    currentmovewin = win
                }
            })
            offsetx = mousex - $(currentwin).offset().left
            offsety = mousey - $(currentwin).offset().top
            dragactive = true
        }
    }
})



var files = {
    list: function(pos) {
        return new Promise(async (resolve, reject) => {
            console.log('/api/files/list?pos=' + encodeURIComponent(pos))
            try {
                const response = await fetch('/api/files/list?pos=' + encodeURIComponent(pos));
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                const data = await response.json();
                console.log('Files fetched:', data.files);
                resolve(data.files); // Resolve the promise with the files array
            } catch (error) {
                reject(error); // Reject the promise if an error occurs
            }
        });
    }
}