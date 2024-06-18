/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration.css => {
                console.log('Service Worker registered:', registration.css);
            })
            .catch(error => {
                console.error('Service Worker registration.css failed:', error);
            });
    });
}*/

const deleteMessagePopup = document.querySelector('.delete-student-message')
const studentPopup = document.querySelector('.edit-add-student-message');
const studentsTable = document.querySelector('.student-table')

const firstNameInput = studentPopup.querySelector('.firstName');
const lastNameInput = studentPopup.querySelector('.lastName');
const birthdayInput = studentPopup.querySelector('.birthday');
const genderInput = studentPopup.querySelector('.gender');
const groupInput = studentPopup.querySelector('.group');

let currentRowToDelete = null;
let currentRowToEdit = null;
let isEditing = false;

const urlParams = new URLSearchParams(window.location.search);
const userID = urlParams.get("userID");


const userName = document.getElementById("user-name");
const profileIcon = document.getElementById("profile-icon");

const socket = io('ws://localhost:55001')

const notificationButton = document.querySelector('.profile-notification-button');
const notificationTasksContainer = document.querySelector(".notification-tasks-container");
socket.on("notification", (data) => {
    console.log(data);
    if (userID !== data.sender._id && data.chat.members.includes(userID)) {

        createNotificationItem(data.chat, data.sender, data.newMessage);

        if (notificationList.firstChild) {
            notificationList.removeChild(notificationList.firstChild);
        }
    }
});

socket.on('task-notification', (data) => {
    console.log(data);
    const notificationTaskToAdd = document.getElementById(data.task._id);
    if (notificationTaskToAdd) {
        if (data.task.status !== 'to do') {
            todoNotificationTaskList.removeChild(notificationTaskToAdd);
        }
    } else {
        createTodoNotificationTaskItem(data.task);
    }
});




let students = [];

class Student{
    id;
    groupName;
    firstName;
    lastName;
    gender;
    birthday;

    constructor(groupName, firstName, lastName, gender, birthday) {
        this.groupName = groupName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.birthday = birthday;
    }

    toString() {
    return "id=" + this.id + "&" +
        "group=" + this.groupName + "&" +
        "firstName=" + this.firstName + "&" +
        "lastName=" + this.lastName + "&" +
        "gender=" + this.gender + "&" +
        "birthday=" + this.birthday;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    if (userID) {
        try {
            const sendData = {
                userId: userID
            };
            const response = await fetch('http://localhost:55001/api/auth/load-page', {
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
            
            profileIcon.src = responseData.profilePic;
            userName.textContent = responseData.nickname;

            let count = 0;

            responseData.notifications.forEach(notification => {
                if (count < 3 && userID !== notification.sender._id && notification.chat.members.includes(userID)) {

                    createNotificationItem(notification.chat, notification.sender, notification.message);
                    count++;
                }
            });


            if(responseData.todoTasks){
                responseData.todoTasks.forEach(task => {
                    createTodoNotificationTaskItem(task)
                })
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }



    const chatsLink = document.getElementById("chatsLink");

    chatsLink.addEventListener("click", function () {
        event.preventDefault();
        window.location.href =
            chatsLink.getAttribute("href") + "?userID=" + userID;
    });

    const tasksLink = document.getElementById("tasksLink");

    tasksLink.addEventListener("click", function () {
        event.preventDefault();
        window.location.href =
            tasksLink.getAttribute("href") + "?userID=" + userID;
    });

    // socket.emit("authenticate", {userID});
});

const notificationList = document.querySelector('.notification');
const todoNotificationTaskList = document.querySelector(".tasks-notification-list")

function createTodoNotificationTaskItem(task) {
    const todoNotificationTaskItem = document.createElement("li");

    todoNotificationTaskItem.id = task._id;
    todoNotificationTaskItem.status = task.status;
    todoNotificationTaskItem.innerHTML =   `<li class="tasks-notification-item">${task.message}</li>`

    todoNotificationTaskList.appendChild(todoNotificationTaskItem);

    notificationButton.classList.add('notification-active');

    setTimeout(() => {
        notificationButton.classList.remove('notification-active');
    }, 3000);
}

function createNotificationItem(chat, user, message){
    const notificationItem = document.createElement("li");

    notificationItem.classList.add("notification-item");

    notificationItem.innerHTML =
        `<span class="notification-chat">${chat.name}</span>
        <div class="notification-message">
        <div>
        <span class="notification-message-time">${formatTime(message.createdAt)}</span>
        <span class="notification-sender">${user.nickname}</span>
        </div>
        <p class="notification-message-text">${message.message}</p>
        </div>`

    notificationList.appendChild(notificationItem);

    notificationButton.classList.add('notification-active');

    setTimeout(() => {
        notificationButton.classList.remove('notification-active');
    }, 3000);
}





function openStudentPopup(title) {
    studentPopup.querySelector('#modalTitle').textContent = title;
    studentPopup.style.opacity = '1';
    studentPopup.style.visibility = 'visible';
}

function exitStudentPopup() {
    studentPopup.style.visibility = 'hidden';
    studentPopup.style.opacity = '0';
    isEditing = false;
    // Очищення полів вводу
    // Встановлення першого значення для поля group
    const groupDropdown = studentPopup.querySelector('.group');
    groupDropdown.value = groupDropdown.options[0].value;

    // Встановлення першого значення для поля gender
    const genderDropdown = studentPopup.querySelector('.gender');
    genderDropdown.value = genderDropdown.options[0].value;

    studentPopup.querySelector('.firstName').value = '';
    studentPopup.querySelector('.lastName').value = '';
    studentPopup.querySelector('.birthday').value = '';

    removeInputsStyles()
}


function removeInputsStyles(){
    groupInput.classList.remove("invalid");
    firstNameInput.classList.remove("invalid");
    lastNameInput.classList.remove("invalid");
    genderInput.classList.remove("invalid");
    birthdayInput.classList.remove("invalid");
}



function confirmStudentAction() {
    const getValueOrNull = (input) => input ? input.value.trim() || null : null;

    let groupName = studentPopup.querySelector('.group').value;
    const firstName = getValueOrNull(studentPopup.querySelector('.firstName'));
    const lastName = getValueOrNull(studentPopup.querySelector('.lastName'));
    let gender = studentPopup.querySelector('.gender').value;
    const birthday = getValueOrNull(studentPopup.querySelector('.birthday'));


    if (isEditing) {
        currentRowToEdit.student.firstName = firstName;
        currentRowToEdit.student.lastName = lastName;
        currentRowToEdit.student.birthday = birthday;
        currentRowToEdit.student.gender = gender;
        currentRowToEdit.student.groupName = groupName;
        if (sendGetRequest(currentRowToEdit.student, "/editStudent", 'PUT') === 200) {
            currentRowToEdit.cells[1].textContent = groupName;
            currentRowToEdit.cells[2].textContent = firstName + ' ' + lastName;
            currentRowToEdit.cells[3].textContent = gender;
            currentRowToEdit.cells[4].textContent = birthday;
        }
    }
    else {
        const student = new Student(groupName, firstName, lastName, gender, birthday);

        if(sendGetRequest(student, "/addStudent", 'POST') === 200) {

           const newRow = document.createElement('tr');
           newRow.student = student; // Прив'язка студента до рядка

           students.push(student);

           newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${student.groupName}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.gender}</td>
                <td>${student.birthday}</td>
                <td><div class="status-icon"></div></td>
                <td>
                    <button onclick="openStudentPopup('Edit student'); fillStudentForm(this);" class="button small-button edit-table-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                        </svg>
                    </button>
                    <button onclick="openDeleteMessagePopup(this)" class="button small-button delete-table-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="close-button bi bi-x-lg" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                    </button>
                </td>
            `;
           studentsTable.appendChild(newRow);
        }
    }
}

groupInput.addEventListener('focus', function () {
    groupInput.classList.remove("invalid")
});

firstNameInput.addEventListener('focus', function () {
    firstNameInput.classList.remove("invalid")
});

lastNameInput.addEventListener('focus', function () {
    lastNameInput.classList.remove("invalid")
});

genderInput.addEventListener('focus', function () {
    genderInput.classList.remove("invalid")
});

birthdayInput.addEventListener('focus', function () {
    birthdayInput.classList.remove("invalid")
});

function fillStudentForm(button) {

    isEditing = true;
    const row = button.closest('tr');
    currentRowToEdit = row;

    const groupName = row.cells[1].textContent;
    const fullName = row.cells[2].textContent;
    const gender = row.cells[3].textContent;
    const birthday = row.cells[4].textContent;

    studentPopup.querySelector('.group').value = groupName;
    studentPopup.querySelector('.firstName').value = fullName.split(' ')[0];
    studentPopup.querySelector('.lastName').value = fullName.split(' ')[1];
    studentPopup.querySelector('.gender').value = gender;
    studentPopup.querySelector('.birthday').value = birthday;

    openStudentPopup('Edit student');
}


function openDeleteMessagePopup(button) {

    const row = button.closest('tr')
    const fullName = row.cells[2].textContent

    currentRowToDelete = row
    deleteMessagePopup.querySelector('.fullname-to-delete').textContent = fullName

    deleteMessagePopup.style.visibility = 'visible';
    deleteMessagePopup.style.opacity = '1';
}

/*вихід з вікна при натиску на хрестик з вікна видалення студентів*/
function exitDeleteMessagePopup() {
    deleteMessagePopup.style.visibility = 'hidden';
    deleteMessagePopup.style.opacity = '0';
}


function confirmDeletingStudent() {
    // Отримуємо індекс елемента, який потрібно видалити
    const index = students.findIndex(student => student === currentRowToDelete.student);
    if (sendGetRequest(students.at(index), `/delete/${students.at(index).id}`, 'DELETE') === 200) {
        students.splice(index, 1);

        currentRowToDelete.remove();

        deleteMessagePopup.style.visibility = 'hidden';
        deleteMessagePopup.style.opacity = '0';
    }
}


async function logoutSender(){
     try {
        const response = await fetch('http://localhost:55001/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData.error);
            return;
        }

        window.location.href = './index.html';
    }
    catch (error) {
        console.error('Error:', error);
    }
}


    let baseUrl = "http://127.0.0.1:9191"

    function sendGetRequest(studentData, actionType, sendMethodType) {
        var xhr = new XMLHttpRequest();

        let urlString = constructURL(actionType);

        removeInputsStyles();

        let serverAnswerStatus = 0;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    serverAnswerStatus = 200;
                    if(sendMethodType == 'POST'){
                        console.log("Student successfully added");
                        studentData.id = xhr.responseText;
                    }else {
                        console.log(xhr.responseText);
                    }
                    exitStudentPopup();
                }
                else {
                    console.error("There was a problem with the request: " + xhr.status);
                    console.log(xhr.responseText)
                    serverAnswerStatus = xhr.status;
                    var responseText = xhr.responseText;

                    var inputClasses = JSON.parse(responseText);

                    for (let i = 0; i < inputClasses.length; i++) {
                        if (inputClasses[i] == "over18") {
                            inputClasses[i] = "birthday"
                        }
                        var input = document.querySelector('.' + inputClasses[i]);

                        if (!input.classList.contains("invalid")) {
                            input.classList.add('invalid');
                        }
                    }
                }
            }
        }

        xhr.open(sendMethodType, urlString, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(studentData));
        return serverAnswerStatus
    }

function constructURL( actionType) {
    return baseUrl  + actionType;
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
