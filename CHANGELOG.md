# Changelog

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
 