var runshellcmd = async function(el, ev) {
    foundcmdlet = false
    if (ev.key == "Enter") {
        $(el).attr("readonly", "true")
        cmd = el.value.split(" ")
        cmdarg = ""
        cmdname = cmd.shift()
        cmd.forEach(element => {
            cmdarg = cmdarg + element + " "
        });
        fileslist = fetch("/app/delta/imfs/list/")
        .then(res => res.json())
        .then(res => {
            textfilelist = ""
            res.forEach(async (filelement) => {
                if (filelement == cmdname) {
                    foundcmdlet = true
                    newfileget = fetch("/app/delta/imfs/get/" + filelement)
                    .then(getres => getres.text())
                    .then(async (getres) => {
                        eval(getres)
                        await cmdlet()
                        $(el).closest(".termarea").append(`
                            <div style="margin-top: 10px; margin-left: 10px;" class="userinpblock">
                                <div style="display: inline; color: rgb(0, 133, 88);">User $</div>
                                <input style="background-color: rgba(255, 255, 255, 0); color: #666666; border: none; outline: none; font-size: 16px; padding: 0px; width: calc(100% - 100px);" onkeypress="runshellcmd(this, event)"></input>
                            </div>
                        `)
                        $(el).closest(".termarea").find(".userinpblock").find("input").focus()
                    })
                }
            })
            if (!foundcmdlet) {
                $(el).closest(".termarea").append(`
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <div style="display: inline; color: #666666;">
                            ` + cmdname + ` is not the name of a recognised executable file
                        </div>
                    </div>
                `)
                $(el).closest(".termarea").append(`
                    <div style="margin-top: 10px; margin-left: 10px;" class="userinpblock">
                        <div style="display: inline; color: rgb(0, 133, 88);">User $</div>
                        <input style="background-color: rgba(255, 255, 255, 0); color: #666666; border: none; outline: none; font-size: 16px; padding: 0px; width: calc(100% - 100px);" onkeypress="runshellcmd(this, event)"></input>
                    </div>
                `)
                $(el).closest(".termarea").find(".userinpblock").find("input").focus()
            }
        })
    }
}

var runshellcmdlgc = async function(el, ev) {
    if (ev.key == "Enter") {
        $(el).attr("readonly", "true")
        cmd = el.value.split(" ")
        cmdarg = ""
        cmdname = cmd.shift()
        cmd.forEach(element => {
            cmdarg = cmdarg + element + " "
        });
        if (cmdname == "eval") {
            try {
                ret = eval(cmdarg)
                if (ret != undefined) {
                    $(el).closest(".termarea").append(`
                        <div style="margin-top: 10px; margin-left: 10px;">
                            <div style="display: inline; color: #666666;">`+ ret + `</div>
                        </div>
                    `)
                }
            } catch (err) {
                $(el).closest(".termarea").append(`
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <div style="display: inline; color: #666666;">`+ err + `</div>
                    </div>
                `)
            }
        } else if (cmdname == "system") {
            argslist = cmdarg.split(" ")
            if(argslist[0] == "reload") {
                window.location.reload()
            } else if (argslist[0] == "help") {
                $(el).closest(".termarea").append(`
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <div style="display: inline; color: #666666;">
                            Delta System Commands
                            <ul>
                                <li>
                                    reload: reload the browser
                                </li>    
                                <li>
                                    help: display this message
                                </li>    
                            </ul>
                        </div>
                    </div>
                `)
            }
        } else if (cmdname == "ls") {
            fileslist = await fetch("/app/delta/imfs/list/")
            newfilelist = await fileslist.json()
            textfilelist = ""
            newfilelist.forEach(filelement => {
                textfilelist = textfilelist + filelement + ", "
            })
            $(el).closest(".termarea").append(`
                <div style="margin-top: 10px; margin-left: 10px;">
                    <div style="display: inline; color: #666666;">
                        ` + textfilelist + `
                    </div>
                </div>
            `)
        }
        $(el).closest(".termarea").append(`
            <div style="margin-top: 10px; margin-left: 10px;" class="userinpblock">
                <div style="display: inline; color: rgb(0, 133, 88);">User $</div>
                <input style="background-color: rgba(255, 255, 255, 0); color: #666666; border: none; outline: none; font-size: 16px; padding: 0px; width: calc(100% - 100px);" onkeypress="runshellcmd(this, event)"></input>
            </div>
        `)
        $(el).closest(".termarea").find(".userinpblock").find("input").focus()
    }
}