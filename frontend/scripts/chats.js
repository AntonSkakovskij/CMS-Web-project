const urlParams = new URLSearchParams(window.location.search);
const userID = urlParams.get("userID");

const userName = document.getElementById("user-name");
const profileIcon = document.getElementById("profile-icon");

const chatMessagesContainer = document.querySelector(".chat-container");
const usersListContainer = document.querySelector(".chat-users-list");


const chatMessagesList = document.querySelector(".chat-messages-list");
const usersList = document.querySelector(".users-list");
const chatsList = document.querySelector(".chats-list");


const linkHomepage = document.getElementById("link-homepage");

const socket = io('ws://localhost:55001')

socket.on("message", (data) => {
    createNewMessage(data.message)
})

socket.on("newChat", (data) => {
    if(data.membersId.includes(userID) && userID !== data.membersId[data.membersId.length - 1]){
        createNewChat(data.chat);
    }
})

socket.on("newUser", (data) => {
    createNewUserItem(data.userNickname)
})

socket.on("join-room", (data) => {
    if(userID === data.userId){
        createNewChat(data.chat);
    }
})



function createNewMessage(message) {
    const newMessageItem = document.createElement('li');

    if (userID === message.sender._id) {
        newMessageItem.classList.add('login-user-message');
    } else {
        newMessageItem.classList.add('other-user-message');
    }

    newMessageItem.innerHTML = `
                            <span class="message-time">${formatTime(message.createdAt)}</span>
                            <span class="message-text">${message.message}</span>
                            <span class="message-sender">${message.sender.nickname}</span>`


    chatMessagesList.appendChild(newMessageItem);
    chatMessagesList.scrollTop = chatMessagesList.scrollHeight
}

function createNewChat(chat) {
    const chatListItem = document.createElement('li');
    chatListItem.classList.add('chats-list-item');

    chatListItem.textContent = chat.name;
    chatListItem.id = chat._id

    chatsList.appendChild(chatListItem);
}

function createNewUserItem(nickname){
    const userItem = document.createElement('li');
    userItem.classList.add('users-list-item');

    userItem.textContent = nickname;

    usersList.appendChild(userItem);
}




linkHomepage.addEventListener("click", function () {
    event.preventDefault();
    window.location.href =
        linkHomepage.getAttribute("href") + "?userID=" + userID;
});

document.addEventListener("DOMContentLoaded", async function () {
    if (userID) {
        const sendData = {
            userId: userID
        };

        let responseData = await sendRequest(sendData, "auth/load-page")

        if(responseData){
            profileIcon.src = responseData.profilePic;
            userName.textContent = responseData.nickname;
        }

        responseData = await sendRequest(sendData, "chatrooms/chats")

        if(responseData){
            if (responseData.chatrooms) {
                responseData.chatrooms.forEach(chat => {
                    createNewChat(chat)
                });
            }
        }
    }
});


document.querySelector(".chat-tools-container").addEventListener("submit", async (e) => {
    e.preventDefault()
    const activeChatId = document.querySelector(".active-chats-list-item").id
    const input = document.querySelector('.chat-message-field')
    if (input.value) {

        sendData = {
            message: input.value,
            userId: userID,
            chatroomId: activeChatId
        };

        await sendRequest(sendData, "messages/send");

        input.value = ''
    }
    input.focus()
})


document.querySelector(".chats-list").addEventListener("click", async function (event) {
    if (event.target && event.target.matches("li.chats-list-item")) {
        
        // Якщо елемент вже активний, знімаємо клас
        if (event.target.classList.contains("active-chats-list-item")) {
            event.target.classList.remove("active-chats-list-item");

            chatMessagesContainer.style.opacity = '0';
            chatMessagesContainer.style.visibility = 'hidden';

            usersListContainer.style.opacity = '0';
            usersListContainer.style.visibility = 'hidden';

            socket.emit("leaveRoom",{
                chatroomId: event.target.id
            })
        } 
        else {
            // Видаляємо клас з поточного активного елемента
            const currentActive = document.querySelector(".active-chats-list-item");
            if (currentActive) {
                currentActive.classList.remove("active-chats-list-item");
            }
            // Додаємо клас до натиснутого елемента
            event.target.classList.add("active-chats-list-item");

            //очищення списку повідомлень та списку користувачів
            chatMessagesList.innerHTML= ''
            usersList.innerHTML= ''
            
            // отримання даних з серверу для відображення повідомлень та списку користувічів
            
            const sendData = {
                chatId: event.target.id
            };

            const responseData = await sendRequest(sendData, "chatrooms/chat-data");

            if(responseData){
                if (responseData.chatroom) {
                    document.querySelector(".chat-name").textContent = responseData.chatroom.name

                    responseData.chatroom.messages.forEach(message => {
                        createNewMessage(message)
                    });

                    responseData.chatroom.members.forEach(member => {
                        createNewUserItem(member.nickname)
                    });
                }

                socket.emit("enterRoom", {
                    chatroomId: event.target.id
                })

                chatMessagesContainer.style.opacity = '1';
                chatMessagesContainer.style.visibility = 'visible';

                usersListContainer.style.opacity = '1';
                usersListContainer.style.visibility = 'visible';
            }

        }
    }
});

const createNewChatPopup = document.querySelector(".create-chat-popup")
const addUserToChatPopup = document.querySelector(".add-user-popup")
const notExistingUserList = document.querySelector(".notexisting-users-list")
const existingUserList = document.querySelector(".existing-users-list")

async function openPopup(button) {
    if(button.classList.contains('create-chat-button')){
        createNewChatPopup.style.opacity = '1';
        createNewChatPopup.style.visibility = 'visible';

        const sendData = {
            userId: userID
        };

        const responseData = await sendRequest(sendData, "chatrooms/users");

        if(responseData){
            responseData.users.forEach(user => {
                            const userItem = document.createElement('option');
                            userItem.classList.add('existing-user-item');
                            userItem.value = user._id
                            userItem.textContent = user.nickname;
                            existingUserList.appendChild(userItem);
                        });
        }
    }
    else if(button.classList.contains('add-user-button')){
        addUserToChatPopup.style.opacity = '1';
        addUserToChatPopup.style.visibility = 'visible';

        const activeChatId = document.querySelector(".active-chats-list-item").id

        const sendData = {
            chatId: activeChatId
        };

        const responseData = await sendRequest(sendData, "chatrooms/not-existed-users");

        if(responseData){
            responseData.notmembers.forEach(notmember => {
                            const userItem = document.createElement('option');
                            userItem.classList.add('notexisting-user-item');
                            userItem.value = notmember._id
                            userItem.textContent = notmember.nickname;
                            notExistingUserList.appendChild(userItem);
                        });
        }
    }
}

function exitPopup(button) {

    if (button.classList.contains('create-chat-exitbutton')) {
        closeCreateNewChatPopup();
        document.querySelector("#chat-name-field").value = ""
    } else if (button.classList.contains('add-user-exitbutton')) {
        closeAddUserToChatPopup();
    }
}

function closeCreateNewChatPopup() {
    createNewChatPopup.style.opacity = '0';
    createNewChatPopup.style.visibility = 'hidden';

    existingUserList.innerHTML = ''
}

function closeAddUserToChatPopup() {
    addUserToChatPopup.style.opacity = '0';
    addUserToChatPopup.style.visibility = 'hidden';

    notExistingUserList.innerHTML = ''
}


async function confirmAddingUserToChat(){
    const selectedUserId = notExistingUserList.value;
    const activeChatId = document.querySelector(".active-chats-list-item").id

    const sendData = {
        userId: selectedUserId,
        chatroomId: activeChatId
    };

    const responseData = await sendRequest(sendData, "chatrooms/add-user");

    if(responseData){
        closeAddUserToChatPopup();
    }
}

async function confirmCreatingChat() {
    const chatName = document.querySelector("#chat-name-field").value
    userForCreatingChat.push(userID)

    const sendData = {
        chatroomName: chatName,
        membersId: userForCreatingChat
    };

    const responseData = await sendRequest(sendData, "chatrooms/create-chat")

    if (responseData) {
        
        createNewChat(responseData.chatroom)
        
        closeCreateNewChatPopup();

        userForCreatingChat = [];
        document.querySelector("#chat-name-field").value = ""
    }
}


let userForCreatingChat = [];

function addUserForCreatingChat(){
    const existingUsersList = document.querySelector('.existing-users-list');
    const selectedUserId = existingUsersList.value;

    if (selectedUserId) {
        userForCreatingChat.push(selectedUserId);

        const selectedOption = existingUsersList.querySelector(`option[value="${selectedUserId}"]`);

        if (selectedOption) {
            selectedOption.remove();
        }
    } 
    else {
        console.log("No user selected");
    }
}


async function sendRequest(sendData, requestMethod){
    try {
        const response = await fetch('http://localhost:55001/api/' + requestMethod, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData.error);

            return;
        }

        const responseData = await response.json();

        return responseData;
        
    }
    catch (error) {
        console.error('Error:', error);
    }
}


function formatTime(dateString) {
    const date = new Date(dateString);
    let hours = (date.getUTCHours() + 3) % 24;
    let minutes = date.getUTCMinutes();

    // Додаємо провідний нуль до хвилин, якщо потрібно
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Форматуємо час у вигляді HH:MM
    return `${hours}:${minutes}`;
}
