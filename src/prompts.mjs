export class Prompts {
    #_cachedDialogTitle = ``;
    #_messageToDisplay = ``;
    #_promptTypes = [];
    #_actor = null;

    async prepareActorFlags(actor) {
        const abilities = [ `all`, `str`, `dex`, `con`, `int`, `wis`, `cha`, `san`, `hon` ];
        const skills = [ `all`, `acr`, `ani`, `arc`, `ath`, `dec`, `his`, `ins`, `inv`, `itm`, `med`, `nat`, `per`, `prc`, `prf`, `rel`, `slt`, `ste`, `sur` ];

        const updates = {};
        for (const ability of abilities) {
            updates[`flags.suite-5e.prompts.check.${ability}`] = [];
            updates[`flags.suite-5e.prompts.save.${ability}`] = [];
        }
        for (const skill of skills) {
            updates[`flags.suite-5e.prompts.skill.${skill}`] = [];
        }
        updates[`flags.suite-5e.prompts.concentration`] = [];
        updates[`flags.suite-5e.prompts.attack`] = [];
        await actor.update(updates);
    }

    /**
     * 
     * @param {string} hook The name of the roll hook
     * @param {Actor5e} actor The actor performing the roll
     * @param {string} title The roll dialog's title
     * @param  {...any} options Any relevant arguments
     */
    onRollDialog(hook, actor, title, ...options) {
        this.#_actor = actor;

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
            this.#_promptTypes = [];
            this.#_actor = null;
            return;
        }

        const originalParts = this.#_messageToDisplay.split(`<br>`);
        const messageParts = [];
        for (var i = 0; i < originalParts.length; i++) {
            if (originalParts[i] === ``) continue;

            var matched = false;

            for (const item of this.#_actor.items) {
                for (const effect of item.effects) {
                    for (const change of effect.changes) {
                        if (!this.#_promptTypes.includes(change.key)) continue;
                        if (originalParts[i] !== change.value) continue;

                        messageParts.push(`${originalParts[i]} <i>(${item.name})</i>`);
                        matched = true;
                        break;
                    }
                    if (matched) break;
                }
                if (matched) break;
            }

            if (!matched) messageParts.push(`${originalParts[i]} <i>(Custom)</i>`);
        }

        const message = messageParts.join(`<br>`);

        const dialog = $(html).find(`div.dialog-content`).children(`:first`);
        dialog.append($(`<div class="form-group"><span>&nbsp;</span></div>`));
        dialog.append($(`<div class="form-group" style="color:var(--color-text-dark-secondary);"><span>${message}</span></div>`));
        
        const top = parseInt($(html).css(`top`).replace(`px`, ``));
        const width = parseInt($(html).css(`width`).replace(`px`, ``));
        const height = parseInt($(html).css(`height`).replace(`px`, ``));

        var lineCount = 0;
        for (const msg of messageParts) {
            lineCount += Math.ceil($(dialog).textWidth(msg) / width);
        }

        $(html).css(`top`, `${top - 11 - (lineCount * 8.5)}px`);
        $(html).css(`height`, `${height + 22 + (lineCount * 17)}px`);

        this.#_cachedDialogTitle = ``;
        this.#_messageToDisplay = ``;
        this.#_promptTypes = [];
        this.#_actor = null;
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
        this.#_messageToDisplay = ``;
        this.#_promptTypes = [];

        if (globalStr !== undefined) {
            this.#_promptTypes.push(`flags.suite-5e.${globalStr}`);
            const globalFlag = actor.getFlag(`suite-5e`, globalStr);
            if (globalFlag !== undefined) {
                this.#_cachedDialogTitle = title;
                this.#_messageToDisplay += typeof globalFlag === `string` ? globalFlag : globalFlag.length > 0 ? globalFlag.join(`<br>`) : ``;
            }
        }

        if (localStr !== undefined) {
            this.#_promptTypes.push(`flags.suite-5e.${localStr}`);
            const localFlag = actor.getFlag(`suite-5e`, localStr);
            if (localFlag !== undefined) {
                this.#_cachedDialogTitle = title;
                this.#_messageToDisplay += `${this.#_messageToDisplay !== `` ? `<br>` : ``}${typeof localFlag === `string` ? localFlag : localFlag.length > 0 ? localFlag.join(`<br>`) : ``}`;
            }
        }

        return this.#_messageToDisplay !== ``;
    }
}
