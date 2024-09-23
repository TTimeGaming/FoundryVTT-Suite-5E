export class Grants {
    #_requiredParams = [ `flags.suite-5e.grants.id` ];
    #_optionalParams = {
        'flags.suite-5e.grants.filter': ``,
        'flags.suite-5e.grants.ability': ``,
        'flags.suite-5e.grants.count': 1
    };

    async onGrantAdd(id, actor, items) {
        switch (id) {
            case `suite-5e.spell`:
                break;
        }
    }

    async onGrantRem(id, actor, items) {
        switch (id) {
            case `suite-5e.spell`:
                break;
        }
    }

    async onItemAdded(item, options) {
        if (item.parent === undefined || item.parent == null) return;

        for (const effect of item.effects) {
            const isValid = this.#isValidGrant(effect.changes);
            if (!isValid) continue;
            
            const keys = this.#constructKeys(effect.changes);
            const id = keys[`flags.suite-5e.grants.id`];

            switch (id) {
                case `suite-5e.spell`:
                    const additional = this.#constructFilters(keys[`flags.suite-5e.grants.filter`]);
                    const count = keys[`flags.suite-5e.grants.count`];

                    const filters = { locked: { types: new Set([`spell`]) } };
                    filters.initial = { documentClass: `Item`, types: new Set([`spell`]), additional: additional };

                    const result = await game.dnd5e.applications.CompendiumBrowser.select(foundry.utils.mergeObject({ filters }, { selection: { min: count, max: count } }, { inplace: false } ));
                    if (!result) {
                        await item.delete();
                        break;
                    }

                    const added = {};
                    for (const uuid of [...result]) {
                        const document = await fromUuid(uuid);
                        if (document === undefined) continue;
                        
                        const copies = await item.parent.createEmbeddedDocuments(`Item`, [ document.toObject() ]);
                        copies.forEach(async (x) => {
                            added[x.id] = document.id;
                            await document.update({ system: { ability: keys[`flags.suite-5e.grants.ability`] }});
                        });
                    }

                    const updates = {};
                    updates[`flags.suite-5e.grants.${item.id}`] = {
                        id: id,
                        options: [...result],
                        grants: added
                    };
                    await item.parent.update(updates);

                    Hooks.callAll(`suite-5e.grants.add`, id, item.parent, item, [...result]);
                    break;
            }
        }
    }

    async onItemRemoved(item, options) {
        if (item.parent === undefined || item.parent == null) return;

        for (const effect of item.effects) {
            const isValid = this.#isValidGrant(effect.changes, false);
            if (!isValid) continue;

            const flag = item.parent.getFlag(`suite-5e`, `grants.${item.id}`);
            if (flag === undefined) continue;

            for (const option of Object.keys(flag.grants)) {
                for (const document of item.parent.items) {
                    if (document.id !== option) continue;
                    document.delete(); break;
                }
            }

            const updates = {};
            updates[`flags.suite-5e.-=grants.${item.id}`] = null;
            await item.parent.update(updates);

            Hooks.callAll(`suite-5e.grants.rem`, flag.id, item.parent, flag.options);
        }
    }

    onActiveEffect(changes) {
        this.#isValidGrant(changes, true, true);
    }

    #isValidGrant(entries, notifyError = true, notifySuccess = false) {
        if (entries === undefined || entries == null || entries.length == 0) return false;

        var isDialog = false;
        const keys = entries.map(x => x.key);
        for (const param of this.#_requiredParams) {
            if (!keys.includes(param)) continue;
            isDialog = true; break;
        }
        for (const param of Object.keys(this.#_optionalParams)) {
            if (!keys.includes(param)) continue;
            isDialog = true; break;
        }
        if (!isDialog) return false;

        var missingParams = [];
        for (const param of this.#_requiredParams) {
            if (keys.includes(param)) continue;
            missingParams.push(param);
        }

        if (missingParams.length > 0) {
            if (notifyError) ui.notifications.error(`Unable to create grant, missing keys: ${missingParams.join(`, `)}`);
            return false;
        }

        missingParams = [];
        for (const param of Object.keys(this.#_optionalParams)) {
            if (keys.includes(param)) continue;
            missingParams.push(param);
        }

        if (missingParams.length > 0) { if (notifyError) ui.notifications.warn(`Assuming default values for grant, missing keys: ${missingParams.join(`, `)}`); }
        else if (notifySuccess) ui.notifications.info(`Grant created successfully`);
        return true;
    }

    #constructKeys(entries) {
        const keys = {};
        for (const entry of entries) {
            if (!this.#_requiredParams.includes(entry.key) && !Object.keys(this.#_optionalParams).includes(entry.key)) continue;
            keys[entry.key] = entry.value;
        }

        for (const optional of Object.keys(this.#_optionalParams)) {
            if (keys[optional] !== undefined) continue;
            keys[optional] = this.#_optionalParams[optional];
        }

        return keys;
    }

    #constructFilters(filter) {
        const additional = {};
        for (const kvp of filter.split(`&`)) {
            const parts = kvp.split(`=`);
            if (parts.length !== 2) continue;

            switch (parts[0]) {
                case `class`:
                    if (additional.spelllist === undefined) additional.spelllist = {};
                    if (additional.spelllist.class === undefined) additional.spelllist.class = {};
                    additional.spelllist.class[parts[1]] = 1;
                    break;
                case `min_level`:
                    if (additional.level === undefined) additional.level = {};
                    additional.level.min = parseInt(parts[1]);
                    break;
                case `max_level`:
                    if (additional.level === undefined) additional.level = {};
                    additional.level.max = parseInt(parts[1]);
                    break;
                case `school`:
                    if (additional.school === undefined) additional.school = {};
                    additional.school[parts[1]] = 1;
                    break;
            }
        }
        return additional;
    }
}