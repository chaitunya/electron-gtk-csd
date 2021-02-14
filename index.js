// import remote from Electron;
const GSettings = require('node-gsettings-wrapper');

class ClientSideDecoration {
    constructor(options={}) {
        /*
        All options:
        - electronWindow
        - preMinimize()
        - preMaximize()
        - preRestore()
        - preClose()
        - preUpdateButtonLayout(buttonLayout, electronWindow) 
        - windowControlsLeftId
        - windowControlsRightId
        - windowControlsClass
        */
        this.options = options;
        if (!options.electronWindow) {
            this.electronWindow = remote.getCurrentWindow();
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
        this.buttonLayoutKey = GSettings.Key.findById("org.gnome.desktop.wm.preferences", "button-layout");
        this.buttonLayoutKey.addListener((_key, buttonLayoutString) => {
            this.buttonLayout = this.parseButtonLayout(buttonLayoutString);
            this.updateButtonLayout();
        })
    }

    static parseButtonLayout(buttonLayoutString) {
        var buttonTypes = ["minimize", "maximize", "close"];
        var buttonLayout = [[], []];
        var sidesLayout = buttonLayoutString.split(/:(.+)/).splice(0, 2);
        var leftLayout = sidesLayout[0].split(',');
        for (let i in leftLayout) {
            if (buttonTypes.indexOf(leftLayout[i]) >= 0) {
                buttonLayout[0].push(leftLayout[i]);
            }
        }
        if (sidesLayout[1]) {
            var rightLayout = sidesLayout[1].split(',');
        } else {
            var rightLayout = [];
        }
        for (let i in rightLayout) {
            if (buttonTypes.indexOf(rightLayout[i]) >= 0) {
                buttonLayout[1].push(rightLayout[i]);
            }
        }
        return buttonLayout;
    }

    updateButtonLayout() {
        if (this.preUpdateButtonLayout) {
            this.preUpdateButtonLayout(this.buttonLayout);
        }
        
    }
}

exports.ClientSideDecoration = ClientSideDecoration;