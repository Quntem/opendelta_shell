var processes = []
currentpid = 0
currentwinpid = 0

class QDProcess {
    constructor(name, iframe) {
        this.name = name
        this.iframe = iframe
        if(this.iframe != undefined) {
            this.element = $(this.iframe).closest("deltashell-window")
        }
        this.windowlist = []
        this.killCallback = undefined
        this.processListPosition = processes.length
        this.init()
        this.pid = currentpid
        currentpid += 1
        window.dispatchEvent(new CustomEvent("cmdletOpen", {
            detail: {
                process: this,
            }
        }))
    }

    registerWindow(window) {
        this.windowlist.push(window)
    }

    init() {
        console.log('QDAplication init')
        processes.push(this)
    }

    kill() {
        if (this.killCallback != undefined) {
            this.killCallback()
        }
        if(this.element != undefined) {
            this.element.remove()
        }
        if(this.windowlist.length > 0) {
            this.windowlist.forEach(window => {
                window.kill()
            })
        }
        processes.splice(processes.indexOf(this), 1)
        window.dispatchEvent(new CustomEvent("cmdletClose", {
            detail: {
                process: this,
            }
        }))
    }
}

class QDWindowProcess {
    constructor(options) {
        this.window = options.window
        this.winpid = currentwinpid
        currentwinpid += 1
    }
    kill() {
        this.window.remove()
    }
}

window.addEventListener("keypress", function(event) {
    if (event.key == "q" && event.ctrlKey) {
        runcmdlet("term")
    }
})

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
    },
    get: function(inp) {
        return new Promise(async (resolve, reject) => {
            var response = ""
            try {
                response = await fetch(baseurl + '/service/dfs/mount/system_volume/get/' + inp);
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                const data = await response.text();
                console.log('Files fetched:', data);
                resolve(data); // Resolve the promise with the files array
            } catch (error) {
                reject(response.statusText); // Reject the promise if an error occurs
            }
        });
    },
    mkdir: function(pos, dirname) {
        return new Promise(async (resolve, reject) => {
            var response = ""
            try {
                response = await fetch(baseurl + '/service/dfs/mount/system_volume/mkdir?pos=' + encodeURIComponent(pos), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        dirname: dirname,
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                resolve(response)
            } catch (error) {
                reject(response.statusText)
            }
        });
    },
    rm: function(file) {
        return new Promise(async (resolve, reject) => {
            var response = ""
            try {
                response = await fetch(baseurl + '/service/dfs/mount/system_volume/delete?filename=' + encodeURIComponent(file), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                resolve(response)
            } catch (error) {
                reject(response.statusText)
            }
        });
    },
    exists: function(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(baseurl + '/service/dfs/mount/system_volume/exists?filename=' + encodeURIComponent(file));
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
                const data = await response.json();
                resolve(data)
            } catch (error) {
                reject(response.statusText)
            }
        });
    },
    write: function(content, file) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(baseurl + '/service/dfs/mount/system_volume/write?filename=' + encodeURIComponent(file), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        data: content,
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    reject(new Error(`Error fetching files: ${errorData.error || response.statusText}`));
                    return;
                }
    
                const data = await response.text();
                console.log('Files fetched:', data);
                resolve(data); // Resolve the promise with the files array
            } catch (error) {
                reject(error); // Reject the promise if an error occurs
            }
        });
    },
}

var runcmdlet = async function(inp, ps) {
    newfileget = await fetch(baseurl + '/service/dfs/mount/bin/get/' + inp)
    getres = await newfileget.text()
    eval(getres)
    process = new QDProcess(inp)
    cmdres = await cmdlet({process, ...ps})
    process.kill()
    return cmdres
}

var runStandaloneCmdlet = async function(cmdletname, options) {
    newfileget = await fetch(baseurl + '/service/dfs/mount/bin/get/' + cmdletname)
    getres = await newfileget.text()
    eval(getres)
    if(options?.process == undefined) {
        process = new QDProcess(cmdletname)
    } else {
        process = options.process
    }
    var shellpos = options?.shellpos? options.shellpos : "/"
    if (options?.cmdarg != undefined) {
        var cmdarg = options.cmdarg
    }
    cmdres = await cmdlet({process, shellpos, setshellpos: options?.setshellpos? options?.setshellpos : function(inp) {}, ...options})
    process.kill()
    return cmdres
}