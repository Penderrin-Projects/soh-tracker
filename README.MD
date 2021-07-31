# how to run your own server

## dependencies

- yarn (https://classic.yarnpkg.com/en/docs/install/)
- some server tool to host the website
    - > e.g.: serve (https://www.npmjs.com/package/serve)

## installing the application

- clone the repository to your computer
- go into the root directory of the repository
- run `yarn install`

## how to build

### production

- run `yarn build`
- serve the `./prod` folder as local server
    - >e.g.: run `serve ./prod`

### development

- run `yarn buildDev`
    - or as watch job `yarn watch`
- serve the `./dev` folder as local server
    - >e.g.: run `serve ./dev` (alias: `yarn serve`)

### flags

the build process allows flags to be added.
flags need to be added with a `-` before them.
> e.g.: `yarn build -nocompress -rebuildjs`

| command | description | 
| --- | --- |
| nocompress | by default the build process will look over the json files and try to compress them, this options disables that feature, since it can take a lot of time |
| rebuild | force rebuilding all files, not only the changed ones |
| rebuildjs | force rebuilding all javascript files, not only the changed ones. not needed if rebuild is already declared |

## editor

use the editor to change tracker configurations.
> the editor is currently a work in progress

- run `yarn edit`

included:

- logic editor (glitchless and glitched)
    - edit the logic for each check
    - > these editors are also accessible inside the tracker
- world editor
    - unfinished editor
    - used to edit the world entries
