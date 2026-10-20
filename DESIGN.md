---
name: ponytail-minimax
description: A MiniMax Code plugin with no interface of its own; the icon pair is the whole visual identity.
colors:
  primary: "#1c1917"
  neutral-bg: "#f4f3f1"
  accent: "#d97706"
  dark-bg: "#18181b"
  dark-accent: "#fbbf24"
typography:
  body:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "runtime default"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "runtime default"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  bar: "14px"
spacing:
  bar-gap: "12px"
  bar-pitch: "40px"
  margin: "53px"
---

# Design system: ponytail-minimax

## Overview

**Creative North Star: "three lines of a diff"**

This plugin draws nothing. It is three Node.js scripts, a manifest, a hooks
file and six Markdown skill files, and everything a user sees is text that
the agent's runtime prints inside a session. There is no window, no
component, no stylesheet and no font in this repository.

The one piece of visual design the plugin owns is its icon. The runtime shows
it in the plugin list, on the marketplace card and in the settings, and the
runtime decides how large it is and where it sits. What the repository owns
is the picture: 256 by 256 pixels, three rounded bars, and the two
backgrounds the runtime picks between.

The rest of the surface is text. The ruleset that gets injected into a
session is Markdown, and it is rendered by whatever the user's terminal or
editor renders Markdown with. The plugin's own constraint on that text is
its content rather than its styling: short sentences, a reply a busy person
reads in one pass, and the name of what was skipped at the end.

Confirmed rejections: no colours of its own in the interface, no fonts, no
icons beyond the pair, no light and dark variants of anything else, and no
layout that the runtime would have to honour.

Key characteristics:

- two flat icons, one light and one dark, both the same drawing;
- no shadow, no gradient, no outline;
- one accent colour, used once per icon, on the shortest bar;
- everything else is the runtime's.

## Colors

Five values, all measured out of the two PNG files. There is no colour in
the plugin's own surface.

### Primary

- **Ink** (`#1c1917`): the two long bars of the light icon, and the
  background of the dark icon's counterpart. A near-black with a warm cast.
- **Paper** (`#f4f3f1`): the background of the light icon and the bars of
  the dark one. A warm off-white rather than pure white, so the icon does
  not glare on a light panel.

### Secondary

- **Amber** (`#d97706`): the short bar of the light icon. The only colour
  in the drawing besides the two neutrals.
- **Amber light** (`#fbbf24`): the same bar in the dark icon, lightened so
  it holds against the dark ground.

### Neutral

- **Ground** (`#18181b`): the background of the dark icon. A cool near-black,
  so the dark pair reads as the inversion of the light pair rather than as
  a dimmed copy of it.

### Named rules

**The One Accent Rule.** Amber appears once in each icon, on the shortest
bar. A second coloured bar would say something the plugin does not.

**The Two Themes Rule.** The light and the dark icon are the same drawing
with the paper and the ink exchanged, and the accent swapped for its lighter
counterpart. Nothing else differs between them.

## Typography

**Display Font:** the runtime's.
**Body Font:** the runtime's.

No font file is in this repository. The ruleset is Markdown and is rendered
by the runtime in the user's terminal or editor, so the family, the size and
the measure belong to that program.

The plugin controls one thing about that text, and it controls its shape:

- **Sentence length.** The ruleset asks for short sentences, and the level
  table asks for a reply a busy person reads in one pass.
- **The last line.** Every reply ends with one or two lines naming what was
  skipped and what risk the user has to know. That is the only place the
  plugin has a formatting rule of its own.
- **The level table.** The ruleset's level table is a real Markdown table,
  with the level name in bold and the behaviour in plain text.

The runtime's default is a monospace stack, and the plugin's own text is
written for it: short lines, no wide tables, no nested indentation.

## Layout

The icon is drawn on a 256 by 256 canvas, and the grid is the same in both
themes.

- The three bars start at x = 53 and end at x = 202, x = 154 and x = 106.
  Their widths are 150, 102 and 54 pixels, so each bar is 48 pixels shorter
  than the one above it.
- Every bar is 28 pixels tall. Their tops are at y = 74, 114 and 154, a
  pitch of 40 pixels and a gap of 12.
- The block of bars is 108 pixels tall and sits between y = 74 and y = 181,
  which leaves 74 pixels above and 75 below.
- The whole drawing is left-aligned. The right edge is the only edge that
  steps, and it steps by the same 48 pixels each time.

Below the icon, the plugin's layout is a file tree and nothing else: the
manifest names the skills by path, the hooks file names the scripts by path,
and the runtime draws the tree.

## Elevation & Depth

None. Both icons are flat fills on a flat ground: no shadow, no gradient, no
bevel, no outline, and no transparency. A shadow on a 256 pixel square at
the size the runtime draws it would turn to mush.

## Shapes

One shape: a bar with fully rounded ends. The corner radius is 14 pixels,
which is half the 28 pixel height, so the ends are semicircles and the bar
is a capsule.

The ground is a square with square corners, 256 by 256. Nothing in the
drawing is a circle on its own, and no other radius appears.

## Components

### Plugin icon

- **Shape:** 256 by 256 square, square corners, three capsules.
- **Light:** ground `#f4f3f1`, bars `#1c1917`, short bar `#d97706`.
- **Dark:** ground `#18181b`, bars `#f4f3f1`, short bar `#fbbf24`.
- **Naming:** `icon.png` for the light surface and `icon-dark.png` for the
  dark one. The manifest points at them with `icon` and `darkIcon`.

### Ruleset

- **Shape:** Markdown, no wrapper.
- **Size:** the body of `skills/ponytail/SKILL.md` with the YAML
  frontmatter removed, capped at 65536 characters. The file is 3027
  characters today.
- **Presentation:** printed as `hookSpecificOutput.additionalContext` when
  a session or a delegated task starts.

### Commands

- **Shape:** one slash command with an argument.
- **Forms:** `/ponytail`, `/ponytail lite`, `/ponytail full`, `/ponytail
  ultra`, `/ponytail off`, `/ponytail on`.
- **Presentation:** plain text on standard output. The runtime prints it.

## Do's and Don'ts

### Do:

- **Do** keep the icon drawing identical in both files, so a change to the
  grid lands in both.
- **Do** keep the accent on the shortest bar and nowhere else.
- **Do** hold the ruleset to the width of a terminal, and cut a sentence
  rather than let it run.
- **Do** name the runtime as the owner of any font, size or measure.

### Don't:

- **Don't** add a colour to the icon that is not one of the five.
- **Don't** add a shadow, a gradient or a stroke to the icon.
- **Don't** add a second variant of the icon for a third surface. The
  runtime asks for a light one and a dark one.
- **Don't** ship a font, a stylesheet or an image the runtime does not
  draw.
- **Don't** change the six upstream skill files for a styling reason. They
  are somebody else's text and they are copied byte for byte.
