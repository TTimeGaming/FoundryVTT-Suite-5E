export class Prompts {
    #_cachedDialogTitle = ``;
    #_messageToDisplay = ``;
    #_promptTypes = [];
    #_actor = null;

    async prepareActorFlags(actor) {
        const abilities = [ `all`, `str`, `dex`, `con`, `int`, `wis`, `cha`, `san`, `hon` ];
        const skills = [ `all`, `acr`, `ani`, `arc`, `ath`, `dec`, `his`, `ins`, `inv`, `itm`, `med`, `nat`, `per`, `prc`, `prf`, `rel`, `slt`, `ste`, `sur` ];
        const rests = [ `all`, `short`, `long` ];

        const updates = {};
        for (const ability of abilities) {
            if (actor.getFlag(`suite-5e`, `prompts.check.${ability}`) == undefined) updates[`flags.suite-5e.prompts.check.${ability}`] = [];
            if (actor.getFlag(`suite-5e`, `prompts.save.${ability}`) == undefined) updates[`flags.suite-5e.prompts.save.${ability}`] = [];
        }
        for (const skill of skills) {
            if (actor.getFlag(`suite-5e`, `prompts.skill.${skill}`) == undefined) updates[`flags.suite-5e.prompts.skill.${skill}`] = [];
        }
        for (const rest of rests) {
            if (actor.getFlag(`suite-5e`, `prompts.rest.${rest}`) == undefined) updates[`flags.suite-5e.prompts.rest.${rest}`] = [];
        }
        if (actor.getFlag(`suite-5e`, `prompts.concentration`) == undefined) updates[`flags.suite-5e.prompts.concentration`] = [];
        if (actor.getFlag(`suite-5e`, `prompts.attack`) == undefined) updates[`flags.suite-5e.prompts.attack`] = [];
        if (actor.getFlag(`suite-5e`, `prompts.damage`) === undefined) updates[`flags.suite-5e.prompts.damage`] = [];
        if (actor.getFlag(`suite-5e`, `prompts.initiative`) === undefined) updates[`flags.suite-5e.prompts.initiative`] = [];
        if (actor.getFlag(`suite-5e`, `prompts.death`) === undefined) updates[`flags.suite-5e.prompts.death`] = [];
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
        this.#_cachedDialogTitle = title;

        switch (hook) {
            case `check`: {
                const abilityKey = options[0];
                this.#obtainMessage(actor, `prompts.check.all`, `prompts.check.${abilityKey}`);
                break;
            }
            case `save`: {
                const abilityKey = options[0];
                this.#obtainMessage(actor, `prompts.save.all`, `prompts.save.${abilityKey}`);
                break;
            }
            case `concentration`: {
                this.#obtainMessage(actor, `prompts.concentration`);
                break;
            }
            case `skill`: {
                const skillKey = options[0];
                this.#obtainMessage(actor, `prompts.skill.all`, `prompts.skill.${skillKey}`);
                break;
            }
            case `attack`: {
                const itemType = options[0];
                const source = [ `consumable`, `container`, `equipment`, `loot`, `tool`, `weapon` ].includes(itemType) ? `inventory` : [ `feat` ].includes(itemType) ? `feature` : [ `spell` ].includes(itemType) ? `spell` : `none`;
                this.#obtainMessage(actor, `prompts.attack.all`, `prompts.attack.${source}`);
                break;
            }
            case `damage`: {
                const itemType = options[0];
                const source = [ `consumable`, `container`, `equipment`, `loot`, `tool`, `weapon` ].includes(itemType) ? `inventory` : [ `feat` ].includes(itemType) ? `feature` : [ `spell` ].includes(itemType) ? `spell` : `none`;
                this.#obtainMessage(actor, `prompts.damage.all`, `prompts.damage.${source}`);
                break;
            }
            case `rest`: {
                const restType = options[0];
                this.#obtainMessage(actor, `prompts.rest.all`, `prompts.rest.${restType}`);
                break;
            };
            case `initiative`: {
                this.#obtainMessage(actor, `prompts.initiative`);
                break;
            }
            case `death`: {
                this.#obtainMessage(actor, `prompts.death`);
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
        if ((title !== this.#_cachedDialogTitle && !title.includes(this.#_cachedDialogTitle)) || this.#_messageToDisplay === ``) {
            this.#_cachedDialogTitle = ``;
            this.#_messageToDisplay = ``;
            this.#_promptTypes = [];
            this.#_actor = null;
            return;
        }
        
        const rollData = this.#_actor.getRollData();
        
        const originalParts = this.#_messageToDisplay.split(`<br>`);
        const messageParts = [];
        for (const original of originalParts) {
            if (original === ``) continue;

            var matched = false;

            for (const item of this.#_actor.items) {
                for (const effect of item.effects) {
                    for (const change of effect.changes) {
                        if (!this.#_promptTypes.includes(change.key)) continue;
                        if (original !== change.value) continue;

                        var entry = original;
                        const matches = original.match(/@([^\s]+)/g);
                        for (const match of (matches ?? [])) {
                            const key = match.replace(/<\/[^>]+(>|$)/g, ``);
                            
                            var obj = rollData;
                            for (const part of key.replace(`@`, ``).split(`.`)) {
                                obj = obj[part];
                                if (obj === undefined) continue;
                            }

                            if (obj === undefined) continue;
                            entry = entry.replace(key, obj);
                        }

                        messageParts.push(`${entry} <i>(${item.name})</i>`);
                        matched = true;
                        break;
                    }
                    if (matched) break;
                }
                if (matched) break;
            }

            if (!matched) messageParts.push(`${original} <i>(Custom)</i>`);
        }

        const message = messageParts.join(`<br>`);

        const dialog = $(html).find(`section.window-content`).find(`form`);
        const buttons = dialog.find(`.dialog-buttons`);
        const appendFunction = (content) => {
            if (buttons.length > 0) content.insertBefore(buttons);
            else dialog.append(content);
        };

        appendFunction($(`<div class="form-group"><span>&nbsp;</span></div>`));
        appendFunction($(`<div class="form-group" style="color:var(--color-text-dark-secondary);"><span>${message}</span></div>`));
        
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
     * @param {string} globalStr The global flag to check on the actor
     * @param {string} localStr The local flag to check on the actor
     * @returns {boolean}
     */
    #obtainMessage(actor, globalStr, localStr = undefined) {
        this.#_messageToDisplay = ``;
        this.#_promptTypes = [];
        
        if (globalStr !== undefined) {
            this.#_promptTypes.push(`flags.suite-5e.${globalStr}`);
            const globalFlag = actor.getFlag(`suite-5e`, globalStr);
            if (globalFlag !== undefined) {
                this.#_messageToDisplay += typeof globalFlag === `string` ? globalFlag : globalFlag.length > 0 ? globalFlag.join(`<br>`) : ``;
            }
        }

        if (localStr !== undefined) {
            this.#_promptTypes.push(`flags.suite-5e.${localStr}`);
            const localFlag = actor.getFlag(`suite-5e`, localStr);
            if (localFlag !== undefined) {
                this.#_messageToDisplay += `${this.#_messageToDisplay !== `` ? `<br>` : ``}${typeof localFlag === `string` ? localFlag : localFlag.length > 0 ? localFlag.join(`<br>`) : ``}`;
            }
        }

        return this.#_messageToDisplay !== ``;
    }
}
