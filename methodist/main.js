document.addEventListener("DOMContentLoaded", () => {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path

    const URL = "https://oop.dgu.ru"
    //const URL = "https://localhost:44370"

    let logoutBtn = document.querySelector(".header .action__btn")

    let uploadUchPlan = document.querySelector(".file-upload--big input[type=file]")
    let modalUchPlan = document.querySelector("#popup-uchplan")

    let modalUploadFile = document.querySelector("#popup-uploadFile")
    let popupUploadFileBtn = document.querySelector("#popup-uploadFile .popup-form__btn")
    let closeModalBtns = document.querySelectorAll(".popup__close")
    let popupSaveUchPlanBtn = document.querySelector("#popup-uchplan .popup-form__btn")

    let popupDelete = document.querySelector("#popup-delete")
    let popupDeleteYesBtn = document.querySelector("#popup-delete .confirm-button--yes")
    let popupDeleteNoBtn = document.querySelector("#popup-delete .confirm-button--no")
    let popupEditFile = document.querySelector("#popup-editFile")
    let popupEditFileBtn = document.querySelector("#popup-editFile .popup-form__btn")

    let popupDeleteFileBtn = document.querySelector("#popup-editFile .delete__btn")
    let popupDeleteFile = document.querySelector("#popup-deleteFile")
    let popupDeleteFileYesBtn = document.querySelector("#popup-deleteFile .confirm-button--yes")
    let popupDeleteFileNoBtn = document.querySelector("#popup-deleteFile .confirm-button--no")

    let popupEditText = document.querySelector("#popup-editText")
    let popupEditTextBtn = document.querySelector("#popup-editText .popup-form__btn")
    let dataUchPlanFinal;
    let profiles
    let kafedra_id
    let listKafedras
    let departments
    let fileTypes
    let userId
    let userName
    let userRole

    let choiceOptions = {
        noResultsText: "Результат не найден",
        itemSelectText: "",
        loadingText: "Загрузка данных...",
        noChoicesText: "Элементы списка отсутствуют",
        removeItemButton: true, 
        position: "bottom",
        searchResultLimit: 9999,
    }

    let deptSelect = document.querySelector("#dept")
    let deptChoice = new Choices(deptSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите название направления"
    });

    let levelEduSelect = document.querySelector("#levelEdu")
    let levelEduChoice = new Choices(levelEduSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите уровень образования"
    })

    let eduFormSelect = document.querySelector("#eduForm")
    let eduFormChoice = new Choices(eduFormSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите форму обучения"
    })

    let kafedraSelect = document.querySelector("#kafedra")
    let kafedraChoice = new Choices(kafedraSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

    let deptSelectTwo = document.querySelector("#dept-2")
    let deptChoiceTwo = new Choices(deptSelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите название направления"
    });

    let levelEduSelectTwo = document.querySelector("#levelEdu-2")
    let levelEduChoiceTwo = new Choices(levelEduSelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите уровень образования"
    })

    let eduFormSelectTwo = document.querySelector("#eduForm-2")
    let eduFormChoiceTwo = new Choices(eduFormSelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите форму обучения"
    })

    let kafedraSelectTwo = document.querySelector("#kafedra-2")
    let kafedraChoiceTwo = new Choices(kafedraSelectTwo, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите каферу"
    })

    let pageTable = document.querySelector(".page__table")
    pageTable.addEventListener("click", function (e) {
        let targetItem = e.target

        if (targetItem.closest(".file-upload__btn")) { // кнопка загрузки файлов
            fillDataForUploadFile(targetItem)
        } else if (targetItem.closest("td:last-child .edit")) { // кнопка внесения изменения в опоп
            targetItem.closest("tr").classList.toggle("editable")
        } else if (targetItem.closest(".delete__btn")) { // кнопка удаления опоп
            showModalDeleteOpop(targetItem)
        } else if (targetItem.closest(".edit-item--text .btn")) { //кнопка внесения изменения текстовой информации в опоп
            fillDataForEditTextOpop(targetItem)
        } else if (targetItem.closest(".edit-item .btn")) { //кнопка изменения файла в опоп
            fillDataForEditFile(e.target)
        }
    })

    uploadUchPlan.addEventListener("change", function (e) {
        parsingUchPlan(e.target)
    })

    //парсинг excel файла учебного плана
    const parsingUchPlan = async (el) => {
        el.previousElementSibling.textContent = "Загрузка..."
        el.previousElementSibling.classList.add("loading")

        el.previousElementSibling.disabled = true;

        let formData = new FormData()
        formData.append("uploadedFile", el.files[0])

        let response = await fetch(`${URL}/api/Profiles/ParsingProfileByFile`, {
            method: "POST",
            credentials: "include",
            body: formData
        })

        if (response.ok) {
            let data = await response.json()
            getLevelEdues()
            fillUchPlanData(data)

            el.previousElementSibling.classList.remove("loading")
            el.previousElementSibling.textContent = "Загрузить учебный план"
            el.previousElementSibling.disabled = false;
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось спарсить данные. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.previousElementSibling.classList.remove("loading")
            el.previousElementSibling.textContent = "Загрузить учебный план"
            el.previousElementSibling.disabled = false;
        }
    }

    //функция заполнение модального окна данными полученными при парсинге учебного плана 
    const fillUchPlanData = (data) => {
        document.body.classList.add("no-scroll")
        modalUchPlan.classList.add("open")
        dataUchPlanFinal = data

        let year = data.profile.year ?? ""
        let profile = data.profile.profileName ?? ""
        let levelId = data.profile.levelEdu?.id
        let deptId = data.caseSDepartment?.departmentId
        let eduFormId = data.caseCEdukind?.edukindId

        let kafedraId = listKafedras.find(x => x.depId == kafedra_id).depId

        let yearInp = modalUchPlan.querySelector("#year")
        yearInp.value = year
        let deptCodeInput = modalUchPlan.querySelector("#departmentCode")
        deptCodeInput.value = data.caseSDepartment?.code
        let profileInp = modalUchPlan.querySelector("#profile")
        profileInp.value = profile
        let langInput = modalUchPlan.querySelector("#eduLang")
        langInput.value = "русский"

        if (deptId) {
            deptChoice.setChoiceByValue(deptId)
        }

        deptSelect.addEventListener("choice", function(evt) {
            let selectedEl = this.nextElementSibling
            selectedEl.setAttribute("title", evt.detail.choice.customProperties.facName)
            deptCodeInput.value = evt.detail.choice.customProperties.deptCode
        })

        if (levelId) {
            levelEduChoice.setChoiceByValue(levelId)
        }

        if (eduFormId) {
            eduFormChoice.setChoiceByValue(eduFormId)
        }

        if (kafedraId) {
            kafedraChoice.setChoiceByValue(kafedraId)
        }
    }

    //кнопка создания профиля в модальном окне
    popupSaveUchPlanBtn.addEventListener("click", () => {
        let isFormValid = validateProfileForm(modalUchPlan)

        if (isFormValid) {
            saveUchPlanData(dataUchPlanFinal)
        }

    })

    //создание профиля 
    const saveUchPlanData = async (data) => {
        popupSaveUchPlanBtn.classList.add("loading")
        popupSaveUchPlanBtn.textContent = "Сохранение..."
        popupSaveUchPlanBtn.disabled = true

        let yearInput = modalUchPlan.querySelector("#year")
        let profileInput = modalUchPlan.querySelector("#profile")
        let eduLangInput = modalUchPlan.querySelector("#eduLang")
        let accredInput = modalUchPlan.querySelector("#periodAccredistation")

        dataUchPlanFinal = data.profile

        if (dataUchPlanFinal.levelEdu) {
            dataUchPlanFinal.levelEdu = null
        }
        dataUchPlanFinal.levelEduId = parseInt(levelEduChoice.getValue(true))
        dataUchPlanFinal.year = yearInput.value.trim()
        dataUchPlanFinal.profileName = profileInput.value.trim()
        dataUchPlanFinal.caseSDepartmentId = parseInt(deptChoice.getValue(true))
        dataUchPlanFinal.caseCEdukindId = parseInt(eduFormChoice.getValue(true))
        dataUchPlanFinal.educationLanguage = eduLangInput.value
        dataUchPlanFinal.validityPeriodOfStateAccreditasion = accredInput.value

        let listPersDepartmentsId = []
        let selectedKafedrasId = kafedraChoice.getValue(true)
        selectedKafedrasId.forEach(facItem => {
            listPersDepartmentsId.push({
                id: 0,
                profileId: 0,
                profile: null,
                persDepartmentId: facItem
            })
        })

        dataUchPlanFinal.listPersDepartmentsId = listPersDepartmentsId
        dataUchPlanFinal.lastChangeAuthorId = userId

        let response = await fetch(`${URL}/api/Profiles/CreateProfile?kafedraId=${kafedra_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(dataUchPlanFinal)
        })

        if (response.ok) {
            alert("Профиль добавлен")
            popupSaveUchPlanBtn.classList.remove("loading")
            popupSaveUchPlanBtn.textContent = "Завершить редактирование"
            popupSaveUchPlanBtn.disabled = false
            popupSaveUchPlanBtn.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось добавить профиль. Попробуйте еще раз")
            } else {
                if (error.includes("Такой профиль создан другой кафедрой")) {
                    let addKafedraConfirm = confirm("Такой профиль создан другой кафедрой. Вы хотите добавить вашу кафедру в список ответственных за данный профиль?")
                    if (addKafedraConfirm) {
                        addKafedraToProfile(kafedra_id, dataUchPlanFinal)
                    }
                } else {
                    alert(error)
                }
            }

            popupSaveUchPlanBtn.classList.remove("loading")
            popupSaveUchPlanBtn.textContent = "Завершить редактирование"
            popupSaveUchPlanBtn.disabled = false
        }
    }

    const addKafedraToProfile = async (kafedraId, newProfile) => {
        let response = await fetch(`${URL}/api/Profiles/AddKafedraToProfile?kafedraId=${kafedraId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(newProfile)
        })

        if (response.ok) {
            alert("Профиль добавлен")
            popupSaveUchPlanBtn.classList.remove("loading")
            popupSaveUchPlanBtn.textContent = "Завершить редактирование"
            popupSaveUchPlanBtn.disabled = false
            popupSaveUchPlanBtn.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось добавить профиль. Попробуйте еще раз")
            } else {
                alert(error)
            }

            popupSaveUchPlanBtn.classList.remove("loading")
            popupSaveUchPlanBtn.textContent = "Завершить редактирование"
            popupSaveUchPlanBtn.disabled = false
        }
    }

    //заполнение модального окна данными для создания файла
    const fillDataForUploadFile = (targetItem) => {
        modalUploadFile.classList.add("open")
        document.body.classList.add("no-scroll")  

        let fileTypeId = parseInt(targetItem.dataset.filetype)
        let profileId = parseInt(targetItem.closest("tr").dataset.profileid)
        modalUploadFile.querySelector("#fileTypeId").value = fileTypeId
        modalUploadFile.querySelector("#profileId").value = profileId
        modalUploadFile.querySelector(".popup-form__input").setAttribute("placeholder", fileTypes[fileTypes.map(e => e.id).indexOf(fileTypeId)].name)

        //отображение названия выбранного файла
        let uploadInput = modalUploadFile.querySelector("input[type=file]")
        uploadInput.addEventListener("change", function (e) {
            let fileNameField = modalUploadFile.querySelector(".popup-form__file-name")
            fileNameField.textContent = `Название файла: ${e.target.files[0].name}`
        })
    }

    //обработчик событий выбора способа загрузки файла
    const radioBtns = document.querySelectorAll(".radio__item label")
    radioBtns.forEach((radioItem) => {
        radioItem.addEventListener("click", function (e) {                                
            let fileUploadBtnLabel = e.target.closest(".popup__content").querySelector(".file")
            let linkInputLabel = e.target.closest(".popup__content").querySelector(".link")
            let popup = e.target.closest(".popup")
            let popupRadioBtns = popup.querySelectorAll(".radio__item label")

            if (radioItem.closest(".radio__item").querySelector("input").classList.contains("checked")) {

                for (let radioEl of popupRadioBtns) {
                    //radioEl.closest(".radio__item").querySelector("input").removeAttribute("data-checked")
                    radioEl.closest(".radio__item").querySelector("input").classList.remove("checked")
                }
                fileUploadBtnLabel.style.display = "none"
                linkInputLabel.style.display = "none"
            } else {
                //очищаем все радио кнопки
                
                for (let radioEl of popupRadioBtns) {
                    //radioEl.closest(".radio__item").querySelector("input").removeAttribute("data-checked")
                    radioEl.closest(".radio__item").querySelector("input").classList.remove("checked")
                    //radioEl.closest(".radio__item").querySelector("input").checked = false
                }
                e.target.closest(".radio__item").querySelector("input").classList.add("checked")

                let selectedUploadOption = e.target.textContent.trim()
                if (selectedUploadOption == "Загрузить файл") {
                    if (popup.getAttribute("id") == "popup-uploadFile") {
                        fileUploadBtnLabel.style.display = "block"
                    } else {
                        fileUploadBtnLabel.style.display = "flex"
                    }

                    linkInputLabel.style.display = "none"
                } else if (selectedUploadOption == "Загрузить ссылку") {
                    linkInputLabel.style.display = "flex"
                    fileUploadBtnLabel.style.display = "none"
                }
            }           
        })
    })

    // событие нажатия на кнопку создания файла в соответствующем модальном окне
    popupUploadFileBtn.addEventListener("click", function (e) {
        let fileTypeId = modalUploadFile.querySelector("#fileTypeId").value
        let profileId = modalUploadFile.querySelector("#profileId").value 
        let nameFileInput = e.target.closest(".popup-form").querySelector(".popup-form__label")
        let isValidateName = nameFileInput.querySelector(".popup-form__input").value.trim() != "" ? true : false
        let uploadInput = e.target.closest(".popup-form").querySelector('input[type="file"]')
        let linkInputLabel = modalUploadFile.querySelector(".link")
        let linkInput = modalUploadFile.querySelector(".link input")

        let isFormValid = true

        if (isValidateName) {
            nameFileInput.classList.remove("invalid")
        } else {
            nameFileInput.classList.add("invalid")
            isFormValid = false
        }

        let selectedOption = modalUploadFile.querySelector(".radio .checked + label")?.textContent.trim()
        if (selectedOption) {
            if (selectedOption == "Загрузить файл") {            
                let isUploadFile = uploadInput.files.length > 0 ? true : false
    
                if (isUploadFile) {
                    uploadInput.nextElementSibling.classList.remove("invalid")
                } else {
                    uploadInput.nextElementSibling.classList.add("invalid")
                    isFormValid = false
                }
            } else {
                let isValidateLink = linkInput.value.trim() != "" ? true : false
    
                if (isValidateLink) {
                    linkInputLabel.classList.remove("invalud")
                } else {
                    linkInputLabel.classList.add("invalid")
                    isFormValid = false
                }
            }
        }

        if (isFormValid) {
            let formData = new FormData()
            let fileName = nameFileInput.querySelector(".popup-form__input").value
            formData.append("fileName", fileName)
            formData.append("fileType", fileTypeId)
            formData.append("profileId", profileId)

            if (selectedOption == "Загрузить файл") {
                formData.append("formFile", uploadInput.files[0])
            } else if (selectedOption == "Загрузить ссылку") {
                formData.append("linkToFile", encodeURIComponent(linkInput.value))
            }
                  
            e.target.classList.add("loading")
            e.target.textContent = "Загрузка..."
            e.target.disabled = true
            
            saveFile(formData, e.target)
        }
    })

    //заполнение данными модальное окно для изменения файла
    const fillDataForEditFile = (el) => {
        popupEditFile.classList.add("open")
        document.body.classList.add("no-scroll")

        let fileTypeId = parseInt(el.dataset.filetype)
        let fileId = parseInt(el.dataset.fileid)
        let profileId = parseInt(el.closest("tr").dataset.profileid)

        popupEditFile.querySelector("#fileId").value = fileId
        popupEditFile.querySelector("#fileTypeId").value = fileTypeId
        popupEditFile.querySelector("#profileId").value = profileId

        //let fileUploadBtnLabel = popupEditFile.querySelector(".file")
        let linkInputLabel = popupEditFile.querySelector(".link")
        
        let fileNameField = popupEditFile.querySelector(".popup-form__file-name")
        let itemFileInner = el.closest(".item-file").querySelector(".item-file__inner")
        let fileElem = itemFileInner.children[itemFileInner.children.length - 1]

        if (fileElem) {
            let outputFileName = fileElem.textContent

            let popupEditFileInput = popupEditFile.querySelector(".popup-form__input")
            popupEditFileInput.value = outputFileName

            if (fileElem.hasAttribute("href")) {
                let hrefLink = fileElem.getAttribute("href")
                if (!hrefLink.startsWith(`${URL}/sved/files-oop`)) {
                    linkInputLabel.querySelector("input").value = hrefLink
                    popupEditFile.querySelector(".radio__item:nth-child(2) label").click()
                } else {
                    //получаем название файла из профиля
                    let fileModelsProfile = profiles[profiles.map(e => e.profile.id).indexOf(profileId)].profile.fileModels
                    let fileName = "";
                    fileModelsProfile.forEach(fileModel => {
                        if (fileModel.outputFileName == outputFileName) {
                            if (fileModel.name != null) {
                                fileName = fileModel.name
                                popupEditFile.querySelector(".radio__item:nth-child(1) label").click() 
                            }   
                        }
                    })

                    //вывод названия файла                
                    fileNameField.textContent = `Название файла: ${fileName}`           
                }
            }

            //вывести название файла в случае выбора другого файла
            let uploadFileInput = popupEditFile.querySelector("input[type=file]")
            uploadFileInput.addEventListener("change", function (e) {
                fileNameField.textContent = `Название файла: ${e.target.files[0].name}`
            })

            popupEditFileInput.setAttribute("placeholder", fileTypes[fileTypes.map(e => e.id).indexOf(fileTypeId)].name)
        }                
    }

    //валидация формы изменения профиля
    const validateProfileForm = (modalWindow) => {
        let yearInput = modalWindow.querySelector("#year")
        let profileInput = modalWindow.querySelector("#profile")
        let eduLangInput = modalWindow.querySelector("#eduLang")
        let accredInput = modalWindow.querySelector("#periodAccredistation")

        let isValidForm = true

        let modalWindowId = modalWindow.getAttribute("id")
        if (modalWindowId == "popup-uchplan") {
            let deptId = deptChoice.getValue(true)
            let levelEduId = levelEduChoice.getValue(true)
            let eduFormId = eduFormChoice.getValue(true)
            let kafedras = kafedraChoice.getValue(true)

            if (!deptId) {
                isValidForm = false
                deptSelect.closest(".choices__inner").classList.add("invalid")
            } else {
                deptSelect.closest(".choices__inner").classList.remove("invalid")
            }

            if (!levelEduId) {
                isValidForm = false
                levelEduSelect.closest(".choices__inner").classList.add("invalid")
            } else {
                levelEduSelect.closest(".choices__inner").classList.remove("invalid")
            }

            if (!eduFormId) {
                isValidForm = false
                eduFormSelect.closest(".choices__inner").classList.add("invalid")
            } else {
                eduFormSelect.closest(".choices__inner").classList.remove("invalid")
            }

            if (!kafedras.length > 0) {
                isValidForm = false
                kafedraSelect.closest(".choices__inner").classList.add("invalid")
            } else {
                kafedraSelect.closest(".choices__inner").classList.remove("invalid")
            }
        } else if (modalWindowId == "popup-editText") {
            let deptId = deptChoiceTwo.getValue(true)
            let levelEduId = levelEduChoiceTwo.getValue(true)
            let eduFormId = eduFormChoiceTwo.getValue(true)
            let kafedras = kafedraChoiceTwo.getValue(true)

            if (!deptId) {
                isValidForm = false
                deptSelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                deptSelectTwo.closest(".choices__inner").classList.remove("invalid")
            }

            if (!levelEduId) {
                isValidForm = false
                levelEduSelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                levelEduSelectTwo.closest(".choices__inner").classList.remove("invalid")
            }

            if (!eduFormId) {
                isValidForm = false
                eduFormSelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                eduFormSelectTwo.closest(".choices__inner").classList.remove("invalid")
            }

            if (!kafedras.length > 0) {
                isValidForm = false
                kafedraSelectTwo.closest(".choices__inner").classList.add("invalid")
            } else {
                kafedraSelectTwo.closest(".choices__inner").classList.remove("invalid")
            }
        }

        if (yearInput.value.trim() == "") {
            isValidForm = false
            yearInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            yearInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (profileInput.value.trim() == "") {
            isValidForm = false
            profileInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            profileInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (eduLangInput.value.trim() == "") {
            isValidForm = false
            eduLangInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            eduLangInput.closest(".popup-form__label").classList.remove("invalid")
        }

        if (accredInput.value.trim() == "") {
            isValidForm = false
            accredInput.closest(".popup-form__label").classList.add("invalid")
        } else {
            accredInput.closest(".popup-form__label").classList.remove("invalid")
        }

        return isValidForm
    }

    //нажатие на кнопку изменения профиля в модальном окне
    popupEditFileBtn.addEventListener("click", function (e) {
        validateAndEditFileOpop(e.target)
    })

    //валидация и отправка формы если валидация прошла успешно
    const validateAndEditFileOpop = (el) => {
        let fileId = popupEditFile.querySelector("#fileId").value
        let fileTypeId = popupEditFile.querySelector("#fileTypeId").value
        let profileId = popupEditFile.querySelector("#profileId").value

        let uploadInput = el.closest(".popup-form").querySelector('input[type="file"]')
        let nameFileInput = el.closest(".popup-form").querySelector(".popup-form__label")

        let linkInputLabel = popupEditFile.querySelector(".link")
        let linkInput = popupEditFile.querySelector(".link input")

        let isValidateName = nameFileInput.querySelector(".popup-form__input").value.trim() != "" ? true : false
        let isUploadFile = uploadInput.files.length > 0 ? true : false
        let isValidateLink = linkInput.value.trim() != "" ? true : false      

        let isFormValid = true

        if (isValidateName) {
            nameFileInput.classList.remove("invalid")
        } else {
            nameFileInput.classList.add("invalid")
            isFormValid = false
        }

        let selectedOption = popupEditFile.querySelector(".radio .checked + label")?.textContent.trim()
        if (selectedOption) {
            if (selectedOption == "Загрузить ссылку") {            
                if (isValidateLink) {
                    linkInputLabel.classList.remove("invalid")
                } else {
                    linkInputLabel.classList.add("invalid")
                    isFormValid = false
                }
            }
        }

        if (isFormValid) {
            nameFileInput.classList.remove("invalid")

            el.classList.add("loading")
            el.textContent = "Загрузка..."
            el.disabled = true

            let formData = new FormData()
            let fileName = nameFileInput.querySelector(".popup-form__input").value

            
            if (selectedOption == "Загрузить файл") {
                if (isUploadFile) {
                    formData.append("formFile", uploadInput.files[0])
                }
            } else if (selectedOption == "Загрузить ссылку") {
                if (isValidateLink) {
                    formData.append("linkToFile", encodeURIComponent(linkInput.value))
                } 
            }
            

            formData.append("fileName", fileName)
            formData.append("fileType", fileTypeId)
            formData.append("fileId", fileId)
            formData.append("profileId", profileId)

            editFile(formData, el)
        }

    }

    //функция изменения текстовой информации профиля
    const editProfile = async (profile, el) => {
        el.classList.add("loading")
        el.textContent = "Сохранение..."
        el.disabled = true

        let response = await fetch(`${URL}/api/Profiles/EditProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(profile)
        })

        if (response.ok) {
            alert("Профиль изменен")
            el.classList.remove("loading")
            el.textContent = "Завершить редактирование"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось изменить профиль. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.textContent = "Завершить редактирование"
            el.disabled = false
        }
    }

    //нажатие на кнопку удаления файла в модальном окне изменения файла
    popupDeleteFileBtn.addEventListener("click", function (e) {
        popupEditFile.classList.remove("open")

        let fileId = popupEditFile.querySelector("#fileId").value
        popupDeleteFile.querySelector("#fileId").value = fileId

        popupDeleteFile.classList.add("open")
    })

    //подтверждение удаления файла
    popupDeleteFileYesBtn.addEventListener("click", function (e) {
        e.target.classList.add("loading")
        e.target.disabled = true

        let fileId = popupEditFile.querySelector("#fileId").value
        deleteFile(fileId, e.target)
    })

    //отклонение удаления файла
    popupDeleteFileNoBtn.addEventListener("click", function (e) {
        popupDeleteFile.classList.remove("open")
        document.body.classList.remove("no-scroll")
    })

    //функция заполнения данными модального окна для редактирования текстовой информации профиля
    const fillDataForEditTextOpop = (el) => {
        popupEditText.classList.add("open")
        document.body.classList.add("no-scroll")

        let tdElements = el.closest("tr")
        let profileEdited = profiles[profiles.map(e => e.profile.id).indexOf(+tdElements.dataset.profileid)]
        let year = profileEdited.profile.year
        let profile = profileEdited.profile.profileName
        let levelEduId = profileEdited.profile.levelEduId
        let deptId = profileEdited.caseSDepartment.departmentId
        let eduFormId = profileEdited.caseCEdukind.edukindId
        let lang = profileEdited.profile.educationLanguage
        let accred = profileEdited.profile.validityPeriodOfStateAccreditasion

        let profileIdInput = popupEditText.querySelector("#profileId")
        profileIdInput.value = tdElements.dataset.profileid

        let yearInp = popupEditText.querySelector("#year")
        yearInp.value = year
        let deptCodeInput = popupEditText.querySelector("#departmentCode")
        deptCodeInput.value = profileEdited.caseSDepartment.code
        let profileInp = popupEditText.querySelector("#profile")
        profileInp.value = profile
        let langInput = popupEditText.querySelector("#eduLang")
        langInput.value = lang
        let accredInput = popupEditText.querySelector("#periodAccredistation")
        accredInput.value = accred

        if (deptId) {
            deptChoiceTwo.setChoiceByValue(deptId)
        }

        deptSelectTwo.addEventListener("choice", function(evt) {
            let selectedEl = this.nextElementSibling
            selectedEl.setAttribute("title", evt.detail.choice.customProperties.facName)
            deptCodeInput.value = evt.detail.choice.customProperties.deptCode
        })

        if (levelEduId) {
            levelEduChoiceTwo.setChoiceByValue(levelEduId)
        }

        if (eduFormId) {
            eduFormChoiceTwo.setChoiceByValue(eduFormId)
        }


        //нахождение привязанных к профилю кафедр 
        let listKafedrasProfileEdited = profileEdited.profile.listPersDepartmentsId
        let listKafedrasId = listKafedrasProfileEdited.map(x => x.persDepartmentId)
        if (listKafedrasId) {
            kafedraChoiceTwo.setChoiceByValue(listKafedrasId)
        }
    }

    //нажатие на кнопку сохранения изменений в модальном окне изменения профиля
    popupEditTextBtn.addEventListener("click", function () {
        //валидация формы изменения профиля
        let isFormValid = validateProfileForm(popupEditText)

        //если форма заполнена верно, то собираем данные с формы и отправляем запрос на изменение профиля
        if (isFormValid) {
            let profileId = popupEditText.querySelector("#profileId").value
            let profileItem = profiles[profiles.map(e => e.profile.id).indexOf(+profileId)]

            profileItem.profile.year = popupEditText.querySelector("#year").value
            profileItem.profile.profileName = popupEditText.querySelector("#profile").value.trim()
            profileItem.profile.caseSDepartmentId = deptChoiceTwo.getValue(true)
            profileItem.profile.caseCEdukindId = eduFormChoiceTwo.getValue(true)
            profileItem.profile.levelEduId = levelEduChoiceTwo.getValue(true)
            profileItem.profile.educationLanguage = popupEditText.querySelector("#eduLang").value
            profileItem.profile.validityPeriodOfStateAccreditasion = popupEditText.querySelector("#periodAccredistation").value
            //profileItem.profile.linkToDistanceEducation = popupEditText.querySelector("#linkToEduDistance").value

            let listPersDepartmentsId = []
            let selectedKafedrasId = kafedraChoiceTwo.getValue(true)
            selectedKafedrasId.forEach(facItem => {
                listPersDepartmentsId.push({
                    id: 0,
                    profileId: profileItem.profile.id,
                    profile: null,
                    persDepartmentId: facItem
                })
            })

            profileItem.profile.listPersDepartmentsId = listPersDepartmentsId
            profileItem.profile.lastChangeAuthorId = userId
            editProfile(profileItem.profile, popupEditTextBtn)
        }
    })

    //вывод модального окна удаления профиля
    const showModalDeleteOpop = (el) => {
        popupDelete.classList.add("open")
        document.body.classList.add("no-scroll")

        let tdElement = el.closest("tr")
        let profileId = tdElement.dataset.profileid

        //получение айди удаляемого профиля
        let profileIdInput = popupDelete.querySelector("#profileId")
        profileIdInput.value = profileId
    }

    //нажатие на кнопку да в модальном окне удаления профиля
    popupDeleteYesBtn.addEventListener("click", function (e) {
        let profileId = popupDelete.querySelector("#profileId").value
        popupDeleteYesBtn.classList.add("loading")
        popupDeleteYesBtn.disabled = true
        popupDeleteNoBtn.disabled = true
        deleteProfile(profileId, userId)
    })

    //нажатие на кнопку нет в модальном окне удаления профиля
    popupDeleteNoBtn.addEventListener("click", function () {
        popupDelete.querySelector(".popup__close").click()
    })

    //закрытие модального окна
    closeModalBtns.forEach(closeItem => {
        closeItem.addEventListener("click", function (e) {
            let popupClosed = e.target.closest(".popup")

            //очищение всех полей и выпадающих списков закрываемого модального окна
            let popupLabels = popupClosed.querySelectorAll(".popup-form__label")
            if (popupLabels) {
                popupLabels.forEach(popupLabel => {
                    popupLabel.classList.remove("invalid")
                    let popupLabelInput = popupLabel.querySelector(".popup-form__input")
                    let popupLabelSelect = popupLabel.querySelector("select")
                    let popupLabelUploadFile = popupLabel.querySelector(".file-upload__btn")
                    let popupLabelRadioBtns = popupLabel.querySelector(".radio")

                    //очистка текстового поля
                    if (popupLabelInput) {
                        popupLabelInput.value = ""
                    } else if (popupLabelSelect) { // сброс значений выпадоющего списка
                        if (popupClosed.getAttribute("id") == "popup-uchplan") {
                            deptSelect.closest(".choices__inner").classList.remove("invalid")
                            deptChoice.removeActiveItems()

                            levelEduSelect.closest(".choices__inner").classList.remove("invalid")
                            levelEduChoice.removeActiveItems()

                            eduFormSelect.closest(".choices__inner").classList.remove("invalid")
                            eduFormChoice.removeActiveItems()

                            kafedraSelect.closest(".choices__inner").classList.remove("invalid")
                            kafedraChoice.removeActiveItems()
                        } else {
                            deptSelectTwo.closest(".choices__inner").classList.remove("invalid")
                            deptChoiceTwo.removeActiveItems()

                            levelEduSelectTwo.closest(".choices__inner").classList.remove("invalid")
                            levelEduChoiceTwo.removeActiveItems()

                            eduFormSelectTwo.closest(".choices__inner").classList.remove("invalid")
                            eduFormChoiceTwo.removeActiveItems()

                            kafedraSelectTwo.closest(".choices__inner").classList.remove("invalid")
                            kafedraChoiceTwo.removeActiveItems()
                        }
                    } else if (popupLabelUploadFile) {
                        popupLabelUploadFile.classList.remove("invalid")
                        popupLabelUploadFile.previousElementSibling.value = ''
                    } else if (popupLabelRadioBtns) { 
                        let selectedRadioBtn = popupLabel.querySelector(".radio__item .checked + label")
                        if (selectedRadioBtn) {
                            selectedRadioBtn.click()
                        }
                        //selectedRadioBtn.previousElementSibling.classList.remove("checked")
                    }
                })
            }

            let fileNameField = popupClosed.querySelector(".popup-form__file-name")
            if (fileNameField) {
                fileNameField.textContent = ""
            }

            //после очистки закрываем модальное окно
            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")

        })
    })

    //создать файл профиля
    const saveFile = async (formData, el) => {
        // Сохранение файлов (кроме РПД)
        let linkToFile = ""
        if (formData.has("linkToFile")) {
            linkToFile = `&linkToFile=${formData.get("linkToFile")}`
        }

        let response = await fetch(`${URL}/api/FileModel/CreateFileModel?fileName=${formData.get("fileName")}&fileType=${formData.get("fileType")}&profileId=${formData.get("profileId")}${linkToFile}`, {
            method: "POST",
            credentials: "include",
            body: formData
        })
        if (response.ok) {
            alert("Файл успешно добавлен")
            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось загрузить файл. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            el.disabled = false
        }
    }

    //изменить файл профиля
    const editFile = async (formData, el) => {
        let linkToFile = ""
        if (formData.has("linkToFile")) {
            linkToFile = `&linkToFile=${formData.get("linkToFile")}`
        }

        let response = await fetch(`${URL}/api/FileModel/EditFileModel?fileId=${formData.get("fileId")}&fileType=${formData.get("fileType")}&fileName=${formData.get("fileName")}&profileId=${formData.get("profileId")}${linkToFile}`, {
            method: "POST",
            credentials: "include",
            body: formData
        })
        if (response.ok) {
            alert("Файл успешно изменен")
            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось изменить файл. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            el.disabled = false
        }
    }

    //удаление файла профиля
    const deleteFile = async (fileId, el) => {
        let response = await fetch(`${URL}/api/FileModel/DeleteFileModel?fileId=${fileId}`, {
            method: "POST",
            credentials: "include"
        })
        if (response.ok) {
            alert("Файл успешно удален")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить файл. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.textContent = "Удалить файл"
            el.disabled = false
        }
    }

    //генерация разметки для файловых элементов таблицы
    const generateMarkupFileModelByFileTypeId = (profile, fileTypeId) => {
        let fileModels = new Set(profile.profile.fileModels.filter(e => e.fileTypeId == fileTypeId))
        let markup = "";

        //расставление тегов
        let propItem = ""
        if (fileTypeId == getFileTypeIdByName("ОПОП") || fileTypeId == getFileTypeIdByName("АОПОП")) { //тег для опоп
            propItem += `itemprop="opMain"`
        } else if (fileTypeId == getFileTypeIdByName("Аннотации к РПД")) {
            propItem += `itemprop="educationAnnotation"`
        } else if (fileTypeId == getFileTypeIdByName("Учебный план")) { //тег для учебного плана
            propItem += `itemprop="educationPlan"`
        } else if (fileTypeId == getFileTypeIdByName("КУГ")) { //тег для календарного учебного графика
            propItem += `itemprop="educationShedule"`
        } else if (fileTypeId == getFileTypeIdByName("Дистанционное обучение")) {
            propItem += `itemprop="eduEl"`
        } else if (fileTypeId == getFileTypeIdByName("Методические материалы для обеспечения ОП")) { //тег для методического материала
            propItem += `itemprop="methodology"`
        }

        if (fileModels.size != 0) {
            markup += `<td ${propItem}>`
            //циклом перебираем все файлы принадлежащие одному типу файлов (на случай, если их будет несколько)             
            for (let fileModel of fileModels) {
                markup += `
                    <div class="item-file">                                 
                `

                //вывод ссылки на файл вместе с ключом эцп (если ключа нет, то выводим только ссылку на файл)
                markup += `
                    <div class="item-file__inner">
                        ${
                            (fileModel.linkToFile != null || fileModel.name != null)  
                            ? `
                                <span class="key-icon"></span>
                                <div class="document-key">
                                    <p class="document-key__text">Документ подписан</p>
                                    <p class="document-key__text">Простая электронная подпись</p>
                                    <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                    <p class="document-key__text">Ректор</p>
                                    <p class="document-key__text">Ключ (SHA-256):</p>
                                    <p class="document-key__text">${fileModel.codeECP}</p>
                                </div>
                            `
                            : ''
                        }
                        ${
                            fileModel.linkToFile != null
                            ? `<a href=${fileModel.linkToFile}>${fileModel.outputFileName}</a>`
                            : fileModel.name != null
                            ? `<a href='${URL}/sved/files-oop/${fileModel.name}'>${fileModel.outputFileName}</a>`
                            : `<span>${fileModel.outputFileName}</span>`
                        }
                    </div>
                `
                markup += `            
                    <div class="actions">
                        <button type="button" class="edit edit-item">
                            <span data-fileType="${fileTypeId}" data-fileid=${fileModel.id} class="edit__btn btn"></span>
                        </button>
                    </div>
                `
            }

            markup += `
                    <div class="actions">
                        <button class="file-upload file-upload__item">
                            <span data-fileType="${fileTypeId}" class="file-upload__btn btn"></span>
                        </button>
                    </div>
                </div>
            </td>
        `
        } else {
            markup += `
                <td ${propItem}>
                    <button class="file-upload">
                        <span data-fileType="${fileTypeId}" class="file-upload__btn btn"></span>
                    </button>
                </td>
            `
        }
        return markup
    }

    //получить профили по айди кафедры
    const getProfilesById = async () => {
        if (kafedra_id && userName) {
            document.querySelector("tbody").innerHTML = `
                <tr><td>Идет загрузка профилей...</td></tr>
            `

            let response = await fetch(`${URL}/api/Profiles/GetDataByKafedraId?kafedraId=${kafedra_id}`, {
                credentials: "include"
            })

            if (response.ok) {
                profiles = await response.json()
                showProfiles(profiles)
            } else if (response.status == 405) {
                window.location.assign(`${URL}/sved/login.html`)
            }
        } else {
            window.location.assign(`${URL}/sved/login.html`)
        }
    }

    //отображение пользователю всех профилей кафедры
    const showProfiles = (profiles) => {
        let res = ""

        //здесь происходит создание разметки профилей с их атрибутами 
        for (let el of profiles) {

            if (el.caseSDepartment != null) {
                res += `
                <tr data-profileid=${el.profile.id} itemprop="eduOp"> 
                    <td>
                        <span>${el.profile.year}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                                <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                    <td itemprop="eduCode">
                        <span>${el.caseSDepartment.code}</span>
                    </td>
                    <td itemprop="eduName">
                        <span>${el.caseSDepartment.deptName}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                                <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                    <td itemprop="eduLevel">
                        <span>${el.profile.levelEdu.name}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                                <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                    <td itemprop="eduProf">
                        <span>${el.profile.profileName}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                                <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>                    
                `

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("ФГОС")) // фгос

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("ОПОП")) // опоп

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("АОПОП")) // аопоп

                res += `
                    <td itemprop="eduForm">
                        <span>${el.caseCEdukind.edukind}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                            <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                `

                res += `
                    <td itemprop="language">
                        <span>${el.profile.educationLanguage}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                            <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                `

                res += `
                    <td itemprop="dateEnd">
                        <span>${el.profile.validityPeriodOfStateAccreditasion}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                            <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                `

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Дистанционное обучение")) // дистанционное обучение

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Учебный план")) // учебный план

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Аннотации к РПД")) // Аннотации к РПД


                //если есть ссылка на РПД для аспирантуры, то показываем ее, если нет, то генерируем ссылку на страницу ЭОР
                if (String(el.profile.linkToRPD).toString() != "NULL" && el.profile.linkToRPD != null) {
                    res += `
                        <td itemprop="educationRpd">
                            <a href="${el.profile.linkToRPD}" target="_blank">РПД и ФОС</a>
                        </td>
                    `
                } else {
                    res += `
                        <td itemprop="educationRpd">
                            <a href="${URL}/sved/methodist/eor.html?profileId=${el.profile.id}" target="_blank">РПД и ФОС</a>
                        </td>
                    `
                }

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("КУГ")) // календарный учебный график

                let fileModelsRpp = el.profile.disciplines // рабочие программы практик
                if (fileModelsRpp.length != 0) {
                    let rpp = `<td itemprop="eduPr">`
                    rpp += '<div class="item-files">'

                    for (let fileRPP of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                            ${fileRPP.fileRPD != null
                                ? `
                                    <div class="item-file__inner">
                                        <span class="key-icon"></span>
                                        <div class="document-key">
                                            <p class="document-key__text">Документ подписан</p>
                                            <p class="document-key__text">Простая электронная подпись</p>
                                            <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                            <p class="document-key__text">Ректор</p>
                                            <p class="document-key__text">Ключ (SHA-256):</p>
                                            <p class="document-key__text">${fileRPP.fileRPD.codeECP}</p>
                                        </div>
                                        <a href='${fileRPP.fileRPD.linkToFile ? fileRPP.fileRPD.linkToFile : `${URL}/sved/files-oop/${fileRPP.fileRPD.name}`}'>${fileRPP.disciplineName}</a>
                                    </div>
                                    
                                `
                                : `
                                    <span>${fileRPP.disciplineName}</span>
                                `
                            }
                            
                            </div>
                        `
                    }
                    rpp += '</div>'
                    rpp += '<button type="button" class="show-practic-btn">показать все</button>'

                    res += rpp
                } else {
                    res += '<td itemprop="eduPr"></td>'
                }

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Программа ГИА")) // гиа

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Матрицы компетенций")) // матрицы

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Методические материалы для обеспечения ОП")) // Методические материалы для обеспечения ОП

                //кнопки для редактирования и удаления профиля
                res += `
                    <td>
                        <button type="button" class="edit">
                            <span class="edit__btn btn"></span>
                        </button>
                        <button type="button" class="delete">
                            <span class="delete__btn btn"></span>
                        </button>
                    </td>
                `
            }
        }

        if (res.length > 0) {
            document.querySelector("tbody").innerHTML = res
        } else {
            document.querySelector("tbody").innerHTML = ""
        }

        let showPracticNameBtns = document.querySelectorAll(".show-practic-btn")
        showPracticNameBtns.forEach(practicBtn => {
            practicBtn.addEventListener("click", function(e) {
                e.preventDefault()

                let practicNames = e.target.previousElementSibling
                practicNames.classList.add("show")

                e.target.remove()
            })
        })
    }

    //функция, которая создает ссылку на панель администратора если пользователем является админ
    const setUserName = (userName) => {
        let actionText = document.querySelector(".header .action__text")
        actionText.textContent = userName
    }

    //удалить профиль
    const deleteProfile = async (profileId, userId) => {
        let response = await fetch(`${URL}/api/Profiles/DeleteProfile?profileId=${profileId}&userId=${userId}`, {
            method: "POST",
            credentials: "include"
        })

        if (response.ok) {
            alert("Профиль успешно удален")
            popupDeleteYesBtn.classList.remove("loading")
            popupDeleteYesBtn.disabled = false
            popupDeleteNoBtn.disabled = false
            popupDeleteYesBtn.closest(".popup__content").querySelector(".popup__close").click()


            getProfilesById(kafedra_id)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить профиль. Попробуйте еще раз")
            } else {
                alert(error)
            }

            popupDeleteYesBtn.classList.remove("loading")
            popupDeleteYesBtn.disabled = false
            popupDeleteNoBtn.disabled = false
        }
    }

    //получить направления кафедры
    const getCaseSDepartmentsIncludeFaculty = async () => {
        if (kafedra_id) {
            let response = await fetch(`${URL}/api/DekanatData/GetCaseSDepartmentsIncludeFaculty`, {
                credentials: "include"
            })

            if (response.ok) {
                departments = await response.json()
  
                const deptChoices = []
                for (let el of departments) {
                    deptChoices.push({
                        value: el.caseSDepartment.departmentId,
                        label: el.caseSDepartment.deptName,
                        selected: false,
                        disabled: false,
                        customProperties: {
                            facName: el.caseCFaculty.facName,
                            deptCode: el.caseSDepartment.code
                        }
                    });
                }
                deptChoice.setChoices(deptChoices, "value", "label", true);
                deptChoiceTwo.setChoices(deptChoices, "value", "label", true);
            }
        } else {
            window.location.assign(`${URL}/sved/login.html`)
        }

    }

    //получить уровни обучения
    const getLevelEdues = async () => {
        let response = await fetch(`${URL}/api/LevelEdu/GetLevelEdu`, {
            credentials: "include"
        })

        if (response.ok) {
            let levelEdues = await response.json()
            
            const levelEduChoices = []
            for (let el of levelEdues) {
                levelEduChoices.push({
                    value: el.id,
                    label: el.name,
                    selected: false,
                    disabled: false
                });
            }
            levelEduChoice.setChoices(levelEduChoices, "value", "label", true);
            levelEduChoiceTwo.setChoices(levelEduChoices, "value", "label", true);
        }
    }

    //получить формы обучения
    const getEduForms = async () => {
        let response = await fetch(`${URL}/api/DekanatData/GetCaseSEdukinds`, {
            credentials: "include"
        })

        if (response.ok) {
            let eduForms = await response.json()

            const eduFormChoices = []
            for (let el of eduForms) {
                eduFormChoices.push({
                    value: el.edukindId,
                    label: el.edukind,
                    selected: false,
                    disabled: false
                });
            }
            eduFormChoice.setChoices(eduFormChoices, "value", "label", true);
            eduFormChoiceTwo.setChoices(eduFormChoices, "value", "label", true);
        }
    }

    const getAllKafedra = async () => {
        let response = await fetch(`${URL}/api/PersonalData/GetAllKafedra`, {
            credentials: "include"
        })

        if (response.ok) {
            listKafedras = await response.json()

            const kafedraChoices = []
            for (let el of listKafedras) {
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

    const getFileTypes = async () => {
        let response = await fetch(`${URL}/api/FileType/GetFileTypes`, {
            credentials: "include"
        })

        if (response.ok) {
            fileTypes = await response.json()
        }
    }

    const getFileTypeIdByName = (nameFileType) => {
        let fileType = fileTypes.find(x => x.name.toLowerCase() == nameFileType.toLowerCase())
        return fileType.id
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
    logoutBtn.addEventListener("click", function () {
        logout()
    })

    //функция проверки доступа пользователя по его роли
    const hasUserAccessToRole = () => userRole === "methodist"

    if (isAuthorize()) {
        userId = localStorage.getItem("userId")
        kafedra_id = localStorage.getItem("persDepartmentId")
        userRole = localStorage.getItem("userRole")

        let hasAccess = hasUserAccessToRole()
        if (hasAccess) {
            userName = localStorage.getItem("userName")

            setUserName(userName)
            getFileTypes().
                then(_ => getAllKafedra()).
                then(_ => getCaseSDepartmentsIncludeFaculty()).
                then(_ => getProfilesById()).
                then(_ => getLevelEdues()).
                then(_ => getEduForms()).
                then(_ => getFileTypes())

        } else { //если пользователь не имеет доступа к данной странице, то он перемещается на страницу, соответствующая его роли 
            let redirectPage = userRole !== "null" ? userRole : "methodist"
            window.location.assign(`/sved/${redirectPage}/`)
        }
    } else {
        window.location.assign(`${URL}/sved/login.html`)
    }
})