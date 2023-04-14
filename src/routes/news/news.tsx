import React from 'react';
import RoguelikeAnnouncement from 'img/RoguelikeAnnouncement.webp';

const News = () => {
  return (
    <div>
      <hgroup>
        <h1>News</h1>
        <h2>Choose your play mat from tne options menu in game!<h2>
        <h2>Announcing Major Roguelike Update</h2>
      </hgroup>
      <p>
      <a href='https://beta.talishar.net/game/Roguelike/CreateGame.php'><img src={RoguelikeAnnouncement} style={{width:"100%", height:"auto", maxHeight:"100%"}} /></a>
      </p>
      <p>Please join our community:</p>
      <ul>
        <li>
          <a href="https://discord.gg/JykuRkdd5S" target="_blank">
            Discord
          </a>
        </li>
        <li>
          <a href="https://twitter.com/talishar_online" target="_blank">
            Twitter
          </a>
        </li>
      </ul>
      <p>Disclaimer:</p>
      <small>Talishar is in no way affiliated with Legend Story Studios. Legend Story Studios®, Flesh and Blood™, and set names are trademarks of Legend Story Studios. Flesh and Blood characters, cards, logos, and art are property of Legend Story Studios. Talishar is a fan made project that may have bugs; game interactions and rulings are the jurisdiction of LSS and judges. Card Images © Legend Story Studios</small>
    </div>
  );
};

export default News;
