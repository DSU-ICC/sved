document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path

    //const URL = "https://oop.icc.dgu.ru"
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

    const getProfiles = async () => {
        document.querySelector("tbody").innerHTML = `
            <tr><td>Идет загрузка профилей...</td></tr>
        `

        let response = await fetch(`/api/Profiles/GetDataOpop2`, {
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
            if (el.CaseSDepartment != null) {
                res += `
                <tr data-profileid=${el.Profile.Id} itemprop="eduAccred">
                    <td>
                        <span>${el.Profile.Year}</span>
                    </td>
                    <td itemprop="eduCode">
                        <span>${el.CaseSDepartment.Code}</span>
                    </td>
                    <td itemprop="eduName">
                        <span>${el.CaseSDepartment.DeptName}</span>
                    </td>
                    <td itemprop="eduProf">
                        <span>${el.Profile.ProfileName}</span>
                    </td>    
                    <td itemprop="eduLevel">
                        <span>${el.Profile.LevelEdu.Name}</span>
                    </td>   
                    <td itemprop="eduForm">
                        <span>${el.CaseCEdukind.Edukind}</span>
                    </td>  
                    <td itemprop="learningTerm">
                        <span>${el.Profile.TermEdu}</span>
                    </td>    
                    <td itemprop="dateEnd">
                        <span>${el.Profile.ValidityPeriodOfStateAccreditasion}</span>
                    </td>  
                    <td itemprop="language">
                        <span>${el.Profile.EducationLanguage}</span>
                    </td>     
                ` 

                if (el.Profile.Disciplines.length > 0) {
                    res += `
                        <td itemprop="eduPred">
                            <button class="show-disciplines btn">Показать</button>
                        </td> 
                    `
                } else {
                    res += `
                        <td itemprop="eduPred"></td> 
                    `
                }

                let fileModelsRpp = el.Disciplines // рабочие программы практик
                if (fileModelsRpp.length != 0) {
                    let rpp = `<td itemprop="eduPrac">`
                    for (let fileRPP of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                            ${
                                fileRPP.FileRPD != null
                                ? `
                                    <div class="item-file__inner">
                                        <span class="key-icon"></span>
                                        <div class="document-key">
                                            <p class="document-key__text">Документ подписан</p>
                                            <p class="document-key__text">Простая электронная подпись</p>
                                            <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                            <p class="document-key__text">Ректор</p>
                                            <p class="document-key__text">Ключ (SHA-256):</p>
                                            <p class="document-key__text">${fileRPP.FileRPD.CodeECP}</p>
                                        </div>
                                        <a href="/sved/Files/${fileRPP.FileRPD.Name}">${fileRPP.DisciplineName}</a>
                                    </div>
                                    
                                `
                                : `
                                    <span>${fileRPP.DisciplineName}</span>
                                `
                            }
                                
                            </div>
                        `
                    }               
                    res += rpp
                } else {
                    res += '<td itemprop="eduPrac"></td>'
                }

                res += `
                    <td itemprop="eduEl">
                    ${
                        el.Profile.LinkToDistanceEducation != "" 
                        ? `<a href=${el.Profile.LinkToDistanceEducation}>Дистанционное обучение</a>`
                        : "<span>не используется</span>"
                    }
                </td>
                </tr>
                `
            }
        }
        if (res.length > 0) {
            document.querySelector("tbody").innerHTML = res
        } else {
            document.querySelector("tbody").innerHTML = ""
        } 

        let showDisciplinesBtns = document.querySelectorAll(".show-disciplines")
        showDisciplinesBtns.forEach(btnItem => {
            btnItem.addEventListener("click", function(e) {
                let profileId = parseInt(e.target.closest("tr").dataset.profileid)
                let profileDisciplines = profiles[profiles.map(e => e.Profile.Id).indexOf(profileId)].Profile.Disciplines
                let res = ""
                for (let discipline of profileDisciplines) {
                    res += `
                        <li class="popup__item">
                            ${
                                discipline.FileRPD != null 
                                ? `<a href="${discipline.FileRPD.name}">${discipline.DisciplineName}</a>`
                                : discipline.DisciplineName
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
        window.location.assign("https://oop.icc.dgu.ru/sved/login.html")
    })

    getProfiles()
})