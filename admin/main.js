document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path

    //const URL = "https://localhost:44370"
    const URL = "https://oop.dgu.ru"

    let logoutBtn = document.querySelector(".header .action__btn")

    let createUserBtn = document.querySelector(".users__btn")
    let popupCreateUser = document.querySelector("#popup-createUser")
    let popupCreateUserBtn = document.querySelector("#popup-createUser .popup-form__btn")

    let popupEditUser = document.querySelector("#popup-editUser")
    let popupEditUserBtn = document.querySelector("#popup-editUser .popup-form__btn")

    let popupDeleteUser = document.querySelector("#popup-deleteUser")
    let popupDeleteUserYesBtn = document.querySelector("#popup-deleteUser .confirm-button--yes")
    let popupDeleteUserNoBtn = document.querySelector("#popup-deleteUser .confirm-button--no")

    let closeModalBtns = document.querySelectorAll(".popup__close")
    let users
    let kafedras

    let choiceOptions = {
        noResultsText: "Результат не найден",
        itemSelectText: "",
        loadingText: "Загрузка данных...",
        noChoicesText: "Элементы списка отсутствуют",
        removeItemButton: true, 
        position: "bottom",
        searchResultLimit: 9999,
    }

    let kafedraSelect = document.querySelector("#kafedra")
    let kafedraChoice = new Choices(kafedraSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

    let kafedraSelectTwo = document.querySelector("#kafedra-2")
    let kafedraChoiceTwo = new Choices(kafedraSelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

    let facultySelect = document.querySelector("#faculty")
    let facultyChoice = new Choices(facultySelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

    let facultySelectTwo = document.querySelector("#faculty-2")
    let facultyChoiceTwo = new Choices(facultySelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

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
                    let popupLabelSelect = popupLabel.querySelector("select")

                    //очистка текстового поля
                    if (popupLabelInput) {
                        popupLabelInput.value = ""
                    } else if (popupLabelSelect) { // сброс значений выпадоющего списка
                        if (popupClosed.getAttribute("id") == "popup-createUser") {
                            kafedraSelect.closest(".choices__inner").classList.remove("invalid")
                            kafedraChoice.removeActiveItems()

                            facultySelect.closest(".choices__inner").classList.remove("invalid")
                            facultyChoice.removeActiveItems()
                        } else {
                            kafedraSelectTwo.closest(".choices__inner").classList.remove("invalid")
                            kafedraChoiceTwo.removeActiveItems()

                            facultySelectTwo.closest(".choices__inner").classList.remove("invalid")
                            facultyChoiceTwo.removeActiveItems()
                        }
                    }
                })
            } 

            //после очистки закрываем модальное окно
            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")
            
        })
    })

    //кнопка создания пользователя
    createUserBtn.addEventListener("click", function() {  
        //ставим в модальном окне значение роли по умолчанию (методист) и скрываем выбор факультетов
        let metodistRoleRadioBtn = popupCreateUser.querySelector(".radio__item:nth-child(1) label")
        metodistRoleRadioBtn.click()
        metodistRoleRadioBtn.previousElementSibling.classList.add("checked")

        //let facultySelect = popupCreateUser.querySelector(".select[data-selectField=faculty]")
        facultySelect.closest(".popup-form__label").style.display = "none"

        popupCreateUser.classList.add("open")
        document.body.classList.add("no-scroll")

        //обработчик событий выбора роли
        const radioBtns = popupCreateUser.querySelectorAll(".radio__item label")
        radioBtns.forEach((radioItem) => {
            radioItem.addEventListener("click", function(e) {
                //очищаем все радио кнопки
                for (let radioEl of radioBtns) {
                    radioEl.closest(".radio__item").querySelector("input").classList.remove("checked")
                }

                //скрываем выбор кафедры и факультетов
                //let kafedraSelect = popupCreateUser.querySelector(".select[data-selectField=kafedra]").closest(".popup-form__label")
                kafedraSelect.closest(".popup-form__label").style.display = "none"
        
                //let facultySelect = popupCreateUser.querySelector(".select[data-selectField=faculty]").closest(".popup-form__label")
                facultySelect.closest(".popup-form__label").style.display = "none"

                //помечаем нажатую кнопку как выбранную
                e.target.closest(".radio__item").querySelector("input").classList.add("checked")

                
                let selectedRole = e.target.textContent.trim()
                //если выбранная роль - методист, то даем возможность выбрать кафедру
                if (selectedRole == "Методист") {                    
                    kafedraSelect.closest(".popup-form__label").style.display = "flex"
                } else if (selectedRole == "Сотрудник УМУ") { //если выбранная роль - сотрудник УМУ, то даем возможность выбрать факультеты
                    facultySelect.closest(".popup-form__label").style.display = "flex"
                }
            })
        })
    })

    //кнопка создания пользователя в модальном окне
    popupCreateUserBtn.addEventListener("click", function() {
        let loginInput = popupCreateUser.querySelector("#login")
        let passwordInput = popupCreateUser.querySelector("#password")

        //валидация формы и создание объекта пользователя
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

        let newUser = {}

        let selectedRole = popupCreateUser.querySelector("input.checked + label")?.textContent.trim()
        if (selectedRole == "Методист") {
            let selectedKafedraId = kafedraChoice.getValue(true)
            if (!selectedKafedraId) {
                isValidForm = false
                kafedraSelect.closest(".choices__inner").classList.add("invalid")
            } else {
                kafedraSelect.closest(".choices__inner").classList.remove("invalid")
                newUser.persDepartmentId = selectedKafedraId
                newUser.role = "methodist"
                newUser.faculties = []
            }
        }

        if (selectedRole == "Сотрудник УМУ") {
            let selectedFacultiesId = facultyChoice.getValue(true)
            if (!selectedFacultiesId.length > 0) {
                isValidForm = false
                facultySelect.closest(".choices__inner").classList.add("invalid")
            } else {
                facultySelect.closest(".choices__inner").classList.remove("invalid")

                newUser.faculties = selectedFacultiesId
                newUser.role = "umu"
                newUser.persDepartmentId = 0
            }
        }
        
        if (selectedRole == "Админ") {
            newUser.persDepartmentId = 0
            newUser.role = "admin"
            newUser.faculties = []
        }

        //если форма заполнена, то отправляем запрос на создание пользователя
        if (isValidForm) {
            newUser.login = loginInput.value
            newUser.password = passwordInput.value
            createUser(newUser)
        }
    })

    //создания пользователя
    const createUser = async (newUser) => {
        popupCreateUserBtn.classList.add("loading")
        popupCreateUserBtn.textContent = "Создание..."
        popupCreateUserBtn.disabled = true
        
        let response = await fetch(`${URL}/api/User/CreateUser`, {
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

            popupCreateUserBtn.classList.remove("loading")
            popupCreateUserBtn.textContent = "Создать"
            popupCreateUserBtn.disabled = false
        }
    } 

    //кнопка изменения пользователя в модальном окне
    popupEditUserBtn.addEventListener("click", function() {
        let userId = popupEditUser.querySelector("#userId").value
        let userLoginInput = popupEditUser.querySelector("#userLogin")
        let userPasswordInput = popupEditUser.querySelector("#userPassword")

        //валидация формы и создание объекта изменяемого пользователя
        let isValidForm = true
        
        if (userLoginInput.value.trim() == "") {
            isValidForm = false
            userLoginInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            userLoginInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (userPasswordInput.value.trim() == "") {
            isValidForm = false
            userPasswordInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            userPasswordInput.closest(".popup-form__label").classList.remove("invalid")
        }

        let userEdited = {id: userId}

        let selectedRole = popupEditUser.querySelector("input.checked + label")?.textContent.trim()
        if (selectedRole == "Методист") {
            let selectedKafedraId = kafedraChoiceTwo.getValue(true)
            if (!selectedKafedraId) {
                isValidForm = false
                kafedraSelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                kafedraSelectTwo.closest(".choices__inner").classList.remove("invalid")
                userEdited.persDepartmentId = selectedKafedraId
                userEdited.role = "methodist"
                userEdited.faculties = []
            }
        }

        if (selectedRole == "Сотрудник УМУ") {
            let selectedFacultiesId = facultyChoiceTwo.getValue(true)
            if (!selectedFacultiesId.length > 0) {
                isValidForm = false
                facultySelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                facultySelectTwo.closest(".choices__inner").classList.remove("invalid")

                userEdited.faculties = selectedFacultiesId
                userEdited.role = "umu"
                userEdited.persDepartmentId = 0
            }
        }
        
        if (selectedRole == "Админ") {
            userEdited.persDepartmentId = 0
            userEdited.role = "admin"
            userEdited.faculties = []
        }

        //если форма валидна, то отправляем запрос на изменение данных пользователя
        if (isValidForm) {
            userEdited.login = userLoginInput.value
            userEdited.password = userPasswordInput.value

            editUser(userEdited)
        }

    })

    //изменение пользователя
    const editUser = async (userEdited) => {
        popupEditUserBtn.classList.add("loading")
        popupEditUserBtn.textContent = "Сохранение..."
        popupEditUserBtn.disabled = true

        let response = await fetch(`${URL}/api/User/EditUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(userEdited)
        })

        if (response.ok) {
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
    }

    //нажатие на кнопку да в модальном окне удаления пользователя
    popupDeleteUserYesBtn.addEventListener("click", function() {
        let userId = popupDeleteUser.querySelector("#userId").value
        deleteUser(userId)
    })

    //нажатие на кнопку нет в модальном окне удаления пользователя
    popupDeleteUserNoBtn.addEventListener("click", function(e) {
        //закрываем модальное окно
        e.target.closest(".popup").querySelector(".popup__close").click()
    })

    //удаления пользователя
    const deleteUser = async (userId) => {
        popupDeleteUserYesBtn.classList.add("loading")
        popupDeleteUserYesBtn.disabled = true
        
        let response = await fetch(`${URL}/api/User/DeleteUser?id=${userId}`, {
            method: "POST",
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

    //получение всех пользователей
    const getAllUsers = async () => {
        document.querySelector(".users__table").innerHTML = `
            <p>Идет загрузка пользователей...</p>
        `

        let response = await fetch(`${URL}/api/User/GetUsers`, {
            credentials: "include"
        })

        if (response.ok) {
            users = await response.json()   
            showAllUsers(users)
        } 
    }

    //вывод всех пользователей
    const showAllUsers = (users) => {
        let markup = `
            <table>
                <thead>
                    <tr>
                        <th>Имя пользователя</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `
        
        for (let userData of users) {
            markup +=  `
                    <tr>
                        <td>${userData.user.userName}</td>
                        <td>
                            <div class="wrapper">
                                <button type="button" class="edit">
                                    <span data-id="${userData.user.id}" class="edit__btn btn"></span>
                                </button> 
                                <button type="button" class="delete">
                                    <span data-id="${userData.user.id}" class="delete__btn btn"></span>
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

        if (markup.length > 0) {
            document.querySelector(".users__table").innerHTML = markup
        } else {
            document.querySelector(".users__table").innerHTML = ""
        } 

        //обработка события нажатия на кнопку изменения пользователя
        let editUserBtns = document.querySelectorAll(".users__table .edit__btn")
        editUserBtns.forEach(editUserItem => {
            editUserItem.addEventListener("click", function(e) {
                let userId = e.target.dataset.id
                let userName = e.target.closest("tr").firstElementChild.textContent
                popupEditUser.querySelector("#userId").value = userId
                popupEditUser.querySelector("#userLogin").value = userName

                //let facultySelect = popupEditUser.querySelector(".select[data-selectField=faculty]")
                //let kafedraSelect = popupEditUser.querySelector(".select[data-selectField=kafedra]")
                
                //получаем изменяемого пользователя
                let userEdited = users[users.map(e => e.user.id).indexOf(userId)]

                if (userEdited.department != null) {
                    let metodistRoleRadioBtn = popupEditUser.querySelector(".radio__item:nth-child(1) label")
                    metodistRoleRadioBtn.click()
                    metodistRoleRadioBtn.previousElementSibling.classList.add("checked")

                    //скрываем выбор факультетов
                    facultySelectTwo.closest(".popup-form__label").style.display = "none"

                    // let kafedraSelectOptions = kafedraSelect.querySelectorAll(".select__option")
                    // kafedraSelectOptions.forEach(optionItem => {
                    //     if (optionItem.textContent.trim() == userEdited.department.depName) {
                    //         optionItem.click()
                    //         return
                    //     }
                    // })
                    kafedraChoiceTwo.setChoiceByValue(userEdited.department.depId)
                } else if (userEdited.faculties.length > 0) {
                    let umuRoleRadioBtn = popupEditUser.querySelector(".radio__item:nth-child(2) label")
                    umuRoleRadioBtn.click()
                    umuRoleRadioBtn.previousElementSibling.classList.add("checked")

                    //скрываем выбор кафедр
                    kafedraSelectTwo.closest(".popup-form__label").style.display = "none"

                    let userFacultiesId = userEdited.faculties.map(e => e.divId)
                    facultyChoiceTwo.setChoiceByValue(userFacultiesId)
                } else {
                    let adminRoleRadioBtn = popupEditUser.querySelector(".radio__item:nth-child(3) label")
                    adminRoleRadioBtn.click()
                    adminRoleRadioBtn.previousElementSibling.classList.add("checked")

                    //скрываем выбор кафедр
                    kafedraSelectTwo.closest(".popup-form__label").style.display = "none"
                     
                    //скрываем выбор факультетов
                    facultySelectTwo.closest(".popup-form__label").style.display = "none"
                }
                
                popupEditUser.classList.add("open")
                document.body.classList.add("no-scroll")

                //получаем все кнопки выбора роли
                const radioBtns = popupEditUser.querySelectorAll(".radio__item label")
                radioBtns.forEach((radioItem) => {
                    //обработчик для каждой кнопки
                    radioItem.addEventListener("click", function(e) {
                        //очищаем все радио кнопки
                        for (let radioEl of radioBtns) {
                            radioEl.closest(".radio__item").querySelector("input").classList.remove("checked")
                        }

                        //скрываем выбор кафедр и факультетов
                        let kafedraSelect = kafedraSelectTwo.closest(".popup-form__label")
                        kafedraSelect.style.display = "none"
                
                        let facultySelect = facultySelectTwo.closest(".popup-form__label")
                        facultySelect.style.display = "none"

                        //помечаем нажатую кнопку как выбранную
                        e.target.closest(".radio__item").querySelector("input").classList.add("checked")

                        let selectedRole = e.target.textContent.trim()

                        //если выбранная роль - методист, то даем возможность выбрать кафедру
                        if (selectedRole == "Методист") {                    
                            kafedraSelect.style.display = "flex"
                        } else if (selectedRole == "Сотрудник УМУ") {//если выбранная роль - методист, то даем возможность выбрать кафедру
                            facultySelect.style.display = "flex"
                        }
                    })
                })
            })
        })

        //обработка событий нажатий на кнопку удаления пользователя
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
        let response = await fetch(`${URL}/api/PersonalData/GetAllKafedra`, {
            credentials: "include"
        })
            
        if (response.ok) {
            kafedras = await response.json()

            const kafedraChoices = []
            for (let el of kafedras) {
                kafedraChoices.push({
                    value: el.depId,
                    label: el.depName,
                    selected: false,
                    disabled: false
                });
            }
            kafedraChoice.setChoices(kafedraChoices, "value", "label", true);
            kafedraChoiceTwo.setChoices(kafedraChoices, "value", "label", true);
        } 
    }
    
    const getAllFaculties = async () => {
        let response = await fetch(`${URL}/api/DekanatData/GetFaculties`)

        if (response.ok) {
            faculties = await response.json()
            fillFacultyList(faculties)
        }
    }

    //заполнить выпадающий список в поиске данными факультетов для поиска по ним профилей
    const fillFacultyList = (faculties) => {
        const facultyChoices = []
        for (let el of faculties) {
            facultyChoices.push({
                value: el.facId,
                label: el.facName,
                selected: false,
                disabled: false
            });
        }
        facultyChoice.setChoices(facultyChoices, "value", "label", true);
        facultyChoiceTwo.setChoices(facultyChoices, "value", "label", true);
    }

    //функционал выпадающих списков
    // const select = document.querySelectorAll('.select');
    // select.forEach(selectItem => {
    //     selectItem.querySelector('.select__btn').addEventListener('click', function () {
    //         selectItem.classList.toggle('active');
    //     })
    //     let options = selectItem.querySelector('.select__options');
    //     options.addEventListener("click", function(e) {
    //         if (e.target.closest(".select__option")) { 
    //             let selectedOption = e.target.closest(".select__option")
    //             let selectedOptionText = selectedOption.querySelector('.select__option-text').textContent;
    //             let selectText = selectItem.querySelector('.select__text')
    //             let selectedElemId = parseInt(selectedOption.dataset.id)

    //             //если выпадающий список не предусматривает выбор нескольких элементов
    //             if (!selectItem.hasAttribute("data-multiple")) {
    //                 //если мы нажали на не выбранный элемент списка
    //                 if (!selectedOption.classList.contains("selected")) {
    //                     //помечаем все элементы списка как не выбранные
    //                     options.querySelectorAll(".select__option").forEach(optionItem => {
    //                         optionItem.classList.remove("selected")
    //                     })

                        

    //                     //помечаем выбранный нами элемент как выбранный
    //                     selectedOption.classList.add("selected")
    //                     selectText.textContent = selectedOptionText;
    //                     selectText.dataset.id = selectedElemId
    //                 } else { //если же мы выбрали уже выбранный элемент списка, 
    //                     selectedOption.classList.remove("selected")
    //                     selectText.textContent = selectText.dataset.placeholder
    //                     selectText.removeAttribute("data-id")
    //                 }
    //             } else { //если в выпадающем списке можно выбрать несколько элементов  
    //                 //если мы нажимаем на не выбранный элемент
    //                 if (!selectedOption.classList.contains("selected")) {
    //                     //помечаем его как выбранный элемент
    //                     selectedOption.classList.add("selected")

    //                     //если мы выбрали второй или более элемент списка
    //                     if (selectText.textContent != selectText.dataset.placeholder) {
    //                         selectText.textContent += `, ${selectedOptionText}`;
    //                         selectText.dataset.id += `, ${selectedElemId}`
    //                     } else { // если впервые выбрали элемент списка
    //                         selectText.textContent = selectedOptionText;
    //                         selectText.dataset.id = selectedElemId
    //                     }
    //                 } else { //логика удаления элемента из списка

    //                     selectedOption.classList.remove("selected")

    //                     //создаем массив айди выбранных элементов списка, а также массив их названия
    //                     let arrayId = [...selectText.dataset.id.split(", ")]
    //                     let listElem = selectText.textContent.split(", ")

    //                     //если было выбрано больше одного элемента списка
    //                     if (arrayId.length > 1) {

    //                         //создаем строку названий элементов, не включая в него выбранный нами элемент
    //                         selectText.textContent = listElem.filter(el => el != selectedOptionText).join(", ")

    //                         //создаем строку айди элементов, не включая в него выбранный нами элемент
    //                         selectText.dataset.id = arrayId.filter(id => parseInt(id) != selectedElemId).join(", ")
    //                     } else {// если бьл выбран только один элемент, то просто ставим значение списка по умолчанию и удаляем id
    //                         selectText.textContent = selectText.dataset.placeholder
    //                         selectText.removeAttribute("data-id")
    //                     }
    //                 }
    //             }
                
    //             selectItem.classList.remove('active');
    //         }
    //     })
                    
    // })

    //функция, которая устанавливает имя пользователя в шапку страницы
    const setUserName = (userName) => {
        let actionText = document.querySelector(".header .action__text")
        actionText.textContent = userName
    }

    //выход подьзователя из аккаунта
    const logout = async () => {
        let response = await fetch(`${URL}/api/Account/Logout`, {
            credentials: "include"
        }) 

        if (response.ok) {
            localStorage.clear()
            window.location.assign(`${URL}/sved/login.html`)
        }
    }

    //функция проверки авторизаций пользователя
    const isAuthorize = () => localStorage.getItem("userId") != null

    //нажатие на кнопку выхода из аккаунта пользователя
    logoutBtn.addEventListener("click", function() {
        logout()
    })

    //функция проверки доступа пользователя по его роли
    const hasUserAccessToRole = () => userRole == "admin"

    //если пользователь авторизовался
    if (isAuthorize()) {
        userId = localStorage.getItem("userId")
        userRole = localStorage.getItem("userRole")

        let hasAccess = hasUserAccessToRole()

        if (hasAccess) {
            userName = localStorage.getItem("userName")

            setUserName(userName)
            getAllKafedra().then(_ => getAllFaculties()).then(_ => getAllUsers())
        } else { //если пользователь не имеет доступа к данной странице, то он перемещается на страницу, соответствующая его роли 
            let redirectPage = userRole !== "null" ? userRole : "metodist"
            window.location.assign(`${URL}/sved/${redirectPage}/`)
        }
    } else {
        window.location.assign(`${URL}/sved/login.html`)
    }
})  