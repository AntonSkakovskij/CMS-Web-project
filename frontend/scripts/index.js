let emailInput = document.getElementById("email");
let passwordInput = document.getElementById("password");

document.querySelector('form')
    .addEventListener('submit', loginSender)

emailInput.addEventListener('focus', function () {
    emailInput.classList.remove("invalid")
});
passwordInput.addEventListener('focus', function () {
    passwordInput.classList.remove("invalid")
});


async function loginSender(e) {
    e.preventDefault();

    let email = emailInput.value;
    let password = passwordInput.value;

    let userData = {
        email: email,
        password: password
    };
    
    try {
        const response = await fetch('http://localhost:55001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData.error);

            let emailInput = document.getElementById("email");
            let passwordInput = document.getElementById("password");

            if (response.status === 400)
            {
                passwordInput.classList.add('invalid');
                emailInput.classList.add('invalid');
            }
            else if (response.status === 401)
            {
                passwordInput.classList.add('invalid');
            }

            return;
        }

        const responseData = await response.json();
        window.location.href = './dashboard.html' + "?userID=" + responseData.id;
    }
    catch (error) {
        console.error('Error:', error);
    }
}