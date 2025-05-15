document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path
    
    const URL = "https://oop.dgu.ru"

    let disciplineList
    let statusDisciplineList

    let closeModalBtns = document.querySelectorAll(".popup__close")

    let recoveryBtn = document.querySelector(".profile-recovery-btn")
    let popupRecovery = document.querySelector("#popup-recovery")
    let popupProfilesDeleted = popupRecovery.querySelector(".profiles-deleted")
    let popupRecoveryConfirm = document.querySelector("#popup-recovery-confirm")
    let popupRecoveryConfirmYesBtn = document.querySelector("#popup-recovery-confirm .confirm-button--yes")
    let popupRecoveryConfirmNoBtn = document.querySelector("#popup-recovery-confirm .confirm-button--no")

    let popupApproveDiscipline = document.querySelector("#popup-approveDiscipline")
    let popupApproveDisciplineYesBtn = document.querySelector("#popup-approveDiscipline .confirm-button--yes")
    let popupApproveDisciplineNoBtn = document.querySelector("#popup-approveDiscipline .confirm-button--no")

    let popupRejectDiscipline = document.querySelector("#popup-rejectDiscipline")
    let popupRejectDisciplineYesBtn = document.querySelector("#popup-rejectDiscipline .confirm-button--yes")
    let popupRejectDisciplineNoBtn = document.querySelector("#popup-rejectDiscipline .confirm-button--no")

    let rejectMultipleDisciplinesBtn = document.querySelector(".reject-disciplines-btn")
    let popupRejectMultipleDisciplines = document.querySelector("#popup-reject-disciplines")
    let popupRejectMultipleDisciplinesBtn = document.querySelector("#popup-reject-disciplines .popup__reject-btn")

    let approveMultipleDisciplinesBtn = document.querySelector(".approve-disciplines-btn")
    let popupApproveMultipleDisciplines = document.querySelector("#popup-approve-disciplines")
    let popupApproveMultipleDisciplinesBtn = document.querySelector("#popup-approve-disciplines .popup__approve-btn")

    let popupApproveStatusDiscipline = document.querySelector("#popup-approveStatusDiscipline")
    let popupApproveStatusDisciplineYesBtn = document.querySelector("#popup-approveStatusDiscipline .confirm-button--yes")
    let popupApproveStatusDisciplineNoBtn = document.querySelector("#popup-approveStatusDiscipline .confirm-button--no")

    let popupRejectStatusDiscipline = document.querySelector("#popup-rejectStatusDiscipline")
    let popupRejectStatusDisciplineYesBtn = document.querySelector("#popup-rejectStatusDiscipline .confirm-button--yes")
    let popupRejectStatusDisciplineNoBtn = document.querySelector("#popup-rejectStatusDiscipline .confirm-button--no")

    let logoutBtn = document.querySelector(".header .action__btn")
    let userId
    let userRole
    let deletedProfiles

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

                    //очистка текстового поля
                    if (popupLabelInput) {
                        popupLabelInput.value = ""
                    } else if (popupLabelSelect) { // сброс значений выпадоющего списка
                        let popupLabelSelectedEl = popupLabelSelect.querySelectorAll(".select__option.selected")
                        if (popupLabelSelectedEl) {
                            popupLabelSelectedEl.forEach(selectedItem => {
                                selectedItem.classList.remove("selected")
                            })
                        }

                        let popupLabelSelectText = popupLabelSelect.querySelector(".select__text")
                        popupLabelSelect.classList.remove("invalid")
                        popupLabelSelectText.removeAttribute("data-id")
                        popupLabelSelectText.textContent = popupLabelSelectText.dataset.placeholder

                    } else { // ставим значение роли по умолчанию (методист)
                        let metodistRoleRadioBtn = popupLabel.querySelector(".radio__item:nth-child(1) label")
                        metodistRoleRadioBtn.click()
                        metodistRoleRadioBtn.previousElementSibling.setAttribute("data-checked", true)
                    }
                })
            } 

            //после очистки закрываем модальное окно
            popupClosed.classList.remove("open")
            document.body.classList.remove("no-scroll")
            
        })
    })

    recoveryBtn.addEventListener("click", function() {
        popupRecovery.classList.add("open")
        document.body.classList.add("no-scroll")
        
        if (!deletedProfiles) {
            popupProfilesDeleted.innerHTML = "<span>Загрузка удаленных профилей...</span>"
            getDeletedProfiles(userId)
        } else {
            showDeletedProfiles(deletedProfiles)
        }
    })

    const getDeletedProfiles = async (userId) => {
        let response = await fetch(`${URL}/api/Profiles/GetDeletedProfiles?umuId=${userId}`, {
            credentials: "include"
        })

        if (response.ok) {
            deletedProfiles = await response.json()
            showDeletedProfiles(deletedProfiles)
        } else if (response.status == 400) {
            popupProfilesDeleted.innerHTML = "<span>Нет доступных дисциплин для восстановления</span>"
        } else {
            popupProfilesDeleted.innerHTML = "<span>Ошибка загрузки профиля</span>"
        }
    }

    const showDeletedProfiles = (deletedProfiles) => {
        let profileTable = `
            <table class="profiles-deleted__table">
                <thead>
                    <tr>
                        <th>Год реал-ии</th>
                        <th>Код, шифр</th>
                        <th>Профиль</th>
                        <th>Форма обучения</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `

        for (let profileItem of deletedProfiles) {
            profileTable += `
                <tr data-profileid=${profileItem.profile.id}>
                    <td>
                        <span>${profileItem.profile.year}</span>
                    </td>
                    <td>
                        <span>${profileItem.caseSDepartment.code}</span>
                    </td>
                    <td>
                        <span>${profileItem.profile.profileName}</span>
                    </td>
                    <td>
                        <span>${profileItem.profile.levelEdu.name}</span>
                    </td>
                    <td>
                        <button type="button" class="profiles-deleted__btn btn">Восстановить</button>'
                    </td>    
                </tr>
            `
        }

        profileTable += `
                </tbody>
            </table>
        `
        popupProfilesDeleted.innerHTML = profileTable

        let popupProfilesDeletedBtns = popupRecovery.querySelectorAll(".profiles-deleted__btn")
        popupProfilesDeletedBtns.forEach(profileDeletedBtn => {
            profileDeletedBtn.addEventListener("click", function() {
                let profileId = profileDeletedBtn.closest("tr").dataset.profileid

                let profileIdField = popupRecoveryConfirm.querySelector("#profileId")
                profileIdField.value = profileId

                popupRecovery.classList.remove("open")
                popupRecoveryConfirm.classList.add("open")
            })
        })
    }

    popupRecoveryConfirmYesBtn.addEventListener("click", function() {
        let profileId = popupRecoveryConfirm.querySelector("#profileId").value

        popupRecoveryConfirmYesBtn.classList.add("loading")
        recoveryProfile(profileId, userId)
    })

    const recoveryProfile = async (profileId, userId) => {
        let response = await fetch(`${URL}/api/Profiles/RecoveryProfile?profileId=${profileId}&userId=${userId}`, {
            method: "POST",
            credentials: "include"
        })

        if (response.ok) {
            alert("Восстановление профиля прошло успешно")
            popupRecoveryConfirmYesBtn.classList.remove("loading")
            popupRecoveryConfirm.querySelector(".popup__close").click()
            deletedProfiles = null
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось восстановить профиль. Попробуйте еще раз")          
            } else {
                alert(error)
            }

            popupRecoveryConfirmYesBtn.classList.remove("loading")
        }
    }

    popupRecoveryConfirmNoBtn.addEventListener("click", function() {
        popupRecoveryConfirm.classList.remove("open")
        recoveryBtn.click()
    })

    //получение удаляемых дисциплин
    const getRemovableDisciplines = async (statusDisciplineId, el) => {
        document.querySelector(".disciplines tbody").innerHTML = `
            <tr><td>Идет загрузка удаляемых дисцилин...</td></tr>
        ` 

        let response = await fetch(`${URL}/api/Discipline/GetRemovableDisciplines?userId=${userId}`, {
            credentials: "include"
        })

        if (response.ok) {
            disciplineList = await response.json()
            showRemovableDisciplines(disciplineList)
            showRemovableDisciplinesForPopups(disciplineList)
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                popupRejectMultipleDisciplines.querySelector(".rejectable-disciplines tbody").innerHTML = `
                    <tr><td>Ошибка получения данных</td></tr>
                `
                popupApproveMultipleDisciplines.querySelector(".approvable-disciplines tbody").innerHTML = `
                    <tr><td>Ошибка получения данных</td></tr>
                `
                document.querySelector(".disciplines tbody").innerHTML = `
                    <tr><td>Ошибка получения данных</td></tr>
                `
            } else {
                popupRejectMultipleDisciplines.querySelector(".rejectable-disciplines tbody").innerHTML = `
                    <tr><td>${error}</td></tr>
                `
                popupApproveMultipleDisciplines.querySelector(".approvable-disciplines tbody").innerHTML = `
                    <tr><td>${error}</td></tr>
                `
                document.querySelector(".disciplines tbody").innerHTML = `
                    <tr><td>${error}</td></tr>
                `
            }
        }
    }

    //функция для вывода удаляемых дисциплин
    const showRemovableDisciplines = (disciplineList) => {
              
        let res = ""
        
        for (let discipline of disciplineList) {
            res += `
                <tr>
                    <td>${discipline.profile.year}</td>
                    <td>${discipline.profile.profileName}</td>
                    <td>${discipline.discipline.disciplineName}</td>      
                    <td>${discipline.caseCEdukind.edukind}</td>
                    <td>${discipline.levelEdu.name}</td>
                    <td>
                        <div class="wrapper">
                            <button type="button" class="approve approve-discipline">
                                <span data-disciplineid=${discipline.discipline.id} class="approve__btn btn"></span>
                            </button>
                            <button type="button" class="reject reject-discipline">
                                <span data-disciplineid=${discipline.discipline.id} class="reject__btn btn"></span>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        }

        if (res.length > 0) {
            document.querySelector(".disciplines tbody").innerHTML = res
        } else {
            document.querySelector(".disciplines tbody").innerHTML = ""
        } 

        let approveDeleteDiscipline = document.querySelectorAll(".approve-discipline .btn")
        approveDeleteDiscipline.forEach(approveDisciplineItem => {
            approveDisciplineItem.addEventListener("click", function(e) {
                popupApproveDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupApproveDiscipline.querySelector("#disciplineId").value = e.target.dataset.disciplineid
            })
        })

        let rejectDeleteDiscipline = document.querySelectorAll(".reject-discipline .btn")
        rejectDeleteDiscipline.forEach(rejectDisciplineItem => {
            rejectDisciplineItem.addEventListener("click", function(e) {
                popupRejectDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupRejectDiscipline.querySelector("#disciplineId").value = e.target.dataset.disciplineid
            })
        })
    }

    
    const showRemovableDisciplinesForPopups = (disciplineList) => {
        let res = ""
        for (let discipline of disciplineList) {
            res += `
                <tr data-id="${discipline.discipline.id}">
                    <td>${discipline.profile.year}</td>
                    <td>${discipline.profile.profileName}</td>
                    <td>${discipline.discipline.disciplineName}</td>      
                    <td>${discipline.caseCEdukind.edukind}</td>
                    <td>${discipline.levelEdu.name}</td>
                    <td>
                        <input type="checkbox" name="disciplines">
                    </td>
                </tr>
            `
        }

        if (res.length > 0) {
            popupRejectMultipleDisciplines.querySelector(".rejectable-disciplines tbody").innerHTML = res
            popupApproveMultipleDisciplines.querySelector(".approvable-disciplines tbody").innerHTML = res
        } else {
            popupRejectMultipleDisciplines.querySelector(".rejectable-disciplinees tbody").innerHTML = ""
            popupApproveMultipleDisciplines.querySelector(".approvable-disciplines tbody").innerHTML = ""
        } 
    }

    rejectMultipleDisciplinesBtn.addEventListener("click", function() {
        popupRejectMultipleDisciplines.classList.add("open")
        document.body.classList.add("no-scroll")
    })

    popupRejectMultipleDisciplinesBtn.addEventListener("click", function() {
        let rejectableDisciplineIds = []

        let confirmCancelDelete = confirm("Вы действительно хотите отклонить удаление дисциплин?")
        if (confirmCancelDelete) {
            popupRejectMultipleDisciplines.querySelectorAll("tbody tr").forEach(rejectableDiscipline => {
                let isChecked = rejectableDiscipline.querySelector('input')?.checked
                if (isChecked) {
                    let disciplineId = parseInt(rejectableDiscipline.dataset.id)
                    rejectableDisciplineIds.push(disciplineId)
                }
            })
            
            if (rejectableDisciplineIds.length > 0) {
                cancelManyRequestDeleteDiscipline(rejectableDisciplineIds, userId, popupRejectMultipleDisciplinesBtn)
            } else {
                alert("Выберите хотя бы одну дисциплину для отклонения удаления")
            }
        }
    })

    const cancelManyRequestDeleteDiscipline = async (disciplineIds, userId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/Discipline/CancelManyRequestDeleteDiscipline?userId=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(disciplineIds)
        })

        if (response.ok) {
            alert("Отклонение удаления дисциплин прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableDisciplines()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
        }
    }

    approveMultipleDisciplinesBtn.addEventListener("click", function() {
        popupApproveMultipleDisciplines.classList.add("open")
        document.body.classList.add("no-scroll")
    })

    popupApproveMultipleDisciplinesBtn.addEventListener("click", function() {
        let approvableDisciplineIds = []

        let confirmDelete = confirm("Вы действительно хотите удалить дисциплины?")
        if (confirmDelete) {
            popupApproveMultipleDisciplines.querySelectorAll("tbody tr").forEach(approvableDiscipline => {
                let isChecked = approvableDiscipline.querySelector('input')?.checked
                if (isChecked) {
                    let disciplineId = parseInt(approvableDiscipline.dataset.id)
                    approvableDisciplineIds.push(disciplineId)
                }
            })
            
            if (approvableDisciplineIds.length > 0) {
                deleteManyDisciplines(approvableDisciplineIds, userId, popupApproveMultipleDisciplinesBtn)
            } else {
                alert("Выберите хотя бы одну дисциплину для удаления")
            }
        }
    })

    const deleteManyDisciplines = async (disciplineIds, userId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/Discipline/DeleteManyDisciplines?userId=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(disciplineIds)
        })

        if (response.ok) {
            alert("Удаление дисциплин прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableDisciplines()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
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
                let selectedOption = e.target.closest(".select__option")
                let selectedOptionText = selectedOption.querySelector('.select__option-text').textContent;
                let selectText = selectItem.querySelector('.select__text')
                let selectedElemId = parseInt(selectedOption.dataset.id)

                //если выпадающий список не предусматривает выбор нескольких элементов
                if (!selectItem.hasAttribute("data-multiple")) {
                    //если мы нажали на не выбранный элемент списка
                    if (!selectedOption.classList.contains("selected")) {
                        //помечаем все элементы списка как не выбранные
                        options.querySelectorAll(".select__option").forEach(optionItem => {
                            optionItem.classList.remove("selected")
                        })

                        

                        //помечаем выбранный нами элемент как выбранный
                        selectedOption.classList.add("selected")
                        selectText.textContent = selectedOptionText;
                        selectText.dataset.id = selectedElemId
                    } else { //если же мы выбрали уже выбранный элемент списка, 
                        selectedOption.classList.remove("selected")
                        selectText.textContent = selectText.dataset.placeholder
                        selectText.removeAttribute("data-id")
                    }
                } else { //если в выпадающем списке можно выбрать несколько элементов  
                    //если мы нажимаем на не выбранный элемент
                    if (!selectedOption.classList.contains("selected")) {
                        //помечаем его как выбранный элемент
                        selectedOption.classList.add("selected")

                        //если мы выбрали второй или более элемент списка
                        if (selectText.textContent != selectText.dataset.placeholder) {
                            selectText.textContent += `, ${selectedOptionText}`;
                            selectText.dataset.id += `, ${selectedElemId}`
                        } else { // если впервые выбрали элемент списка
                            selectText.textContent = selectedOptionText;
                            selectText.dataset.id = selectedElemId
                        }
                    } else { //логика удаления элемента из списка

                        selectedOption.classList.remove("selected")

                        //создаем массив айди выбранных элементов списка, а также массив их названия
                        let arrayId = [...selectText.dataset.id.split(", ")]
                        let listElem = selectText.textContent.split(", ")

                        //если было выбрано больше одного элемента списка
                        if (arrayId.length > 1) {

                            //создаем строку названий элементов, не включая в него выбранный нами элемент
                            selectText.textContent = listElem.filter(el => el != selectedOptionText).join(", ")

                            //создаем строку айди элементов, не включая в него выбранный нами элемент
                            selectText.dataset.id = arrayId.filter(id => parseInt(id) != selectedElemId).join(", ")
                        } else {// если бьл выбран только один элемент, то просто ставим значение списка по умолчанию и удаляем id
                            selectText.textContent = selectText.dataset.placeholder
                            selectText.removeAttribute("data-id")
                        }
                    }
                }
                
                selectItem.classList.remove('active');
            }
        })
                    
    })

    //нажатие на кнопку да при подтверждении удаления дисциплины
    popupApproveDisciplineYesBtn.addEventListener("click", function(e) {
        let disciplineId = popupApproveDiscipline.querySelector("#disciplineId").value
        deleteDiscipline(disciplineId, e.target)
    })

    //нажатие на кнопку нет при подтверждении удаления дисциплины
    popupApproveDisciplineNoBtn.addEventListener("click", function(e) {
        popupApproveDiscipline.querySelector(".popup__close").click()
    })

    //удаление дисциплины
    const deleteDiscipline = async (disciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/Discipline/DeleteDiscipline?disciplineId=${disciplineId}&userId=${userId}`, {
            method: "POST",
            credentials: "include"
        })

        if (response.ok) {
            alert("Удаление дисциплины прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableDisciplines()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить дисциплину. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //нажатие на кнопку да при подтверждении удаления статуса дисциплины
    popupApproveStatusDisciplineYesBtn.addEventListener("click", function(e) {
        let statusDisciplineId = popupApproveStatusDiscipline.querySelector("#statusDisciplineId").value
        deleteStatusDiscipline(statusDisciplineId, e.target)
    })

    //нажатие на кнопку нет при подтверждении удаления статуса дисциплины
    popupApproveStatusDisciplineNoBtn.addEventListener("click", function(e) {
        popupApproveStatusDiscipline.querySelector(".popup__close").click()
    })

    //удаление статуса дисциплины
    const deleteStatusDiscipline = async (statusDisciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/StatusDiscipline/DeleteStatusDiscipline?statusDisciplineId=${statusDisciplineId}`, {
            method: "POST",
            credentials: "include"
        })

        if (response.ok) {
            alert("Удаление статуса дисциплины прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableStatusDisciplines()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось удалить статус дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //нажатие на кнопку да при отклонении удаления дисциплины
    popupRejectDisciplineYesBtn.addEventListener("click", function(e) {
        let disciplineId = parseInt(popupRejectDiscipline.querySelector("#disciplineId").value)
        let rejectedDiscipline = disciplineList[disciplineList.map(e => e.discipline.id).indexOf(disciplineId)]
        rejectedDiscipline.discipline.isDeletionRequest = false
        rejectedDiscipline.discipline.lastChangeAuthorId = userId
        sendRejectDeleteDiscipline(rejectedDiscipline.discipline, e.target)
    })

    //нажатие на кнопку нет при отклонении удаления дисциплины
    popupRejectDisciplineNoBtn.addEventListener("click", function(e) {
        popupRejectDiscipline.querySelector(".popup__close").click()
    })

    //отклонение удаления дисциплины
    const sendRejectDeleteDiscipline = async (rejectedDiscipline, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/Discipline/EditDiscipline`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(rejectedDiscipline)
        })

        if (response.ok) {
            alert("Отклонение удаления дисциплины прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableDisciplines()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось отклонить удаление дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //нажатие на кнопку да при отклонении удаления статуса дисциплины
    popupRejectStatusDisciplineYesBtn.addEventListener("click", function(e) {
        let statusDisciplineId = parseInt(popupRejectStatusDiscipline.querySelector("#statusDisciplineId").value)
        let rejectedStatusDiscipline = statusDisciplineList[statusDisciplineList.map(e => e.id).indexOf(statusDisciplineId)]
        rejectedStatusDiscipline.isDeletionRequest = false
        sendRejectDeleteStatusDiscipline(rejectedStatusDiscipline, e.target)
    })

    //нажатие на кнопку нет при отклонении удаления статуса дисциплины
    popupRejectStatusDisciplineNoBtn.addEventListener("click", function(e) {
        popupRejectStatusDiscipline.querySelector(".popup__close").click()
    })

    //отклонение удаления статуса дисциплины
    const sendRejectDeleteStatusDiscipline = async (rejectedStatusDiscipline, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/api/StatusDiscipline/UpdateStatusDiscipline`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(rejectedStatusDiscipline)
        })

        if (response.ok) {
            alert("Отклонение удаления статуса дисциплины прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRemovableStatusDiscipline()
        } else {
            let error = await response.text()
            if (error.startsWith("{")) {
                alert("Не удалось отклонить удаление статуса дисциплины. Попробуйте еще раз")
            } else {
                alert(error)
            }

            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //функционал табов (вкладок)
    let tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            for (let sibling of e.target.parentNode.children) {
                sibling.classList.remove('tab--active');
            }
            for (let sibling of e.target.closest('.tabs-wrapper').parentNode.children) {
                if (sibling.classList.contains('tabs-container')) {
                    sibling.querySelectorAll('.tabs-content').forEach(content => {
                        content.classList.remove('tabs-content--active');
                    });
                }
            }
            e.target.classList.add('tab--active');
            document.querySelector(e.target.getAttribute('href')).classList.add('tabs-content--active');
        });
    });

    //функция, которая создает ссылку на панель администратора если пользователем является админ
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
    const hasUserAccessToRole = () => userRole == "umu"

    if (isAuthorize()) {
        userId = localStorage.getItem("userId")
        userRole = localStorage.getItem("userRole")

        let hasAccess = hasUserAccessToRole()
        if (hasAccess) {
            userName = localStorage.getItem("userName")

            setUserName(userName)
            getRemovableDisciplines()
        } else { //если пользователь не имеет доступа к данной странице, то он перемещается на страницу, соответствующая его роли        
            let redirectPage = userRole !== "null" ? userRole : "metodist"
            window.location.assign(`${URL}/sved/${redirectPage}/`)
        }
    } else {
        window.location.assign(`${URL}/sved/login.html`)
    }
})