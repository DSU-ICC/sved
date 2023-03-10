document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let disciplineList
    let statusDisciplineList

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

    const getRemovableForDiscipline = async (statusDisciplineId, el) => {
        let response = await fetch(`${URL}/Discipline/GetRemovableDiscipline`, {
            credentials: "include"
        })

        if (response.ok) {
            showRemovableDisciplines(disciplineList)
        }
    }

    const showRemovableDisciplines = (disciplineList) => {
        let res = ""
        
        for (let discipline of disciplineList) {
            res += `
                <tr>
                    <td>Удаление дисциплины</td>
                    <td>Педагогика высшей школы</td>
                    <td>
                        <div class="wrapper">
                            <button type="button" class="approve approve-discipline">
                                <span data-disciplineid=${discipline.id} class="approve__btn btn"></span>
                            </button>
                            <button type="button" class="reject reject-discipline">
                                <span class="reject__btn btn"></span>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        }

        document.querySelector("tbody").innerHTML = res

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

    const getRemovableStatusDiscipline = async () => {
        let response = await fetch(`${URL}/StatusDiscipline/GetRemovableStatusDiscipline`, {
            credentials: "include"
        })

        if (response.ok) {
            statusDisciplineList = await response.json()

            showRemovableStatusDisciplines(statusDisciplineList)
        }
    }

    const showRemovableStatusDisciplines = (statusDisciplineList) => {
        let res = ""
        
        for (let statusDiscipline of statusDisciplineList) {
            res += `
                <tr>
                    <td>Удаление статуса дисциплины</td>
                    <td>Педагогика высшей школы</td>
                    <td>
                        <div class="wrapper">
                            <button type="button" class="approve approve-status">
                                <span data-statusDisciplineId=${statusDiscipline.id} class="approve__btn btn"></span>
                            </button>
                            <button type="button" class="reject reject-status">
                                <span class="reject__btn btn"></span>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        }

        document.querySelector("tbody").innerHTML = res

        let approveDeleteStatusDiscipline = document.querySelectorAll(".approve-status .btn")
        approveDeleteStatusDiscipline.forEach(approveStatusDisciplineItem => {
            approveStatusDisciplineItem.addEventListener("click", function(e) {
                popupApproveStatusDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupApproveStatusDiscipline.querySelector("#statusDisciplineId").value = e.target.dataset.statusdisciplineid
            })
        })

        let rejectDeleteStatusDiscipline = document.querySelectorAll(".reject-discipline .btn")
        rejectDeleteStatusDiscipline.forEach(rejectStatusDisciplineItem => {
            rejectsStatusDisciplineItem.addEventListener("click", function(e) {
                popupRejectStatusDiscipline.classList.add("open")
                document.body.classList.add("no-scroll")

                popupRejectStatusDiscipline.querySelector("#statusDisciplineId").value = e.target.dataset.statusdisciplineid
            })
        })
    }

    //кнопка удаления статуса дисциплины
    deleteStatusBtn.addEventListener("click", function() {
        let selectedStatusDiscipline = document.querySelector("[data-selectfield=statusDiscipline] .select__text")

        if (selectedStatusDiscipline.textContent == "Выберите статус дисциплины") {
            selectedStatusDiscipline.closest(".select").classList.add("invalid")
        } else {
            selectedStatusDiscipline.closest(".select").classList.remove("invalid")
            popupDeleteStatus.classList.add("open")
            document.body.classList.add("no-scroll")

            let statusDisciplineId = selectedStatusDiscipline.dataset.id
            popupDeleteStatus.querySelector("#statusDisciplineId").value = statusDisciplineId
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
            getRequestsForDiscipline()
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
            getRequestsForDiscipline()
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
            alert("Отклонение удаления статуса дисциплины прошло успешно")
            el.classList.remove("loading")
            el.disabled = false
            el.closest(".popup__content").querySelector(".popup__close").click()
            getRequestsForDiscipline()
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
})