document.addEventListener("DOMContentLoaded", () => {
    //const URL = "https://localhost:44370"
    const URL = "https://oop.dgu.ru"

    const yearInput = document.querySelector(".report-form__input")
    yearInput.value = new Date().getFullYear()

    const reportBtn = document.querySelector(".report-form__btn")
    const reportResult = document.querySelector(".report__result")

    let logoutBtn = document.querySelector(".header .action__btn")

    let choiceOptions = {
        noResultsText: "Результат не найден",
        itemSelectText: "",
        loadingText: "Загрузка данных...",
        noChoicesText: "Элементы списка отсутствуют",
        removeItemButton: true,
        position: "bottom",
        searchResultLimit: 9999,
    }

    let facultySelect = document.querySelector("#faculty")
    let facultyChoice = new Choices(facultySelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите название направления/специальности"
    });

    let levelEduSelect = document.querySelector("#levelEdu")
    let levelEduChoice = new Choices(levelEduSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите уровень образования"
    })

    let deptSelect = document.querySelector("#dept")
    let deptChoice = new Choices(deptSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите название направления/специальности",
        callbackOnCreateTemplates: function (template) {
            return {
                item: ({ classNames }, data) => {
                    return template(`
                      <div class="${classNames.item} ${
                      data.highlighted
                        ? classNames.highlightedState
                        : classNames.itemSelectable
                    } ${
                      data.placeholder ? classNames.placeholder : ''
                    }" data-item data-id="${data.id}" data-value="${data.value}" title="${data.customProperties}" ${
                      data.active ? 'aria-selected="true"' : ''
                    } ${data.disabled ? 'aria-disabled="true"' : ''}>
                        ${data.label}
                        <button type="button" class="choices__button" aria-label="Remove item: '${data.value}'" data-button="">Remove item</button>
                      </div>
                    `);
                },
                choice: ({ classNames }, data) => {
                    return template(`
                  <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable
                        }" data-select-text="${this.config.itemSelectText}" data-choice ${data.disabled
                            ? 'data-choice-disabled aria-disabled="true"'
                            : 'data-choice-selectable'
                        } data-id="${data.id}" title="${data.customProperties}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'
                        } data-deletable>
                    ${data.label}              
                  </div>
                `);
                },
            };
        }
    });

    let profileSelect = document.querySelector("#profile")
    let profileChoice = new Choices(profileSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите образовательную программу",
        callbackOnCreateTemplates: function (template) {
            return {
                item: ({ classNames }, data) => {
                    return template(`
                      <div class="${classNames.item} ${
                      data.highlighted
                        ? classNames.highlightedState
                        : classNames.itemSelectable
                    } ${
                      data.placeholder ? classNames.placeholder : ''
                    }" data-item data-id="${data.id}" data-value="${data.value}" title="${data.customProperties.deptInfo}" ${
                      data.active ? 'aria-selected="true"' : ''
                    } ${data.disabled ? 'aria-disabled="true"' : ''}>
                        ${data.label}
                        <button type="button" class="choices__button" aria-label="Remove item: '${data.value}'" data-button="">Remove item</button>
                      </div>
                    `);
                },
                choice: ({ classNames }, data) => {
                    return template(`
                  <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable
                        }" data-select-text="${this.config.itemSelectText}" data-choice ${data.disabled
                            ? 'data-choice-disabled aria-disabled="true"'
                            : 'data-choice-selectable'
                        } data-id="${data.id}" title="${data.customProperties.deptInfo}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'
                        } data-deletable>
                    ${data.label}              
                  </div>
                `);
                },
            };
        }
    })

    let eduFormSelect = document.querySelector("#eduForm")
    let eduFormChoice = new Choices(eduFormSelect, {
        ...choiceOptions,
        searchPlaceholderValue: "Введите форму обучения"
    })

    //получить уровни обучения
    const getLevelEdues = async () => {
        let response = await fetch(`${URL}/api/LevelEdu/GetLevelEdu`, {
            credentials: "include"
        })

        if (response.ok) {
            let levelEdues = await response.json()

            let levelEduChoices = []
            for (let el of levelEdues) {
                levelEduChoices.push({
                    value: el.id,
                    label: el.name,
                    selected: false,
                    disabled: false
                });
            }
            levelEduChoice.setChoices(levelEduChoices, "value", "label", true);
        }
    }

    //получить факультеты
    // const getFaculties = async () => {
    //     let response = await fetch(`${URL}/api/DekanatData/GetFaculties`, {
    //         credentials: "include"
    //     })

    //     if (response.ok) {
    //         let facultiesData = await response.json()

    //         let facultyChoices = []
    //         for (let el of facultiesData) {
    //             facultyChoices.push({
    //                 value: el.facId,
    //                 label: el.facName,
    //                 selected: false,
    //                 disabled: false
    //             });
    //         }
    //         facultyChoice.setChoices(facultyChoices, "value", "label", true);
    //     }
    // }

    //получить формы обучения
    const getEduForms = async () => {
        let response = await fetch(`${URL}/api/DekanatData/GetCaseSEdukinds`, {
            credentials: "include"
        })

        if (response.ok) {
            let eduFormsData = await response.json()

            const eduFormChoices = []
            for (let el of eduFormsData) {
                eduFormChoices.push({
                    value: el.edukindId,
                    label: el.edukind,
                    selected: false,
                    disabled: false
                });
            }
            eduFormChoice.setChoices(eduFormChoices, "value", "label", true);
        }
    }

    //получить формы обучения
    const getFacultiesAndDepartments = async () => {
        let response = await fetch(`${URL}/api/DekanatData/GetCaseSDepartmentsIncludeFaculty`, {
            credentials: "include"
        })

        if (response.ok) {
            let data = await response.json()

            let facultiesData = data.map(d => d.caseCFaculty)

            let facultyChoices = []
            for (let el of facultiesData) {
                facultyChoices.push({
                    value: el.facId,
                    label: el.facName,
                    selected: false,
                    disabled: false
                });
            }

            facultyChoice.setChoices(facultyChoices, "value", "label", true)

            const deptChoices = []
            for (let el of data) {
                for (let departmentEl of el.caseSDepartments) {
                    deptChoices.push({
                        value: departmentEl.departmentId,
                        label: departmentEl.deptName,
                        selected: false,
                        disabled: false,
                        customProperties: `Факультет - ${el.caseCFaculty.facName}; Код - ${departmentEl.code}`
                    });
                }
            }
            deptChoice.setChoices(deptChoices, "value", "label", true);
        }
    }

    const getUniqueChoicesByValue = (array) => {
        return array.filter((e, i) => array.findIndex(a => a.value === e.value) === i);
     }

    const getProfilesByDepartmentAndYear = async (deptId, year) => {
        let response = await fetch(`${URL}/api/Profiles/GetProfileByCaseSDepartmentIdAndYear?caseSDepartmentId=${deptId}&year=${year}`, {
            credentials: "include"
        })

        if (response.ok) {
            let profilesData = await response.json()

            const profileChoices = []
            for (let el of profilesData) {
                profileChoices.push({
                    value: el.profile.id,
                    label: el.profile.profileName,
                    selected: false,
                    disabled: false,
                    customProperties: {
                        deptInfo: `${el.caseSDepartment.deptName}`,
                        deptId: el.caseSDepartment.departmentId
                    }
                });
            }
            profileChoice.setChoices(getUniqueChoicesByValue(profileChoices), "value", "label", false);
        } 
    }

    deptSelect.addEventListener("choice", function(evt) {
        const deptId = evt.detail.choice.value
        const year = yearInput.value
        if (year.trim() != "") {
            getProfilesByDepartmentAndYear(deptId, year)
        }
    })

    deptSelect.addEventListener("removeItem", function(evt) {
        const deptId = evt.detail.value
        const newStateChoices = profileChoice._prevState.choices.filter(choice => choice.customProperties.deptId != deptId)
        profileChoice.setChoices(newStateChoices, "value", "label", true)
    })

    const getStatistic = async (filterForStatistic) => {
        let response = await fetch(`${URL}/api/Profiles/GetProfilesByFilter`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(filterForStatistic)
        })

        if (response.ok) {
            let data = await response.json()

            let selectedFacultiesCount = filterForStatistic.facultiesId != null ? filterForStatistic.facultiesId.length : 0
            showStatistic(data, selectedFacultiesCount)
        } else if (response.status == 400) {
            let error = await response.text()
            if (!error.startsWith("{")) {
                const reportResult = document.querySelector(".report__result")
                reportResult.innerHTML = `<p>${error}</p>`
            }
        }
    }

    const showStatistic = (dataForStatistic, selectedFacultiesCount) => {
        let res = `
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Образовательная программа</th>
                        <th rowspan="2">Форма обучения</th>
                        <th colspan="4">РПД</th>
                    </tr>
                    <tr>
                        <th>Всего</th>
                        <th>Загружено</th>
                        <th>% заполненности</th>
                        <th>Перечень дисциплин, по которым не загружены РПД</th>
                    </tr>
                </thead>
                <tbody>
        `

        for (let item of dataForStatistic) {
            if (selectedFacultiesCount != 1) {
                res += `
                    <tr>
                        <td colspan="6">${item.faculty.facName}</th>
                    </tr>
                `
            }
            
            for (let departmentItem of item.departments) {
                const deptCode = departmentItem.department.code
                const deptName = departmentItem.department.deptName

                for (let profileItem of departmentItem.profiles) {
                    res += `
                        <tr>
                            <td>${deptCode} ${deptName}. Профиль - ${profileItem.profile.profileName}</td>
                            <td>${profileItem.edukind}</td>
                            <td>${profileItem.disciplineCount}</td>
                            <td>${profileItem.fileRpdCount}</td>
                            <td>${profileItem.downloadPercentFileRpd * 100}%</td>
                            <td>
                                <ol>
                    `

                    if (profileItem.unloadedFileRpdDisciplines.length > 0) {
                        for (let discipline of profileItem.unloadedFileRpdDisciplines) {
                            res += `<li>${discipline}</li>`
                        }
                    }

                    res += `
                        </ol>
                        </td>
                    </tr>
                    `
                }
                
            
            }
        }
    
        reportResult.innerHTML = res
    }


    const validateFilterForm = () => {
        let isValid = true

        if (yearInput.value == "") {
            isValid = false
            yearInput.closest(".report-form__label").classList.add("invalid")
        } else {
            yearInput.closest(".report-form__label").classList.remove("invalid")
        }

        const levelEduesId = levelEduChoice.getValue(true)
        if (!levelEduesId) {
            isValid = false
            levelEduSelect.closest(".choices__inner").classList.add("invalid")
        } else {
            levelEduSelect.closest(".choices__inner").classList.remove("invalid")
        }

        return isValid
    }

    reportBtn.addEventListener("click", () => {
        if (!validateFilterForm()) return

        const filterForStatistic = {
            facultiesId: null,
            departmentsId: null,
            years: null,
            levelEduesId: null,
            edukindsId: null,
            profilesId: null
        }

        const facultiesId = facultyChoice.getValue(true)
        if (facultiesId.length > 0) {
            filterForStatistic.facultiesId = facultiesId
        }

        filterForStatistic.years = [parseInt(yearInput.value)]

        const departmentsId = deptChoice.getValue(true)
        if (departmentsId.length > 0) {
            filterForStatistic.departmentsId = departmentsId
        }

        filterForStatistic.levelEduesId = [levelEduChoice.getValue(true)]

        const edukindsId = eduFormChoice.getValue(true)
        if (edukindsId.length > 0) {
            filterForStatistic.edukindsId = edukindsId
        }

        const profilesId = profileChoice.getValue(true)
        if (profilesId.length > 0) {
            filterForStatistic.profilesId = profilesId
        }

        reportResult.innerHTML = "<p>Загрузка...</p>"
        getStatistic(filterForStatistic)
    })


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
    logoutBtn.addEventListener("click", function () {
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

            getFacultiesAndDepartments()
                .then(_ => getLevelEdues())
                .then(_ => getEduForms())
            //getRemovableStatusDisciplines()
        } else { //если пользователь не имеет доступа к данной странице, то он перемещается на страницу, соответствующая его роли        
            let redirectPage = userRole !== "null" ? userRole : "metodist"
            window.location.assign(`${URL}/sved/${redirectPage}/`)
        }
    } else {
        window.location.assign(`${URL}/sved/login.html`)
    }
})