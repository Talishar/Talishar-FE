import React from 'react';
import RoguelikeAnnouncement from 'img/RoguelikeAnnouncement.webp';

const News = () => {
  return (
    <div>
      <hgroup>
        Meet Nate (OotTheMonk) from the dev team October 7th at Battle Hardened Milwaukee (Hosted by MinMax Games)!
        <a href="https://www.minmaxgames.com/products/milwaukee-battle-hardened-battle-hardened-registration?_pos=2&_sid=05e5aa19a&_ss=r" target="_blank">
          <img
            src="bhmilwaukee.webp"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '100%',
              objectFit: 'cover'
            }}
          />
        </a>
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
      <small>
        Talishar is in no way affiliated with Legend Story Studios. Legend Story
        Studios®, Flesh and Blood™, and set names are trademarks of Legend Story
        Studios. Flesh and Blood characters, cards, logos, and art are property
        of Legend Story Studios. Talishar is a fan made project that may have
        bugs; game interactions and rulings are the jurisdiction of LSS and
        judges. Card Images © Legend Story Studios
      </small>
    </div>
  );
};

export default News;
