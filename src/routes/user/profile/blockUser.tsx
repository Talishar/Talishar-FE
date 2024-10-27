import React, { useEffect } from 'react';
import styles from './profile.module.css';

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
      const formData = new FormData();
      formData.append('userToBlock', userInput.value);
      try {
        const response = await fetch('includes/BlockUser.php', {
          method: 'POST',
          body: formData,
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
        <h3>Block List</h3>
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