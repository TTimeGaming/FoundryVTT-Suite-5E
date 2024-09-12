# FoundryVTT Module: Suite 5E

![License](https://img.shields.io/github/license/TTimeGaming/FoundryVTT-Suite-5E?label=Software%20License&color=blue)
![FoundryVTT Version](https://img.shields.io/badge/Foundry%20Version-12%2B%20%28Verified%2012.331%29-purple?logo=foundryvirtualtabletop&logoColor=white)
![D&D Version](https://img.shields.io/badge/D%26D%20Version-3.x.x%2B%20%28Verified%204.0.0%29-purple?logo=dungeonsanddragons&logoColor=white)
![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FTTimeGaming%2FFoundryVTT-Suite-5E%2Fmaster%2Fmodule.json&label=Latest%20Version&query=$.version&colorB=green)

This is a FoundryVTT module providing an expanded suite of tools to further utilise the official [D&D 5E system](https://foundryvtt.com/packages/dnd5e).

*This module is in active development and features will be expanded on frequently. Please submit any feature requests via the [Issues](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/issues) page.*

## Major Features

### Roll Prompts
These prompts allow users to specify prompts in the roll dialog windows using Active Effect keys for given hooks, such as ability checks, saving throws, skill checks, and more. These can be used to remind players of conditions that may change the roll mode (e.g. advantage on saving throws against poison), damage dice (e.g. + 1d8 if the target is undead) that cannot be automated using the tools provided by the D&D system.

![A roll prompt added to the ability check roll dialog window](./assets/prompts/ability-check.png "Ability Check Roll Prompt")

### Custom Dialogs
These dialogs can be configured using Active Effect keys to display when an item is added to an actor's sheet and can be used in a variety of ways, but functionality will primarily need to be implemented via a module listening to the `suite-5e` hooks. Implementations are incredibly versatile, but can allow for items to provide an actor with an additional language, skill choice, proficiency with an armor or weapon, etc. The chosen option can also be amended using the "Amend Option" context menu item.

![A custom dialog displayed when adding an item to an actor's sheet](./assets/dialogs/custom-dialog.png "Custom Dialog")

### Fully-Fledged Wiki
This module has a fully-fledged [Wiki](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/wiki) providing a full list of all available features and associated Active Effect keys, where necessary, to utilise the suite to its full potential. If you believe anything is missing from the wiki, please raise it on the [Issues](https://github.com/TTimeGaming/FoundryVTT-Suite-5E/issues) page so it can be resolved as quickly as possible.

### Planned Features
- Roll Prompts to identify the source of the prompt (e.g. `This is an <b>example</b> prompt. (<i>Example Feature</i>)`)
- Roll Prompt values to be converted from Strings to Sets to allow multiple prompts per roll  
***(This will be a breaking change as Active Effect Change Modes will need to be amended from `Override` to `Add`)***
- Grants to be implemented, and fully compatible with Custom Dialogs, to allow player's to choose items (similar to the D&D 5E Choose Items advancement).

## Known Issues
- **Unable to append a prompt to initiative rolls** (v0.1.0)  
This issue is caused by the `dnd5e.preRollInitiative` hookEvent being fired **after** the roll dialog has been closed instead of before, as with all other rolls.
- **Unable to remove tool proficiencies applied by Custom Dialog** (v0.2.1)   
This issue has recently been highlighted and is being looked into.

---
This module has been built using HTML5, CSS3 and Javascript.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
