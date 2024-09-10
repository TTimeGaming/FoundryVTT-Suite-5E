export class Prompts {
    #_cachedDialogTitle = ``;
    #_messageToDisplay = ``;

    /**
     * 
     * @param {string} hook The name of the roll hook
     * @param {Actor5e} actor The actor performing the roll
     * @param {string} title The roll dialog's title
     * @param  {...any} options Any relevant arguments
     */
    onRollDialog(hook, actor, title, ...options) {
        switch (hook) {
            case `check`: {
                const abilityKey = options[0];
                this.#obtainMessage(actor, title, `prompts.check.all`, `prompts.check.${abilityKey}`);
                break;
            }
            case `save`: {
                const abilityKey = options[0];
                this.#obtainMessage(actor, title, `prompts.save.all`, `prompts.save.${abilityKey}`);
                break;
            }
            case `concentration`: {
                this.#obtainMessage(actor, title, `prompts.concentration`);
                break;
            }
            case `skill`: {
                const skillKey = options[0];
                this.#obtainMessage(actor, title, `prompts.skill.all`, `prompts.skill.${skillKey}`);
                break;
            }
            case `attack`: {
                this.#obtainMessage(actor, title, `prompts.attack`);
                break;
            }
        }
    }

    /**
     * 
     * @param {string} title The roll dialog's title
     * @param {JQuery} html The roll dialog's HTML content
     */
    onRenderDialog(title, html) {
        if (title !== this.#_cachedDialogTitle || this.#_messageToDisplay === ``) {
            this.#_cachedDialogTitle = ``;
            this.#_messageToDisplay = ``;
            return;
        }

        const dialog = $(html).find(`div.dialog-content`).children(`:first`);
        dialog.append($(`<div class="form-group"><span>&nbsp;</span></div>`));
        dialog.append($(`<div class="form-group" style="color:var(--color-text-dark-secondary);"><span>${this.#_messageToDisplay}</span></div>`));
        
        const top = parseInt($(html).css(`top`).replace(`px`, ``));
        const width = parseInt($(html).css(`width`).replace(`px`, ``));
        const height = parseInt($(html).css(`height`).replace(`px`, ``));
        
        const messageWidth = $(dialog).textWidth(this.#_messageToDisplay);
        const lineCount = Math.ceil(messageWidth / width);

//        $(html).css(`top`, `${top - (10 * lineCount)}px`);
        $(html).css(`height`, `${height + 40 + (20 * (lineCount - 1))}px`);

        this.#_cachedDialogTitle = ``;
        this.#_messageToDisplay = ``;
    }

    /**
     * Returns true if a flag is obtained on the actor.
     * 
     * @param {Actor5e} actor The actor performing the roll
     * @param {string} title The title of the roll dialog
     * @param {string} globalStr The global flag to check on the actor
     * @param {string} localStr The local flag to check on the actor
     * @returns {boolean}
     */
    #obtainMessage(actor, title, globalStr, localStr = undefined) {
        const globalFlag = actor.getFlag(`suite-5e`, globalStr);
        if (globalFlag !== undefined) {
            this.#_cachedDialogTitle = title;
            this.#_messageToDisplay = globalFlag;
            return true;
        }

        if (localStr === undefined) return;
        const localFlag = actor.getFlag(`suite-5e`, localStr);
        if (localFlag !== undefined) {
            this.#_cachedDialogTitle = title;
            this.#_messageToDisplay = localFlag;
            return true;
        }

        return false;
    }
}
