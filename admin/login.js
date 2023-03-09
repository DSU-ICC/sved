document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let kafedra_id = 6
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

        let response = await fetch(`${URL}/Account/Login`, {
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

            let user = await response.json()
            localStorage.setItem("userName", user.userName)
            localStorage.setItem("userRole", user.role)
            localStorage.setItem("persDepartmentId", user.persDepartmentId)

            
            redirectByRole(user)
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

    const redirectByRole = (user) => {
        if (user.persDepartmentId != null) {
            window.location.assign("/metodist/")
        } else if (user.role == "UMU") {
            window.location.assign("/umu/")
        } else if (user.role == "admin") {
            window.location.assign("/admin/")
        }
    }
})