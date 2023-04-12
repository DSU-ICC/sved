document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path
    const URL = "https://oop.icc.dgu.ru"
    let disciplineList
    let profileId

    //получение дисциплин по айди профиля
    const getDisciplinesByProfile = async (profileId) => {
        document.querySelector(".accordeon__list").innerHTML = `
            <li>Идет загрузка дисциплин...</li>
        `
        
        profileId = window.location.href.split("=")[1]
        let response = await fetch(`${URL}/Discipline/GetDisciplineByProfileId?profileId=${profileId}`)

        if (response.ok) {
            let data = await response.json()
            disciplineList = data.disciplines 

            let headerTitle = document.querySelector(".page__title")
            headerTitle.textContent = `Направление: ${data.caseSDepartment.code} ${data.caseSDepartment.deptName}`

            let headerSubTitle = document.querySelector(".page__subtitle")
            headerSubTitle.textContent = `Профиль: ${data.profile.profileName}`

            showDisciplines(disciplineList)
        } 
    }

    const showDisciplines = (disciplineList) => {
        //получение уникальных имен статусов дисциплин
        let statusList = new Set(disciplineList.map(e => e.statusDiscipline.name))
        let res = ""

        for (let statusItem of statusList) {
            //разметка статуса
            res += `
                <li class="accordeon__item">
                    <div class="accordeon__control" aria-expanded="false">               
                        <p class="accordeon__title">${statusItem}</p>
                        <div class="accordeon__icon"></div>
                    </div>
                    <div class="accordeon__content" aria-hidden="true">
                        <table class="discipline-table">
                            <tbody>
                                
                        
            `
            
            for (let discipline of disciplineList) {
                //находим дисциплины которые принадлежат статусу
                if (discipline.statusDiscipline.name == statusItem) {

                    //разментка для дисциплины
                    let disciplineMarkup = "";
                    disciplineMarkup += 
                        `
                        <tr class="discipline">
                            <td>${discipline.code}</td>
                    `

                    //если файл дисциплины есть, то выводим ссылку на файл вместе с ключом эци (если файла дсициплины нет, то выводим только его названия)
                    if (discipline.fileRPD != null) {
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
                                            <p class="document-key__text">${discipline.fileRPD.codeECP}</p>
                                        </div>
                                        <a class="discipline-name" href="http://oop.icc.dgu.ru/Files/${discipline.fileRPD.name}">${discipline.disciplineName}</a>
                                    </div>
                                </div>
                            </td>
                            </tr>
                        `
                    } else {
                        disciplineMarkup += `
                            <td>
                                <div class="wrapper">
                                    <span class="discipline-name">${discipline.disciplineName}</span>
                                </div>
                            </td> 
                            </tr>
                            `
                    }
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