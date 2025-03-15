var currentid = 0

class deltawinhandle extends HTMLElement {
    static observedAttributes = ["color", "size"];
  
    constructor() {
      super();
    }
  
    connectedCallback() {
        if ($(this).attr("type") == "expanded") {
            $(this).height("60")
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
            <div style="margin-left: 13px; font-size: 14px;">` + $(this).attr("wintitle") + `</div>
            <div style="margin-right: 13px; margin-left: auto; margin-top: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
            </div>
            <div style="margin-right: 10px;" onclick="minmaxwin(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </div>
            <div style="margin-right: 10px;" onclick="closewin(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
        `)
    }
}
  
customElements.define("deltashell-window-handle", deltawinhandle);

class deltawin extends HTMLElement {
    static observedAttributes = ["color", "size"];
  
    constructor() {
      super();
    }
  
    connectedCallback() {
        $(this).prepend(`<deltashell-window-handle type="` + $(this).attr("titletype") + `" cntitlebar="` + $(this).attr("cntitlebar") + `" wintitle="` + $(this).attr("wintitle") + `" titlefgcolor="` + $(this).attr("titlefgcolor") + `" titlebgcolor="` + $(this).attr("titlebgcolor") + `"></deltashell-window-handle>`)
        $(this).resizable({handles: "n, e, s, w, ne, se, sw, nw" })
        if ($(this).attr("type") != "ctb") {
            $(this).draggable({handle: "deltashell-window-handle"})
        }
        $(this).attr("onclick", "$(this).css('z-index', globalz); globalz += 1;")
        $(this).css("z-index", globalz)
        $(this).css("scale", 1)
        globalz += 1
        if($(this).attr("winid") == undefined) {
            $(this).attr("winid", currentid)
            currentid += 1
        }
        rscover = document.createElement('div')
        $(rscover).attr("class", "rscover")
        $(rscover).css("height", "0%")
        $(rscover).css("width", "0%")
        $(rscover).css("position", "absolute")
        $(rscover).css("top", "0px")
        $(this).append(rscover)

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
                processes.splice(processes.indexOf(proc), 1)
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
            top: "0",
            left: "0",
            width: winarea.width(),
            height: winarea.height() - 50,
            // height: winarea.height(),
            boxShadow: "none",
            borderRadius: "0px"
        }, animspeed, function() {
            win.width("100%")
            win.height("calc(100% - 50px")
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
            borderRadius: "5px"
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