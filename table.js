document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let loginBtn = document.querySelector(".header .action__btn")
    let popupDisciplines = document.querySelector("#popup-disciplines")
    let closeModalBtns = document.querySelectorAll(".popup__close")
    let profiles

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
                        let popupLabelSelectText = popupLabelSelect.querySelector(".select__text")
                        popupLabelSelect.classList.remove("invalid")
                        popupLabelSelectText.removeAttribute("data-id")
                        popupLabelSelectText.textContent = popupLabelSelectText.dataset.placeholder

                        let popupLabelSelectedEl = popupLabelSelect.querySelector(".select__option.selected")
                        if (popupLabelSelectedEl) {
                            popupLabelSelectedEl.classList.remove("selected")
                        }
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

    const getProfiles = async () => {
        let response = await fetch(`${URL}/Profiles/GetData`, {
            credentials: "include"
        })

        if (response.ok) {
            profiles = await response.json()
            showProfiles(profiles)
        } 
    }

    const showProfiles = (profiles) => {
        let res = ""
        for (let el of profiles) {
            res += `
                <tr data-profileid=${el.profile.id} itemprop="eduAccred">
                    <td>
                        <span>${el.profile.year}</span>
                    </td>
                    <td itemprop="eduCode">
                        <span>${el.caseSDepartment.code}</span>
                    </td>
                    <td itemprop="eduName">
                        <span>${el.caseSDepartment.deptName}</span>
                    </td>
                    <td itemprop="eduProf">
                        <span>${el.profile.profileName}</span>
                    </td>    
                    <td itemprop="eduLevel">
                        <span>${el.profile.levelEdu.name}</span>
                    </td>   
                    <td itemprop="eduForm">
                        <span>${el.caseCEdukind.edukind}</span>
                    </td>  
                    <td itemprop="learningTerm">
                        <span>${el.profile.termEdu.includes("год") ? el.profile.termEdu : el.profile.termEdu + " года"}</span>
                    </td>    
                    <td itemprop="dateEnd">
                        <span>${el.profile.validityPeriodOfStateAccreditasion}</span>
                    </td>  
                    <td itemprop="language">
                        <span>${el.profile.educationLanguage}</span>
                    </td>  
                    <td itemprop="eduPred">
                        <button class="show-disciplines btn">Показать</button>
                    </td>    
                ` 

            let fileModelsRpp = el.disciplines // рабочие программы практик
            if (fileModelsRpp.size != 0) {
                let rpp = `<td itemprop="eduPrac">`
                for (let fileModel of fileModelsRpp) {
                    rpp += `
                        <div class="item-file">
                            <a href="/Users/User/source/repos/EorDSU/SvedenOop/Files/${discipline.fileRPD.name}">${fileModel.disciplineName}</a>
                        </div>
                    `
                }               
                res += rpp
            }

            res += `
                <td itemprop="eduEl">
                ${
                    el.profile.linkToDistanceEducation != "" 
                    ? `<a href=${el.profile.linkToDistanceEducation}>Дистанционное обучение</a>`
                    : "<span>не используется</span>"
                }
            </td>
            </tr>
            `
        }
        document.querySelector("tbody").innerHTML = res

        let showDisciplinesBtns = document.querySelectorAll(".show-disciplines")
        showDisciplinesBtns.forEach(btnItem => {
            btnItem.addEventListener("click", function(e) {
                let profileId = parseInt(e.target.closest("tr").dataset.profileid)
                
                let profileDisciplines = profiles[profiles.map(e => e.profile.id).indexOf(profileId)].profile.disciplines

                let res = ""
                for (let discipline of profileDisciplines) {
                    res += `
                        <li class="popup__item">
                            ${
                                discipline.fileRPD != null 
                                ? `<a href="${discipline.fileRPD.name}">${discipline.disciplineName}</a>`
                                : discipline.disciplineName
                            }
                        </li>
                    `
                }

                popupDisciplines.querySelector(".popup__list").innerHTML = res

                popupDisciplines.classList.add("open")
                document.body.classList.add("no-scroll")
            })
        })
    }

    //кнопка для входа на страницу авторизации
    loginBtn.addEventListener("click", function() {
        window.location.assign("/login.html")
    })

    getProfiles()
})