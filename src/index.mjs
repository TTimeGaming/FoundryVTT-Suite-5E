import { Prompts } from './prompts.mjs';
import { Dialogs } from './dialogs.mjs';

const prompts = new Prompts();
const dialogs = new Dialogs();

Hooks.once(`init`, function() {
    console.log(`suite-5e | Initializing Suite 5E module!`);
});

Hooks.on(`dnd5e.preRollAbilityTest`, function(actor, rollData, abilityKey) {
    prompts.onRollDialog(`check`, actor, rollData.title, abilityKey);
});

Hooks.on(`dnd5e.preRollAbilitySave`, function(actor, rollData, abilityKey) {
    prompts.onRollDialog(rollData.isConcentration !== undefined && rollData.isConcentration ? `concentration` : `save`, actor, rollData.title, abilityKey);
});

Hooks.on(`dnd5e.preRollSkill`, function(actor, rollData, skillKey) {
    prompts.onRollDialog(`skill`, actor, rollData.title, skillKey);
});

// Used by dnd5e v3.x.x
Hooks.on(`dnd5e.preRollAttack`, function(roll, dialog, message) {
    prompts.onRollDialog(`attack`, game.actors.find(x => x.id === message.data.speaker.actor), undefined);
});

// Used by dnd5e v4.x.x
Hooks.on(`dnd5e.preRollAttackV2`, function(roll, dialog, message) {
    prompts.onRollDialog(`attack`, game.actors.find(x => x.id === message.data.speaker.actor), undefined);
});

Hooks.on(`renderDialog`, function(application, html, content) {
    prompts.onRenderDialog(application.data.title, html);
});

Hooks.on(`createItem`, function(item, options, userId) {
    dialogs.onItemAdded(item, options);
});

Hooks.on(`deleteItem`, function(item, options, userId) {
    dialogs.onItemRemoved(item, options);
});

Hooks.on(`dnd5e.getItemContextOptions`, function(item, menu) {
    dialogs.onItemContext(item, menu);
});

Hooks.on(`closeActiveEffectConfig`, function(app, html) {
    dialogs.onActiveEffect(app?.object?.changes ?? []);
});

Hooks.on(`suite-5e.dialog.add`, async function(id, actor, options) {
    switch (id) {
        case `suite-5e.dialog`:
            ui.notifications.info(`Custom Dialog '${id}' added options: ${options.join(`, `)}`);
            break;
        case `suite-5e.armor`:
            const armors = actor.system.traits.armorProf.value;
            options.forEach(x => armors.add(x));
            await actor.update({ 'system.traits.armorProf.value': armors });
            break;
        case `suite-5e.weapon`:
            const weapons = actor.system.traits.weaponProf.value;
            options.forEach(x => weapons.add(x));
            await actor.update({ 'system.traits.armorProf.value': weapons });
            break;
        case `suite-5e.tool`:
            const tools = actor.system.tools;
            options.forEach(x => tools[x] = { value: 1 });
            await actor.update({ 'system.tools': tools });
            break;
        case `suite-5e.language`:
            const languages = actor.system.traits.languages.value;
            options.forEach(x => languages.add(x));
            await actor.update({ 'system.traits.languages.value': languages });
            break;
        case `suite-5e.save`:
            const saveUpdates = {};
            options.forEach(x => saveUpdates[`system.abilities.${x}.proficient`] = 1);
            await actor.update(saveUpdates);
            break;
        case `suite-5e.skill`:
            const skillUpdates = {};
            options.forEach(x => skillUpdates[`system.skills.${x}.value`] = 1);
            await actor.update(skillUpdates);
            break;
    }
});

Hooks.on(`suite-5e.dialog.rem`, async function(id, actor, options) {
    switch (id) {
        case `suite-5e.dialog`:
            ui.notifications.info(`Custom Dialog '${id}' removed options: ${options.join(`, `)}`);
            break;
        case `suite-5e.armor`:
            const armors = actor.system.traits.armorProf.value;
            options.forEach(x => armors.delete(x));
            await actor.update({ 'system.traits.armorProf.value': armors });
            break;
        case `suite-5e.weapon`:
            const weapons = actor.system.traits.weaponProf.value;
            options.forEach(x => weapons.delete(x));
            await actor.update({ 'system.traits.armorProf.value': weapons });
            break;
        case `suite-5e.tool`:
            const filteredTools = Object.keys(actor.system.tools).filter(key => !options.includes(key));
            const tools = filteredTools.length > 0 ? filteredTools.reduce((obj, key) => { obj[key] = actor.system.tools[key]; return obj; }) : {};
            await actor.update({ 'system.tools': tools });
            break;
        case `suite-5e.language`:
            const languages = actor.system.traits.languages.value;
            options.forEach(x => languages.delete(x));
            await actor.update({ 'system.traits.languages.value': languages });
            break;
        case `suite-5e.save`:
            const saveUpdates = {};
            options.forEach(x => saveUpdates[`system.abilities.${x}.proficient`] = 0);
            await actor.update(saveUpdates);
            break;
        case `suite-5e.skill`:
            const skillUpdates = {};
            options.forEach(x => skillUpdates[`system.skills.${x}.value`] = 0);
            await actor.update(skillUpdates);
            break;
    }
});

$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $(`<span>`).hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css(`font`, font || this.css(`font`));
    return $.fn.textWidth.fakeEl.width();
};