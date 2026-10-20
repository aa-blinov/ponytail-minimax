# Screenshots

This repository carries no screenshots.

The plugin has no interface to photograph. What a user sees is text that the
agent's runtime prints inside a session, and that text belongs to the
runtime's window. A picture of a session would be a picture of MiniMax Code
and of whoever happened to be using it, and it would say nothing about the
plugin.

The two images in the repository are not screenshots. `icon.png` and
`icon-dark.png` are the plugin icons, 256 by 256 pixels, and the manifest
points at them with `icon` and `darkIcon`. The runtime draws them in the
plugin list, on the marketplace card and in the settings, and it decides the
size and the placement. `DESIGN.md` records the drawing: three capsules on
a flat ground, 28 pixels tall, on a 40 pixel pitch, with one accent bar.

The house-style checker verifies that every image reference resolves to a
file that exists, so a renamed icon cannot quietly break the manifest.
