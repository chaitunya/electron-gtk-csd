# electron-gtk-csd

This is an in-progress nodejs module that makes it easier for electron app developers to integrate client-side decorations onto Linux electron apps. This module automatically changes the window button layout based on GSettings.

The CSS and window button icons currently need to be provided by the app developer, but I may add support to automatically imitate the window buttons of the user's GTK theme.

To test it out:
```bash
npm install
npm run-script demo
```
