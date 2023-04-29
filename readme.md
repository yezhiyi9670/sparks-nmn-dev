# Sparks NMN (Development)

> Note: This will be made into a node module soon™.

Sparks NMN is a text-based language for composing numbered music notation (aka. 简谱). It features web-based rendering and natural markup syntax.

Documentation and desktop app will be developed later.

## What is in this repo?

This repo contains a 'development demo' of Sparks NMN. It runs directly in a browser.

Currently, the `src/nmn` directory in the repo is (although untested so far) 'standalone' and can be copied into other projects as long as the dependencies are satisfied.

## Running and building

This project is built using npm. To initialize, run `yarn` or `npm install`.

To run the demo, run `yarn start` or `npm run start`. It will by default run on the 8527 port.

### Standalone demo version

Running `yarn build-demo` or `npm run build-demo` will get you a standalone HTML demo app. Note that it can't run if opened using `file://`.

Press Ctrl + P in the demo to print the current score.

### Library

Run `yarn build-lib` will create one js file, containing the exports of `src/nmn/index.ts`, but currently with no types.

Run `yarn build-umd` will create one js file which exposes a `SparksNMN` global variable, containing exports of `src/nmn/index.ts`.

### HTML preview template

Run `yarn build-wrapper` will create `template.html`. See `./src/builder/wrapper/wrapper-builder.ts` for the usage.
