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

// v3.x.x
Hooks.on(`dnd5e.preRollAttack`, function(roll, dialog, message) {
    prompts.onRollDialog(`attack`, game.actors.find(x => x.id === message.data.speaker.actor), undefined, message.data.flags.dnd5e.item?.type ?? `none`);
});

Hooks.on(`dnd5e.preRollDamage`, function(roll, dialog, message) {
    prompts.onRollDialog(`damage`, game.actors.find(x => x.id === message.data.speaker.actor), undefined, message.data.flags.dnd5e.item?.type ?? `none`);
});

// v4.x.x
Hooks.on(`dnd5e.preRollAttackV2`, function(roll, dialog, message) {
    prompts.onRollDialog(`attack`, game.actors.find(x => x.id === message.data.speaker.actor), undefined, message.data.flags.dnd5e.item?.type ?? `none`);
});

Hooks.on(`dnd5e.preRollDamageV2`, function(roll, dialog, message) {
    prompts.onRollDialog(`damage`, game.actors.find(x => x.id === message.data.speaker.actor), undefined, message.data.flags.dnd5e.item?.type ?? `none`);
});

Hooks.on(`dnd5e.preShortRest`, function(actor, rest) {
    prompts.onRollDialog(`rest`, actor, `Short Rest`, rest.type);
});

Hooks.on(`dnd5e.preLongRest`, function(actor, rest) {
    prompts.onRollDialog(`rest`, actor, `Long Rest`, rest.type);
});

Hooks.on(`dnd5e.preRollInitiative`, function(actor, roll) {
    prompts.onRollDialog(`initiative`, actor, `Initiative`);
});

Hooks.on(`dnd5e.preRollDeathSave`, function(actor, rollData) {
    prompts.onRollDialog(`death`, actor, rollData.title);
});

Hooks.on(`renderDialog`, function(application, html, content) {
    prompts.onRenderDialog(application.data.title, html);
});

Hooks.on(`createActor`, async function(actor, options, userId) {
    await prompts.prepareActorFlags(actor);
});

Hooks.on(`renderActorSheet5e`, async function(app, html, options) {
    await prompts.prepareActorFlags(options.actor);
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
    dialogs.onDialogAdd(id, actor, options);
});

Hooks.on(`suite-5e.dialog.rem`, async function(id, actor, options) {
    dialogs.onDialogRem(id, actor, options);
});

$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $(`<span>`).hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css(`font`, font || this.css(`font`));
    return $.fn.textWidth.fakeEl.width();
};
