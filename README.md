<p align="center">
  <img src="https://github.com/Talishar/Talishar/blob/main/Images/TalisharLogo.webp?raw=true" width="623" height="278" alt="Talishar" />
</p>

<h3 align="center">Talishar is a browser-based platform to play Flesh and Blood. It is a fan-made FABTCG project not associated with Legend Story Studios.</h3>

[![license](https://flat.badgen.net/github/license/talishar/talishar-fe)](./LICENSE)
[![discord](https://flat.badgen.net/discord/online-members/JykuRkdd5S?icon=discord)](https://discord.gg/JykuRkdd5S)
[![twitter](https://flat.badgen.net/badge/twitter/@talishar_online/1DA1F2?icon=twitter)](https://twitter.com/talishar_online)
[![bluesky](https://flat.badgen.net/badge/bluesky/pvtvoid/1185FE?icon=bluesky)](https://bsky.app/profile/pvtvoid.bsky.social)
[![patreon](https://flat.badgen.net/badge/become/a%20patreon/F96854?icon=patreon)](https://linktr.ee/Talishar)

Visit [Talishar.net](https://talishar.net/) to get playing Flesh & Blood in your browser right now!

## Getting started with Talishar-FE

This is the front end client for talishar.net - completely separate from the back end.

## Project

This is a [Vite](https://vitejs.dev/) single page [React](https://reactjs.org/) App using [Redux](https://redux.js.org/), [Redux Toolkit](https://redux-toolkit.js.org/), and [React Redux](https://react-redux.js.org/) bindings.

## Requirements / How to install

### Prerequisites:

- [Volta](https://volta.sh/) or FNM to manage node installs.
- node.js (currently 16.19.0), which would be managed automagically by Volta for you.
- git
- basic knowledge of the command line / terminal
  - If you're on Windows, get Windows Powershell or wsl or something.

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

You will also need the local dev talishar backend running.

If you have problems running the development server, come to the discord and ask for help.

### Important!

If you run into any trouble setting up the project please let LaustinSpayce know so we can fix it, and help make it a smoother process for future contributors.

If you have any configuration that isn't the default for the backend, change the hostname, ports etc in the .env file. You can also twiddle with the .env if you want to develop the FE locally but hook up into the production backend (then you'll want to point to api.talishar.net)

## Optional Configuration

Configure Prettier and ESLint in your text editor of choice for a better development experience.

## Project Organization

The codebase is organized with small, focused React components and containers. If you have ideas for better organization, please share them. When contributing:
- Keep everything as modular as possible
- Use React containers for logic separation
- Pull data from Redux where appropriate
- Use CSS modules to keep styles locally scoped

## Development Progress

### Completed
- Automatic deployment to CDN
- Automatic testing for all merge requests and commits to main

### In Progress / Help Wanted
- Expand testing coverage
- Build out new features
- Help with backend integration and bug fixes

## Learn More

This project was originally bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and is now using Vite.

To learn React, check out the [React documentation](https://reactjs.org/).

There is some redux stuff involved here too so check the [React Redux documentation too.](https://react-redux.js.org/)

## Disclaimer

All artwork and card images © Legend Story Studios.

Talishar.net is in no way affiliated with Legend Story Studios. Legend Story Studios®, Flesh and Blood™, and set names are trademarks of Legend Story Studios. Flesh and Blood characters, cards, logos, and art are property of [Legend Story Studios](https://legendstory.com/).
