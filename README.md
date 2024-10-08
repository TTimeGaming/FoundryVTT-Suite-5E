# FoundryVTT Module: Suite 5E

![License](https://img.shields.io/github/license/TTimeGaming/FoundryVTT-Suite-5E?label=Software%20License&color=blue)
![Foundry](https://img.shields.io/badge/Foundry%20Version-12-purple?logo=foundryvirtualtabletop&logoColor=white)
![D&D](https://img.shields.io/badge/D%26D%20Version-4.x.x%2B-purple?logo=dungeonsanddragons&logoColor=white)
![Software](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FTTimeGaming%2FFoundryVTT-Suite-5E%2Fmaster%2Fmodule.json&label=Latest%20Version&query=$.version&colorB=green)

This is a FoundryVTT module providing an expanded suite of tools to further utilise the official [D&D 5E system](https://foundryvtt.com/packages/dnd5e).

*This module is in active development and features will be expanded on frequently. Please submit any feature requests via the [Issues](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/issues) page.*

## Major Features

### Dialog Prompts
These prompts allow users to specify prompts in various dialog windows using Active Effect keys for given hooks, such as ability checks, saving throws, skill checks, and more. These can be used to remind players of conditions that may change the roll mode (e.g. advantage on saving throws against poison), damage dice (e.g. + 1d8 if the target is undead) that cannot be automated using the tools provided by the D&D system.

![A dialog prompt added to the ability check roll dialog window](./assets/prompt-ability.png "Ability Check Roll Prompt")

![A dialog prompt added to the rest dialog window](./assets/prompt-rest.png "Rest Dialog Prompt")

### Custom Choices
These dialogs can be configured using Active Effect keys to display when an item is added to an actor's sheet and can be used in a variety of ways, but functionality will primarily need to be implemented via a module listening to the `suite-5e` hooks. Implementations are incredibly versatile, but can allow for items to provide an actor with an additional language, skill choice, proficiency with an armor or weapon, etc. The Grants feature allows for additional objects to be provided to the actor based upon the chosen option(s). The chosen option(s) can also be amended using the "Amend Option" context menu item.

![A custom choice displayed when adding an item to an actor's sheet](./assets/dialog-choice.png "Custom Choice")

### Fully-Fledged Wiki
This module has a fully-fledged [Wiki](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/wiki) providing a full list of all available features and associated Active Effect keys, where necessary, to utilise the suite to its full potential. If you believe anything is missing from the wiki, please raise it on the [Issues](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/issues) page so it can be resolved as quickly as possible.

### Planned Features
- Support for "conditional conditions" (such as Bardic Inspiration die)
- Expanded Dialogs to include proficiency and expertise, and filter lists to not include already obtained items or only include already obtained items
- Add an API function to allow other modules to register their own shortcut strings for Custom Dialogs

## Known Issues
- **Unable to append a prompt to initiative rolls** (v0.1.0)  
This issue is caused by the `dnd5e.preRollInitiative` hookEvent being fired **after** the roll dialog has been closed instead of before, as with all other rolls.  
*This has been raised as an issue on the D&D system's page and can be found [here](https://github.com/foundryvtt/dnd5e/issues/4399).*
- **Unable to remove tool proficiencies applied by Custom Dialog** (v0.2.1)   
This issue has recently been highlighted and is being looked into.
- **Unable to pre-populate displayed spell lists in Compendium Browser** (v0.4.0)
This issue is caused by the `additional` tag of the options supplied to the Compendium Browser is deleted, preventing them from being supplied when the window is being opened.  
*This has been raised as an issue on the D&D system's page and can be found [here](https://github.com/foundryvtt/dnd5e/issues/4398).*

---
This module has been built using HTML5, CSS3 and Javascript.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
