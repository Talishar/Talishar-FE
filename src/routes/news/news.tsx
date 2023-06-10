import React from 'react';
import RoguelikeAnnouncement from 'img/RoguelikeAnnouncement.webp';

const News = () => {
  return (
    <div>
      <hgroup>
        <h1>Looking for DTD spoilers? Read up!</h1>
        <h2>DTD Spoilers are limited to "Open Format"</h2>
        <h2>Stats are not reported for DTD heroes until release</h2>
        <h2>We're trying out less automation for this set, so pay attention to card effects!</h2>
      </hgroup>
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
