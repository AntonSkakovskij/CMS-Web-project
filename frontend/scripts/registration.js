document.querySelector('form')
    .addEventListener('submit', registrationSender)

async function registrationSender(e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let gender = document.getElementById("gender").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let nickname = document.getElementById("nickname").value;

    let userData = {
        email: email,
        nickname: nickname,
        gender: gender,
        password: password,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch('http://localhost:55001/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData.error);

            return;
        }

        const responseData = await response.json();
        window.location.href = './dashboard.html' + "?userID=" + responseData.id;
    }
    catch (error) {
        console.error('Error:', error);
    }
}


