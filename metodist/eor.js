document.addEventListener("DOMContentLoaded", () => {
    const URL = "https://localhost:44370"
    let logoutBtn = document.querySelector(".header .action__btn")
    let closeModalBtns = document.querySelectorAll(".popup__close")
    let popupUploadFileRpd = document.querySelector("#popup-createRpd")
    let popupUploadFileRpdBtn = document.querySelector("#popup-createRpd .popup-form__btn")
    let createDisciplineBtn = document.querySelector(".page__header .action-eor")
    let createStatusBtn = document.querySelector(".popup-form__btn--create-status")
    let popupCreateStatus = document.querySelector("#popup-createStatus")
    let popupCreateStatusBtn = document.querySelector("#popup-createStatus .popup-form__btn")
    let popupCreateDiscipline = document.querySelector("#popup-createDiscipline")
    let popupCreateDisciplineBtn = document.querySelector("#popup-createDiscipline .popup-form__btn--create-discipline")
    let popupEditStatus = document.querySelector("#popup-editStatus")
    let popupEditStatusBtn = document.querySelector("#popup-editStatus .popup-form__btn")
    let popupEditDiscipline = document.querySelector("#popup-editDiscipline")
    let popupEditDisciplineBtn = document.querySelector("#popup-editDiscipline .popup-form__btn")
    let popupDeleteRpd = document.querySelector("#popup-deleteRpd")
    let popupDeleteRpdYesBtn = document.querySelector("#popup-deleteRpd .confirm-button--yes")
    let popupDeleteRpdNoBtn = document.querySelector("#popup-deleteRpd .confirm-button--no")
    let popupDeleteDiscipline = document.querySelector("#popup-deleteDiscipline")
    let popupDeleteDisciplineYesBtn = document.querySelector("#popup-deleteDiscipline .confirm-button--yes")
    let popupDeleteDisciplineNoBtn = document.querySelector("#popup-deleteDiscipline .confirm-button--no")
    let deleteStatusBtn = document.querySelector(".status__btn")
    let popupDeleteStatus = document.querySelector("#popup-deleteStatus")
    let popupDeleteStatusYesBtn = document.querySelector("#popup-deleteStatus .confirm-button--yes")
    let popupDeleteStatusNoBtn = document.querySelector("#popup-deleteStatus .confirm-button--no")
    let profileId = window.location.href.split("=")[1];
    let disciplineList;
    let authors;
    
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
                    let popupLabelSearch = popupLabel.querySelector(".search")
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
                    } else if (popupLabelSearch) {
                        let popupLabelSearchInp = popupLabelSearch.querySelector("input")
                        popupLabelSearchInp.value = ""
                    }
                })
            } 

            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")
            
        })
    })

    //генерация случайного числа для генерации ключа
    const randomNumber = (max) => Math.floor(Math.random() * max)

    //генерация ключа для эцп
    const generateKeyForSignature = () => {
        let key = ""
        key += Number(randomNumber(2 ** 32 - 1)).toString(16).toString().substring(0, 8) + "-"
        key += Number(randomNumber(2 ** 32 - 1)).toString(16).toString().substring(0, 4) + "-"
        key += Number(randomNumber(2 ** 32 - 1)).toString(16).toString().substring(0, 4) + "-"
        key += Number(randomNumber(2 ** 32 - 1)).toString(16).toString().substring(0, 4)
        key += Number(randomNumber(2 ** 32 - 1)).toString(16).toString().substring(0, 8)
        return key.toUpperCase()
    }

    //получение профилей вместе с их статусами по айди профиля
    const getDisciplinesByProfile = async (profileId) => {
        let response = await fetch(`${URL}/Discipline/GetDisciplineByProfileId?profileId=${profileId}`, {
            credentials: "include",
        })
        const userName = localStorage.getItem("userName")
        const userRole = localStorage.getItem("userRole")

        if (response.ok) {
            let data = await response.json()
            disciplineList = data.disciplines 

            //вывод пользователю названия направления профиля
            let headerTitle = document.querySelector(".page__title")
            headerTitle.textContent = `Направление: ${data.caseSDepartment.code} ${data.caseSDepartment.deptName}`

            //вывод пользователю названия название профиля
            let headerSubTitle = document.querySelector(".page__subtitle")
            headerSubTitle.textContent = `Профиль: ${data.profile.profileName}`

            setUserName(userName, userRole)

            showDisciplines(disciplineList)
        } else if (response.status == 405) {
            window.location.assign("/login.html")
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось получить профили")
            } else {
                alert(error)
            }
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

    //вывод дисциплин пользователю 
    const showDisciplines = (disciplineList) => {
        let statusList = new Set(disciplineList.map(e => e.statusDiscipline.name))
        let res = ""
        for (let statusItem of statusList) {
            res += `
                <li class="accordeon__item">
                    <div class="accordeon__control" aria-expanded="false">               
                        <p class="accordeon__title">${statusItem}</p>
                        <div class="accordeon__icon"></div>
                    </div>
                    <div class="accordeon__content" aria-hidden="true">
                        <div class="actions-eor">
                            <button type="button" data-statusDisciplineId=${disciplineList[disciplineList.map(e => e.statusDiscipline.name).indexOf(statusItem)].statusDiscipline.id} class="action-eor action-eor--edit-status btn">
                                Изменить статус дисциплины
                            </button>
                        </div>
                        <table class="discipline-table">
                            <tbody>
                                
                           
            `
            for (let discipline of disciplineList) {
                if (discipline.statusDiscipline.name == statusItem) {

                    let disciplineMarkup = "";
                    disciplineMarkup += 
                        `
                        <tr class="discipline">
                            <td>${discipline.code}</td>
                    `

                    if (discipline.fileRPD != null) {
                        disciplineMarkup += `
                            <td>
                               <div class="wrapper">
                                    <div class="item-file__inner">
                                        <span class="key-icon"></span>
                                        <div class="document-key">
                                            <p class="document-key__text">Документ подписан</p>
                                            <p class="document-key__text">Простая электронная подпись</p>
                                            <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                            <p class="document-key__text">Ректор</p>
                                            <p class="document-key__text">Ключ (SHA-256):</p>
                                            <p class="document-key__text">${discipline.fileRPD.codeECP}</p>
                                        </div>
                                        <a class="discipline-name" href="${discipline.fileRPD.name}">${discipline.disciplineName}</a>
                                    </div>
                                    <div class="actions-rpd">
                                        <button type="button" class="delete delete-rpd">
                                            <span data-filerpdid="${discipline.fileRPD.id}" class="delete__btn btn"></span>
                                        </button>                 
                                        <button type="button" class="edit">
                                            <span data-disciplineid="${discipline.id}" class="edit__btn btn"></span>
                                        </button>     
                                `
                    } else {
                        disciplineMarkup += `
                            <td>
                                <div class="wrapper">
                                    <span class="discipline-name">${discipline.disciplineName}</span>
                                    <div class="actions-rpd">
                                        <label class="file-upload">                                      
                                            <span data-disciplineid="${discipline.id}" class="file-upload__btn btn"></span>
                                            <input type="file">
                                        </label>    
                                        <button type="button" class="edit">
                                            <span data-disciplineid="${discipline.id}" class="edit__btn btn"></span>
                                        </button> 
                            `
                    }

                    if (discipline.isDeletionRequest) {
                        disciplineMarkup += `
                            <button type="button" class="delete delete-discipline">
                                <span disabled data-disciplineid="${discipline.id}" class="delete__btn btn">Помечен на удаление</span>
                            </button> 
                        `
                    } else {
                        disciplineMarkup += `
                            <button type="button" class="delete delete-discipline">
                                <span data-disciplineid="${discipline.id}" class="delete__btn btn">Удалить дисциплину</span>
                            </button> 
                        `
                    }

                    disciplineMarkup += `
                            </div>
                        </div>
                    </td>
                    </tr>
                    `

                    res += disciplineMarkup
                }
            }
            res += `
                    </tbody>
                    </table>
                </div>
            </li>
            `
        }
        document.querySelector(".accordeon__list").innerHTML = res

        let uploadFileRpdBtns = document.querySelectorAll(".file-upload input[type=file]")
        uploadFileRpdBtns.forEach(uploadBtn => {
            uploadBtn.addEventListener("change", function(e) {
                let btnUpload = e.target.previousElementSibling
    
                popupUploadFileRpd.querySelector("#disciplineId").value = btnUpload.dataset.disciplineid
                popupUploadFileRpd.querySelector("#ecp").value = generateKeyForSignature()

                popupUploadFileRpd.querySelector("#uploadedFile").files = e.target.files
                popupUploadFileRpd.querySelector(".popup-form__file-name").textContent = `Название файла: ${e.target.files[0].name}`

                getAuthors(btnUpload)
                
            })
        })

        let popupDeleteRpdBtns = document.querySelectorAll(".delete-rpd")
        popupDeleteRpdBtns.forEach(popupDeleteRpdBtn => {
            popupDeleteRpdBtn.addEventListener("click", function(e) {
                popupDeleteRpd.classList.add("open")
                document.body.classList.add("no-scroll")
        
                let fileRpdId = e.target.dataset.filerpdid
                popupDeleteRpd.querySelector("#fileRPDId").value = fileRpdId
            })
        })

        let editDisciplineBtns = document.querySelectorAll(".edit")
        editDisciplineBtns.forEach(editBtn => {
            editBtn.addEventListener("click", function(e) {
                popupEditDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                let disciplineName = e.target.closest(".wrapper").querySelector(".discipline-name").textContent
                let disciplineId = e.target.dataset.disciplineid

                popupEditDiscipline.querySelector("#disciplineId").value = disciplineId
                popupEditDiscipline.querySelector(".popup-form__input").value = disciplineName
                
            })
        })

        let editStatusBtns = document.querySelectorAll(".action-eor--edit-status")
        editStatusBtns.forEach(editStatusBtn => {
            editStatusBtn.addEventListener("click", function(e) {
                popupEditStatus.classList.add("open")
                document.body.classList.add("no-scroll")

                let statusDisciplineName = e.target.closest(".accordeon__item").querySelector(".accordeon__title").textContent
                let statusDisciplineId = editStatusBtn.dataset.statusdisciplineid
                
                popupEditStatus.querySelector(".popup-form__input").value = statusDisciplineName
                popupEditStatus.querySelector("#statusDisciplineId").value = statusDisciplineId
            })
        })

        let deleteDisciplineBtns = document.querySelectorAll(".delete-discipline .delete__btn")
        deleteDisciplineBtns.forEach(deleteDisciplineBtn => {
            deleteDisciplineBtn.addEventListener("click", function(e) {
                popupDeleteDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                let disciplineId = e.target.dataset.disciplineid
                popupDeleteDiscipline.querySelector("#disciplineId").value = disciplineId
            })
        })
    }

    popupUploadFileRpdBtn.addEventListener("click", function(e) {
        let selectedAuthor = popupUploadFileRpd.querySelector(".search__input")

        if (selectedAuthor.textContent == "Выберите автора") {
            selectedAuthor.closest(".popup-form__label").classList.add("invalid")
        } else {
            selectedAuthor.closest(".popup-form__label").classList.remove("invalid")

            let author = authors[authors.map(e => e.фио).indexOf(selectedAuthor.value)]
            if (author) {
                //console.log(popupUploadFileRpd.querySelector("#uploadedFile").files[0])
                let formData = new FormData()
                formData.append("disciplineId", popupUploadFileRpd.querySelector("#disciplineId").value)
                formData.append("ecp", popupUploadFileRpd.querySelector("#ecp").value)

                //let fileReader = new FileReader()
                let uploadedFile = popupUploadFileRpd.querySelector("#uploadedFile").files[0]
                //let fileToBinary = fileReader.readAsBinaryString(uploadedFile)
                formData.append("uploadedFile", uploadedFile)

                formData.append("authorId", author.idСотрудника)
                uploadFileRpd(formData, e.target) 
            } else {
                alert("Такого автора нет в списке!")
            }
           
        } 
    })

    //загрузка файла РПД
    const uploadFileRpd = async (formData, el) => {
        el.classList.add("loading")
        el.textContent = "Загрузка..."
        el.disabled = true

        let ecpCode = ""
        if (formData.has("ecp")) {
            ecpCode += `&ecp=${formData.get("ecp")}`
        }
        
        let response = await fetch(`${URL}/FileRPD/CreateRPD?authorId=${formData.get("authorId")}&disciplineId=${formData.get("disciplineId")}${ecpCode}`, {
            method: "POST",
            credentials: "include",
            body: formData
        })

        if (response.ok) {
            alert("РПД успешно загружен")
            el.classList.remove("loading")
            el.textContent = "Загрузить файл РПД"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось загрузить РПД. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.textContent = "Загрузить файл РПД"
            el.disabled = false
        }
    }

    //кнопка создания дисциплины
    createDisciplineBtn.addEventListener("click", function() {
        popupCreateDiscipline.classList.add("open")
        document.body.classList.add("no-scroll")
    })

    //кнопка создания дисциплины в модальном окне
    popupCreateDisciplineBtn.addEventListener("click", function(e) {
        let newDisciplineCode = popupCreateDiscipline.querySelector("#codeDiscipline")
        let newDisciplineName = popupCreateDiscipline.querySelector("#disciplineName")
        let selectedStatusDiscipline = popupCreateDiscipline.querySelector("[data-selectfield=statusDiscipline] .select__text")

        let isValidForm = true
        if (newDisciplineCode.value.trim() == "") {
            isValidForm = false
            newDisciplineCode.closest(".popup-form__label").classList.add("invalid")
        } else {
            newDisciplineCode.closest(".popup-form__label").classList.remove("invalid")
        }

        if (newDisciplineName.value.trim() == "") {
            isValidForm = false
            newDisciplineName.closest(".popup-form__label").classList.add("invalid")
        } else {
            newDisciplineName.closest(".popup-form__label").classList.remove("invalid")
        }

        if (selectedStatusDiscipline.textContent == "Выберите статус дисциплины") {
            isValidForm = false
            selectedStatusDiscipline.closest(".popup-form__label").classList.add("invalid")
        } else {
            selectedStatusDiscipline.closest(".popup-form__label").classList.remove("invalid")
        }

        if (isValidForm) {
            let statusDisciplineId = selectedStatusDiscipline.dataset.id
            let newDisciplineProfileId = profileId

            let newDiscipline = {
                id: 0,
                disciplineName: newDisciplineName.value,
                profile: null,
                profileId: newDisciplineProfileId,
                statusDisciplineId: statusDisciplineId,
                statusDiscipline: null,
                code: newDisciplineCode.value,
                fileRPD: null,
                createDate: "0001-01-01T00:00:00",
                updateDate: "0001-01-01T00:00:00"
            }

            createDiscipline(newDiscipline, e.target)
        }   
    })

    //создание дисциплины
    const createDiscipline = async (newDiscipline, el) => {
        el.classList.add("loading")
        el.textContent = "Создание..."
        el.disabled = true

        let response = await fetch(`${URL}/Discipline/CreateDiscipline`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(newDiscipline)
        })

        if (response.ok) {
            alert("Дисциплина успешно создана")
            el.classList.remove("loading")
            el.textContent = "Создать дисциплину"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось создать дисциплину. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.textContent = "Создать"
            el.disabled = false
        }
    }

    //кнопка изменения дисциплины в модальном окне
    popupEditDisciplineBtn.addEventListener("click", function(e) {
        let disciplineId = parseInt(popupEditDiscipline.querySelector("#disciplineId").value)
        let discipline = disciplineList[disciplineList.map(e => e.id).indexOf(disciplineId)]
        
        let disciplineNameInput = popupEditDiscipline.querySelector(".popup-form__input")
        let newDisciplineName = disciplineNameInput.value

        if (newDisciplineName.trim() == "") {
            disciplineNameInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            
            disciplineNameInput.classList.remove("invalid")
            discipline.disciplineName = newDisciplineName
            editDiscipline(discipline, e.target)
        }
    })
    
    //изменение дисциплины
    const editDiscipline = async (discipline, el) => {
        el.classList.add("loading")
        el.textContent = "Сохранение..."
        el.disabled = true

        let response = await fetch(`${URL}/Discipline/EditDiscipline`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(discipline)
        })

        if (response.ok) {
            alert("Дисциплина успешно изменен")
            el.classList.remove("loading")
            el.textContent = "Сохранить изменение"
            el.disabled = false
            popupEditDiscipline.querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось изменить дисциплину. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.textContent = "Сохранить изменение"
            el.disabled = false
        }
    }

    //нажатие на кнопку да в модальном окне удаления дисциплины
    popupDeleteDisciplineYesBtn.addEventListener("click", function(e) {
        let disciplineId = parseInt(popupDeleteDiscipline.querySelector("#disciplineId").value)
        let updateDiscipline = disciplineList[disciplineList.map(e => e.id).indexOf(disciplineId)]
        updateDiscipline.isDeletionRequest = true
        sendRequestDeleteDiscipline(updateDiscipline, e.target.parentNode)
    })

    //нажатие на кнопку нет в модальном окне удаления дисциплины
    popupDeleteDisciplineNoBtn.addEventListener("click", function() {
        popupDeleteDiscipline.querySelector(".popup__close").click()
    })

    //функция отправки запроса на удаление дисциплины
    const sendRequestDeleteDiscipline = async (updateDiscipline, el) => {
        el.classList.add("loading")
        el.disabled = true 

        let response = await fetch(`${URL}/Discipline/EditDiscipline`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(updateDiscipline)
        })

        if (response.ok) {
            alert("Запрос на удаление дисциплины отправлен")
            el.classList.remove("loading")
            el.disabled = false
            popupDeleteRpd.querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось отправить запрос. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //нажатие на кнопку да в модальном окне удаления файла РПД
    popupDeleteRpdYesBtn.addEventListener("click", function(e) {
        let fileRpdId = popupDeleteRpd.querySelector("#fileRPDId").value
        deleteRpd(fileRpdId, e.target)
    })

    //нажатие на кнопку нет в модальном окне удаления файла РПД
    popupDeleteRpdNoBtn.addEventListener("click", function() {
        popupDeleteRpd.querySelector(".popup__close").click()
    })

    //удаление файла РПД
    const deleteRpd = async (fileRPDId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/FileRPD/DeleteRPD?fileRPDId=${fileRPDId}`, {
            method: "DELETE",
            credentials: "include"
        })

        if (response.ok) {
            alert("РПД успешно удален")
            el.classList.remove("loading")
            el.disabled = false
            popupDeleteRpd.querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить РПД. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //кнопка создания статуса дисциплины
    createStatusBtn.addEventListener("click", function(e) {
        e.target.closest(".popup__content").querySelector(".popup__close").click()

        popupCreateStatus.classList.add("open")
        document.body.classList.add("no-scroll")
    })

    //кнопка создания статуса дисциплины в модальном окне
    popupCreateStatusBtn.addEventListener("click", function(e) {
        let statusDisciplineNameInput = popupCreateStatus.querySelector(".popup-form__input")
        let isValidForm = true
        if (statusDisciplineNameInput.value.trim() == "") {
            isValidForm = false
            statusDisciplineNameInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            statusDisciplineNameInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (isValidForm) {
            let statusDiscipline = {
                id: 0,
                name: statusDisciplineNameInput.value,
                isDeleted: false
            }

            createStatusDiscipline(statusDiscipline, e.target)
        }
       
    })

    //создание статуса дисциплины
    const createStatusDiscipline = async (statusDiscipline, el) => {
        el.classList.add("loading")
        el.textContent = "Создание..."
        el.disabled = true

        let response = await fetch(`${URL}/StatusDiscipline/CreateStatusDiscipline`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(statusDiscipline)
        })

        if (response.ok) {
            alert("Статус дисциплины успешно создан")
            el.classList.remove("loading")
            el.textContent = "Создать"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getAllStatusDisciplines()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось создать статус дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.add("loading")
            el.textContent = "Создать"
            el.disabled = false
        }
    }

    //кнопка изменения статуса дисциплины в модальном окне
    popupEditStatusBtn.addEventListener("click", function(e) {
        let statusDisciplineNameInput = popupEditStatus.querySelector(".popup-form__input")
        let isValidForm = true
        if (statusDisciplineNameInput.value.trim() == "") {
            isValidForm = false
            statusDisciplineNameInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            statusDisciplineNameInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (isValidForm) {
            let statusDisciplineId = popupEditStatus.querySelector("#statusDisciplineId").value
            let statusDiscipline = {
                id: statusDisciplineId,
                name: statusDisciplineNameInput.value,
                isDeleted: false
            }

            editStatusDiscipline(statusDiscipline, e.target)
        }
    })

    //изменение статуса дисциплины
    const editStatusDiscipline = async (statusDiscipline, el) => {
        el.classList.add("loading")
        el.textContent = "Сохранение..."
        el.disabled = true

        let response = await fetch(`${URL}/StatusDiscipline/UpdateStatusDiscipline`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(statusDiscipline)
        })

        if (response.ok) {
            alert("Статус дисциплины успешно изменен")
            el.classList.remove("loading")
            el.textContent = "Сохранить изменения"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getAllStatusDisciplines()
            getDisciplinesByProfile(profileId)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось изменить статус дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.textContent = "Сохранить изменения"
            el.disabled = false
        }
    }

    //кнопка удаления статуса дисциплины
    deleteStatusBtn.addEventListener("click", function(e) {
        let selectedStatusDiscipline = e.target.closest(".status").querySelector("[data-selectfield=statusDiscipline] .select__text")

        if (selectedStatusDiscipline.textContent == "Выберите статус дисциплины") {
            selectedStatusDiscipline.closest(".select").classList.add("invalid")
        } else {
            console.log("erqwe")
            selectedStatusDiscipline.closest(".select").classList.remove("invalid")
            popupDeleteStatus.classList.add("open")
            document.body.classList.add("no-scroll")

            let statusDisciplineId = selectedStatusDiscipline.dataset.id
            popupDeleteStatus.querySelector("#statusDisciplineId").value = statusDisciplineId
        }
    })

    //нажатие на кнопку да в модальном окне удаления статуса дисциплины
    popupDeleteStatusYesBtn.addEventListener("click", function(e) {
        let statusDisciplineId = popupDeleteStatus.querySelector("#statusDisciplineId").value
        sendRequestDeleteStatusDiscipline(statusDisciplineId, this)
    })

    //нажатие на кнопку нет в модальном окне удаления статуса дисциплины
    popupDeleteStatusNoBtn.addEventListener("click", function() {
        popupDeleteStatus.querySelector(".popup__close").click()
    })

    //удаление статуса дисциплины
    const sendRequestDeleteStatusDiscipline = async (statusDisciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/StatusDiscipline/RequestDeleteStatusDiscipline?statusDisciplineId=${statusDisciplineId}`, {
            method: "DELETE",
            credentials: "include"
        })

        if (response.ok) {
            alert("Запрос на удаление статуса дисциплины успешно отправлен")
            el.classList.remove("loading")
            el.disabled = false
            popupDeleteRpd.querySelector(".popup__close").click()
            getDisciplinesByProfile(profileId)
        } else if (response.status == 405) {
            window.location.assign("/login.html")
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось отправить запрос. Попробуйте еще раз")
            } else {
                alert(error)
            }
            
            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //функционал аккордеона
    let accordeon = document.querySelector('.accordeon');
    accordeon.addEventListener("click", function(e) {
       if (e.target.closest(".accordeon__control")) {
            e.target.closest(".accordeon__item").classList.toggle("active");
       }
    })

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

    //получение всех статусов дисциплин
    const getAllStatusDisciplines = async () => {
        let response = await fetch(`${URL}/StatusDiscipline/GetStatusDiscipline`, {
            credentials: "include",
        })
        let res = ""
        if (response.ok) {
            let statusDisciplines = await response.json() 
            for (let statusItem of statusDisciplines) {
                res += `
                    <li class="select__option" data-id=${statusItem.id}>
                        <span class="select__option-text">${statusItem.name}</span>
                    </li>
                `
            }
            popupCreateDiscipline.querySelector("[data-selectfield=statusDiscipline] .select__options").innerHTML = res
        } else if (response.status == 405) {
            window.location.assign("/login.html")
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось получить статусы дисциплин")
            } else {
                alert(error)
            }
        }
    }

    const getAuthors = async (el) => {
        el.classList.add("loading")
        el.nextElementSibling.disabled = true

        let response = await fetch(`${URL}/PersonalData/GetPrepods`, {
            credentials: "include",
        })
        let res = ""
        if (response.ok) {
            authors = await response.json() 
            for (let author of authors) {
                res += `
                    <option data-id=${author.idСотрудника} value="${author.фио}">${author.фио}</option>
                `
            }
            popupUploadFileRpd.querySelector("datalist").innerHTML = res

            el.classList.remove("loading")
            el.disabled = false

            popupUploadFileRpd.classList.add("open")
            document.body.classList.add("no-scroll")
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось получить статусы дисциплин")
            } else {
                alert(error)
            }
        }
    }

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

    //кнопка выхода из аккаунта
    logoutBtn.addEventListener("click", function() {
        logout()
    })

    getDisciplinesByProfile(profileId)
    getAllStatusDisciplines()
})