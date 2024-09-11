# Changelog

## Version 0.2.2
- Amended all `suite-5e.custom-dialog` references to `suite-5e.dialog` for clarity and efficiency

## Version 0.2.1
- Added automatic hooks for Custom Dialogs using the `flags.suite-5e.dialog.id` field:
    - `suite-5e.armor` Used to automatically add and remove custom armor proficienxies
    - `suite-5e.weapon` Used to automatically add and remove custom weapon proficienxies
    - `suite-5e.tool` Used to automatically add and remove custom tool proficienxies
    - `suite-5e.language` Used to automatically add and remove custom known languages
    - `suite-5e.save` Used to automatically add and remove custom saving throw proficienxies
    - `suite-5e.skill` Used to automatically add and remove custom skill proficienxies
- `suite-5e.custom-dialog.add` and `suite-5e.custom-dialog.rem` hook events now receive the relevant actor as an argument
- Fixed missing languages in the `suite-5e.dialog.languages` keys

## Version 0.2.0
- Added support for Custom Dialogs to be configured via Active Effect keys
    - Dialogs can be configured with the following keys:
        - `flags.suite-5e.dialog.id` (required)  
        Passed to the `suite-5e.custom-dialog.add` and `suite-5e.custom-dialog.rem` hook events for proper identification of dialogs
        - `flags.suite-5e.dialog.options` (required)  
        A comma-separated list of options to select from in the dialog window
        - `flags.suite-5e.dialog.title` (optional)  
        Displayed in the title bar of the opened dialog window (defaults to "Custom Dialog")
        - `flags.suite-5e.dialog.message` (optional)  
        Displayed above the option picker in the dialog window (defaults to an empty string)
        - `flags.suite-5e.dialog.count` (optional)  
        The number of options that can be selected (defaults to 1)
    - Hook events are fired when options are added, removed or changed via the `suite-5e.custom-dialog.add` and `suite-5e.custom-dialog.rem` hook events

## Version 0.1.1
- Added backwards compatibility for D&D v3.x.x
    - Verified version remains as D&D v4.0.0 as development conducted against this pre-release

## Version 0.1.0
- Added support for custom Roll Prompts for the following roll dialogs:
    - Ability Checks
    - Saving Throws
    - Concentration Checks
    - Skill Checks
    - Attack Rolls
- Outlined required hooks for Custom Dialogs to be implemented in a future update
 