import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class Extension {
    constructor() {
        this._childAddedSignalId = 0;
    }

    enable() {
        const rightBox = Main.panel?._rightBox;

        if (!rightBox) {
            console.error(
                'Desaturated Tray Icons: Main.panel._rightBox is unavailable'
            );
            return;
        }

        this._childAddedSignalId = rightBox.connect(
            'child-added',
            (_box, child) => {
                this._desaturateChild(child);
            }
        );

        this._addEffects();
    }

    disable() {
        const rightBox = Main.panel?._rightBox;

        if (rightBox && this._childAddedSignalId !== 0) {
            rightBox.disconnect(this._childAddedSignalId);
            this._childAddedSignalId = 0;
        }

        this._removeEffects();
    }

    _desaturateChild(child) {
        if (!child || !child.add_effect) {
            return;
        }

        for (const effect of child.get_effects()) {
            if (effect instanceof Clutter.DesaturateEffect) {
                return;
            }
        }

        child.add_effect(new Clutter.DesaturateEffect());
    }

    _getTrayChildren() {
        const rightBox = Main.panel?._rightBox;
        return rightBox ? rightBox.get_children() : [];
    }

    _addEffects() {
        for (const child of this._getTrayChildren()) {
            this._desaturateChild(child);
        }
    }

    _removeEffects() {
        for (const child of this._getTrayChildren()) {
            for (const effect of child.get_effects()) {
                if (effect instanceof Clutter.DesaturateEffect) {
                    child.remove_effect(effect);
                }
            }
        }
    }
}
