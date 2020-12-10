Stay tuned for updates!

<!--
# Submitting Translations

If you have questions following these steps, please open an issue: https://github.com/TurboWarp/translations/issues

## Requirements

 * You must be fluent in both English and another language, preferably native in at least one. Taking one year of a language class in high school does not make you fluent.
 * Machine translations (Google Translate, DeepL, etc.) are not allowed.
 * No coding knowledge is necessary.
 * You must be at least 13 years old. If you're younger than that, you aren't supposed to have a GitHub account and, honestly, the quality of your translations could be questionable.

## Writing translations

First, make a fork of this repository. You can complete every step here directly from the GitHub website. You don't need to clone the repository if you don't want to.

Then, go into the `languages` folder and find the file for your language. See [languages.md](languages.md) to figure out which file to open. If you can't find your language in that list, open an issue before proceeding.

Translations are stored in YAML files that contain entries like this:

```yaml
tw.menuBar.code:
  englishMessage: Source Code
  description: Text for source code link in the Help menu
  message: null
```

`tw.menuBar.code` is the message ID. This is used internally. Do not change this.

`englishMessage` is the English translation of the message for you to reference. Do not change this.

`description` describes more about the message, where it's displayed, the context, etc. Do not change this.

`message` is the translated message. This is what you should change. `null` means that this message has not been translated into this language and the default message will be used instead (except for languages like Español Latinoamericano where it will first check Español before defaulting to English).

If `message` is null, translate it by writing the translated message here as a YAML string. For example, this is how "Turbo Mode" would be translated into Spanish:

```yaml
gui.turboMode.active:
  englishMessage: Turbo Mode
  description: Label indicating turbo mode is active
  message: Modo Turbo
```

Keep the following in mind while writing translations:

 - If the default message ends with a period, your translation should end with a period, etc.
 - If you're not 100% sure about a translation, just leave it as null. A missing translation is better than an incorrect translation.
 - If something does not need to be translated, feel free to leave it as null.
 - Don't worry too hard about YAML syntax, quotes, indentation, etc. Just focus on the translations and we can worry about the technical bits.

Commit your changes and submit a pull request to this repository.

Please enable "Allow edits from maintainers" so that we can fix minor issues without bugging you.

## Special syntax

Sometimes messages can contain variables, for example:

```yaml
tw.framerateIndicator:
  englishMessage: '{framerate} FPS'
  description: Label indicating project framerate
  message: null
```

`{framerate}` is a variable that will be replaced with something else. In this case, `{framerate}` will become a number like `60`. Make sure your translated message contains the same variable. Do not translate the name of the variable.

It's also possible that the variable is replaced with another translation, for example:

```yaml
tw.footer.host:
  englishMessage: Hosting for TurboWarp is provided by {fosshost}.
  description: Host credit
  message: null
tw.footer.host.fosshost:
  englishMessage: fosshost.org
  description: Link to fosshost.org
  message: null
```

When this happens, the variable's translation is usually directly below the primary message. In this case, `{fosshost}` will be replaced with the translation of `tw.footer.host.fosshost`. This generally only happens when a translation contains a link, for example.

-->
