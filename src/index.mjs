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

$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $(`<span>`).hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css(`font`, font || this.css(`font`));
    return $.fn.textWidth.fakeEl.width();
};