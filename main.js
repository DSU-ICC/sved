document.addEventListener("DOMContentLoaded", () => {
    let uploadUchPlan = document.querySelector(".file-upload--big input[type=file]")
    let modalUchPlan = document.querySelector("#popup-uchplan")
    let modalUploadFile = document.querySelector("#popup-uploadFile")
    let popupUploadFileBtn = document.querySelector("#popup-uploadFile .popup-form__btn")
    let closeModalBtn = document.querySelectorAll(".popup__close")
    let saveUchPlanBtn = document.querySelector("#popup-uchplan .popup-form__btn")

    let popupDelete = document.querySelector("#popup-delete")
    let popupDeleteBtn = document.querySelector("#popup-delete .popup-form__btn")
    let popupEditFile = document.querySelector("#popup-editFile")
    let popupEditFileBtn = document.querySelector("#popup-editFile .popup-form__btn")
    let popupDeleteFileBtn = document.querySelector("#popup-editFile .delete__btn")
    let popupEditText = document.querySelector("#popup-editText")
    let popupEditTextBtn = document.querySelector("#popup-editText .popup-form__btn")
    let dataUchPlanFinal;
    let profiles;
    const KAFEDRA_ID = 6

    let pageTable = document.querySelector("table")
    pageTable.addEventListener("click", function(e) {
        let targetItem = e.target

        if (targetItem.closest(".file-upload__btn")) { // кнопка загрузки файлов
            modalUploadFile.classList.add("open")
            document.body.classList.add("no-scroll")
            
            let fileTypeId = parseInt(targetItem.dataset.filetype)
            let profileId = parseInt(targetItem.closest("tr").dataset.profileid)
            modalUploadFile.querySelector("#fileTypeId").value = fileTypeId
            modalUploadFile.querySelector("#profileId").value = profileId
            console.log(fileTypeId, profileId)
        } else if (targetItem.closest("td:last-child .edit")) { // кнопка внесения изменения в опоп
            targetItem.closest("tr").classList.toggle("editable")
        } else if (targetItem.closest(".delete__btn")) { // кнопка удаления опоп
            fillDataForDeleteOpop(targetItem)
        } else if (targetItem.closest(".edit-item--text .btn")) { //кнопка внесения изменения текстовой информации в опоп
            fillDataForEditTextOpop(targetItem)
        } else if (targetItem.closest(".edit-item .btn")) { //кнопка изменения файла в опоп
            fillDataForEditFile(e.target)
        }
    })

    //генерация случайного числа для генерации ключа
    const randomNumber = (min, max) => {
        let r = Math.random()*(max-min) + min
        return Math.floor(r)
    }

    //генерация ключа для простой электронной подписи
    const generateKey = () => {
        let key = ""
        key += Number(randomNumber(0, 2**32)).toString(2)

        return key
    }

    console.log(Number(32).toString(2))

    uploadUchPlan.addEventListener("change", function(e) {
        parsingUchPlan(e.target)
    })

    const fillDataForEditFile = (el) => {
        popupEditFile.classList.add("open")
        document.body.classList.add("no-scroll")

        let fileTypeId = parseInt(el.dataset.filetype)
        let fileId = parseInt(el.dataset.fileid)
        let profileId = parseInt(el.closest("tr").dataset.profileid)

        popupEditFile.querySelector("#fileId").value = fileId
        popupEditFile.querySelector("#fileTypeId").value = fileTypeId
        popupEditFile.querySelector("#profileId").value = profileId

        let outputFileName = el.closest(".item-file").firstElementChild.textContent
        

        popupEditFile.querySelector(".popup-form__input").value = outputFileName
    }

    const fillDataForDeleteOpop = (el) => {
        popupDelete.classList.add("open")
        document.body.classList.add("no-scroll")

        let tdElements = el.closest("tr")
        let profileId = tdElements.dataset.profileid
        let year = tdElements.children[0].textContent.trim()
        let code = tdElements.children[1].textContent.trim()
        let profile = tdElements.children[4].textContent.trim()
        let level = tdElements.children[3].textContent.trim()
        let deptName = tdElements.children[2].textContent.trim()
        let eduForm = tdElements.children[7].textContent.trim()

        let profileIdInput = popupDelete.querySelector("#profileId")
        let yearInput = popupDelete.querySelector("#year")
        let codeInput = popupDelete.querySelector("#code")
        let deptInput = popupDelete.querySelector("#dept")
        let levelInput = popupDelete.querySelector("#level")
        let profileInput = popupDelete.querySelector("#profile")
        let eduFormInput = popupDelete.querySelector("#eduForm")

        profileIdInput.value = profileId
        yearInput.value = year
        codeInput.value = code
        deptInput.value = deptName
        levelInput.value = level
        profileInput.value = profile
        eduFormInput.value = eduForm
    }

    popupDeleteBtn.addEventListener("click", function(e) {
        popupDeleteBtn.classList.add("loading")
        popupDeleteBtn.textContent = "Удаление..."
        deleteProfile(popupDelete.querySelector("#profileId").value)
    }) 

    //функция заполнения данными модального окна для редактирования текстовой информации профиля
    const fillDataForEditTextOpop = (el) => {
        popupEditText.classList.add("open")
        document.body.classList.add("no-scroll")

        let tdElements = el.closest("tr")          

        let year = tdElements.children[0].textContent.trim()
        let profile = tdElements.children[4].textContent.trim()
        let level = tdElements.children[3].textContent.trim()
        let deptName = tdElements.children[2].textContent.trim()
        let eduForm = tdElements.children[7].textContent.trim()

        let profileIdInput = popupEditText.querySelector("#profileId")
        profileIdInput.value = tdElements.dataset.profileid

        let yearInp = popupEditText.querySelector("#year")
        yearInp.value = year
        let profileInp = popupEditText.querySelector("#profile")
        profileInp.value = profile

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
            console.log(`${levelItem.textContent.trim().toLowerCase()} - ${level.toLowerCase()}`)
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

    popupEditTextBtn.addEventListener("click", function() {
        let isFormValid = validateProfileForm(popupEditText)

        if (isFormValid) {
            let selectedDeptItem = popupEditText.querySelector("[data-selectfield='dept'] .select__text")

            let selectedLevelItem = popupEditText.querySelector("[data-selectfield='levelEdu'] .select__text")
            let levelEdu = selectedLevelItem.textContent

            let selectedEduFormItem = popupEditText.querySelector("[data-selectfield='eduForm'] .select__text")
            let profileId = popupEditText.querySelector("#profileId").value
            let profileItem = profiles[profiles.map(e => e.profile.id).indexOf(+profileId)]

            profileItem.profile.year = popupEditText.querySelector("#year").value
            profileItem.profile.profileName = popupEditText.querySelector("#profile").value.trim()
            profileItem.profile.caseSDepartmentId = selectedDeptItem.dataset.id
            profileItem.profile.caseCEdukindId = selectedEduFormItem.dataset.id
            profileItem.profile.levelEdu.name = levelEdu
            console.log(profileItem.profile)
            editProfile(profileItem.profile, popupEditTextBtn)
        }
    })

    popupEditFileBtn.addEventListener("click", function(e) {
        validateAndSaveFileOpop(e.target)
    })

    const validateAndSaveFileOpop = (el) => {
        let fileId = popupEditFile.querySelector("#fileId").value
        let profileId = popupEditFile.querySelector("#profileId").value

        let uploadInput = el.closest(".popup-form").querySelector('input[type="file"]')
        let nameFileInput = el.closest(".popup-form").querySelector(".popup-form__label")
        let isUploadFile = uploadInput.files.length > 0 ? true : false
        let isValidateName = nameFileInput.querySelector(".popup-form__input").value.trim() != "" ? true : false
        if (isValidateName) {
            nameFileInput.classList.remove("invalid")

            el.classList.add("loading")
            el.textContent = "Загрузка..."

            let formData = new FormData()
            let fileName = nameFileInput.querySelector(".popup-form__input").value

            if (isUploadFile) {
                formData.append("upload", uploadInput.files[0])
            }
            formData.append("fileName", fileName)                    
            formData.append("fileId", fileId)
            formData.append("profileId", profileId)

            editFile(formData, el)
        }

    }

    popupDeleteFileBtn.addEventListener("click", function(e) {      
        let result = confirm("Вы действительно хотите удалить файл?")
        if (result) {
            e.target.classList.add("loading")
            e.target.textContent = "Удаление..."
            deleteFile(popupEditFile.querySelector("#fileId").value, e.target)
        }
    })

    closeModalBtn.forEach(closeItem => {
        closeItem.addEventListener("click", function (e) {
            document.body.classList.remove("no-scroll")
            e.target.closest(".popup").classList.remove("open")

            if (e.target.closest("#popup-uploadFile")) {
                let popupFileItems = e.target.closest("#popup-uploadFile").querySelectorAll(".popup-form__file-item")
                popupFileItems.forEach((popupFileItem, idx) =>{
                    if (idx != 0) {
                        if (popupFileItem.querySelector(".add")) {
                            popupFileItems[0].querySelector(".popup-form__actions").append(popupFileItem.querySelector(".add"))
                        }
                        popupFileItem.remove()
                    } else {
                        popupFileItem.querySelector('.file-upload__btn').classList.remove("invalid")
                        popupFileItem.querySelector('.popup-form__label').classList.remove("invalid")
                        popupFileItem.querySelector('input[type="file"]').value = ""
                        popupFileItem.querySelector('.popup-form__input').value = ""
                    }
                })
            }
        })
    })

    const validateProfileForm = (modalWindow) => {
        let selectedDeptItem = modalWindow.querySelector("[data-selectfield='dept'] .select__text")
        let deptName = selectedDeptItem.textContent

        let selectedLevelItem = modalWindow.querySelector("[data-selectfield='levelEdu'] .select__text")
        let levelEdu = selectedLevelItem.textContent

        let selectedEduFormItem = modalWindow.querySelector("[data-selectfield='eduForm'] .select__text")
        let eduForm = selectedEduFormItem.textContent

        let yearInput = modalWindow.querySelector("#year")
        let profileInput = modalWindow.querySelector("#profile")

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

        return isValidForm
    }

    saveUchPlanBtn.addEventListener("click", () => {
        let isFormValid = validateProfileForm(modalUchPlan)
        
        if (isFormValid) {
            saveUchPlanData(dataUchPlanFinal)
        }
        
    })

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

            let formData = new FormData()
            let fileName = nameFileInput.querySelector(".popup-form__input").value

            formData.append("upload", uploadInput.files[0])
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

    //функция изменения текстовой информации профиля
    const editProfile = async (profile, el) => {
        el.classList.add("loading")
        el.textContent = "Сохранение..."
        console.log(profile)

        let response = await fetch("https://localhost:44370/Profiles/EditProfile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profile)
        })

        if (response.ok) {
            alert("Профиль изменен")      
            el.classList.remove("loading")
            el.textContent = "Завершить редактирование"  
            el.closest(".popup__content").querySelector(".popup__close").click()
            getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось изменить профиль. Попробуйте еще раз")
            el.classList.remove("loading")
            el.textContent = "Завершить редактирование"  
        }
    }

    //парсинг excel файла учебного плана
    const parsingUchPlan = async (el) => {
        el.previousElementSibling.textContent = "Загрузка..."
        el.previousElementSibling.classList.add("loading")

        el.previousElementSibling.disabled = true;

        let formData = new FormData()
        formData.append("uploadedFile", el.files[0])

        // "https://localhost:44370/Files/AddFile?fileTypeId=2&profileId=0"

        let response = await fetch("https://localhost:44370/Profiles/CreateProfileByFile", {
            method: "POST",
            body: formData
        })
        let data = await response.json()

        if (response.ok) {
            fillUchPlanData(data)

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
        console.log(dataUchPlanFinal)

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
            console.log(`${levelItem.textContent.trim().toLowerCase()} - ${level.toLowerCase()}`)
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

    //создание профиля 
    const saveUchPlanData = async (data) => {
        saveUchPlanBtn.classList.add("loading")
        saveUchPlanBtn.textContent = "Сохранение..."

        let selectedDeptItem = modalUchPlan.querySelector("[data-selectfield='dept'] .select__text")
        let levelEdu = modalUchPlan.querySelector("[data-selectfield='levelEdu'] .select__text").textContent
        let selectedEduFormItem = modalUchPlan.querySelector("[data-selectfield='eduForm'] .select__text")
        let yearInput = modalUchPlan.querySelector("#year")
        let profileInput = modalUchPlan.querySelector("#profile")

        dataUchPlanFinal = data.profile
        dataUchPlanFinal.year = yearInput.value.trim()
        dataUchPlanFinal.profileName = profileInput.value.trim()
        dataUchPlanFinal.caseSDepartmentId = selectedDeptItem.dataset.id
        dataUchPlanFinal.caseCEdukindId = selectedEduFormItem.dataset.id
        dataUchPlanFinal.levelEdu.name = levelEdu

        console.log(dataUchPlanFinal)

        let response = await fetch("https://localhost:44370/Profiles/CreateProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataUchPlanFinal),
        })

        if (response.ok) {
            alert("Профиль добавлен")
            saveUchPlanBtn.classList.remove("loading")
            saveUchPlanBtn.textContent = "Завершить редактирование"
            saveUchPlanBtn.closest(".popup__content").querySelector(".popup__close").click()
            getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось добавить профиль. Попробуйте еще раз")
            saveUchPlanBtn.classList.remove("loading")
            saveUchPlanBtn.textContent = "Завершить редактирование"
            saveUchPlanBtn.closest(".popup__content").querySelector(".popup__close").click()
            getProfilesById(KAFEDRA_ID)
        }

    }

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
        // Сохранение файлов (кроме РПД и учебного плана)

        let response = await fetch(`https://localhost:44370/FileModel/CreateFileModel?fileName=${formData.get("fileName")}&fileType=${formData.get("fileType")}&profileId=${formData.get("profileId")}`, {
            method: "POST",
            body: formData
        }) 
        if (response.ok) {
           alert("Файл успешно добавлен")
           el.classList.remove("loading")
           el.textContent = "Загрузить файл"
           el.closest(".popup__content").querySelector(".popup__close").click()
           getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось загрузить файл. Попробуйте еще раз")
            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            el.closest(".popup__content").querySelector(".popup__close").click()
        }

        // $.ajax({
        //     type: 'POST',
        //     url: 'https://localhost:44370/FileModel/CreateFileModel',
        //     cache: false,
        //     contentType: false,
        //     processData: false,
        //     data : formData,
        //     success: function(result){
        //         console.log(result);
        //     },
        //     error: function(err){
        //         console.log(err);
        //     }
        // })
    }

    //изменить файл профиля
    const editFile = async (formData, el) => {
        let response = await fetch(`https://localhost:44370/FileModel/EditFileModel?fileId=${formData.get("fileId")}&fileName=${formData.get("fileName")}&profileId=${formData.get("profileId")}`, {
            method: "PUT",
            body: formData
        }) 
        if (response.ok) {
           alert("Файл успешно изменен")
           el.classList.remove("loading")
           el.textContent = "Загрузить файл"
           el.closest(".popup__content").querySelector(".popup__close").click()
           getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось изменить файл. Попробуйте еще раз")
            el.classList.remove("loading")
            el.textContent = "Загрузить файл"
            //el.closest(".popup__content").querySelector(".popup__close").click()
        }
    }

    //удаление файла профиля
    const deleteFile = async (fileId, el) => {
        let response = await fetch(`https://localhost:44370/FileModel/DeleteFileModel?fileId=${fileId}`, {
            method: "DELETE",
        }) 
        if (response.ok) {
           alert("Файл успешно удален")
           el.classList.remove("loading")
           el.textContent = "Удалить файл"
           el.closest(".popup__content").querySelector(".popup__close").click()
           getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось удалить файл. Попробуйте еще раз")
            el.classList.remove("loading")
            el.textContent = "Удалить файл"
            el.closest(".popup__content").querySelector(".popup__close").click()
        }
    }

    const generateMarkupFileModelByFileTypeId = (profile, fileTypeId) => {
        let fileModels = new Set(profile.profile.fileModels.filter(e => e.type == fileTypeId))
        let markup = "";
        if (fileModels.size != 0) {
            markup = `<td>`
            for (let fileModel of fileModels) {
                markup += `
                    <div class="item-file">
                        <a href="file:///C:/Users/User/Downloads/${fileModel.name}">${fileModel.outputFileName}</a>
                        <div class="actions">
                            <button type="button" class="edit edit-item">
                                <span data-fileType="${fileTypeId}" data-fileid=${fileModel.id} class="edit__btn btn"></span>
                            </button>
                        </div>
                    </div>
                `
            }
            markup += `
                <div class="actions">
                    <button class="file-upload file-upload__item">
                        <span data-fileType="${fileTypeId}" class="file-upload__btn btn"></span>
                    </button>
                </div>
                </td>
            `
        } else {
            markup += `
                <td>
                    <button class="file-upload">
                        <span data-fileType="${fileTypeId}" class="file-upload__btn btn"></span>
                    </button>
                </td>
            `
        }
        return markup
    }

    //получить профили по айди кафедры
    const getProfilesById = async (kafedraId) => {
        let response = await fetch(`https://localhost:44370/Profiles/GetDataById?kafedraId=${kafedraId}`)
        
        if (response.ok) {
            profiles = await response.json()
            let res = ""
            for (let el of profiles) {
                res += `
                    <tr data-profileid=${el.profile.id}>
                        <td>
                            <span>${el.profile.year}</span>
                            <div class="actions">
                                <button type="button" class="edit edit-item--text">
                                    <span class="edit__btn btn"></span>
                                </button>
                            </div>
                        </td>
                        <td>
                            <span>${el.caseSDepartment.code}</span>
                        </td>
                        <td>
                            <span>${el.caseSDepartment.deptName}</span>
                            <div class="actions">
                                <button type="button" class="edit edit-item--text">
                                    <span class="edit__btn btn"></span>
                                </button>
                            </div>
                        </td>
                        <td>
                            <span>${el.profile.levelEdu.name}</span>
                            <div class="actions">
                                <button type="button" class="edit edit-item--text">
                                    <span class="edit__btn btn"></span>
                                </button>
                            </div>
                        </td>
                        <td>
                            <span>${el.profile.profileName}</span>
                            <div class="actions">
                                <button type="button" class="edit edit-item--text">
                                    <span class="edit__btn btn"></span>
                                </button>
                            </div>
                        </td>                    
                ` 
                
                res += generateMarkupFileModelByFileTypeId(el, 0) // опоп

                res += generateMarkupFileModelByFileTypeId(el, 1) // фгос
                
                res += `
                    <td>
                        <span>${el.caseCEdukind.edukind}</span>
                        <div class="actions">
                            <button type="button" class="edit edit-item--text">
                            <span class="edit__btn btn"></span>
                            </button>
                        </div>
                    </td>
                 `

                res += generateMarkupFileModelByFileTypeId(el, 2) // учебный план

                res += generateMarkupFileModelByFileTypeId(el, 16) // аннотации к рпд

                res += `
                    <td>
                        <a href="/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                    </td>
                `  

                res += generateMarkupFileModelByFileTypeId(el, 3) // календарный учебный график

                let fileModelsRpp = el.practics // рабочие программы практик
                if (fileModelsRpp.size != 0) {
                    let rpp = `<td>`
                    for (let fileModel of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                                <a href="#">${fileModel.disciplineName}</a>
                                <div class="actions">
                                    <button type="button" class="edit edit-item">
                                        <span data-fileType="10" data-fileid=${fileModel.id} class="edit__btn btn"></span>
                                    </button>
                                </div>
                            </div>
                        `
                    }
                    rpp += `
                        <div class="actions">
                            <button class="file-upload file-upload__item">
                                <span data-fileType="10" class="file-upload__btn btn"></span>
                            </button>
                        </div>
                        </td>
                    `                   
                    res += rpp
                } else {
                    res += `
                        <td>
                            <button class="file-upload">
                                <span data-fileType="10" class="file-upload__btn btn"></span>
                            </button>
                        </td>
                    `
                }

                res += generateMarkupFileModelByFileTypeId(el, 4) // гиа

                res += generateMarkupFileModelByFileTypeId(el, 6) // матрицы

                res += generateMarkupFileModelByFileTypeId(el, 11) // методические материалы

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
                console.log(profiles)
            }
            document.querySelector("tbody").innerHTML = res

        }
    }

    //удалить профиль
    const deleteProfile = async (profileId) => {
        

        let response = await fetch(`https://localhost:44370/Profiles/DeleteProfile?profileId=${profileId}`, {
            method: "DELETE"
        })

        if (response.ok) {
            alert("Профиль успешно удален")
            popupDeleteBtn.classList.remove("loading")
            popupDeleteBtn.textContent = "Удалить профиль"
            popupDeleteBtn.closest(".popup__content").querySelector(".popup__close").click()
            getProfilesById(KAFEDRA_ID)
        } else {
            alert("Не удалось удалить профиль. Попробуйте еще раз")
            popupDeleteBtn.classList.remove("loading")
            popupDeleteBtn.textContent = "Удалить профиль"
            popupDeleteBtn.closest(".popup__content").querySelector(".popup__close").click()
        }
    }

    //получить направления кафедры
    const getCaseSDepartments = async (kafedraId) => {
        let response = await fetch(`https://localhost:44370/DekanatData/GetCaseSDepartmentByKafedraId?kafedraId=${kafedraId}`)
        
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
    }

    //получить уровни обучения
    const getLevelEdu = async () => {
        let data = ["бакалавриат", "магистратура"]
        let res = ""
        for (let el of data) {
            res += `
                <li class="select__option">
                    <span class="select__option-text">${el}</span>
                </li>
            `
        }
        modalUchPlan.querySelector("[data-selectfield=levelEdu] .select__options").innerHTML = res
        popupEditText.querySelector("[data-selectfield=levelEdu] .select__options").innerHTML = res
    }

    //получить формы обучения
    const getEduForms = async () => {
        let response = await fetch("https://localhost:44370/DekanatData/GetCaseSEdukinds")
        
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
    }

    getProfilesById(KAFEDRA_ID)
    getCaseSDepartments(KAFEDRA_ID)
    getEduForms()
    getLevelEdu()
})