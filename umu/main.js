document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let disciplineList
    let statusDisciplineList
    let closeModalBtns = document.querySelectorAll(".popup__close")
    let popupApproveDiscipline = document.querySelector("#popup-approveDiscipline")
    let popupApproveDisciplineYesBtn = document.querySelector("#popup-approveDiscipline .confirm-button--yes")
    let popupApproveDisciplineNoBtn = document.querySelector("#popup-approveDiscipline .confirm-button--no")

    let popupRejectDiscipline = document.querySelector("#popup-rejectDiscipline")
    let popupRejectDisciplineYesBtn = document.querySelector("#popup-rejectDiscipline .confirm-button--yes")
    let popupRejectDisciplineNoBtn = document.querySelector("#popup-rejectDiscipline .confirm-button--no")

    let popupApproveStatusDiscipline = document.querySelector("#popup-approveStatusDiscipline")
    let popupApproveStatusDisciplineYesBtn = document.querySelector("#popup-approveStatusDiscipline .confirm-button--yes")
    let popupApproveStatusDisciplineNoBtn = document.querySelector("#popup-approveStatusDiscipline .confirm-button--no")

    let popupRejectStatusDiscipline = document.querySelector("#popup-rejectStatusDiscipline")
    let popupRejectStatusDisciplineYesBtn = document.querySelector("#popup-rejectStatusDiscipline .confirm-button--yes")
    let popupRejectStatusDisciplineNoBtn = document.querySelector("#popup-rejectStatusDiscipline .confirm-button--no")

    let logoutBtn = document.querySelector(".header .action__btn")
    let userId
    let userRole

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

    const getRemovableDisciplines = async (statusDisciplineId, el) => {
        let response = await fetch(`${URL}/Discipline/GetRemovableDisciplines?userId=${userId}`, {
            credentials: "include"
        })

        if (response.ok) {
            disciplineList = await response.json()
            showRemovableDisciplines(disciplineList)
        }
    }

    const showRemovableDisciplines = (disciplineList) => {
        let res = ""
        
        for (let discipline of disciplineList) {
            res += `
                <tr>
                    <td>Удаление дисциплины</td>
                    <td>${discipline.disciplineName}</td>
                    <td>
                        <div class="wrapper">
                            <button type="button" class="approve approve-discipline">
                                <span data-disciplineid=${discipline.id} class="approve__btn btn"></span>
                            </button>
                            <button type="button" class="reject reject-discipline">
                                <span data-disciplineid=${discipline.id} class="reject__btn btn"></span>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        }

        document.querySelector(".disciplines tbody").innerHTML = res

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

    const getRemovableStatusDisciplines = async () => {
        let response = await fetch(`${URL}/StatusDiscipline/GetRemovableStatusDiscipline`, {
            credentials: "include"
        })

        if (response.ok) {
            statusDisciplineList = await response.json()
            console.log(statusDisciplineList)
            showRemovableStatusDisciplines(statusDisciplineList)
        }
    }

    const showRemovableStatusDisciplines = (statusDisciplineList) => {
        let res = ""
        
        for (let statusDiscipline of statusDisciplineList) {
            res += `
                <tr>
                    <td>Удаление статуса дисциплины</td>
                    <td>${statusDiscipline.name}</td>
                    <td>
                        <div class="wrapper">
                            <button type="button" class="approve approve-status">
                                <span data-statusDisciplineId=${statusDiscipline.id} class="approve__btn btn"></span>
                            </button>
                            <button type="button" class="reject reject-status">
                                <span data-statusDisciplineId=${statusDiscipline.id} class="reject__btn btn"></span>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        }

        document.querySelector(".status-disciplines tbody").innerHTML = res

        let approveDeleteStatusDiscipline = document.querySelectorAll(".approve-status .btn")
        approveDeleteStatusDiscipline.forEach(approveStatusDisciplineItem => {
            approveStatusDisciplineItem.addEventListener("click", function(e) {
                popupApproveStatusDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupApproveStatusDiscipline.querySelector("#statusDisciplineId").value = e.target.dataset.statusdisciplineid
            })
        })

        let rejectDeleteStatusDiscipline = document.querySelectorAll(".reject-status .btn")
        rejectDeleteStatusDiscipline.forEach(rejectStatusDisciplineItem => {
            rejectStatusDisciplineItem.addEventListener("click", function(e) {
                popupRejectStatusDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupRejectStatusDiscipline.querySelector("#statusDisciplineId").value = e.target.dataset.statusdisciplineid
            })
        })
    }

    // //кнопка удаления статуса дисциплины
    // deleteStatusBtn.addEventListener("click", function() {
    //     let selectedStatusDiscipline = document.querySelector("[data-selectfield=statusDiscipline] .select__text")

    //     if (selectedStatusDiscipline.textContent == "Выберите статус дисциплины") {
    //         selectedStatusDiscipline.closest(".select").classList.add("invalid")
    //     } else {
    //         selectedStatusDiscipline.closest(".select").classList.remove("invalid")
    //         popupDeleteStatus.classList.add("open")
    //         document.body.classList.add("no-scroll")

    //         let statusDisciplineId = selectedStatusDiscipline.dataset.id
    //         popupDeleteStatus.querySelector("#statusDisciplineId").value = statusDisciplineId
    //     }
    // })


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

    popupApproveDisciplineYesBtn.addEventListener("click", function(e) {
        let disciplineId = popupApproveDiscipline.querySelector("#disciplineId").value
        deleteDiscipline(disciplineId, e.target)
    })

    popupApproveDisciplineNoBtn.addEventListener("click", function(e) {
        popupApproveDiscipline.querySelector(".popup__close").click()
    })

    const deleteDiscipline = async (disciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/Discipline/DeleteDiscipline?disciplineId=${disciplineId}`, {
            method: "DELETE",
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

    popupApproveStatusDisciplineYesBtn.addEventListener("click", function(e) {
        let statusDisciplineId = popupApproveStatusDiscipline.querySelector("#statusDisciplineId").value
        deleteStatusDiscipline(statusDisciplineId, e.target)
    })

    popupApproveStatusDisciplineNoBtn.addEventListener("click", function(e) {
        popupApproveStatusDiscipline.querySelector(".popup__close").click()
    })

    const deleteStatusDiscipline = async (statusDisciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/StatusDiscipline/DeleteStatusDiscipline?statusDisciplineId=${statusDisciplineId}`, {
            method: "DELETE",
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

    popupRejectDisciplineYesBtn.addEventListener("click", function(e) {
        let disciplineId = parseInt(popupRejectDiscipline.querySelector("#disciplineId").value)
        let rejectedDiscipline = disciplineList[disciplineList.map(e => e.id).indexOf(disciplineId)]
        console.log(disciplineId)
        console.log(rejectedDiscipline)
        rejectedDiscipline.isDeletionRequest = false
        sendRejectDeleteDiscipline(rejectedDiscipline, e.target)
    })

    const sendRejectDeleteDiscipline = async (rejectedDiscipline, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/Discipline/EditDiscipline`, {
            method: "PUT",
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

    popupRejectStatusDisciplineYesBtn.addEventListener("click", function(e) {
        let statusDisciplineId = parseInt(popupRejectStatusDiscipline.querySelector("#statusDisciplineId").value)
        let rejectedStatusDiscipline = statusDisciplineList[statusDisciplineList.map(e => e.id).indexOf(statusDisciplineId)]
        rejectedStatusDiscipline.isDeletionRequest = false
        sendRejectDeleteStatusDiscipline(rejectedStatusDiscipline, e.target)
    })

    const sendRejectDeleteStatusDiscipline = async (rejectedStatusDiscipline, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`${URL}/StatusDiscipline/UpdateStatusDiscipline`, {
            method: "PUT",
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

    const hasUserAccessToRole = () => userRole == "UMU"

    if (isAuthorize()) {
        userId = localStorage.getItem("userId")
        userRole = localStorage.getItem("userRole")

        let hasAccess = hasUserAccessToRole()
        if (hasAccess) {
            userName = localStorage.getItem("userName")

            setUserName(userName)
            getRemovableDisciplines()
            getRemovableStatusDisciplines()
        } else {        
            let redirectPage = userRole !== "null" ? userRole : "metodist"
            window.location.assign(`/${redirectPage}/`)
        }
    } else {
        window.location.assign("/login.html")
    }
})