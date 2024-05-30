import React from 'react';
import RoguelikeAnnouncement from 'img/RoguelikeAnnouncement.webp';
import MSTLogo from '../../img/backgrounds/part_the_mistveil_key_art.jpg';
import styles from '../index/Index.module.css';

const News = () => {
  return (
    <div>
      <h4 className={styles.headlines}>Happy Part the Mistveil launch!
      <br></br>MST cards and heroes are now available in every format!🥳</h4>
      <img src={MSTLogo} className={styles.logo} />
      <br></br>
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

/*
            <hgroup>
        Watch Battle Hardened: St. Louis!
        <a href="https://www.youtube.com/watch?v=9ADl9gDGtH0" target="_blank">
          <img
            src="bh-st-louis.webp"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '100%',
              objectFit: 'cover'
            }}
          />
        </a>
      </hgroup>

      */

export default News;
