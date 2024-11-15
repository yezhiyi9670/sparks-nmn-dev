<img src="src/logo.png" align="right" width="128" height="128"/>

> ⚠ **This repository has now moved to the [sparks-notation-1](https://github.com/yezhiyi9670/sparks-notation-1) monorepo.**

# Sparks NMN (Dev)

[简体中文](./README-en.md) | **English**

Compose Number Music Notation in text format efficiently!

[Website](https://notation.sparkslab.art/) · [Playground](https://notation.sparkslab.art/playground/) · [Desktop App](https://github.com/yezhiyi9670/sparks-nmn-desktop) · [Sponsor](https://notation.sparkslab.art/donate/)

> Since Numbered Music Notation is seemingly not commonly used in English regions, this project does not plan adding English as a display language right now.

Sparks NMN is a text-based language for composing Number Music Notation scores. Based on practical experience, it features simple and natural syntax. Also readability and high efficiency.

```plain
P: 1=bB 4/4 qpm=120
Rp: page=A4 font_lyrics=Roman,CommonSerif/600
====
N: 1. (2)3. (1) | 3 1 3 0 | 2. (3)(44)(32) | 4 - - 0 |
Lw: Do, a deer, a fe-male deer. Re, a drop of gol-den sun.
---
N: 3. (4)5. (3) | 5 3 5 0 | 4. (5)(66)(54) | 6 - - 0 |
Lw: Mi, a name I call my-self. Fa, a long long way to run.
---
N: 5. (1)(23)(45) | 6 - - 0 | 6. (2)(3#4)(56) | 7 - - 0 |
Lw: Sol, a nee-dle pul-ling thread. La, a note to fol-low sol.
---
N: /{w=1.1} 7. (3)(#4#5)(67) |{w=0.9} 1e - 0 (7b7) |
Lw: Ti, a drink with jam and bread, that will
---
N: 6 4 7 5 |{w=0.85} 1e - - 0 |{w=1.15} (01)(23)(45)(67) | 1e[str] 5[str] 1e[str] 0 |||
Lw: lead us back to Do. Do Re Mi Fa Sol La Ti Do Sol Do!
```

Sparks NMN's core is web-based and can run in the browser. This is how the online trial version works. Hence, the desktop app is built with Electron. Undoubtedly, your PC will get another Chromium kernel if you install it.

## What is "Dev" for?

This repo is the development repo, containing the Online Trial webpage.

## Building from source

The source code should be built using `npm` or `yarn`. For more info about commands see `package.json`.
