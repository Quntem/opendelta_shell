var applyStylesFromJson = function(element, json) {
    for (var key in json) {
        // csskey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        element.style[key] = json[key];
    }
}
class DTKElement {
    constructor(options) {
        this.options = options
    }
    set onClick(value) {
        this.options.onClick = value
        this.element.addEventListener("click", value)
    }
    hide() {
        $(this.element).hide()
    }
    show() {
        $(this.element).show()
    }
    remove() {
        this.element.remove()
        this.parent.elementList.splice(this.parent.elementList.indexOf(this), 1)
    }
    removeChildren() {
        this.elementList.forEach((element) => {
            element.remove()
        })
        this.elementList = []
        this.element.innerHTML = ""
    }
}

DTK = {
    window: class {
        constructor(options) {
            this.windowOption = options
            var winarea = document.getElementById("winarea")
            var newwin = document.createElement("deltashell-window")
            this.newwin = newwin
            var process = options.process
            newwin.setAttribute("wintitle", options.title)
            newwin.setAttribute("isdtk", "true")
            if(options.titlebar?.connected == true) {
                newwin.setAttribute("cntitlebar", "true")
            } 
            if (options.titlebar?.hidetitletext == true) {
                newwin.setAttribute("hidetitletext", "true")
            }
            if(options.titlebar?.style == "hidden") {
                newwin.setAttribute("type", "ctb")
            } else if(options.titlebar?.style == "expanded") {
                newwin.setAttribute("titletype", "expanded")
            }
            if(options.titlebar?.colors?.background != undefined) {
                newwin.setAttribute("titlebgcolor", options.titlebar.colors.background)
            }
            if(options.titlebar?.colors?.foreground != undefined) {
                newwin.setAttribute("titlefgcolor", options.titlebar.colors.foreground)
            }
            if(options.backgroundColor != undefined) {
                newwin.style.backgroundColor = options.backgroundColor
            }
            winarea.appendChild(newwin)
            this.windowcontent = document.createElement("div")
            this.windowcontent.setAttribute("style", "width: 100%; height: calc(100% - 40px); border: none; outline: none;")
            if(options.titlebar?.style == "expanded") {
                this.windowcontent.setAttribute("style", "width: 100%; height: calc(100% - 50px); border: none; outline: none;")
            } else if (options.titlebar?.style == "hidden") {
                this.windowcontent.setAttribute("style", "width: 100%; height: 100%; border: none; outline: none;")
            }
            applyStylesFromJson(this.newwin, options?.style)
            newwin.querySelector(".deltashell-window-main").appendChild(this.windowcontent)
            newwin.setAttribute("linkedpid", process.pid)
            // newwin.setAttribute("linkedpid", currentpid)
            // new QDProcess("New App", $(newwin).find("deltashell-window-handle"))
            this.windowElement = newwin
            this.windowprocess = new QDWindowProcess({
                window: this.newwin,
            })
            if(options.onClose != undefined) {
                this.windowprocess.killCallback = options.onClose
            }
            this.pid = process.pid
            this.winpid = this.windowprocess.winpid
            // this.pid = currentpid - 1
            process.registerWindow(this.windowprocess)
            this.processListPosition = processes.length - 1
            this.windowprocessListPosition = process.windowlist.length - 1
            this.elementList = []
            this.visible = true
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element.selfappend != undefined) {
                        element.selfappend(this.windowElement)
                    } else {
                        this.windowcontent.appendChild(element.element)
                    }
                    this.elementList.push(element)
                    element.parent = this
                })
            } else {
                if(element.selfappend != undefined) {
                    element.selfappend(this.windowElement)
                } else {
                    this.windowcontent.appendChild(element.element)
                }
                this.elementList.push(element)
                element.parent = this
            }
        }
        kill(options) {
            console.log(this)
            var openwins = Array.from(this.windowOption.process.windowlist)
            openwins.forEach(win => {
                if(win.winpid == this.winpid) {
                    this.windowOption.process.windowlist.splice(this.windowOption?.process?.windowlist?.indexOf(win), 1)
                    this.windowElement.remove()
                    if(this.windowOption.onClose != undefined && options?.silent != true) {
                        this.windowOption.onClose()
                    }
                }
            })
        }
        set onClose(value) {
            this.windowprocess.killCallback = value
            this.options.onClose = value
        }
        set title(value) {
            this.options.title = value
            this.windowElement.setAttribute("wintitle", value)
        }
        hide() {
            this.windowElement.style.display = "none"
            this.visible = false
        }
        show() {
            this.windowElement.style.display = "block"
            this.visible = true
        }
    },
    button: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("button")
            this.element.classList.add("deltashell-button")
            applyStylesFromJson(this.element, options?.style)
            this.element.innerText = options?.text
            this.element.addEventListener("click", options?.onClick)
        }
        set onclick(value) {
            this.options.onClick = value
            this.element.setAttribute("onclick", value)
        }
    },
    iconButton: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("button")
            this.element.classList.add("deltashell-icon-button")
            applyStylesFromJson(this.element, options?.style)
            this.icon = lucide.createElement(lucide[options.icon])
            this.icon.style.width = "20px"
            this.icon.style.height = "20px"
            this.element.appendChild(this.icon)
            this.element.addEventListener("click", options?.onClick)
        }
        set onclick(value) {
            this.options.onClick = value
            this.element.setAttribute("onclick", value)
        }
        // selfappend(element) {
        //     element.appendChild(this.element)
        //     setTimeout(() => {
        //         lucide.createIcons()
        //     }, 200)
        // }
    },
    label: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("div")
            this.element.classList.add("deltashell-label")
            this.element.innerText = options?.text
            applyStylesFromJson(this.element, options?.style)
        }
        set text(value) {
            this.options.text = value
            this.element.innerText = value
        }
    },
    container: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("div")
            this.element.classList.add("deltashell-container")
            applyStylesFromJson(this.element, options?.style)
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element.selfappend != undefined) {
                        element.selfappend(this.element)
                    } else {
                        this.element.appendChild(element.element)
                    }
                    this.elementList.push(element)
                    element.parent = this
                })
            } else {
                if(element.selfappend != undefined) {
                    element.selfappend(this.element)
                } else {
                    this.element.appendChild(element.element)
                }
                this.elementList.push(element)
                element.parent = this
            }
        }
    },
    webview: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("iframe")
            this.element.classList.add("deltashell-webview")
            this.element.setAttribute("src", options?.src)
            applyStylesFromJson(this.element, options?.style)
        }
        set src(value) {
            this.options.src = value
            this.element.setAttribute("src", value)
        }
    },
    toolbar: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-toolbar")
            applyStylesFromJson(this.element, options?.style)
            if(options?.position == "center") {
                this.element.classList.add("deltashell-toolbar-center")
            }
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element.selfappend != undefined) {
                        element.selfappend(this.element)
                    } else {
                        this.element.appendChild(element.element)
                    }
                    this.elementList.push(element)
                    element.parent = this
                })
            } else {
                if(element.selfappend != undefined) {
                    element.selfappend(this.element)
                } else {
                    this.element.appendChild(element.element)
                }
                this.elementList.push(element)
                element.parent = this
            }
        }
        selfappend(element) {
            try {
                $(element).closest("deltashell-window").find("deltashell-window-handle").prepend(this.element)
            } catch {
                $(element).find("deltashell-window-handle").prepend(this.element)
            }
        }
    },
    image: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("img")
            this.element.setAttribute("src", options?.src)
            applyStylesFromJson(this.element, options?.style)
        }
        set src(value) {
            this.options.src = value
            this.element.setAttribute("src", value)
        }
    },
    menubar: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-menubar")
            applyStylesFromJson(this.element, options?.style)
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if (element instanceof DTK.menubarMenu) {
                        this.element.appendChild(element.element)
                        this.elementList.push(element)
                        element.parent = this
                    }
                })
            } else {
                if(element instanceof DTK.menubarMenu) {
                    this.element.appendChild(element.element)
                    this.elementList.push(element)
                    element.parent = this
                }
            }
        }
    },
    menubarMenu: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-menubar-menu-label")
            this.menutextelement = document.createElement("div")
            this.element.appendChild(this.menutextelement)
            this.elementList = []
            this.element.addEventListener("click", () => {
                this.showmenu()
                this.element.setAttribute("active", "true")
            })
            this.element.addEventListener("mouseenter", () => {
                if($(this.element).closest("deltashell-menubar").find('deltashell-menubar-menu-label[active="true"]').length != 0) {
                    this.showmenu()
                    this.element.setAttribute("active", "true")
                }
            })
            this.element.addEventListener("mouseleave", () => {
                if(!$(this.menuelement).is(':hover')) {
                    this.hideMenu()
                    setTimeout(() => {
                        this.element.setAttribute("active", "false")
                    }, 10)
                }
            })
            this.menutextelement.innerText = options?.label
            this.menutextelement.style.height = "25px"
            this.menutextelement.style.display = "flex"
            this.menutextelement.style.alignItems = "center"
            this.menutextelement.style.justifyContent = "center"
            applyStylesFromJson(this.element, options?.style)
            this.menuelement = document.createElement("deltashell-menubar-menu")
            this.menuelement.style.position = "absolute"
            this.menuelement.style.top = "25px"
            this.menuelement.style.left = "0px"
            this.menuelement.style.backgroundColor = "white"
            this.menuelement.style.border = "1px solid #e4e4e7"
            this.menuelement.style.zIndex = 1000
            this.menuelement.style.display = "none"
            // this.menuelement.style.width = "200px"
            // this.menuelement.style.height = "300px"
            this.element.appendChild(this.menuelement)
        }
        showmenu() {
            this.menuelement.style.display = "block"
        }
        hideMenu() {
            this.menuelement.style.display = "none"
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element instanceof DTK.menubarMenuItem || element instanceof DTK.menubarMenuSeparator) {
                        this.menuelement.appendChild(element.element)
                        this.elementList.push(element)
                        element.parent = this
                    }
                })
            } else {
                if(element instanceof DTK.menubarMenuItem || element instanceof DTK.menubarMenuSeparator) {
                    this.menuelement.appendChild(element.element)
                    this.elementList.push(element)
                    element.parent = this
                }
            }
        }
    },
    menubarMenuSeparator: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-menubar-menu-separator")
            applyStylesFromJson(this.element, options?.style)
        }
    },
    menubarMenuItem: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-menubar-menu-item")
            this.element.innerText = options?.label
            applyStylesFromJson(this.element, options?.style)
            this.element.addEventListener("click", () => {
                if(options?.onClick != undefined) {
                    options.onClick()
                }
            })
        }
    },
    sidebar: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-sidebar")
            applyStylesFromJson(this.element, options?.style)
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element.selfappend != undefined) {
                        element.selfappend(this.element)
                    } else {
                        this.element.appendChild(element.element)
                    }
                    this.elementList.push(element)
                    element.parent = this
                })
            } else {
                if(element.selfappend != undefined) {
                    element.selfappend(this.element)
                } else {
                    this.element.appendChild(element.element)
                }
                this.elementList.push(element)
                element.parent = this
            }
        }
        selfappend(element) {
            // this.toggleButton = new DTK.button({
            //     text: "Toggle",
            //     onClick: () => {
            //         $(this.element).toggleClass("dtk-sidebar-hidden")
            //     },
            //     style: {
            //         marginLeft: "10px"
            //     }
            // })
            this.toggleButton = new DTK.iconButton({
                icon: "PanelLeft",
                onClick: () => {
                    $(this.element).toggleClass("dtk-sidebar-hidden")
                },
                style: {
                    marginLeft: "10px",
                    border: "none"
                }
            })
            try {
                $(element).closest("deltashell-window").find("deltashell-window-flexprovider").prepend(this.element)
                $(element).closest("deltashell-window").find("deltashell-window-handle").attr("type", "expanded")
                $(element).closest("deltashell-window").find("deltashell-window-handle").attr("cntitlebar", "true")
                $(element).closest("deltashell-window").find("deltashell-window-handle").attr("hidetitletext", $(element).closest("deltashell-window").attr("hidetitletext"))
                $(element).closest("deltashell-window").find("deltashell-window-handle").attr("titlebgcolor", "rgba(245, 245, 245, 0)")
                $(element).closest("deltashell-window").find("deltashell-window-handle").prepend(this.toggleButton.element)
            } catch {
                $(element).find("deltashell-window-flexprovider").prepend(this.element)
                $(element).find("deltashell-window-handle").attr("type", "expanded")
                $(element).find("deltashell-window-handle").attr("cntitlebar", "true")
                $(element).find("deltashell-window-handle").attr("hidetitletext", $(element).attr("hidetitletext"))
                $(element).find("deltashell-window-handle").attr("titlebgcolor", "rgba(245, 245, 245, 0)")
                $(element).find("deltashell-window-handle").prepend(this.toggleButton.element)
            }
        }
    },
    tab: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-tab")
            applyStylesFromJson(this.element, options?.style)
            this.tabicon = lucide.createElement(lucide[options.icon])
            this.tabicon.style.width = "20px"
            this.tabicon.style.height = "20px"
            this.tabicon.style.marginRight = "8px"
            this.element.appendChild(this.tabicon)
            this.element.appendChild(document.createTextNode(options.text))
        }
        setActive() {
            this.element.setAttribute("active", "true")
        }
        setInactive() {
            this.element.setAttribute("active", "false")
        }
        get active() {
            return this.element.getAttribute("active") == "true"
        }
    },
    tabbar: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-tabbar")
            if(options?.vertical == true) {
                this.element.style.flexDirection = "column"
                this.element.classList.add("dtk-tabbar-vertical")
            }
            applyStylesFromJson(this.element, options?.style)
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if (element instanceof DTK.tab) {
                        this.element.appendChild(element.element)
                        element.element.addEventListener("click", () => {
                            this.elementList.forEach(tab => {
                                tab.setInactive()
                            })
                            element.setActive()
                        })
                        this.elementList.push(element)
                        element.parent = this
                    }
                })
            } else {
                if(element instanceof DTK.tab) {
                    this.element.appendChild(element.element)
                    element.element.addEventListener("click", () => {
                        this.elementList.forEach(tab => {
                            tab.setInactive()
                        })
                        element.setActive()
                    })
                    this.elementList.push(element)
                    element.parent = this
                }
            }
        }
        selectTab(index) {
            this.elementList[index].setActive()
        }
        set onTabSelect(callback) {
            this.elementList.forEach(tab => {
                tab.element.addEventListener("click", () => {
                    callback(tab)
                })
            })
        }
        setActiveTab(index) {
            this.elementList.forEach(tab => {
                tab.setInactive()
            })
            this.elementList[index].setActive()
        }
        get selectedTabIndex() {
            return this.elementList.findIndex(tab => tab.active)
        }
    },
    list: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-list")
            applyStylesFromJson(this.element, options?.style)
            this.elementList = []
        }
        append(element) {
            if(Array.isArray(element)) {
                element.forEach(element => {
                    if(element instanceof DTK.listItem) {
                        this.element.appendChild(element.element)
                        this.elementList.push(element)
                        element.parent = this
                    }
                })
            } else {
                if(element instanceof DTK.listItem) {
                    this.element.appendChild(element.element)
                    this.elementList.push(element)
                    element.parent = this
                }
            }
        }
    },
    listItem: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-list-item")
            applyStylesFromJson(this.element, options?.style)
            this.titleholder = document.createElement("div")
            this.title = document.createElement("div")
            this.title.className = "deltashell-list-item-title"
            this.title.innerText = options?.title
            this.titleholder.appendChild(this.title)
            this.subtitle = document.createElement("div")
            this.subtitle.className = "deltashell-list-item-subtitle"
            this.subtitle.innerText = options?.subtitle
            this.titleholder.appendChild(this.subtitle)
            this.titleholder.style.marginLeft = "15px"
            this.element.appendChild(this.titleholder)
            if(options?.showArrow == true) {
                this.arrow = lucide.createElement(lucide["ChevronRight"])
                this.arrow.style.width = "20px"
                this.arrow.style.height = "20px"
                this.arrow.style.marginLeft = "auto"
                this.arrow.style.marginRight = "15px"
                this.arrow.style.color = "#999999"
                this.element.appendChild(this.arrow)
            }
        }
    },
    navigationStack: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-navigation-stack")
            applyStylesFromJson(this.element, options?.style)
            this.navstack = []
            var navstackitem = document.createElement("deltashell-navigation-stack-item")
            navstackitem.style.backgroundColor = $(this.element).closest("deltashell-window").css("background-color")
            navstackitem.appendChild(this.options?.baseElement.element)
            this.navstack.push(navstackitem)
            this.element.appendChild(navstackitem)
        }
        set baseElement(element) {
            this.navstack[0].remove()
            var navstackitem = document.createElement("deltashell-navigation-stack-item")
            navstackitem.style.backgroundColor = $(this.element).closest("deltashell-window").css("background-color")
            navstackitem.appendChild(element.element)
            this.navstack[0] = navstackitem
            this.element.prepend(navstackitem)
        }
        push(element) {
            var navstackitem = document.createElement("deltashell-navigation-stack-item")
            navstackitem.style.backgroundColor = $(this.element).closest("deltashell-window").css("background-color")
            navstackitem.style.left = "100%"
            navstackitem.appendChild(element.element)
            this.navstack.push(navstackitem)
            this.element.appendChild(navstackitem)
            $(navstackitem).animate({
                left: "0%"
            }, 100, "easeInOutQuad")
        }
        pop() {
            if(this.navstack.length > 0) {
                $(this.navstack[this.navstack.length - 1]).animate({
                    left: "100%"
                }, 100, "easeInOutQuad")
                setTimeout(() => {
                    this.navstack.pop()
                    this.element.removeChild(this.element.lastChild)
                }, 100)
            }
        }
    },
    sidebarHeader: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("deltashell-sidebar-header")
            applyStylesFromJson(this.element, options?.style)
            this.textelement = document.createElement("div")
            this.textelement.innerText = options?.title
            this.textelement.className = "deltashell-sidebar-header-text"
            this.element.appendChild(this.textelement)
        }
        set title(title) {
            this.textelement.innerText = title
        }
    },
    textinput: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("input")
            applyStylesFromJson(this.element, options?.style)
            this.element.setAttribute("placeholder", options?.placeholder || "")
            this.element.setAttribute("value", options?.value || "")
            this.element.setAttribute("type", "text")
            this.element.classList.add("dtk-textinput")
            if(options?.onChange != undefined) {
                this.element.addEventListener("change", options?.onChange)
            }
            if(options?.onKeypress != undefined) {
                this.element.addEventListener("keypress", options?.onKeypress)
            }
            if (options?.type == "password") {
                this.element.setAttribute("type", "password")
            }
        }
        set value(value) {
            this.element.value = value
        }
        get value() {
            return this.element.value
        }
        set placeholder(placeholder) {
            this.element.placeholder = placeholder
        }
        set onKeypress(value) {
            this.options.onKeypress = value
            this.element.addEventListener("keypress", value)
        }
        set onChange(value) {
            this.options.onChange = value
            this.element.addEventListener("change", value)
        }
    },
    markdown: class extends DTKElement {
        constructor(options) {
            super(options)
            this.element = document.createElement("md-block")
            // this.scriptelem = document.createElement("script")
            // this.scriptelem.setAttribute("type", "text/markdown")
            this.element.innerHTML = options?.content
            // this.element.appendChild(this.scriptelem)
            applyStylesFromJson(this.element, options?.style)
        }
    }
}