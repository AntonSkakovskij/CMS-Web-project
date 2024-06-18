const urlParams = new URLSearchParams(window.location.search);
const userID = urlParams.get("userID");

const userName = document.getElementById("user-name");
const profileIcon = document.getElementById("profile-icon");
const linkHomepage = document.getElementById("link-homepage");

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoLane = document.getElementById("todo-lane");
const doingLane = document.getElementById("doing-lane");
const doneLane = document.getElementById("done-lane");

const droppables = document.querySelectorAll(".swim-lane");

linkHomepage.addEventListener("click", function () {
    event.preventDefault();
    window.location.href =
        linkHomepage.getAttribute("href") + "?userID=" + userID;
});

const socket = io('ws://localhost:55001')

socket.on('newTask', (data) => {

    const taskElement = createTaskElement(data.task);
    switch (data.task.status) {
        case 'to do':
            todoLane.appendChild(taskElement);
            break;
        case 'in progress':
            doingLane.appendChild(taskElement);
            break;
        case 'done':
            doneLane.appendChild(taskElement);
            break;
        default:
            console.error(`Unknown task stage: ${task.status}`);
    }
})

socket.on('task-status', (data) => {
    const taskToChange = document.getElementById(data.task._id);
    if (taskToChange) {
        switch (data.task.status) {
            case 'to do':
                todoLane.appendChild(taskToChange);
                break;
            case 'in progress':
                doingLane.appendChild(taskToChange);
                break;
            case 'done':
                doneLane.appendChild(taskToChange);
                break;
            default:
                console.error(`Unknown task stage: ${task.status}`);
        }
    } else {
        console.error('Task element not found');
    }
})

const createTaskElement = (task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.setAttribute("draggable", "true");
    taskElement.id = task._id;

    const textElement = document.createElement("p");
    textElement.innerText = task.message;

    taskElement.appendChild(textElement);

    taskElement.addEventListener("dragstart", () => {
        taskElement.classList.add("is-dragging");
    });

    taskElement.addEventListener("dragend", () => {
        taskElement.classList.remove("is-dragging");
    });

    return taskElement;
};

document.addEventListener("DOMContentLoaded", async function () {
    if (userID) {
        const sendData = {
            userId: userID
        };

        let responseData = await sendRequest(sendData, "auth/load-page")
        // console.log(responseData)


        if (responseData) {
            profileIcon.src = responseData.profilePic;
            userName.textContent = responseData.nickname;
        }

        responseData = await sendRequest(sendData, "tasks/gettasks")


        if (responseData) {
            if (responseData.tasks) {
                responseData.tasks.forEach(task => {
                    const taskElement = createTaskElement(task);
                    switch (task.status) {
                        case 'to do':
                            todoLane.appendChild(taskElement);
                            break;
                        case 'in progress':
                            doingLane.appendChild(taskElement);
                            break;
                        case 'done':
                            doneLane.appendChild(taskElement);
                            break;
                        default:
                            console.error(`Unknown task stage: ${task.status}`);
                    }
                });
            }
        }
    }
});

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const value = input.value;

    if (!value) return;

    let sendData = {
        taskMessage: value
    }
    input.value =  '';
    await sendRequest(sendData, "tasks/create-task");
})


droppables.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    zone.addEventListener("drop",  async (e) => {
        e.preventDefault();

        const curTask = document.querySelector(".is-dragging");
        if (!curTask) return;

        const taskId = curTask.id;
        let sendData;
        let newStage;
        switch (zone.id) {
            case 'todo-lane':
                newStage = 'to do';

                sendData = {
                    taskStatus: newStage,
                    taskId
                }

                await sendRequest(sendData, "tasks/change-status");

                break;
            case 'doing-lane':
                newStage = 'in progress';

                sendData = {
                    taskStatus: newStage,
                    taskId
                }

                await sendRequest(sendData, "tasks/change-status");

                break;
            case 'done-lane':
                newStage = 'done';

                sendData = {
                    taskStatus: newStage,
                    taskId
                }

                await sendRequest(sendData, "tasks/change-status");

                break;
            default:
                console.error(`Unknown lane id: ${zone.id}`);
        }

        curTask.parentNode.removeChild(curTask);

        zone.appendChild(curTask);
    });
});


async function sendRequest(sendData, requestMethod) {
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

    } catch (error) {
        console.error('Error:', error);
    }
}