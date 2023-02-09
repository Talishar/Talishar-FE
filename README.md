<p align="center">
  <img src="https://github.com/Talishar/Talishar/blob/main/Images/TalisharLogo.webp?raw=true" width="623" height="278" alt="Talishar" />
</p>

<h3 align="center">Talishar is a browser-based platform to play Flesh and Blood. This is an unofficial project not linked to or endorsed by Legend Story Studios.</h3>

[![license](https://flat.badgen.net/github/license/talishar/talishar)](./LICENSE)
[![discord](https://flat.badgen.net/discord/online-members/JykuRkdd5S?icon=discord)](https://discord.gg/JykuRkdd5S)
[![patreon](https://flat.badgen.net/badge/become/a%20patreon/F96854?icon=patreon)](https://www.patreon.com/talishar)
[![twitter](https://flat.badgen.net/twitter/follow/talishar_online?icon=twitter)](https://twitter.com/talishar_online/)
[![github](https://flat.badgen.net/github/last-commit/Talishar/Talishar-FE?icon=github)](https://github.com/Talishar/Talishar-FE/)

Visit [Talishar.net](https://talishar.net/) to get playing Flesh & Blood in your browser right now!

The react frontend is currently in open beta at https://fe.talishar.net/

# Getting started with Talishar-FE

This is a new front end client for talishar.net - completely separate from the back end. The players will be using this app to connect to the servers eventually.

## Project
 This is a [Vite](https://vitejs.dev/) single page [React](https://reactjs.org/) App using [Redux](https://redux.js.org/), [Redux Toolkit](https://redux-toolkit.js.org/), and [React Redux](https://react-redux.js.org/) bindings.

## Requirements / How to install:

### Prerequesites:
 - [Volta](https://volta.sh/) to manage node installs.
 - node.js (currently 16.19.0), which would be managed automagically by Volta for you.
 - git
 - basic knowledge of the command line / terminal
   * If you're on Windows, get Windows Powershell or wsl or something.

```
git clone https://github.com/Talishar/Talishar-FE
```

```
cd Talishar-FE
```

```
npm install
```

```
npm run dev
```

Access the server at http://localhost:5173/ (Port 5173 by default, if you configure it to something else in Vite then it'll be there instead).

If you have problems running the development server, come to the discord and ask for help.

### How to play a game.

- From regular talishar.net you should be able to copy the search Params and append them to your local dev url for spectating.
  - Eg: `https://talishar.net/game/NextTurn4.php?gameName=612839&playerID=3`
  - Copy the `?gameName=612839&playerID=3`
  - Stick it on the the end of your dev service, eg: `http://127.0.0.1:5173/?gameName=612839&playerID=3`
  - react router will automatically route any query like this to the 'game' page.
- If you want to play (use your cards) - you'll need to find your authkey.
  - on Talishar.net you can find your cookie in storage -> cookies, it is called `lastAuthKey` and copy the value as search query param `authKey`
  - so your local dev url will look something like: `http://127.0.0.1:5173/game/play?gameName=612888&playerID=1&authKey=7147c19a6b4460390ace621dc581e334f24e9e4fa0c729eecab9805a6bbafd09`
  - if you're playing with a local dev BE server then there's no need, all the cookies and stuff should work without any fiddling.

### Important!

If you run into any trouble setting up the project please let LaustinSpayce know so we can fix it, and help make it a smoother process for future contributors.

## Optional happy fun things:

Configure Prettier / ES Lint in your text editor of choice.

## How it's organised:

Short answer is it isn't really. If you have a better idea on how to organise the files, please let me know.

Otherwise try to keep everything as small as possible, Reacty-containers. And pulling data from Redux etc. CSS modules help to keep stuff locally scoped.

## The plan for later:

Accomplished so far:
 - ✅ automatic deployment to CDN
 - ✅ automatic testing for all MR and commits to main

Still need help with:
 - More testing coverage
 - Building out features and helping with BE bugs etc.

## Learn More

This project was originally bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and is now using Vite.

To learn React, check out the [React documentation](https://reactjs.org/).

There is some redux stuff involved here too so check the [React Redux documentation too.](https://react-redux.js.org/)

## Disclaimer

All artwork and card images © Legend Story Studios.

Talishar.net is in no way affiliated with Legend Story Studios. Legend Story Studios®, Flesh and Blood™, and set names are trademarks of Legend Story Studios. Flesh and Blood characters, cards, logos, and art are property of [Legend Story Studios](https://legendstory.com/).
