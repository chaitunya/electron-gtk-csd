const { remote } = require('electron');
const GSettings = require('node-gsettings-wrapper');

class ClientSideDecoration {
    constructor(options={}) {
        /*
        All options:
        - electronWindow
        - minimizeElement
        - maximizeElement
        - restoreElement
        - closeElement
        - minimizeClickCallback()
        - maximizeClickCallback()
        - restoreClickCallback()
        - closeClickCallback()
        - preUpdateButtonLayout(buttonLayout, electronWindow) 
        - windowControlsLeftId
        - windowControlsRightId
        - windowControlsClass
        */
        this.options = options;
        if (!options.electronWindow) {
            this.options.electronWindow = remote.getCurrentWindow();
        } else {
            this.options.electronWindow = options.electronWindow;
        }
        if (!options.windowControlsLeftId) {
            this.options.windowControlsLeftId = "window-controls-left";
        }
        if (!options.windowControlsRightId) {
            this.options.windowControlsRightId = "window-controls-right";
        }
        if (!options.windowControlsClass) {
            this.options.windowControlsClass = "window-controls";
        }
        if (!options.minimizeDivId) {
            this.options.minimizeDivId = "minimize-button"
        }
        if (!options.maximizeDivId) {
            this.options.maximizeDivId = "maximize-button"
        }
        if (!options.restoreDivId) {
            this.options.restoreDivId = "restore-button"
        }
        if (!options.closeDivId) {
            this.options.closeDivId = "close-button"
        }

        if (!options.minimizeClickCallback) {
            this.options.minimizeClickCallback = (_event) => {
                this.options.electronWindow.minimize()
            };
        }
        if (!options.maximizeClickCallback) {
            this.options.maximizeClickCallback = (_event) => {
                this.options.electronWindow.maximize();
            };
        }
        if (!options.restoreClickCallback) {
            this.options.restoreClickCallback = (_event) => {
                this.options.electronWindow.unmaximize();
            };
        }
        if (!options.closeClickCallback) {
            this.options.closeClickCallback = (_event) => {
                this.options.electronWindow.close();
            }
        }
        if (!options.minimizeElement) {
            this.options.minimizeElement = "MIN";
        }
        if (!options.maximizeElement) {
            this.options.maximizeElement = "MAX";
        }
        if (!options.restoreElement) {
            this.options.restoreElement = "RES";
        }
        if (!options.closeElement) {
            this.options.closeElement = "CLOSE";
        }

        this.minimizeButton = this.createButton(
            this.options.minimizeDivId,
            this.options.minimizeClickCallback,
            this.options.minimizeElement);
        this.maximizeButton = this.createButton(
            this.options.maximizeDivId,
            this.options.maximizeClickCallback,
            this.options.maximizeElement);
        this.restoreButton = this.createButton(
            this.options.restoreDivId,
            this.options.restoreClickCallback,
            this.options.restoreElement);
        this.closeButton = this.createButton(
            this.options.closeDivId,
            this.options.closeClickCallback,
            this.options.closeElement);
        
        this.buttonLayoutKey = GSettings.Key.findById("org.gnome.desktop.wm.preferences", "button-layout");
        this.buttonLayoutKey.addListener((_key, buttonLayoutString) => {
            var buttonLayout = ClientSideDecoration.parseButtonLayout(buttonLayoutString);
            this.updateButtonLayout(buttonLayout);
        })
        var buttonLayout = ClientSideDecoration.parseButtonLayout(this.buttonLayoutKey.getValue());
        this.updateButtonLayout(buttonLayout);

        if (document.getElementById(this.options.maximizeDivId)) {
            this.toggleMaxRestoreButtons();
            this.options.electronWindow.on('maximize', this.toggleMaxRestoreButtons);
            this.options.electronWindow.on('unmaximize', this.toggleMaxRestoreButtons);
        }
    }

    static parseButtonLayout(buttonLayoutString) {
        var buttonTypes = ["minimize", "maximize", "close"];
        var buttonLayout = [[], []];
        var leftLayoutString = buttonLayoutString.split(':', 1)[0];
        var rightLayoutString = buttonLayoutString.slice(leftLayoutString.length + 1, buttonLayoutString.length);

        var leftLayout = leftLayoutString.split(',');
        for (let i in leftLayout) {
            if (buttonTypes.indexOf(leftLayout[i]) >= 0 && buttonLayout[0].indexOf(leftLayout[i]) == -1) {
                buttonLayout[0].push(leftLayout[i]);
            }
        }
        if (rightLayoutString) {
            var rightLayout = rightLayoutString.split(',');
        } else {
            var rightLayout = [];
        }
        for (let i in rightLayout) {
            if (buttonTypes.indexOf(rightLayout[i]) >= 0 && buttonLayout[0].indexOf(rightLayout[i]) == -1 && buttonLayout[1].indexOf(rightLayout[i]) == -1) {
                buttonLayout[1].push(rightLayout[i]);
            }
        }
        return buttonLayout;
    }

    updateButtonLayout(buttonLayout) {
        if (this.preUpdateButtonLayout) {
            this.preUpdateButtonLayout(buttonLayout);
        }
        var windowControlsLeft = document.getElementById(this.options.windowControlsLeftId);
        var windowControlsRight = document.getElementById(this.options.windowControlsRightId);

        this.removeAllChildNodes(windowControlsLeft);
        this.removeAllChildNodes(windowControlsRight);

        var leftLayout = buttonLayout[0];
        var rightLayout = buttonLayout[1];
        for (let i in leftLayout) {
            let button = leftLayout[i];
            if (button == 'minimize') {
                windowControlsLeft.appendChild(this.minimizeButton);
            } else if (button == 'maximize') {
                windowControlsLeft.appendChild(this.restoreButton);
                windowControlsLeft.appendChild(this.maximizeButton);
            } else if (button == 'close') {
                windowControlsLeft.appendChild(this.closeButton);
            }
        }
        for (let i in rightLayout) {
            let button = rightLayout[i];
            if (button == 'minimize') {
                windowControlsRight.appendChild(this.minimizeButton);
            } else if (button == 'maximize') {
                windowControlsRight.appendChild(this.restoreButton);
                windowControlsRight.appendChild(this.maximizeButton);
            } else if (button == 'close') {
                windowControlsRight.appendChild(this.closeButton);
            }
        }
    }

    createButton(id, callback, innerElement) {
        var span = document.createElement('span');
        span.attributes.role = 'button';
        span.id = id;
        span.attributes.display = 'inline';
        span.addEventListener("click", callback);
        span.innerHTML = innerElement;
        return span;
    }

    toggleMaxRestoreButtons() {
        if (remote.getCurrentWindow().isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }

    removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }
}

exports.ClientSideDecoration = ClientSideDecoration;