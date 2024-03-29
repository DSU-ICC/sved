document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path
    const URL = "https://oop.dgu.ru"
    let disciplineList
    let profileId

    //получение дисциплин по айди профиля
    const getDisciplinesByProfile = async (profileId) => {
        document.querySelector(".accordeon__list").innerHTML = `
            <li>Идет загрузка дисциплин...</li>
        `
        
        profileId = window.location.href.split("=")[1]
        let response = await fetch(`${URL}/api/Discipline/GetDisciplineByProfileId?profileId=${profileId}`)

        if (response.ok) {
            let data = await response.json()
            disciplineList = data.profile.disciplines 

            //вывод пользователю названия направления профиля
            let headerTitleDept = document.querySelector(".page__title")
            headerTitleDept.textContent = `Направление: ${data.caseSDepartment.code} ${data.caseSDepartment.deptName}`

            //вывод пользователю названия профиля
            let headerSubTitleProfileName = document.querySelector(".page__subtitle--profile-name")
            headerSubTitleProfileName.textContent = `Профиль: ${data.profile.profileName}`

            let isLicey = ['Начальное общее образование', 'Начальное общее образовние', 'Основное общее образование', 'Среднее общее образование'].includes(data.profile.profileName.trim())
            let isAspiranture = data.profile.levelEdu.name == "Аспирантура"

            let isFosVisible = (!isLicey && !isAspiranture)
            //вывод пользователю года реализации профиля
            let headerSubTitleYear = document.querySelector(".page__subtitle--year")
            headerSubTitleYear.textContent = `Год: ${data.profile.year}`

            //вывод пользователю формы обучения профиля
            let headerSubTitleEduForm = document.querySelector(".page__subtitle--edu-form")
            headerSubTitleEduForm.textContent = `Форма обучения: ${data.caseCEdukind.edukind}`

            showDisciplines(disciplineList, isFosVisible)
        } 
    }

    const showDisciplines = (disciplineList, isFosVisible = true) => {
        let statusListId = new Set(disciplineList.map(e => e.statusDiscipline.id))
        let res = ""
        for (let statusItemId of statusListId) {
            const statusName = disciplineList[disciplineList.map(e => e.statusDiscipline.id).indexOf(statusItemId)].statusDiscipline.name
            res += `
                <li class="accordeon__item">
                    <div class="accordeon__control" aria-expanded="false">               
                        <p class="accordeon__title">${statusName}</p>
                        <div class="accordeon__icon"></div>
                    </div>
                    <div class="accordeon__content" aria-hidden="true">
                        <table class="discipline-table">
                            <thead>
                                <tr>
                                    <th>Код</th>
                                    <th>Название</th>
                                    <th>РПД</th>
                                    ${isFosVisible ? "<th>ФОС</th>": ""}
                                </tr>
                            </thead>
                            <tbody>  
            `
            for (let discipline of disciplineList) {
                if (discipline.statusDiscipline.id == statusItemId) {
                    let disciplineMarkup = "";
                    disciplineMarkup += 
                        `
                        <tr class="discipline">
                            <td>${discipline.code}</td>
                            <td>
                                <span class="discipline-name">${discipline.disciplineName}</span>
                            </td>
                    `
                    //если файл рпд загружен для данной дисциплины, то выводим его вместе с ключом эцп
                    if (discipline.fileRPD.length > 0) {
                        disciplineMarkup += `
                            <td>
                                <div class="wrapper">
                                    <div class="item-file__inner">
                                        <span class="key-icon"></span>
                                        <div class="document-key">
                                            <p class="document-key__text">Документ подписан</p>
                                            <p class="document-key__text">Простая электронная подпись</p>
                                            <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                            <p class="document-key__text">Ректор</p>
                                            <p class="document-key__text">Ключ (SHA-256):</p>
                                            <p class="document-key__text">${discipline.fileRPD[0]?.codeECP}</p>
                                        </div>
                                        <a href=${discipline.fileRPD[0]?.linkToFile != null
                                            ? discipline.fileRPD[0]?.linkToFile.replace(/\s/g, "%20")
                                            : `${URL}/sved/files-oop/${discipline.fileRPD[0]?.name.replace(/\s/g, "%20")}`}
                                                >РПД
                                        </a>
                                    </div>                              
                                </div>
                            </td>                           
                        `   
                    } else {
                        disciplineMarkup += `
                            <td>  
                            </td>
                        `
                    }

                    if (isFosVisible) {
                        if (discipline.fileFOS.length > 0) {
                            disciplineMarkup += `
                                <td>
                                    <div class="wrapper">
                                        <div class="item-file__inner">
                                            <span class="key-icon"></span>
                                            <div class="document-key">
                                                <p class="document-key__text">Документ подписан</p>
                                                <p class="document-key__text">Простая электронная подпись</p>
                                                <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                                <p class="document-key__text">Ректор</p>
                                                <p class="document-key__text">Ключ (SHA-256):</p>
                                                <p class="document-key__text">${discipline.fileFOS[0]?.codeECP}</p>
                                            </div>
                                            <a href=${discipline.fileFOS[0]?.linkToFile != null
                                                ? discipline.fileFOS[0]?.linkToFile.replace(/\s/g, "%20")
                                                : `${URL}/sved/files-oop/${discipline.fileFOS[0]?.name.replace(/\s/g, "%20")}`}
                                                    >ФОС
                                            </a>
                                        </div>                             
                                    </div>
                                </td>                           
                            `   
                        } else {
                            disciplineMarkup += `
                                <td>
                                </td>
                            `
                        }
                    }

                    disciplineMarkup += `
                    </tr>
                    `

                    res += disciplineMarkup
                }
            }
            res += `
                    </tbody>
                    </table>
                </div>
            </li>
            `
        }
        if (res.length > 0) {
            document.querySelector(".accordeon__list").innerHTML = res
        } else {
            document.querySelector(".accordeon__list").innerHTML = ""
        } 
    }

    //функционал для открытия и закрытия контента аккордеона
    let accordeon = document.querySelector('.accordeon');
    accordeon.addEventListener("click", function(e) {
        if (e.target.closest(".accordeon__control")) {
            e.target.closest(".accordeon__item").classList.toggle("active");
        }
    })

    getDisciplinesByProfile(profileId)
})