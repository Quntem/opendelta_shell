var currentid = 0

var maxoffsets = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 50
}

class deltawinhandle extends HTMLElement {
    static observedAttributes = ["type", "cntitlebar", "wintitle", "titlefgcolor", "titlebgcolor"];

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "type") {
            if (newValue == "expanded") {
                $(this).height("50")
            } else {
                $(this).height("40")
            }
        }

        if (name == "cntitlebar") {
            if (newValue == "true") {
                $(this).css("border-bottom", "0px solid #e4e4e7")
                $(this).css("box-shadow", "none")
            } else {
                $(this).css("border-bottom", "1px solid #e4e4e7")
                $(this).css("box-shadow", "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset")
            }
        }

        if (name == "wintitle") {
            $(this).find(".deltashell-window-title").html($(this).attr("wintitle"))
        }

        if (name == "titlefgcolor") {
            $(this).css("color", $(this).attr("titlefgcolor"))
        }

        if (name == "titlebgcolor") {
            $(this).css("background-color", $(this).attr("titlebgcolor"))
        }

        if (name == "hidetitletext") {
            if (newValue == "true") {
                $(this).find(".deltashell-window-title").css("display", "none")
            } else {
                $(this).find(".deltashell-window-title").css("display", "block")
            }
        }
    }
  
    constructor() {
      super();
    }
  
    connectedCallback() {
        if ($(this).attr("type") == "expanded") {
            $(this).height("50")
        }

        if ($(this).attr("cntitlebar") == "true") {
            $(this).css("border-bottom", "0px solid #e4e4e7")
        }

        if ($(this).attr("titlefgcolor") != undefined) {
            $(this).css("color", $(this).attr("titlefgcolor"))
        }

        if ($(this).attr("titlebgcolor") != undefined) {
            $(this).css("background-color", $(this).attr("titlebgcolor"))
        }

        $(this).attr("ondblclick", "minmaxwin(this)")

        $(this).html(`
            <!--<div style="margin-left: 13px; font-size: 14px;">` + $(this).attr("wintitle") + `</div>-->
            <div style="font-size: 14px;" class="deltashell-window-title">` + $(this).attr("wintitle") + `</div>
            <div style="margin-right: 13px; cursor: pointer; margin-left: auto; margin-top: 8px;" class="deltashell-window-minimize">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
            </div>
            <div style="margin-right: 10px; cursor: pointer;" class="deltashell-window-maximize" onclick="minmaxwin(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </div>
            <div style="margin-right: 10px; cursor: pointer;" class="deltashell-window-close" onclick="closewin(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
        `)

        if($(this).attr("hidetitletext") == "true") {
            $(this).find(".deltashell-window-title").css("display", "none")
        }
    }
}
  
customElements.define("deltashell-window-handle", deltawinhandle);

class deltawin extends HTMLElement {
    static observedAttributes = ["color", "size"];
  
    constructor() {
      super();
    }
  
    connectedCallback() {
        if($(this).attr("isdtk") != "true") {
            $(this).prepend(`<deltashell-window-handle type="` + $(this).attr("titletype") + `" hidetitletext="` + $(this).attr("hidetitletext") + `" cntitlebar="` + $(this).attr("cntitlebar") + `" wintitle="` + $(this).attr("wintitle") + `" titlefgcolor="` + $(this).attr("titlefgcolor") + `" titlebgcolor="` + $(this).attr("titlebgcolor") + `"></deltashell-window-handle>`)
        } else if($(this).attr("type") == "ctb") {
            var content = $(this).html()
            $(this).html(`
                <deltashell-window-flexprovider>
                    <div style="width: 100%; height: 100%;" class="deltashell-window-main">
                        ` + content + `
                    </div>
                </deltashell-window-flexprovider>
            `)
        } else {
            var content = $(this).html()
            $(this).html(`
                <deltashell-window-flexprovider>
                    <div style="width: 100%; height: 100%;" class="deltashell-window-main">
                        <deltashell-window-handle type="` + $(this).attr("titletype") + `" cntitlebar="` + $(this).attr("cntitlebar") + `" hidetitletext="` + $(this).attr("hidetitletext") + `" wintitle="` + $(this).attr("wintitle") + `" titlefgcolor="` + $(this).attr("titlefgcolor") + `" titlebgcolor="` + $(this).attr("titlebgcolor") + `"></deltashell-window-handle>
                        ` + content + `
                    </div>
                </deltashell-window-flexprovider>
            `)
        }
        $(this).resizable({handles: "n, e, s, w, ne, se, sw, nw" })
        if ($(this).attr("type") != "ctb") {
            $(this).draggable({handle: "deltashell-window-handle"})
        }
        $(this).attr("onmousedown", "$(this).css('z-index', globalz); globalz += 1;")
        $(this).css("z-index", globalz)
        $(this).css("scale", 1)
        globalz += 1
        if($(this).attr("winid") == undefined) {
            $(this).attr("winid", currentid)
            currentid += 1
        }
        var rscover = document.createElement('div')
        $(rscover).attr("class", "rscover")
        $(rscover).css("height", "0%")
        $(rscover).css("width", "0%")
        $(rscover).css("position", "absolute")
        $(rscover).css("top", "0px")
        $(this).append(rscover)
        $(this).css("top", "calc(50% - 200px)")
        $(this).css("left", "calc(50% - 300px)")

        $(this).on( "resizestart", function( event, ui ) {
            $(ui.element).find(".rscover").css("width", "100%")
            $(ui.element).find(".rscover").css("height", "calc(100% - 40px)")
        } );

        $(this).on( "resizestop", function( event, ui ) {
            $(ui.element).find(".rscover").css("width", "0%")
            $(ui.element).find(".rscover").css("height", "0%")
        } );

        $(this).on( "dragstart", function( event, ui ) {
            $(event.target).find(".rscover").css("width", "100%")
            $(event.target).find(".rscover").css("height", "calc(100% - 40px)")
        } );

        $(this).on( "dragstop", function( event, ui ) {
            $(event.target).find(".rscover").css("width", "0%")
            $(event.target).find(".rscover").css("height", "0%")
        } );
    }
}
  
customElements.define("deltashell-window", deltawin);

var closewin = function(cb) {
    win = $(cb).closest("deltashell-window")
    win.animate({
        top: "-110vh",
        scale: "0.5"
    }, animspeed, function() {
        win.remove()
        processes.forEach(proc => {
            if (proc.pid == win.attr("linkedpid")) {
                proc.windowlist.forEach(win => {
                    proc.windowlist.splice(proc.windowlist.indexOf(win), 1)
                    if(win.killCallback != undefined) {
                        win.killCallback()
                    }
                })
            }
        })
    })
}

var minmaxwin = function(cb) {
    win = $(cb).closest("deltashell-window")
    // winarea = $("cloudplus-app-area")
    winarea = $("#winarea")
    if (win.attr("state") != "max") {
        win.attr("oldheight", win.height())
        win.attr("oldwidth", win.width())
        win.attr("oldtop", win.offset().top)
        win.attr("oldleft", win.offset().left)
        win.animate({
            top: maxoffsets.top,
            left: maxoffsets.left,
            width: winarea.width() - maxoffsets.left - maxoffsets.right,
            height: winarea.height() - maxoffsets.bottom - maxoffsets.top,
            // height: winarea.height(),
            boxShadow: "none",
            borderRadius: "0px"
        }, animspeed, function() {
            win[0].style.width = "calc(100% - " + (maxoffsets.left + maxoffsets.right) + "px)"
            win[0].style.height = "calc(100% - " + (maxoffsets.top + maxoffsets.bottom) + "px)"
            // win.height("100%")
            win.draggable("disable")
            win.resizable("disable")
            win.attr("state", "max")
        })
    } else {
        win.animate({
            top: win.attr("oldtop"),
            left: win.attr("oldleft"),
            width: win.attr("oldwidth"),
            height: win.attr("oldheight"),
            boxShadow: "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;",
            borderRadius: "7px"
        }, animspeed, function() {
            win.draggable("enable")
            win.resizable("enable")
            win.attr("state", "reg")
        })
    }
    maxwinnum = 0
    openwins = Array.from(document.getElementById("winarea").children)
    openwins.forEach(win => {
        if ($(win).attr("state") == "max") {
            maxwinnum += 1
        }
    })
    if (maxwinnum = 0) {
        $("deltashell-tb").css("box-shadow", "rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset")
    } else {
        $("deltashell-tb").css("box-shadow", "none")
    }
}