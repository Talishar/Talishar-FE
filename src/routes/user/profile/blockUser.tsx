import React, { useEffect } from 'react';
import styles from './profile.module.css';
import { BACKEND_URL, URL_END_POINT } from 'appConstants';

const BlockList = () => {
    useEffect(() => {
      fetchBlockedUsers();
    }, []);
  
    const fetchBlockedUsers = async () => {
      try {
        const response = await fetch('includes/GetBlockedUsers.php');
        const data = await response.json();
        const blockedUsersElement = document.getElementById('blocked-users');
        if (blockedUsersElement) {
          blockedUsersElement.innerHTML = '';
          data.forEach((user: string) => {
            const userElement = document.createElement('div');
            userElement.textContent = user;
            const unblockButton = document.createElement('button');
            unblockButton.textContent = 'Unblock';
            unblockButton.addEventListener('click', () => {
              fetch('includes/UnblockUser.php', {
                method: 'POST',
                body: new URLSearchParams({ userToUnblock: user }),
              })
                .then((response) => response.text())
                .then((message) => {
                  if (message === 'User unblocked') {
                    userElement.remove();
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            });
  
            userElement.appendChild(unblockButton);
            blockedUsersElement.appendChild(userElement);
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const userInput = document.querySelector('input[name="userToBlock"]') as HTMLInputElement;
      const formData = new URLSearchParams();
      formData.append('block-user-submit', 'block-user-submit');
      formData.append('userToBlock', userInput.value);
      try {
          const response = await fetch(`${BACKEND_URL}${URL_END_POINT.BLOCK_USER}`, {
              method: 'POST',
              body: formData.toString(),
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
          });
          const message = await response.text();
          const messageElement = document.getElementById('block-user-message')!;
          messageElement.innerText = message;
          fetchBlockedUsers();
      } catch (error) {
          console.error(error);
      }
  };
  
    return (
      <div>
        <h3>Block List - Work in Progress</h3>
        <div className={styles.BlockList} id="blocked-users"></div>
        <form className="form-resetpwd" id="block-user-form" onSubmit={handleFormSubmit}>
          <input type="text" name="userToBlock" placeholder="User to block" />
          <button type="submit" name="block-user-submit">Block</button>
          <p id="block-user-message"></p>
        </form>
      </div>
    );
  };
  
  export default BlockList;