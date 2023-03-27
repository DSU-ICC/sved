document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"
    let loginBtn = document.querySelector(".header .action__btn")
    let pageTitle = document.querySelector(".page__title")
    let searchBtn = document.querySelector(".search__btn")
    let profiles;
    let kafedras;
    let faculties;

    //генерация разметки для файловых элементов таблицы
    const generateMarkupFileModelByFileTypeId = (profile, fileTypeId) => {
        let fileModels = new Set(profile.profile.fileModels.filter(e => e.fileTypeId == fileTypeId))
        let markup = "";

        //расставление тегов
        let propItem = ""
        if (fileTypeId == 2) { //тег для опоп
            propItem += `itemprop="opMain"`
        } else if (fileTypeId == 3) { //тег для учебного плана
            propItem += `itemprop="educationPlan"`
        } else if (fileTypeId == 4) { // тег для аннотации к рпд
            propItem += `itemprop="educationAnnotation"`
        } else if (fileTypeId == 5) { //тег для календарного рабочего графика
            propItem += `itemprop="educationShedule"`
        } else if (fileTypeId == 8) { //тег для методического материала
            propItem += `itemprop="methodology"`
        }


        if (fileModels.size != 0) {
        markup += `<td ${propItem}>`    
            //циклом перебираем все файлы принадлежащие одному типу файлов (на случай, если их будет несколько)      
            for (let fileModel of fileModels) {
                markup += `
                    <div class="item-file">                                 
                `

                //вывод ссылки на файл вместе с ключом эцп (если ключа нет, то выводим только ссылку на файл)
                if (fileModel.codeECP != null) {
                    markup += `
                        <div class="item-file__inner">
                            <span class="key-icon"></span>
                            <div class="document-key">
                                <p class="document-key__text">Документ подписан</p>
                                <p class="document-key__text">Простая электронная подпись</p>
                                <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                <p class="document-key__text">Ректор</p>
                                <p class="document-key__text">Ключ (SHA-256):</p>
                                <p class="document-key__text">${fileModel.codeECP}</p>
                            </div>
                            <a href="file:///C:/Users/User/Downloads/${fileModel.name}">${fileModel.outputFileName}</a>
                        </div>
                    `
                }  else {
                    markup += `
                        <a href="file:///C:/Users/User/Downloads/${fileModel.name}">${fileModel.outputFileName}</a>
                        
                    `
                }
            }
            
            markup += `
                </div>
            </td>
        `
        } else {
            markup += `
                <td ${propItem}>
                </td>
            `
        }
        return markup
    }

    const getAllProfiles = async () => {
        let response = await fetch(`${URL}/Profiles/GetData`)
        
        if (response.ok) {
            profiles = await response.json()
            showAllProfiles()     
        } 
    }

    const getAllKafedra = async () => {
        let response = await fetch(`${URL}/PersonalData/GetAllKafedra`)

        if (response.ok) {
            kafedras = await response.json()
        }
    }

    const getAllFaculties = async () => {
        let response = await fetch(`${URL}/PersonalData/GetAllFaculty`)

        if (response.ok) {
            faculties = await response.json()
            fillFacultyList(faculties)

        }
    }

    //заполнить выпадающий список в поиске данными факультетов для поиска по ним профилей
    const fillFacultyList = (faculties) => {
        let res = ""
        
        for (let faculty of faculties) {
            res += `
                <option value="${faculty.divName}">${faculty.divName}</option>
            `
        }

        document.querySelector(".page__head datalist").innerHTML = res
    }

    //показ всех существующих профилей с названиями их факультетов
    const showAllProfiles = () => {
        //получаем айди кафедр профилей
        let departmentsId = new Set(profiles.map(e => e.profile.persDepartmentId))

        //переменная для хранения разметки таблицы с профилями
        let res = ""

        for (let departmentIdItem of departmentsId) {
            //находим все профили, которые принадлежат кафедре
            let depIdProfiles = profiles.filter(e => e.profile.persDepartmentId == departmentIdItem)

            //находим айди факультета который связан с кафедрой
            let facultyId = kafedras[kafedras.map(e => e.depId).indexOf(departmentIdItem)].divId

            //получаем имя факультета с помощью его айди
            let facultyName = faculties[faculties.map(e => e.divId).indexOf(facultyId)].divName

            //вывод названия факультета
            res += `
                <tr>
                    <td colspan="30">
                        <strong>${facultyName}</strong>
                    </td>
                </tr>
            `
            
            //проходимся по всем профилям кафедры и создаем разметку для отображения профиля на страницк
            for (let el of depIdProfiles) { 
                res += `
                    <tr itemprop="eduOp">
                        <td>
                            <span>${el.profile.year}</span>
                        </td>
                        <td itemprop="eduCode">
                            <span>${el.caseSDepartment.code}</span>
                        </td>
                        <td itemprop="eduName">
                            <span>${el.caseSDepartment.deptName}</span>
                        </td>
                        <td itemprop="eduLevel">
                            <span>${el.profile.levelEdu.name}</span>
                        </td>
                        <td itemprop="eduProf">
                            <span>${el.profile.profileName}</span>
                        </td>                    
                ` 
        
                res += generateMarkupFileModelByFileTypeId(el, 2) // опоп
                
                res += `
                    <td itemprop="eduForm">
                        <span>${el.caseCEdukind.edukind}</span>
                    </td>
                `

                res += generateMarkupFileModelByFileTypeId(el, 3) // учебный план
        
                res += generateMarkupFileModelByFileTypeId(el, 4) // аннотации к рпд
        
                res += `
                    <td itemprop="educationRpd">
                        <a href="/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                    </td>
                ` 
        
                res += generateMarkupFileModelByFileTypeId(el, 5) // календарный учебный график
        
                let fileModelsRpp = el.disciplines // рабочие программы практик
                if (fileModelsRpp.length > 0) {
                    let rpp = `<td itemprop="eduPr">`
                    for (let fileModelRPPItem of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                                <a href="${fileModelRPPItem.fileRPD?.name}">${fileModelRPPItem.disciplineName}</a>
                            </div>
                        `
                    }               
                    res += rpp
                } else {
                    res += `
                        <td itemprop="eduPr">
                        </td>
                    `
                }
        
                res += generateMarkupFileModelByFileTypeId(el, 8) // методические материалы
        
            }

            document.querySelector("tbody").innerHTML = res
        }
        
    }

    searchBtn.addEventListener("click", function(e) {
        let facultyName = document.querySelector(".search__input").value
        getProfilesByFacultyName(facultyName)
    })

    //получение профилей по имени факультета
    const getProfilesByFacultyName = (facultyName) => {
        //получение айди факультета
        let faculty = faculties[faculties.map(e => e.divName).indexOf(facultyName)]
        let facultyId

        //если факультет был найден
        if (faculty != null) {
            facultyId = faculty.divId
        }
        //получение айди кафедр факультета
        let kafedrasId = kafedras.filter(e => e.divId == facultyId).map(e => e.depId)

        //получение профилей принадлежащих нескольким айди кафедры так как одному факультету могут принадлежать несколько кафедр
        let profilesFaculty = []
        for (let itemId of kafedrasId) {
            let profilesByItemId = profiles.filter(e => e.profile.persDepartmentId == itemId)

            if (profilesByItemId.length != 0) {
                for (let profileItem of profilesByItemId) {
                    profilesFaculty.push(profileItem)
                }
            }
        }
       
        pageTitle.textContent = `Образовательные программы: ${facultyName}`
        showProfilesByFaculty(facultyName, profilesFaculty)
    }

    //функция для вывода пользователю профилей факультета
    const showProfilesByFaculty = (facultyName, profilesFaculty) => {
        //переменная для хранения разметки таблицы с профилями
        let res = ""

        //выводим профили факультета (если их нет, то выводим сообщение об их отстутствии)
        if (profilesFaculty.length != 0) {
            //вывод названия факультета
            res += `
                <tr>
                    <td colspan="30">
                        <strong>${facultyName}</strong>
                    </td>
                </tr>
            `
        
            //создаем разметку для отображения профилей факультета
            for (let el of profilesFaculty) { 
                res += `
                    <tr itemprop="eduOp">
                        <td>
                            <span>${el.profile.year}</span>
                        </td>
                        <td itemprop="eduCode">
                            <span>${el.caseSDepartment.code}</span>
                        </td>
                        <td itemprop="eduName">
                            <span>${el.caseSDepartment.deptName}</span>
                        </td>
                        <td itemprop="eduLevel">
                            <span>${el.profile.levelEdu.name}</span>
                        </td>
                        <td itemprop="eduProf">
                            <span>${el.profile.profileName}</span>
                        </td>                    
                ` 
                
                res += generateMarkupFileModelByFileTypeId(el, 1) // фгос

                res += generateMarkupFileModelByFileTypeId(el, 2) // опоп
                
                res += `
                    <td itemprop="eduForm">
                        <span>${el.caseCEdukind.edukind}</span>
                    </td>
                `
                res += generateMarkupFileModelByFileTypeId(el, 3) // учебный план

                res += generateMarkupFileModelByFileTypeId(el, 4) // аннотации к рпд

                //если есть ссылка на РПД для аспирантуры, то показываем ее, если нет, то генерируем ссылку на страницу ЭОР
                if (el.profile.linkToRPD != null) {
                    res += `
                        <td itemprop="educationRpd">
                            <a href="${el.profile.linkToRPD}">Рабочие программы дисциплин</a>
                        </td>
                    ` 
                } else {
                    res += `
                        <td itemprop="educationRpd">
                            <a href="/admin/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                        </td>
                    ` 
                }

                res += generateMarkupFileModelByFileTypeId(el, 5) // календарный учебный график

                let fileModelsRpp = el.practics // рабочие программы практик
                if (fileModelsRpp.size != 0) {
                    let rpp = `<td itemprop="eduPr">`
                    for (let fileModelRPPItem of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                                <a href="${fileModelRPPItem.fileRPD?.name}">${fileModelRPPItem.disciplineName}</a>
                            </div>
                        `
                    }               
                    res += rpp
                } else {
                    res += `
                        <td itemprop="eduPr">
                        </td>
                    `
                }

                res += generateMarkupFileModelByFileTypeId(el, 4) // гиа

                res += generateMarkupFileModelByFileTypeId(el, 6) // матрицы

                res += generateMarkupFileModelByFileTypeId(el, 11) // методические материалы

            }
        } else {
            res += `
                <tr>
                    <td colspan="30">
                        Ничего не найдено
                    </td>
                </tr>
            `
        }

        document.querySelector("tbody").innerHTML = res
    }

    //кнопка для входа на страницу авторизации
    loginBtn.addEventListener("click", function() {
        window.location.assign("/login.html")
    })
    
    
    getAllKafedra().then(_ => getAllFaculties()).then(_ => getAllProfiles())
})