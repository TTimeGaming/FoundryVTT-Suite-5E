export class Dialogs {
    #_requiredParams = [ `flags.suite-5e.dialog.id`, `flags.suite-5e.dialog.options` ];
    #_optionalParams = [ `flags.suite-5e.dialog.title`, `flags.suite-5e.dialog.message`, `flags.suite-5e.dialog.count` ];
    #_optionalValues = {
        'flags.suite-5e.dialog.title': `Custom Dialog`,
        'flags.suite-5e.dialog.message': ``,
        'flags.suite-5e.dialog.count': 1
    };

    onItemAdded(item, options) {
        if (item.parent === undefined || item.parent == null) return;

        for (const effect of item.effects) {
            const isValid = this.#isValidDialog(effect.changes);
            if (!isValid) continue;

            this.#openDialog(effect.changes, [],
                async(picker, id) => {
                    const updates = {};
                    updates[`flags.suite-5e.dialog.${item.id}`] = {
                        id: id,
                        options: picker.getSelected()
                    };
                    await item.parent.update(updates);

                    Hooks.callAll(`suite-5e.dialog.add`, id, item.parent, picker.getSelected());
                },
                async() => item.delete()
            );
        }
    }

    async onItemRemoved(item, options) {
        if (item.parent === undefined || item.parent == null) return;

        for (const effect of item.effects) {
            const isValid = this.#isValidDialog(effect.changes, false);
            if (!isValid) continue;

            const flag = item.parent.getFlag(`suite-5e`, `dialog.${item.id}`);
            if (flag === undefined) continue;

            const updates = {};
            updates[`flags.suite-5e.-=dialog.${item.id}`] = null;
            await item.parent.update(updates);

            Hooks.callAll(`suite-5e.dialog.rem`, flag.id, item.parent, flag.options);
        }
    }

    onItemContext(item, menu) {
        for (const effect of item.effects) {
            const isValid = this.#isValidDialog(effect.changes, false);
            if (!isValid) continue;

            menu.push({
                name: `suite-5e.contextmenu.choice`,
                icon: `<i class="fas fa-question fa-fw"></i>`,
                group: `state`,
                condition: () => item.isOwner,
                callback: (li) => {
                    const oldOptions = item.parent.getFlag(`suite-5e`, `dialog.${item.id}`)?.options ?? [];

                    this.#openDialog(effect.changes, oldOptions,
                        async(picker, id) => {
                            const newOptions = picker.getSelected();

                            const updates = {};
                            updates[`flags.suite-5e.dialog.${item.id}`] = {
                                id: id,
                                options: newOptions
                            };
                            await item.parent.update(updates);

                            const removed = oldOptions.filter(x => !newOptions.includes(x));
                            const added = newOptions.filter(x => !oldOptions.includes(x));

                            if (removed.length > 0) Hooks.callAll(`suite-5e.dialog.rem`, id, item.parent, removed);
                            if (added.length > 0) Hooks.callAll(`suite-5e.dialog.add`, id, item.parent, added);
                        },
                        async() => { /* make no changes */ }
                    );
                }
            });
        }
    }

    onActiveEffect(changes) {
        this.#isValidDialog(changes, true, true);
    }

    #openDialog(changes, existingOptions, successCallback, failureCallback) {
        const keys = this.#constructKeys(changes);
        const picker = OptionPicker.fromString(keys[`flags.suite-5e.dialog.options`], existingOptions, keys[`flags.suite-5e.dialog.count`], (count) => {
        });

        var success = false;
        const dialog = new Dialog({
            title: keys[`flags.suite-5e.dialog.title`],
            content: ``,
            buttons: {
                submit: { icon: `<i class="fas fa-check"></i>`, label: `Submit`, callback: () => success = true },
                cancel: { icon: `<i class="fas fa-times"></i>`, label: `Cancel`, callback: () => success = false }
            },
            default: `submit`,
            render: (html) => {
                const message = keys[`flags.suite-5e.dialog.message`];
                if (message !== ``) $(html).first().append($(`<p>${message}</p>`));
                $(html).first().append(picker.create());
            },
            close: async(html) => {
                if (!success) {
                    await failureCallback();
                    return;
                }
                await successCallback(picker, keys[`flags.suite-5e.dialog.id`]);
            }
        });
        dialog.render(true);
    }

    #isValidDialog(entries, notifyError = true, notifySuccess = false) {
        if (entries === undefined || entries == null || entries.length == 0) return false;

        var isDialog = false;
        const keys = entries.map(x => x.key);
        for (const param of this.#_requiredParams) {
            if (!keys.includes(param)) continue;
            isDialog = true; break;
        }
        for (const param of this.#_optionalParams) {
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
            if (notifyError) ui.notifications.error(`Unable to create custom dialog, missing keys: ${missingParams.join(`, `)}`);
            return false;
        }

        missingParams = [];
        for (const param of this.#_optionalParams) {
            if (keys.includes(param)) continue;
            missingParams.push(param);
        }

        if (missingParams.length > 0) { if (notifyError) ui.notifications.warn(`Assuming default values for custom dialog, missing keys: ${missingParams.join(`, `)}`); }
        else if (notifySuccess) ui.notifications.info(`Custom dialog created successfully`);
        return true;
    }

    #constructKeys(entries) {
        const keys = {};
        for (const entry of entries) {
            if (!this.#_requiredParams.includes(entry.key) && !this.#_optionalParams.includes(entry.key)) continue;
            keys[entry.key] = entry.value;
        }

        for (const optional of this.#_optionalParams) {
            if (keys[optional] !== undefined) continue;
            keys[optional] = this.#_optionalValues[optional];
        }

        return keys;
    }
}

class OptionPicker {
    static #SWAPPABLE_VALUES = {
        'suite-5e.dialog.armors.light': `leather[Leather],padded[Padded],studded[Studded Leather]`,
        'suite-5e.dialog.armors.medium': `breastplate[Breastplate],chainshirt[Chain Shirt],halfplate[Half Plate],hide[Hide],scalemail[Scale Mail]`,
        'suite-5e.dialog.armors.heavy': `chainmail[Chain Mail],plate[Plate],ringmail[Ring Mail],splint[Splint]`,
        'suite-5e.dialog.armors.shields': `shield[Shield]`,
        'suite-5e.dialog.armors.all': `suite-5e.dialog.armors.light{light},suite-5e.dialog.armors.medium{medium},suite-5e.dialog.armors.heavy{heavy},suite-5e.dialog.armors.shields{shields}`,
        'suite-5e.dialog.armors.group': `lgt[Light],med[Medium],hvy[Heavy],shl[Shield]`,

        'suite-5e.dialog.weapons.simple': `club[Club],dagger[Dagger],dart[Dart],greatclub[Greatclub],handaxe[Handaxe],javelin[Javelin],lightcrossbow[Light Crossbow],lighthammer[Light Hammer],mace[Mace],quarterstaff[Quarterstaff],shortbow[Shortbow],sickle[Sickle],sling[Sling],spear[Spear]`,
        'suite-5e.dialog.weapons.martial': `battleaxe[Battleaxe],blowgun[Blowgun],flail[Flail],glaive[Glaive],greataxe[Greataxe],greatsword[Greatsword],halberd[Halberd],handcrossbow[Hand Crossbow],heavycrossbow[Heavy Crossbow],lance[Lance],longbow[Longbow],longsword[Longsword],maul[Maul],morningstar[Morningstar],net[Net],pike[Pike],rapier[Rapier],scimitar[Scimitar],shortsword[Shortsword],trident[Trident],warpick[War Pick],warhammer[Warhammer],whip[Whip]`,
        'suite-5e.dialog.weapons.all': `suite-5e.dialog.weapons.simple{simple},suite-5e.dialog.weapons.martial{martial}`,
        'suite-5e.dialog.weapons.group': `sim[Simple],mar[Martial]`,

        'suite-5e.dialog.tools.artisan': `alchemist[Alchemist's Supplies],brewer[Brewer's Supplies],calligrapher[Calligrapher's Supplies],carpenter[Carpenter's Tools],cartographer[Cartographer's Tools],cobbler[Cobbler's Tools],cook[Cook's Utensils],glassblower[Glassblower's Tools],jeweler[Jeweler's Tools],leatherworker[Leatherworker's Tools],mason[Mason's Tools],painter[Painter's Supplies],potter[Potter's Tools],smith[Smith's Tools],tinker[Tinker's Tools],weaver[Weaver's Tools],woodcarver[Woodcarver's Tools]`,
        'suite-5e.dialog.tools.gaming': `card[Playing Card Set],chess[Chess Set],dice[Dice Set]`,
        'suite-5e.dialog.tools.musical': `bagpipes[Bagpipes],drum[Drum],dulcimer[Dulcimer],flute[Flute],horn[Horn],lute[Lute],lyre[Lyre],panflute[Pan Flute],shawm[Shawm],viol[Viol]`,
        'suite-5e.dialog.tools.other': `disg[Disguise Kit],forg[Forgery Kit],herb[Herbalism Kit],navg[Navigator's Tools],pois[Poisoner's Kit],thief[Thieves' Tools]`,
        'suite-5e.dialog.tools.all': `suite-5e.dialog.tools.artisan{artisan},suite-5e.dialog.tools.gaming{gaming},suite-5e.dialog.tools.musical{musical},suite-5e.dialog.tools.other{other}`,

        'suite-5e.dialog.languages.standard': `common[Common],dwarvish[Dwarvish],elvish[Elvish],giant[Giant],gnomish[Gnomish],goblin[Goblin],halfling[Halfling],orc[Orc]`,
        'suite-5e.dialog.languages.exotic': `aarakocra[Aarakocra],abyssal[Abyssal],celestial[Celestial],deep[Deep Speech],draconic[Draconic],gith[Gith],gnoll[Gnoll],infernal[Infernal],primordial[Primordial],aquan[Aquan]{primordial},auran[Auran]{primordial},ignan[Ignan]{primordial},terran[Terran]{primordial},sylvan[Sylvan],undercommon[Undercommon]`,
        'suite-5e.dialog.languages.secret': `druidic[Druidic],cant[Thieves' Cant]`,
        'suite-5e.dialog.languages.all': `suite-5e.dialog.languages.standard{standard},suite-5e.dialog.languages.exotic{exotic},suite-5e.dialog.languages.secret{secret}`,

        'suite-5e.dialog.abilities': `str[Strength],dex[Dexterity],con[Constitution],int[Intelligence],wis[Wisdom],cha[Charisma],san[Sanity],hon[Honor]`,
        'suite-5e.dialog.skills': `acr[Acrobatics],ani[Animal Handling],arc[Arcana],ath[Athletics],dec[Deception],his[History],ins[Insight],itm[Intimidation],inv[Investigation],med[Medicine],nat[Nature],prc[Perception],prf[Performance],per[Persuasion],rel[Religion],slt[Sleight of Hand],ste[Stealth],sur[Survival]`,
    };

    #availableGroupings;
    #maxSelections;
    #changeCallback;
    #cachedLabels;
    #selectedOptions;

    /**
     * This constructor should only be used internally.
     * Please use {@link OptionPicker.fromString} or {@link OptionPicker.fromList} for proper instantiation.
     * @param {any} availableGroupings The configured groupings for the dialog.
     * @param {string[]} existingOptions A list of pre-existing selected items.
     * @param {number} maxSelections The maximum number of selections permitted.
     * @param {Function} changeCallback 
     */
    constructor(availableGroupings, existingOptions, maxSelections = 1, changeCallback = undefined) {
        this.#availableGroupings = availableGroupings;
        this.#maxSelections = maxSelections;
        this.#selectedOptions = new Set();
        for (const option of existingOptions) {
            this.#selectedOptions.add(option);
        }
        this.#changeCallback = changeCallback;
        this.#cachedLabels = {};

        const iterator = (obj) => {
            Object.keys(obj).forEach(key => {
                if (obj[key].children !== undefined) {
                    this.#cachedLabels[key] = obj[key].label;
                }

                if (typeof obj[key] === `object` && obj[key] !== null) {
                    iterator(obj[key]);
                }
            });
        };
        iterator(availableGroupings);
        changeCallback?.(0);
    }

    /**
     * Create a CustomDialog from a comma-separated string.
     * @param {string} options A comma-separated string, with each entry in the format <key>[<label>]{<group>}.
     * @param {string[]} existingOptions A list of pre-existing selected items. 
     * @param {number} maxSelections The maximum number of selections permitted.
     * @param {Function} changeCallback 
     * @returns
     */
    static fromString(options, existingOptions, maxSelections = 1, changeCallback = undefined) {
        const optionList = this.#flattenOptions(options.split(`,`));

        const groupings = {};
        for (const option of optionList) {
            const key = (/^[^\[]*/g.exec((/^[^\{]*/g.exec(option) ?? [ option ])[0]) ?? [ option ])[0];
            const label = option.includes(`[`) ? ((/\[([^}]+)\]/g.exec(option) ?? [ option ])[0].replace(`[`, ``).replace(`]`, ``)) : key;
            const group = option.includes(`{`) ? (/{([^}]+)}/g.exec(option) ?? [ option ])[0].replace(`{`, ``).replace(`}`, ``) : `none`;

            if (groupings[group] === undefined) groupings[group] = {};
            groupings[group][key] = { label: label, children: {} };
        }
        this.#flattenGroupings(groupings);
        return this.fromList(groupings, existingOptions, maxSelections, changeCallback);
    }

    /**
     * Create a CustomDialog from a list of options.
     * @param {{ key: string, label?: string?, group?: string? }[]} options The list of options available to be selected.
     * @param {string[]} existingOptions A list of pre-existing selected items. 
     * @param {number} maxSelections The maximum number of selections permitted.
     * @param {Function} changeCallback 
    * @returns
     */
    static fromList(options, existingOptions, maxSelections = 1, changeCallback = undefined) {
        return new OptionPicker(options, existingOptions, maxSelections, changeCallback);
    }

    create() {
        return this.#buildList();
    }

    getSelected() {
        return [...this.#selectedOptions];
    }
   
    static #flattenGroupings(groupings) {
        const topLevel = [];
        const childLevel = [];
        const updates = [];

        for (const groupKey of Object.keys(groupings)) {
            topLevel.push(groupKey);

            for (const childKey of Object.keys(groupings[groupKey])) {
                childLevel.push({ key: childKey, parent: groupKey });
            }
        }

        var refreshNeeded = false;
        for (const child of childLevel) {
            if (!topLevel.includes(child.key)) continue;

            groupings[child.parent][child.key].children = groupings[child.key];
            updates.push(child.key);
            refreshNeeded = true;
        }

        for (const update of updates) {
            delete groupings[update];
        }

        if (refreshNeeded) this.#flattenGroupings(groupings);
    }

    static #flattenOptions(options) {
        var refreshNeeded = false;

        const newOptions = [];
        for (var i = 0; i < options.length; i++) {
            var option = options[i];

            var key = `${((/^[^\]]*/g.exec((/^[^\{]*/g.exec(option) ?? [ option ])[0]) ?? [ option ])[0])}${option.includes(`[`) ? `]` : ``}`;
            var group = option.includes(`{`) ? (/{([^}]+)}/g.exec(option) ?? [ option ])[0].replace(`{`, ``).replace(`}`, ``) : `none`;

            while (Object.keys(this.#SWAPPABLE_VALUES).includes(key)) {
                key = this.#SWAPPABLE_VALUES[key];
                refreshNeeded |= true;
            }

            newOptions.push(...key.split(`,`).map(x => group !== `none` ? `${x}{${group}}` : x));
        }
        return refreshNeeded ? this.#flattenOptions(newOptions) : newOptions;
    }

    #buildList() {
        const form = this.#getOrCreateElement(`#suite5e-form`, $(`<form id="suite5e-form" autocomplete="off"></form>`));
        form.empty();

        const ol = this.#getOrCreateElement(`#suite5e-slots`, $(`<ol id="suite5e-slots"></ol>`).appendTo(form));
        ol.empty();

        for (const option of this.#selectedOptions) {
            this.#createItem(option, ol);
        }
       
        this.#createSelect(ol);
        return form;
    }

    #createSelect(parent) {
        const remaining = this.#maxSelections - this.#selectedOptions.size;
        if (remaining < 1) return;

        const li = $(`<li class="flexrow"></li>`);
        const select = $(`<select name="choices"></select>`);
        li.append(select);

        select.append($(`<option value="_selector">Choose ${remaining} more option${remaining != 1 ? `s` : ``}</option>`));
        for (const groupKey of Object.keys(this.#availableGroupings)) {
            if (groupKey === `none`) continue;
            this.#buildGroup(groupKey, this.#availableGroupings[groupKey], select);
        }
        this.#buildGroup(undefined, this.#availableGroupings.none, select);

        select.on(`change`, () => {
            this.#selectedOptions.add(select.find(`:selected`).val());
            this.#changeCallback?.(this.#selectedOptions.size);
            this.#buildList();
        });

        parent.append(li);
    }

    #buildGroup(groupKey, group, parent, depth = 0) {
        if (group === undefined) return;

        var target = parent;
        if (groupKey !== undefined) {
            const optgroup = $(`<optgroup label="${`\>`.repeat(depth + 1)} ${groupKey}"></optgroup>`);
            parent.append(optgroup);
            target = optgroup;
        }

        for (const childKey of Object.keys(group)) {
            const child = group[childKey];
            const childCount = Object.keys(child.children ?? {}).length;
            if (childCount > 0) {
                this.#buildGroup(childKey, child.children, parent, depth + 1);
                continue;
            }

            if (this.#selectedOptions.has(childKey)) continue;
            target.append($(`<option value="${childKey}">${groupKey !== undefined ? `\>` : ``}${`\>`.repeat(depth + 1)} ${child.label}</option>`));
        }

        return target;
    }

    #createItem(key, parent) {
        const li = $(`<li data-key="${key}" class="flexrow"></li>`);

        const label = $(`<label class="flexrow">${this.#cachedLabels[key]}</label>`);
        li.append(label);

        const a = $(`<a><i class="fa fa-trash"></i></a>`);
        a.on(`click`, () => {
            this.#selectedOptions.delete(key);
            this.#changeCallback?.(this.#selectedOptions.size);
            this.#buildList();
        });
        li.append(a);

        parent.append(li);
    }

    #getOrCreateElement(selector, creator) {
        var element = $(selector);
        if (!element.length) {
            element = creator;
        }
        return element;
    }
}