document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path

    const URL = "https://localhost:44370"
    let loginBtn = document.querySelector(".header .action__btn")
    let pageTitle = document.querySelector(".page__title")
    let searchBtn = document.querySelector(".search__btn")
    let profiles;
    let kafedras;
    let faculties;
    let fileTypes;

    const getFileTypeIdByName = (nameFileType) => {
        let fileType = fileTypes.find(x => x.name.toLowerCase() == nameFileType.toLowerCase())
        return fileType.id
    }

    //генерация разметки для файловых элементов таблицы
    const generateMarkupFileModelByFileTypeId = (profile, fileTypeId) => {
        let fileModels = new Set(profile.profile.fileModels.filter(e => e.fileTypeId == fileTypeId))
        let markup = "";

        //расставление тегов
        let propItem = ""
        if (fileTypeId == getFileTypeIdByName("ОПОП")) { //тег для опоп
            propItem += `itemprop="opMain"`
        } else if (fileTypeId == getFileTypeIdByName("Учебный план")) { //тег для учебного плана
            propItem += `itemprop="educationPlan"`
        } else if (fileTypeId == getFileTypeIdByName("Аннотации к РПД")) { // тег для аннотации к рпд
            propItem += `itemprop="educationAnnotation"`
        } else if (fileTypeId == getFileTypeIdByName("Календарный график")) { //тег для календарного учебного графика
            propItem += `itemprop="educationShedule"`
        } else if (fileTypeId == getFileTypeIdByName("Методические материалы для обеспечения ОП")) { //тег для методического материала
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
                            <a href=${fileModel.linkToFile != null
                                ? fileModel.linkToFile
                                : "http://oop.icc.dgu.ru/Files/" + fileModel.name}>${fileModel.outputFileName}</a>
                        </div>
                    `
                }  else {
                    markup += `
                    <a href=${fileModel.linkToFile != null
                        ? fileModel.linkToFile
                        : "http://oop.icc.dgu.ru/Files/" + fileModel.name}
                        >${fileModel.outputFileName}</a>
                        
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
        document.querySelector("tbody").innerHTML = `
            <tr><td>Идет загрузка профилей...</td></tr>
        `

        let response = await fetch(`${URL}/Profiles/GetDataForOopDgu`)

        if (response.ok) {
            profiles = await response.json()
            showAllProfiles()     
        } 
    }

    const getAllFaculties = async () => {
        let response = await fetch(`${URL}/PersonalData/GetAllFaculty`)

        if (response.ok) {
            faculties = await response.json()
            console.log(faculties)
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
        //получаем айди факультетов профилей
        let facultiesId = new Set(profiles.map(e => e.caseSDepartment?.facId).filter(e => e !== undefined))
        //переменная для хранения разметки таблицы с профилями
        let res = ""
        
        for (let facIdItem of facultiesId) {
            //находим все профили, которые принадлежат факультету
            let facIdProfiles = profiles.filter(e => e.caseSDepartment?.facId === facIdItem)

            //получаем имя факультета с помощью его айди
            let facultyName = faculties[faculties.map(e => e.divId).indexOf(facIdItem)]?.divName

            if (facultyName) {
                //вывод названия факультета
                res += `
                    <tr>
                        <td colspan="30">
                            <strong>${facultyName}</strong>
                        </td>
                    </tr>
                `
            
                //проходимся по всем профилям и создаем разметку для отображения профиля на страницк
                for (let el of facIdProfiles) { 
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
            
                    res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("ОПОП")) // опоп
                    
                    res += `
                        <td itemprop="eduForm">
                            <span>${el.caseCEdukind ? el.caseCEdukind.edukind : ""}</span>
                        </td>
                    `

                    res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Учебный план")) // учебный план
            
                    res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Аннотации к РПД")) // аннотации к рпд
            
                    if (String(el.profile.linkToRPD).toString() != "NULL" && el.profile.linkToRPD != null) {
                        res += `
                            <td itemprop="educationRpd">
                                <a href="${el.profile.linkToRPD}">Рабочие программы дисциплин</a>
                            </td>
                        ` 
                    } else {
                        res += `
                            <td itemprop="educationRpd">
                                <a href="/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                            </td>
                        ` 
                    } 
            
                    res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Календарный график")) // календарный учебный график
            
                    let fileModelsRpp = el.disciplines // рабочие программы практик
                    if (fileModelsRpp.length > 0) {
                        let rpp = `<td itemprop="eduPr">`
                        for (let fileRPP of fileModelsRpp) {
                            rpp += `
                                <div class="item-file">
                                ${
                                    fileRPP.fileRPD != null
                                    ? `
                                        <div class="item-file__inner">
                                            <span class="key-icon"></span>
                                            <div class="document-key">
                                                <p class="document-key__text">Документ подписан</p>
                                                <p class="document-key__text">Простая электронная подпись</p>
                                                <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                                <p class="document-key__text">Ректор</p>
                                                <p class="document-key__text">Ключ (SHA-256):</p>
                                                <p class="document-key__text">${fileRPP.fileRPD.codeECP}</p>
                                            </div>
                                            <a href="https://oop.icc.dgu.ru/Files/${fileRPP.fileRPD.name}">${fileRPP.disciplineName}</a>
                                        </div>
                                        
                                    `
                                    : `
                                        <span>${fileRPP.disciplineName}</span>
                                    `
                                }
                                
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
            
                    res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Методические материалы для обеспечения ОП")) // методические материалы
            
                }    
            }
        }
        
        if (res.length > 0) {
            document.querySelector("tbody").innerHTML = res
        } else {
            document.querySelector("tbody").innerHTML = ""
        } 
        
    }

    //нажатие на кнопку поиска факультета
    searchBtn.addEventListener("click", function(e) {
        let facultyName = document.querySelector(".search__input").value
        getProfilesByFacultyName(facultyName)
    })

    //получение профилей по имени факультета
    const getProfilesByFacultyName = (facultyName) => {
        document.querySelector("tbody").innerHTML = `
            <tr><td>Идет загрузка профилей...</td></tr>
        `

        //получение айди факультета
        let faculty = faculties[faculties.map(e => e.divName).indexOf(facultyName)]
        let facultyId
        let profilesFaculty
        console.log(profiles.filter(e => e.caseSDepartment?.facId == 17))
        //если факультет был найден
        if (faculty != null) {
            facultyId = faculty.divId
            //находим все профили, которые принадлежат факультету
            profilesFaculty = profiles.filter(e => e.caseSDepartment?.facId === facultyId)   
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
        
                res += generateMarkupFileModelByFileTypeId(el, 2) // опоп
                
                res += `
                    <td itemprop="eduForm">
                        <span>${el.caseCEdukind ? el.caseCEdukind.edukind : ""}</span>
                    </td>
                `

                res += generateMarkupFileModelByFileTypeId(el, 3) // учебный план
        
                res += generateMarkupFileModelByFileTypeId(el, 10) // аннотации к рпд
        
                res += `
                    <td itemprop="educationRpd">
                        <a href="/eor.html?profileId=${el.profile.id}">Рабочие программы дисциплин</a>
                    </td>
                ` 
        
                res += generateMarkupFileModelByFileTypeId(el, 4) // календарный учебный график
        
                let fileModelsRpp = el.disciplines // рабочие программы практик
                if (fileModelsRpp.length > 0) {
                    let rpp = `<td itemprop="eduPr">`
                    for (let fileRPP of fileModelsRpp) {
                        rpp += `
                            <div class="item-file">
                            ${
                                fileRPP.fileRPD != null
                                ? ` <a href="https://oop.icc.dgu.ru/Files/${fileRPP.fileRPD.name}">${fileRPP.disciplineName}</a>`
                                : `<span>${fileRPP.disciplineName}</span>`
                            }
                            
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
        } else {
            res += `
                <tr>
                    <td colspan="30">
                        Ничего не найдено
                    </td>
                </tr>
            `
        }

        if (res.length > 0) {
            document.querySelector("tbody").innerHTML = res
        } else {
            document.querySelector("tbody").innerHTML = ""
        } 
    }

    const getFileTypes = async () => {
        let response = await fetch(`${URL}/FileType/GetFileTypes`, {
            credentials: "include"
        })

        if (response.ok) {
            fileTypes = await response.json()
        }
    }

    //кнопка для входа на страницу авторизации
    loginBtn.addEventListener("click", function() {
        window.location.assign("/login.html")
    })
    
    getFileTypes().then(_ => getAllFaculties()).then(_ => getAllProfiles())
})