<p align="center">
  <img src="https://github.com/Talishar/Talishar/blob/main/Images/TalisharLogo.webp?raw=true" width="623" height="278" alt="Talishar" />
</p>

<h3 align="center">Talishar is a browser-based platform to play Flesh and Blood. It is a fan-made FABTCG project not associated with Legend Story Studios.</h3>

[![license](https://flat.badgen.net/github/license/talishar/talishar)](./LICENSE)
[![discord](https://flat.badgen.net/discord/online-members/JykuRkdd5S?icon=discord)](https://discord.gg/JykuRkdd5S)
[![patreon](https://flat.badgen.net/badge/become/a%20patreon/F96854?icon=patreon)](https://www.patreon.com/talishar_online/)
[![twitter](https://flat.badgen.net/twitter/follow/talishar_online)](https://twitter.com/talishar_online/)

Visit [Talishar.net](https://talishar.net/) to get playing Flesh & Blood in your browser right now!

# Getting started with Talishar-FE

This is a new front end client for talishar.net - completely separate from the back end. The players will be using this app to connect to the servers eventually, we hope.

## Project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) TS template.

## Requirements / How to install:

Github and git installed first.
[Node.js](https://nodejs.org/en/) installed. (latest version, 16.0+)

Latest [Yarn](https://yarnpkg.com/) installed, how to:
enable node corepack:
`corepack enable`
if there is some error with windows, you'll need to change permissions on your nodejs folder to allow all users to modify, and it'll make the corepack folder there.

clone the repo (duh)

then inside the repo:
`yarn install`
and then:
`yarn start`
then you should be in developer mode. Happy coding!

You'll probably need to `yarn install` every time you switch branches to make sure dependencies and libraries are up to date.

### Important!

In the file `src/features/game/GameSlice.ts` you'll need to modify `queryURL` so that the port is the same as what you're running for the php BE. (TODO: Make it less jank).

## Optional happy fun things:

Configure Prettier / ES Lint in your editor of choice.
Helps to maintain a consistent 'code-style' which I think is helpful?

## How it's organised:

Short answer is it isn't really. If you have a better idea on how to organise the files, please let me know.

Otherwise try to keep everything as small as possible, Reacty-containers. And pulling data from Redux etc. CSS modules help to keep stuff locally scoped.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Put your FE build on prr.net/ReactClient

Get access to the talishar beta server (speak to Nate about getting access) and get the IP, add it to your `.ssh/config` add your key and make life nice n easy.

Anyway this is what I am doing:
check `src/Constants.ts` to make sure everything is pointing toward the beta site.

- `yarn build`
- `rsync -r --stats ./build talishar-beta:/opt/ReactClientRepo/` and it'll stick your locally baked build over to the beta server.
  - If you don't have `rsync` you can use `scp` just set aside an hour for it all to copy over(!)

[Get on the beta](https://beta.talishar.net/ReactClient/) and you're good to go!

### This doesn't work (but should be the ideal way)

- `ssh talishar-beta` to ssh into the talishar beta.
- `cd /opt/ReactClientRepo`
- Now do what you need to check out the repo, switch to your beta/feature branch or whatever
- `yarn build` and get a cup of coffee as it takes a while and doesn't tell you anything while it's doing its thing.

There will then be a build made and you can access it by going to https://beta.talishar.net/ReactClient/ yay

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

There is some redux stuff involved here too so check the [React Redux documentation too.](https://react-redux.js.org/)

## Disclaimer

Talishar.net is in no way affiliated with Legend Story Studios. Legend Story Studios®, Flesh and Blood™, and set names are trademarks of Legend Story Studios. Flesh and Blood characters, cards, logos, and art are property of [Legend Story Studios](https://legendstory.com/).
