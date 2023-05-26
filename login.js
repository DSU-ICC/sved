document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path
    //const URL = "https://oop.icc.dgu.ru"
    //const URL = "https://localhost:44370"

    //функция валидации формы входа
    const validateLoginForm = () => {
        //получаем логин и пароль из формы
        let loginInput = document.querySelector("#login")
        let passwordInput = document.querySelector("#password")

        //переменная для обозначения валидности формы (если все поля формы заполнены, то значением переменной является true, иначе false )
        let isValidForm = true

        //если поле не пустое, то присваиваем полю класс invalid, чтобы показать пользователю, что поле не заполнено 
        if (loginInput.value.trim() == "") {
            isValidForm = false
            loginInput.closest(".login-form__label").classList.add("invalid")
        } else {
            loginInput.closest(".login-form__label").classList.remove("invalid")
        }

        if (passwordInput.value.trim() == "") {
            isValidForm = false
            passwordInput.closest(".login-form__label").classList.add("invalid")
        } else {
            passwordInput.closest(".login-form__label").classList.remove("invalid")
        }

        //если все поля заполнены, то отправляем запрос на вход в админ панель
        if (isValidForm) {
            loginUser(loginInput.value, passwordInput.value)
        }
    }

    //функция отправки запроса на вход в админ панель
    const loginUser = async (loginUser, passwordUser) => {
        loginBtn.classList.add("loading")
        loginBtn.textContent = "Вход..."
        loginBtn.disabled = true

        let user = {
            login: loginUser,
            password: passwordUser
        }

        let response = await fetch(`https://oop.icc.dgu.ru/api/Account/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(user)
        })

        if (response.ok) {
            loginBtn.classList.remove("loading")
            loginBtn.textContent = "Войти"
            loginBtn.disabled = false

            let userData = await response.json()
            localStorage.setItem("userId", userData.user.id)
            localStorage.setItem("userName", userData.user.userName)
            localStorage.setItem("userRole", userData.role)
            localStorage.setItem("persDepartmentId", userData.user.persDepartmentId)

            redirectByRole(userData.role)
        } else {
            let error = await response.text()
            alert(error)
            

            loginBtn.classList.remove("loading")
            loginBtn.textContent = "Войти"
            loginBtn.disabled = false
        }
    }
   
    let loginBtn = document.querySelector(".login-form__btn")
    loginBtn.addEventListener("click", function() {
        validateLoginForm()
    })

    const redirectByRole = (role) => {
        window.location.assign(`https://oop.icc.dgu.ru/sved/${role}/`)
        //window.location.assign(`/${role}/`)
    }
})