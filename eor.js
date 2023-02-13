document.addEventListener("DOMContentLoaded", () => {
    let uploadFileRpdBtns = document.querySelectorAll(".file-upload input[type=file]")
    let popupEditFileRpd = document.querySelector("#popup-editFileRpd")
    let profileId = window.location.href.split("=")[1]


    const showDisciplinesByProfile = async (profileId) => {
        let response = await fetch(`https://localhost:44370/Discipline/GetDisciplineByProfileId?profileId=${profileId}`)

        if (response.ok) {
            let disciplinesList = await response.json()
            let statusList = new Set(disciplinesList.map(e => e.statusDiscipline.name))
            let res = ""
            for (let statusItem of statusList) {
                res += `
                    <tr>
                        <td colspan="3">${statusItem}</td>
                    </tr>
                `
                for (let discipline of disciplinesList) {
                    if (discipline.statusDiscipline.name == statusItem) {
                        res += `
                        <tr>
                            <td>${discipline.code}</td>
                        `

                        if (discipline.fileRPD != null) {
                            res += `<td><a href="${discipline.fileRPD.name}">${discipline.disciplineName}</a></td>`
                        } else {
                            res += `<td><span>${discipline.disciplineName}</span></td>`
                        }

                        res += `
                            <td>
                                <button type="button" class="edit edit-item">
                                    <span data-disciplineid="${discipline.id}"  class="edit__btn btn"></span>
                                </button>
                                <button class="file-upload file-upload__item">
                                    <span data-disciplineid="${discipline.id}" class="file-upload__btn btn"></span>
                                    <input type="file">
                                </button>
                            </td>
                            </tr>
                        `
                    }
                }
            }

            document.querySelector("tbody").innerHTML = res
        }
    }

    const fillDataForEditFile = (el) => {
        popupEditFileRpd.classList.add("open")
        document.body.classList.add("no-scroll")

        let disciplineId = parseInt(el.dataset.disciplineid)

        popupEditFileRpd.querySelector("#disciplineId").value = disciplineId

        let outputFileName = el.closest("tr").children[1].textContent
        popupEditFile.querySelector(".popup-form__input").value = outputFileName
    }

    uploadFileRpdBtns.forEach(uploadBtn => {
        uploadBtn.addEventListener("change", function(e) {
            let btnUpload = e.target.previousElementSibling

            let formData = new FormData()
            formData.append("disciplineId", btnUpload.dataset.disciplineid)
            formData.append("uploadedFile", uploadBtn.files[0])

            uploadFileRpd(formData, btnUpload)


        })
    })

    const uploadFileRpd = async (formData, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`https://localhost:44370/FileRPD/CreateRPD?disciplineId=${formData.get("disciplineId")}`, {
            method: "POST",
            body: formData
        })

        if (response.ok) {
            alert("РПД успешно загружен")
            el.classList.remove("loading")
            el.disabled = false
        } else {
            alert("Не удалось загрузить РПД. Попробуйте еще раз")
            el.classList.remove("loading")
            el.disabled = false
        }
    }
    
    const editFileRpd = async (formData, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`https://localhost:44370/FileRPD/EditRPD?disciplineId=${formData.get("disciplineId")}`, {
            method: "PUT",
            body: formData
        })

        if (response.ok) {
            alert("РПД успешно изменен")
            el.classList.remove("loading")
            el.disabled = false
        } else {
            alert("Не удалось изменить РПД. Попробуйте еще раз")
            el.classList.remove("loading")
            el.disabled = false
        }
    }

    const deleteFileRpd = async (fileRPDId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`https://localhost:44370/FileRPD/DeleteRPD?fileRPDId=${fileRPDId}`, {
            method: "DELETE"
        })

        if (response.ok) {
            alert("РПД успешно удален")
            el.classList.remove("loading")
            el.disabled = false
        } else {
            alert("Не удалось удалить РПД. Попробуйте еще раз")
            el.classList.remove("loading")
            el.disabled = false
        }
    }


    const createStatusDiscipline = async (statusDiscipline) => {
        let response = await fetch("https://localhost:44370/StatusDiscipline/CreateStatusDiscipline", {
            method: "POST",
            body: JSON.stringify(statusDiscipline)
        })

        if (response.ok) {
            alert("Статус дисциплины успешно создан")
        } else {
            alert("Не удалось создать статус дисциплины. Попробуйте еще раз")
        }
    }

    const editStatusDiscipline = async (statusDiscipline) => {
        let response = await fetch("https://localhost:44370/StatusDiscipline/EditStatusDiscipline", {
            method: "PUT",
            body: JSON.stringify(statusDiscipline)
        })

        if (response.ok) {
            alert("Статус дисциплины успешно изменен")
        } else {
            alert("Не удалось изменить статус дисциплины. Попробуйте еще раз")
        }
    }

    const deleteStatusDiscipline = async (statusDisciplineId) => {
        let response = await fetch(`https://localhost:44370/StatusDiscipline/DeleteStatusDiscipline?statusDisciplineId=${statusDisciplineId}`, {
            method: "DELETE"
        })

        if (response.ok) {
            alert("Статус дисциплины успешно удален")
        } else {
            alert("Не удалось удалить статус дисциплины. Попробуйте еще раз")
        }
    }


    const deleteDiscipline = async (disciplineId, el) => {
        el.classList.add("loading")
        el.disabled = true

        let response = await fetch(`https://localhost:44370/Discipline/DeleteDiscipline?disciplineId=${disciplineId}`, {
            method: "DELETE"
        })

        if (response.ok) {
            alert("Дисциплина успешно удалена")
            el.classList.remove("loading")
            el.disabled = false
        } else {
            alert("Не удалось удалить дисциплину. Попробуйте еще раз")
            el.classList.remove("loading")
            el.disabled = false
        }
    }

    //showDisciplinesByProfile(profileId)
})