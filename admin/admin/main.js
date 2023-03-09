document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let logoutBtn = document.querySelector(".header .action__btn")

    let createUserBtn = document.querySelector(".users__btn")
    let popupCreateUser = document.querySelector("#popup-createUser")
    let popupCreateUserBtn = document.querySelector("#popup-createUser .popup-form__btn")

    let popupEditUser = document.querySelector("#popup-editUser")
    let popupEditUserBtn = document.querySelector("#popup-editUser .popup-form__btn")

    let popupDeleteUser = document.querySelector("#popup-deleteUser")
    let popupDeleteUserYesBtn = document.querySelector("#popup-deleteUser .confirm-button--yes")
    let popupDeleteUserNoBtn = document.querySelector("#popup-deleteUser .confirm-button--no")

    let popupCreateUserCheckbox = document.querySelector("#popup-createUser .checkbox label")
    let popupEditUserCheckbox = document.querySelector("#popup-editUser .checkbox label")

    let closeModalBtns = document.querySelectorAll(".popup__close")
    let kafedras

    //закрытие модального окна
    closeModalBtns.forEach(closeItem => {
        closeItem.addEventListener("click", function(e) {
            let popupClosed = e.target.closest(".popup")
            
            //очищение всех полей и выпадающих списков закрываемого модального окна
            let popupLabels = popupClosed.querySelectorAll(".popup-form__label")
            if (popupLabels) {
                popupLabels.forEach(popupLabel => {
                    popupLabel.classList.remove("invalid")
                    let popupLabelInput = popupLabel.querySelector(".popup-form__input")
                    let popupLabelSelect = popupLabel.querySelector(".select")
                    if (popupLabelInput) {
                        popupLabelInput.value = ""
                    } else if (popupLabelSelect) {
                        let popupLabelSelectText = popupLabelSelect.querySelector(".select__text")
                        popupLabelSelect.classList.remove("invalid")
                        popupLabelSelectText.removeAttribute("data-id")
                        popupLabelSelectText.textContent = popupLabelSelectText.dataset.placeholder

                        let popupLabelSelectedEl = popupLabelSelect.querySelector(".select__option.selected")
                        if (popupLabelSelectedEl) {
                            popupLabelSelectedEl.classList.remove("selected")
                        }
                    } else {
                        let popupLabelCheckbox = popupLabel.querySelector("input[type=checkbox]")
                        if (popupLabelCheckbox.classList.contains("checked")) {
                            popupLabelCheckbox.click()
                        }
                    }
                })
            } 

            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")
            
        })
    })

    //кнопка создания пользователя
    createUserBtn.addEventListener("click", function() {
        popupCreateUser.classList.add("open")
        document.body.classList.add("no-scroll")
    })

    //кнопка создания пользователя в модальном окне
    popupCreateUserBtn.addEventListener("click", function() {
        let loginInput = popupCreateUser.querySelector("#login")
        let passwordInput = popupCreateUser.querySelector("#password")

        let selectedKafedra = popupCreateUser.querySelector("[data-selectfield=kafedra] .select__text")
        let selectedKafedraName = selectedKafedra.textContent
        let selectedKafedraId = selectedKafedra.dataset.id
        
        let isValidForm = true
        if (loginInput.value.trim() == "") {
            isValidForm = false
            loginInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            loginInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (passwordInput.value.trim() == "") {
            isValidForm = false
            passwordInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            passwordInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (selectedKafedraName == "Выберите кафедру") {
            selectedKafedraId = 0
        }

        if (isValidForm) {
            let newUser = {
                persDepartmentId: selectedKafedraId,
                login: loginInput.value,
                password: passwordInput.value,
            }

            let isAdmin = false
            if (popupCreateUserCheckbox.previousElementSibling.classList.contains("checked")) {
                newUser.role = "admin"
            }

            createUser(newUser, isAdmin)
        }
    })

    //создания пользователя
    const createUser = async (newUser, isAdmin) => {
        popupCreateUserBtn.classList.add("loading")
        popupCreateUserBtn.textContent = "Создание..."
        popupCreateUserBtn.disabled = true
        
        let response = await fetch(`${URL}/User/CreateUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(newUser)
        })

        if (response.ok) {
            alert("Пользователь успешно создан")
            popupCreateUserBtn.classList.remove("loading")
            popupCreateUserBtn.textContent = "Создать"
            popupCreateUserBtn.disabled = false
            popupCreateUserBtn.closest(".popup").querySelector(".popup__close").click()
            getAllUsers()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось создать пользователя. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            popupCreateUserBtn.classList.remove("invalid")
            popupCreateUserBtn.textContent = "Создать"
            popupCreateUserBtn.disabled = false
        }
    } 

    //кнопка изменения пользователя в модальном окне
    popupEditUserBtn.addEventListener("click", function() {
        let userId = popupEditUser.querySelector("#userId").value
        let userLoginInput = popupEditUser.querySelector("#userLogin")
        let userPasswordInput = popupEditUser.querySelector("#userPassword")
        let selectedKafedra = popupEditUser.querySelector("[data-selectfield=kafedra] .select__text")

        let isValidForm = true
        
        if (userLoginInput.value.trim() == "") {
            isValidForm == false
            userLoginInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            userLoginInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (userPasswordInput.value.trim() == "") {
            isValidForm == false
            userPasswordInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            userPasswordInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (isValidForm) {
            let isAdmin = false
            if (popupEditUserCheckbox.previousElementSibling.classList.contains("checked")) {
                isAdmin = true
            }
            editUser(userId, userLoginInput.value, userPasswordInput.value, selectedKafedra.dataset.id, isAdmin)
        }

    })

    //изменение пользователя
    const editUser = async (userId, userLogin, userPassword, kafedraId, isAdmin) => {
        popupEditUserBtn.classList.add("loading")
        popupEditUserBtn.textContent = "Сохранение..."
        popupEditUserBtn.disabled = true

        let user = {
            id: userId,
            login: userLogin,
            password: userPassword, 
            persDepartmentId: kafedraId,
        }

        let response = await fetch(`${URL}/User/EditUser`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(user)
        })

        if (response.ok) {
            let role = ""
            if (isAdmin) {
                role = "&role=admin"
            } 

            let roleResponse = await fetch(`${URL}/Role/EditRole?userId=${userId}${role}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            if (roleResponse.ok) {
                alert("Изменение данных пользователя прошло успешно")
                popupEditUserBtn.classList.remove("loading")
                popupEditUserBtn.textContent = "Сохранить изменения"
                popupEditUserBtn.disabled = false
                popupEditUserBtn.closest(".popup__content").querySelector(".popup__close").click()
                getAllUsers()
            } else {
                let error = await response.text()
                if (error.startsWith("{")) {
                    alert("Не удалось изменить профиль. Попробуйте еще раз")
                } else {
                    alert(error)
                }
                
                popupEditUserBtn.classList.remove("loading")
                popupEditUserBtn.textContent = "Сохранить изменения"
                popupEditUserBtn.disabled = false
            }
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось изменить профиль. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            popupEditUserBtn.classList.remove("loading")
            popupEditUserBtn.textContent = "Сохранить изменения"
            popupEditUserBtn.disabled = false
        }
    }

    //нажатие на кнопку да в модальном окне удаления пользователя
    popupDeleteUserYesBtn.addEventListener("click", function() {
        let userId = popupDeleteUser.querySelector("#userId").value
        deleteUser(userId)
    })

    //нажатие на кнопку нет в модальном окне удаления пользователя
    popupDeleteUserNoBtn.addEventListener("click", function(e) {
        e.target.closest(".popup").querySelector(".popup__close").click()
    })

    //удаления пользователя
    const deleteUser = async (userId) => {
        popupDeleteUserYesBtn.classList.add("loading")
        popupDeleteUserYesBtn.disabled = true
        
        let response = await fetch(`${URL}/User/DeleteUser?id=${userId}`, {
            method: "DELETE",
            credentials: "include"
        })

        if (response.ok) {
            alert("Пользователь успешно удален")
            popupDeleteUserYesBtn.classList.remove("loading")
            popupDeleteUserYesBtn.disabled = false
            popupDeleteUserYesBtn.closest(".popup").querySelector(".popup__close").click()
            getAllUsers()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить пользователя. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            popupDeleteUserYesBtn.classList.remove("loading")
            popupDeleteUserYesBtn.disabled = false
        }
    }

    popupCreateUserCheckbox.addEventListener("click", function(e) {
        if (this.previousElementSibling.hasAttribute("checked")) {
            this.previousElementSibling.removeAttribute("checked")
        } else {
            this.previousElementSibling.setAttribute("checked", "checked")
        }
        
        this.previousElementSibling.classList.toggle("checked")
    })

    popupEditUserCheckbox.addEventListener("click", function(e) {
        if (this.previousElementSibling.hasAttribute("checked")) {
            this.previousElementSibling.removeAttribute("checked")
        } else {
            this.previousElementSibling.setAttribute("checked", "checked")
        }
        
        this.previousElementSibling.classList.toggle("checked")
    })

    //получение всех пользователей
    const getAllUsers = async () => {
        let response = await fetch(`${URL}/User/GetUsers`, {
            credentials: "include"
        })

        if (response.ok) {
            let users = await response.json()
            showAllUsers(users)
        } else if (response.status == 404) {
            window.location.assign("/admin/index.html")
        } else if (response.status == 405) {
            window.location.assign("/login.html")
        } 
    }

    //вывод всех пользователей
    const showAllUsers = (users) => {
        let markup = `
            <table>
                <thead>
                    <tr>
                        <th>Имя пользователя</th>
                        <th>Кафедра</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `
        
        for (let user of users) {
            let userKafedraName = kafedras[kafedras.map(e => e.depId).indexOf(user.persDepartmentId)]?.depName

            markup +=  `
                    <tr>
                        <td>${user.userName}</td>
                        <td>${userKafedraName ?? ""}</td>
                        <td>
                            <div class="wrapper">
                                <button type="button" class="edit">
                                    <span data-id="${user.id}"  class="edit__btn btn"></span>
                                </button> 
                                <button type="button" class="delete">
                                    <span data-id="${user.id}" class="delete__btn btn"></span>
                                </button> 
                            </div>
                        </td>
                    </tr>
                `
        }

        markup += `
            </tbody>
            </table>
        `

        document.querySelector(".users__table").innerHTML = markup

        let editUserBtns = document.querySelectorAll(".users__table .edit__btn")
        editUserBtns.forEach(editUserItem => {
            editUserItem.addEventListener("click", function(e) {
                let userId = e.target.dataset.id
                let userName = e.target.closest("tr").firstElementChild.textContent
                let kafedraName = e.target.closest("tr").children[1].textContent 

                popupEditUser.querySelector("#userId").value = userId
                popupEditUser.querySelector("#userLogin").value = userName

                if (kafedraName != "") {
                    let kafedraSelectOptions = document.querySelectorAll("#popup-editUser [data-selectfield=kafedra] .select__option") 

                    kafedraSelectOptions.forEach(kafedraOption => {
                        if (kafedraOption.textContent.trim().toLowerCase() == kafedraName.trim().toLowerCase()) {
                            kafedraOption.classList.add("selected")
                            kafedraOption.closest(".select").querySelector(".select__text").textContent = kafedraName
                            kafedraOption.closest(".select").querySelector(".select__text").setAttribute("data-id", kafedraOption.dataset.id)   
                        }
                    })
                }

                popupEditUser.classList.add("open")
                document.body.classList.add("no-scroll")
            })
        })

        let deleteUserBtns = document.querySelectorAll(".users__table .delete__btn")
        deleteUserBtns.forEach(deleteUserItem => {
            deleteUserItem.addEventListener("click", function(e) {
                popupDeleteUser.classList.add("open")
                document.body.classList.add("no-scroll")

                let id = e.target.dataset.id
                popupDeleteUser.querySelector("#userId").value = id
            })
        })
    }

    //получение всех кафедр
    const getAllKafedra = async () => {
        let response = await fetch(`${URL}/PersonalData/GetAllKafedra`, {
            credentials: "include"
        })
            
        if (response.ok) {
            kafedras = await response.json()
            let res = ""
            for (let el of kafedras) {
                res += `
                    <li class="select__option" data-id=${el.depId}>
                        <span class="select__option-text">${el.depName}</span>
                    </li>
                `
            }
            popupCreateUser.querySelector("[data-selectfield=kafedra] .select__options").innerHTML = res
            popupEditUser.querySelector("[data-selectfield=kafedra] .select__options").innerHTML = res
        } else if (response.status == 404) {
            window.location.assign("/admin/index.html")
        } else if (response.status == 405) {
            window.location.assign("/login.html")
        }
    }
    
    //функционал выпадающих списков
    const select = document.querySelectorAll('.select');
    select.forEach(selectItem => {
        selectItem.querySelector('.select__btn').addEventListener('click', function () {
            selectItem.classList.toggle('active');
        })
        let options = selectItem.querySelector('.select__options');
        options.addEventListener("click", function(e) {
            if (e.target.closest(".select__option")) {
                options.querySelectorAll(".select__option").forEach(optionItem => {
                    optionItem.classList.remove("selected")
                })
                e.target.closest(".select__option").classList.add("selected")
                let selectedOption = e.target.closest(".select__option").querySelector('.select__option-text').innerText;
                selectItem.querySelector('.select__text').innerText = selectedOption;
                selectItem.querySelector('.select__text').dataset.id = e.target.closest(".select__option").dataset.id
                selectItem.classList.remove('active');
            }
        })
                    
    })

    //кнопка выхода из аккаунта
    logoutBtn.addEventListener("click", function() {
        logout()
    })

    //выход из аккаунта
    const logout = async () => {
        let response = await fetch(`${URL}/Account/Logout`, {
            credentials: "include"
        }) 

        if (response.ok) {
            localStorage.removeItem("userName")
            localStorage.removeItem("userRole")
            localStorage.removeItem("persDepartmentId")
            window.location.assign("/login.html")
        }
    }

    //получение всех статусов дисциплин
    const getAllRemovableStatusDiscipline = async () => {
        let response = await fetch(`${URL}/StatusDiscipline/GetRemovableStatusDiscipline`, {
            credentials: "include"
        })

        if (response.ok) {
            let statusDisciplines = await response.json()
            let res = ""
            for (let elem of statusDisciplines) {
                res += `
                    <li class="select__option" data-id=${elem.id}>
                        <span class="select__option-text">${elem.name}</span>
                    </li>
                `
            }
            document.querySelector("[data-selectfield=statusDiscipline] .select__options").innerHTML = res
        } else {
            let error = await response.text()
            alert(error)
        }
    }

    //функция, которая создает ссылку на панель администратора если пользователем является админ
    const setUserName = (userName, userRole = "") => {
        if (userName) {
            let actionText = document.querySelector(".header .action__text")

            if (userRole.toLowerCase() == "admin") {
                actionText.outerHTML = `<a href="/admin/admin.html" class="action__text">${userName}</a>`
            } else {
                actionText.textContent = userName
            }
        }
    }

    setUserName(localStorage.getItem("userName"), localStorage.getItem("userRole"))

    getAllKafedra().then(_ => getAllUsers()).then(_ => getAllRemovableStatusDiscipline())
})