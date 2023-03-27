document.addEventListener("DOMContentLoaded", () => {
    const URL = "https://localhost:44370"

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
    let fileTypes
    let userName
    let userRole


    let pageTable = document.querySelector("table")
    pageTable.addEventListener("click", function(e) {
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

    uploadUchPlan.addEventListener("change", function(e) {
        parsingUchPlan(e.target)
    })

    //парсинг excel файла учебного плана
    const parsingUchPlan = async (el) => {
        el.previousElementSibling.textContent = "Загрузка..."
        el.previousElementSibling.classList.add("loading")

        el.previousElementSibling.disabled = true;

        let formData = new FormData()
        formData.append("uploadedFile", el.files[0])

        let response = await fetch(`${URL}/Profiles/ParsingProfileByFile`, {
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

        let year = data.profile.year
        let profile = data.profile.profileName
        let level = data.profile.levelEdu.name
        let deptName = data.caseSDepartment.deptName
        let eduForm = data.caseCEdukind.edukind

        let yearInp = modalUchPlan.querySelector("#year")
        yearInp.value = year
        let profileInp = modalUchPlan.querySelector("#profile")
        profileInp.value = profile

        let deptSelectOptions = modalUchPlan.querySelectorAll("[data-selectfield='dept'] .select__option")
        let levelSelectOptions = modalUchPlan.querySelectorAll("[data-selectfield='levelEdu'] .select__option")
        let eduFormSelectOptions = modalUchPlan.querySelectorAll("[data-selectfield='eduForm'] .select__option")

        deptSelectOptions.forEach(deptItem => {  
            if (deptItem.textContent.trim().toLowerCase() == deptName.toLowerCase()) {
                deptItem.classList.add("selected")
                deptItem.closest(".select").querySelector(".select__text").textContent = deptName
                deptItem.closest(".select").querySelector(".select__text").setAttribute("data-id", deptItem.dataset.id)                
            } 
        })

        levelSelectOptions.forEach(levelItem => {
            if (levelItem.textContent.trim().toLowerCase() == level.toLowerCase()) {
                levelItem.classList.add("selected")
                levelItem.closest(".select").querySelector(".select__text").textContent = level
                levelItem.closest(".select").querySelector(".select__text").setAttribute("data-id", levelItem.dataset.id)   
            } else {
                levelItem.classList.remove("selected")
            }
        })

        eduFormSelectOptions.forEach(eduFormItem => {
            if (eduFormItem.textContent.trim().toLowerCase() == eduForm.toLowerCase()) {
                eduFormItem.classList.add("selected")
                eduFormItem.closest(".select").querySelector(".select__text").textContent = eduForm
                eduFormItem.closest(".select").querySelector(".select__text").setAttribute("data-id", eduFormItem.dataset.id)   
            } else {
                eduFormItem.classList.remove("selected")
            }
        })    
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

        let selectedDeptItem = modalUchPlan.querySelector("[data-selectfield='dept'] .select__text")
        let selectedLevelEduItem = modalUchPlan.querySelector("[data-selectfield='levelEdu'] .select__text")
        let selectedEduFormItem = modalUchPlan.querySelector("[data-selectfield='eduForm'] .select__text")
        let yearInput = modalUchPlan.querySelector("#year")
        let profileInput = modalUchPlan.querySelector("#profile")
        let eduLangInput = modalUchPlan.querySelector("#eduLang")
        let accredInput = modalUchPlan.querySelector("#periodAccredistation")
        let linkToEduDistanceInput = modalUchPlan.querySelector("#linkToEduDistance")

        dataUchPlanFinal = data.profile

        dataUchPlanFinal.persDepartmentId = kafedra_id
        dataUchPlanFinal.levelEdu = null
        dataUchPlanFinal.levelEduId = parseInt(selectedLevelEduItem.dataset.id)
        dataUchPlanFinal.year = yearInput.value.trim()
        dataUchPlanFinal.profileName = profileInput.value.trim()
        dataUchPlanFinal.caseSDepartmentId = parseInt(selectedDeptItem.dataset.id)
        dataUchPlanFinal.caseCEdukindId = parseInt(selectedEduFormItem.dataset.id)
        dataUchPlanFinal.educationLanguage = eduLangInput.value
        dataUchPlanFinal.validityPeriodOfStateAccreditasion = accredInput.value
        dataUchPlanFinal.linkToDistanceEducation = linkToEduDistanceInput.value ?? ""

        let response = await fetch(`${URL}/Profiles/CreateProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(dataUchPlanFinal),
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
            popupSaveUchPlanBtn.closest(".popup__content").querySelector(".popup__close").click()
            getProfilesById(kafedra_id)
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
        uploadInput.addEventListener("change", function(e) {
            let fileNameField = modalUploadFile.querySelector(".popup-form__file-name")
            fileNameField.textContent = `Название файла: ${e.target.files[0].name}`
        })
    }

    // событие нажатия на кнопку создания файла в соответствующем модальном окне
    popupUploadFileBtn.addEventListener("click", function(e) {
        let fileTypeId = modalUploadFile.querySelector("#fileTypeId").value
        let profileId = modalUploadFile.querySelector("#profileId").value
        let uploadInput = e.target.closest(".popup-form").querySelector('input[type="file"]')
        let nameFileInput = e.target.closest(".popup-form").querySelector(".popup-form__label")
        let isUploadFile = uploadInput.files.length > 0 ? true : false
        let isValidateName = nameFileInput.querySelector(".popup-form__input").value.trim() != "" ? true : false

        if (isValidateName && isUploadFile) {
            nameFileInput.classList.remove("invalid")
            uploadInput.nextElementSibling.classList.remove("invalid")

            e.target.classList.add("loading")
            e.target.textContent = "Загрузка..."
            e.target.disabled = true

            let formData = new FormData()
            
            let fileName = nameFileInput.querySelector(".popup-form__input").value

            formData.append("formFile", uploadInput.files[0])
            formData.append("fileName", fileName)                    
            formData.append("fileType", fileTypeId)
            formData.append("profileId", profileId)

            saveFile(formData, e.target)

        } else {
            if (!isValidateName) {
                nameFileInput.classList.add("invalid")
                nameFileInput.focus()
            } else {
                nameFileInput.classList.remove("invalid")
            }
            
            if (!isUploadFile) {
                uploadInput.nextElementSibling.classList.add("invalid")
                uploadInput.focus()
            } else {
                uploadInput.nextElementSibling.classList.remove("invalid")
            }
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

        //получить и отобразить в текстовом поле название ссылки с файлом
        let linkToFile = el.closest(".item-file").querySelector("a")
        let outputFileName = linkToFile.textContent
        let fileName = linkToFile.getAttribute("href").split("/")[7]
        let popupEditFileInput = popupEditFile.querySelector(".popup-form__input")
        popupEditFileInput.value = outputFileName

        popupEditFileInput.setAttribute("placeholder", fileTypes[fileTypes.map(e => e.id).indexOf(fileTypeId)].name)

        //вывод названия файла
        let fileNameField = popupEditFile.querySelector(".popup-form__file-name")
        fileNameField.textContent = `Название файла: ${fileName}`

        //вывести название файла в случае выбора другого файла
        let uploadFileInput = popupEditFile.querySelector("input[type=file]")
        uploadFileInput.addEventListener("change", function(e) {
            fileNameField.textContent = `Название файла: ${e.target.files[0].name}`
        })
    }

    //валидация формы изменения профиля
    const validateProfileForm = (modalWindow) => {
        let selectedDeptItem = modalWindow.querySelector("[data-selectfield='dept'] .select__text")
        let deptName = selectedDeptItem.textContent

        let selectedLevelItem = modalWindow.querySelector("[data-selectfield='levelEdu'] .select__text")
        let levelEdu = selectedLevelItem.textContent

        let selectedEduFormItem = modalWindow.querySelector("[data-selectfield='eduForm'] .select__text")
        let eduForm = selectedEduFormItem.textContent

        let yearInput = modalWindow.querySelector("#year")
        let profileInput = modalWindow.querySelector("#profile")
        let eduLangInput = modalWindow.querySelector("#eduLang")
        let accredInput = modalWindow.querySelector("#periodAccredistation")

        let isValidForm = true

        if (deptName == "Выберите направление") {
            isValidForm = false
            selectedDeptItem.closest(".popup-form__label").classList.add("invalid")
        } else {
            selectedDeptItem.closest(".popup-form__label").classList.remove("invalid")
        }

        if (levelEdu == "Выберите уровень образования") {
            isValidForm = false
            selectedLevelItem.closest(".popup-form__label").classList.add("invalid")
        } else {
            selectedLevelItem.closest(".popup-form__label").classList.remove("invalid")
        }

        if (eduForm == "Выберите форму обучения") {
            isValidForm = false
            selectedEduFormItem.closest(".popup-form__label").classList.add("invalid")
        } else {
            selectedEduFormItem.closest(".popup-form__label").classList.remove("invalid")
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
    popupEditFileBtn.addEventListener("click", function(e) {
        validateAndEditFileOpop(e.target)
    })

    //валидация и отправка формы если валидация прошла успешно
    const validateAndEditFileOpop = (el) => {
        let fileId = popupEditFile.querySelector("#fileId").value
        let fileTypeId = popupEditFile.querySelector("#fileTypeId").value
        let profileId = popupEditFile.querySelector("#profileId").value

        let uploadInput = el.closest(".popup-form").querySelector('input[type="file"]')
        let nameFileInput = el.closest(".popup-form").querySelector(".popup-form__label")
        let isUploadFile = uploadInput.files.length > 0 ? true : false
        let isValidateName = nameFileInput.querySelector(".popup-form__input").value.trim() != "" ? true : false
        if (isValidateName) {
            nameFileInput.classList.remove("invalid")

            el.classList.add("loading")
            el.textContent = "Загрузка..."
            el.disabled = true

            let formData = new FormData()
            let fileName = nameFileInput.querySelector(".popup-form__input").value

            if (isUploadFile) {
                formData.append("formFile", uploadInput.files[0])
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

        let response = await fetch(`${URL}/Profiles/EditProfile`, {
            method: "PUT",
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
    popupDeleteFileBtn.addEventListener("click", function(e) {  
        popupEditFile.classList.remove("open")

        let fileId = popupEditFile.querySelector("#fileId").value
        popupDeleteFile.querySelector("#fileId").value = fileId

        popupDeleteFile.classList.add("open")
    })

    popupDeleteFileYesBtn.addEventListener("click", function(e) {
        e.target.classList.add("loading")
        e.target.disabled = true

        let fileId = popupEditFile.querySelector("#fileId").value
        deleteFile(fileId, e.target)
    })

    popupDeleteFileNoBtn.addEventListener("click", function(e) {
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
        let level = profileEdited.profile.levelEdu.name
        let deptName = profileEdited.caseSDepartment.deptName
        let eduForm = profileEdited.caseCEdukind.edukind
        let lang = profileEdited.profile.educationLanguage
        let accred = profileEdited.profile.validityPeriodOfStateAccreditasion
        let linkToEduDistance = profileEdited.profile.linkToDistanceEducation

        let profileIdInput = popupEditText.querySelector("#profileId")
        profileIdInput.value = tdElements.dataset.profileid

        let yearInp = popupEditText.querySelector("#year")
        yearInp.value = year
        let profileInp = popupEditText.querySelector("#profile")
        profileInp.value = profile
        let langInput = popupEditText.querySelector("#eduLang")
        langInput.value = lang
        let accredInput = popupEditText.querySelector("#periodAccredistation")
        accredInput.value = accred
        let linkToDistanceInput = popupEditText.querySelector("#linkToEduDistance")
        linkToDistanceInput.value = linkToEduDistance

        let deptSelectOptions = popupEditText.querySelectorAll("[data-selectfield=dept] .select__option")
        let levelSelectOptions = popupEditText.querySelectorAll("[data-selectfield=levelEdu] .select__option")
        let eduFormSelectOptions = popupEditText.querySelectorAll("[data-selectfield=eduForm] .select__option")

        deptSelectOptions.forEach(deptItem => {  
            if (deptItem.textContent.trim().toLowerCase() == deptName.toLowerCase()) {
                deptItem.classList.add("selected")
                deptItem.closest(".select").querySelector(".select__text").textContent = deptName
                deptItem.closest(".select").querySelector(".select__text").setAttribute("data-id", deptItem.dataset.id)                
            } 
        })

        levelSelectOptions.forEach(levelItem => {
            if (levelItem.textContent.trim().toLowerCase() == level.toLowerCase()) {
                levelItem.classList.add("selected")
                levelItem.closest(".select").querySelector(".select__text").textContent = level
                levelItem.closest(".select").querySelector(".select__text").setAttribute("data-id", levelItem.dataset.id)   
            } else {
                levelItem.classList.remove("selected")
            }
        })

        eduFormSelectOptions.forEach(eduFormItem => {
            if (eduFormItem.textContent.trim().toLowerCase() == eduForm.toLowerCase()) {
                eduFormItem.classList.add("selected")
                eduFormItem.closest(".select").querySelector(".select__text").textContent = eduForm
                eduFormItem.closest(".select").querySelector(".select__text").setAttribute("data-id", eduFormItem.dataset.id)   
            } else {
                eduFormItem.classList.remove("selected")
            }
        })
    }

    //нажатие на кнопку сохранения изменений в модальном окне изменения профиля
    popupEditTextBtn.addEventListener("click", function() {
        //валидация формы изменения профиля
        let isFormValid = validateProfileForm(popupEditText)

        //если форма заполнена верно, то собираем данные с формы и отправляем запрос на изменение профиля
        if (isFormValid) {
            let selectedDeptItem = popupEditText.querySelector("[data-selectfield='dept'] .select__text")

            let selectedLevelItem = popupEditText.querySelector("[data-selectfield='levelEdu'] .select__text")
            let levelEduId = selectedLevelItem.dataset.id

            let selectedEduFormItem = popupEditText.querySelector("[data-selectfield='eduForm'] .select__text")
            let profileId = popupEditText.querySelector("#profileId").value
            let profileItem = profiles[profiles.map(e => e.profile.id).indexOf(+profileId)]

            profileItem.profile.year = popupEditText.querySelector("#year").value
            profileItem.profile.profileName = popupEditText.querySelector("#profile").value.trim()
            profileItem.profile.caseSDepartmentId = selectedDeptItem.dataset.id
            profileItem.profile.caseCEdukindId = selectedEduFormItem.dataset.id
            profileItem.profile.levelEduId = levelEduId
            profileItem.profile.educationLanguage = popupEditText.querySelector("#eduLang").value
            profileItem.profile.validityPeriodOfStateAccreditasion = popupEditText.querySelector("#periodAccredistation").value
            profileItem.profile.linkToDistanceEducation = popupEditText.querySelector("#linkToEduDistance").value
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
    popupDeleteYesBtn.addEventListener("click", function(e) {
        let profileId = popupDelete.querySelector("#profileId").value
        popupDeleteYesBtn.classList.add("loading")
        popupDeleteYesBtn.disabled = true
        popupDeleteNoBtn.disabled = true
        deleteProfile(profileId)
    })

    //нажатие на кнопку нет в модальном окне удаления профиля
    popupDeleteNoBtn.addEventListener("click", function() {
        popupDelete.querySelector(".popup__close").click()
    })

    //функционал закрытия модального окна
    closeModalBtns.forEach(closeItem => {
        closeItem.addEventListener("click", function(e) {
            let popupClosed = e.target.closest(".popup")
            
            //очищение всех полей и выпадающих списков закрываемого модального окна
            let popupLabels = popupClosed.querySelectorAll(".popup-form__label")
            if (popupLabels) {
                popupLabels.forEach(popupLabel => {
                    popupLabel.classList.remove("invalid")
                    let popupLabelInput = popupLabel.querySelector(".popup-form__input")
                    if (popupLabelInput) {
                        popupLabelInput.value = ""
                    } else {
                        let popupLabelSelect = popupLabel.querySelector(".select")
                        let popupLabelSelectText = popupLabelSelect.querySelector(".select__text")
                        popupLabelSelect.classList.remove("invalid")
                        popupLabelSelectText.removeAttribute("data-id")
                        popupLabelSelectText.textContent = popupLabelSelectText.dataset.placeholder

                        let popupLabelSelectedEl = popupLabelSelect.querySelector(".select__option.selected")
                        if (popupLabelSelectedEl) {
                            popupLabelSelectedEl.classList.remove("selected")
                        }
                        
                    }
                })
            } 

            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")
            
        })
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
    
    //создать файл профиля
    const saveFile = async (formData, el) => {
        // Сохранение файлов (кроме РПД)
        let ecpCode = ""
        if (formData.has("ecp")) {
            ecpCode += `&ecp=${formData.get("ecp")}`
        }

        let response = await fetch(`${URL}/FileModel/CreateFileModel?fileName=${formData.get("fileName")}&fileType=${formData.get("fileType")}&profileId=${formData.get("profileId")}${ecpCode}`, {
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
        let ecpCode = ""
        if (formData.has("ecp")) {
            ecpCode += `&ecp=${formData.get("ecp")}`
        }

        let response = await fetch(`${URL}/FileModel/EditFileModel?fileId=${formData.get("fileId")}&fileType=${formData.get("fileType")}&fileName=${formData.get("fileName")}&profileId=${formData.get("profileId")}${ecpCode}`, {
            method: "PUT",
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
        let response = await fetch(`${URL}/FileModel/DeleteFileModel?fileId=${fileId}`, {
            method: "DELETE",
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
        if (fileTypeId == 2) { //тег для опоп
            propItem += `itemprop="opMain"`
        } else if (fileTypeId == 3) { //тег для учебного плана
            propItem += `itemprop="educationPlan"`
        } else if (fileTypeId == 4) { // тег для аннотации к рпд
            propItem += `itemprop="educationAnnotation"`
        } else if (fileTypeId == 5) { //тег для календарного рабочего графика
            propItem += `itemprop="educationShedule"`
        } else if (fileTypeId == 8) { //тег для методического материала
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
                if (fileModel.codeECP != null) {
                    markup += `
                        <div class="item-file__inner">
                            <span class="key-icon"></span>
                            <div class="document-key">
                                <p class="document-key__text">Документ подписан</p>
                                <p class="document-key__text">Простая электронная подпись</p>
                                <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                <p class="document-key__text">Ректор</p>
                                <p class="document-key__text">Ключ (SHA-256):</p>
                                <p class="document-key__text">${fileModel.codeECP}</p>
                            </div>
                            <a href="file:///C:/Users/User/Downloads/${fileModel.name}">${fileModel.outputFileName}</a>
                        </div>
                    `
                }  else {
                    markup += `
                        <a href="file:///C:/Users/User/Downloads/${fileModel.name}">${fileModel.outputFileName}</a>
                        
                    `
                }
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
            let response = await fetch(`${URL}/Profiles/GetDataById?kafedraId=${kafedra_id}`, {
                credentials: "include"
            })
        
            if (response.ok) {
                profiles = await response.json()
                showProfiles(profiles)
            } else if (response.status == 405) {
                window.location.assign("/login.html")
            }
        } else {
            window.location.assign("/login.html")
        }
    }

    //отображение пользователю всех профилей кафедры
    const showProfiles = (profiles) => {
        let res = ""
        for (let el of profiles) {
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
            
            res += generateMarkupFileModelByFileTypeId(el, 1) // фгос

            res += generateMarkupFileModelByFileTypeId(el, 2) // опоп

            res += generateMarkupFileModelByFileTypeId(el, 9) // аопоп
            
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
                <td itemprop="language">
                    <span>${el.profile.validityPeriodOfStateAccreditasion}</span>
                    <div class="actions">
                        <button type="button" class="edit edit-item--text">
                        <span class="edit__btn btn"></span>
                        </button>
                    </div>
                </td>
            `

            res += `
                <td itemprop="language">
                    ${
                        el.profile.linkToDistanceEducation != "" 
                        ? `<a href=${el.profile.linkToDistanceEducation}>Дистанционное обучение</a>`
                        : "<span>не используется</span>"
                    }
                    <div class="actions">
                        <button type="button" class="edit edit-item--text">
                        <span class="edit__btn btn"></span>
                        </button>
                    </div>
                </td>
            `

            res += generateMarkupFileModelByFileTypeId(el, 3) // учебный план

            res += generateMarkupFileModelByFileTypeId(el, 4) // аннотации к рпд

            //если есть ссылка на РПД для аспирантуры, то показываем ее, если нет, то генерируем ссылку на страницу ЭОР
            if (el.profile.linkToRPD != null) {
                res += `
                    <td itemprop="educationRpd">
                        <a href="${el.profile.linkToRPD}">Рабочие программы дисциплин</a>
                    </td>
                ` 
            } else {
                res += `
                    <td itemprop="educationRpd">
                        <a href="/metodist/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                    </td>
                ` 
            }

            res += generateMarkupFileModelByFileTypeId(el, 5) // календарный учебный график

            let fileModelsRpp = el.disciplines // рабочие программы практик
            if (fileModelsRpp.length != 0) {
                let rpp = `<td itemprop="eduPr">`
                for (let fileModel of fileModelsRpp) {
                    rpp += `
                        <div class="item-file">
                            <a href=#}>${fileModel.disciplineName}</a>
                        </div>
                    `
                }               
                res += rpp
            }

            res += generateMarkupFileModelByFileTypeId(el, 6) // гиа

            res += generateMarkupFileModelByFileTypeId(el, 7) // матрицы

            res += generateMarkupFileModelByFileTypeId(el, 8) // методические материалы

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
        document.querySelector("tbody").innerHTML = res
    }

    //функция, которая создает ссылку на панель администратора если пользователем является админ
    const setUserName = (userName) => {
        let actionText = document.querySelector(".header .action__text")
        actionText.textContent = userName
    }

    //удалить профиль
    const deleteProfile = async (profileId) => {
        let response = await fetch(`${URL}/Profiles/DeleteProfile?profileId=${profileId}`, {
            method: "DELETE",
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
            
            popupDeleteBtn.classList.remove("loading")
            popupDeleteYesBtn.disabled = false
            popupDeleteNoBtn.disabled = false
        }
    }

    //получить направления кафедры
    const getCaseSDepartments = async () => {
        if (kafedra_id) {
            let response = await fetch(`${URL}/DekanatData/GetCaseSDepartmentByKafedraId?kafedraId=${kafedra_id}`, {
                credentials: "include"
            })
        
            if (response.ok) {
                let data = await response.json()
                let res = ""

                for (let el of data) {
                    res += `
                        <li class="select__option" data-id=${el.departmentId}>
                            <span class="select__option-text">${el.deptName}</span>
                        </li>
                    `
                }
                modalUchPlan.querySelector("[data-selectfield=dept] .select__options").innerHTML = res
                popupEditText.querySelector("[data-selectfield=dept] .select__options").innerHTML = res
            }
        } else {
            window.location.assign("/login.html")
        }
        
    }

    //получить уровни обучения
    const getLevelEdues = async () => {
        let response = await fetch(`${URL}/LevelEdu/GetLevelEdu`, {
            credentials: "include"
        })
        
        if (response.ok) {
            let data = await response.json()
            let res = ""

            for (let el of data) {
                res += `
                    <li class="select__option" data-id=${el.id}>
                        <span class="select__option-text">${el.name}</span>
                    </li>
                `
            }
            modalUchPlan.querySelector("[data-selectfield=levelEdu] .select__options").innerHTML = res
            popupEditText.querySelector("[data-selectfield=levelEdu] .select__options").innerHTML = res
        }
        // } else if (response.status == 405) {
        //     window.location.assign("/login.html")
        // }
    }

    //получить формы обучения
    const getEduForms = async () => {
        let response = await fetch(`${URL}/DekanatData/GetCaseSEdukinds`, {
                credentials: "include"
            })
        
        if (response.ok) {
            let data = await response.json()
            let res = ""
            for (let el of data) {
                res += `
                    <li class="select__option" data-id=${el.edukindId}>
                        <span class="select__option-text">${el.edukind}</span>
                    </li>
                `
            }
            modalUchPlan.querySelector("[data-selectfield=eduForm] .select__options").innerHTML = res
            popupEditText.querySelector("[data-selectfield=eduForm] .select__options").innerHTML = res
        }
        // } else if (response.status == 405) {
        //     window.location.assign("/login.html")
        // }
    }

    const getFileTypes = async () => {
        let response = await fetch(`${URL}/FileType/GetFileTypes`, {
            credentials: "include"
        })

        if (response.ok) {
            fileTypes = await response.json()
        }
    }

    //выход подьзователя из аккаунта
    const logout = async () => {
        let response = await fetch(`${URL}/Account/Logout`, {
            credentials: "include"
        }) 

        if (response.ok) {
            localStorage.clear()
            window.location.assign("/login.html")
        }
    }

    const isAuthorize = () => localStorage.getItem("userId") != null

    //нажатие на кнопку выхода из аккаунта пользователя
    logoutBtn.addEventListener("click", function() {
        logout()
    })

    const hasUserAccessToRole = () => userRole === "null"

    if (isAuthorize()) {
        userId = localStorage.getItem("userId")
        kafedra_id = localStorage.getItem("persDepartmentId")
        userRole = localStorage.getItem("userRole")

        let hasAccess = hasUserAccessToRole()
        if (hasAccess) {
            userName = localStorage.getItem("userName")

            setUserName(userName)
            getProfilesById().then(_ => getCaseSDepartments()).then(_ => getLevelEdues()).then(_ => getEduForms()).then(_ => getFileTypes())
        } else {
            window.location.assign(`/${userRole}/`)
        }
    } else {
        window.location.assign("/login.html")
    }

})