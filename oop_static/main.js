document.addEventListener("DOMContentLoaded", function() {
    var path = window.location.pathname; var host = window.location.hostname;
    document.getElementById("specialVersion").href = "https://finevision.ru/?hostname=" + host + "&path=" + path

    //const URL = "https://oop.dgu.ru"
    //const URL = "https://localhost:44370"
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
        let fileModels = new Set(profile.Profile.FileModels.filter(e => e.FileTypeId == fileTypeId))
        let markup = "";

        //расставление тегов
        let propItem = ""
        if (fileTypeId == getFileTypeIdByName("ОПОП")) { //тег для опоп
            propItem += `itemprop="opMain"`
        } else if (fileTypeId == getFileTypeIdByName("Учебный план")) { //тег для учебного плана
            propItem += `itemprop="educationPlan"`
        } else if (fileTypeId == getFileTypeIdByName("Аннотации к РПД")) {
            propItem += `itemprop="educationAnnotation"`
        } else if (fileTypeId == getFileTypeIdByName("КУГ")) { //тег для календарного учебного графика
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
                if (fileModel.CodeECP != null) {
                    markup += `
                        <div class="item-file__inner">
                            <span class="key-icon"></span>
                            <div class="document-key">
                                <p class="document-key__text">Документ подписан</p>
                                <p class="document-key__text">Простая электронная подпись</p>
                                <p class="document-key__text">Рабаданов Муртазали Хулатаевич</p>
                                <p class="document-key__text">Ректор</p>
                                <p class="document-key__text">Ключ (SHA-256):</p>
                                <p class="document-key__text">${fileModel.CodeECP}</p>
                            </div>
                            <a href="${fileModel.LinkToFile != null
                                ? fileModel.LinkToFile
                                : "/sved/Files/" + fileModel.Name}">${fileModel.OutputFileName}</a>
                        </div>
                    `
                }  else {
                    markup += `
                    <a href=${fileModel.LinkToFile != null
                        ? fileModel.LinkToFile
                        : "/sved/Files/" + fileModel.Name}
                        >${fileModel.OutputFileName}</a>
                        
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

        let response = await fetch(`/api/Profiles/GetDataForOopDgu`)

        if (response.ok) {
            profiles = await response.json()
            showAllProfiles()     
        } 
    }

    const getAllFaculties = async () => {
        let response = await fetch(`/api/DekanatData/GetFaculties`)

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
                <option value="${faculty.facName}">${faculty.facName}</option>
            `
        }

        document.querySelector(".page__head datalist").innerHTML = res
    }

    //показ всех существующих профилей с названиями их факультетов
    const showAllProfiles = () => {
        let res = ""

        let facId = 0;
        for (let el of profiles) { 
            
            if (el.CaseSDepartment.FacId !== facId) {
                //получаем имя факультета с помощью его айди
                let facultyName = faculties[faculties.map(e => e.facId).indexOf(el.CaseSDepartment.FacId)]?.facName

                if (facultyName) {
                    //вывод названия факультета
                    res += `
                        <tr>
                            <td colspan="30">
                                <strong>${facultyName}</strong>
                            </td>
                        </tr>
                    `            
                }
                facId = el.CaseSDepartment.FacId
            }
            
            res += `
                <tr itemprop="eduOp">
                    <td>
                        <span>${el.Profile.Year}</span>
                    </td>
                    <td itemprop="eduCode">
                        <span>${el.CaseSDepartment.Code}</span>
                    </td>
                    <td itemprop="eduName">
                        <span>${el.CaseSDepartment.DeptName}</span>
                    </td>
                    <td itemprop="eduLevel">
                        <span>${el.Profile.LevelEdu.Name}</span>
                    </td>
                    <td itemprop="eduProf">
                        <span>${el.Profile.ProfileName}</span>
                    </td>                    
            ` 
    
            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("ОПОП")) // опоп
            
            res += `
                <td itemprop="eduForm">
                    <span>${el.CaseCEdukind ? el.CaseCEdukind.Edukind : ""}</span>
                </td>
            `

            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Учебный план")) // учебный план

            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Аннотации к РПД")) // Аннотации к РПД
    
            if (String(el.Profile.LinkToRPD).toString() != "NULL" && el.Profile.LinkToRPD != null) {
                res += `
                    <td itemprop="educationRpd">
                        <a href="${el.Profile.LinkToRPD}">РПД</a>
                    </td>
                ` 
            } else {
                res += `
                    <td itemprop="educationRpd">
                        <a href="/sved/eor.html?profileId=${el.Profile.Id}">РПД</a>
                    </td>
                ` 
            } 

    
            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("КУГ")) // календарный учебный график
    
            let fileModelsRpp = el.Disciplines // рабочие программы практик
            if (fileModelsRpp.length > 0) {
                let rpp = `<td itemprop="eduPr">`
                rpp += '<div class="item-files">'
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
                rpp += '</div>'
                rpp += '<button type="button" class="show-practic-btn">показать все</button>'
 
                res += rpp
            } else {
                res += `
                    <td itemprop="eduPr">
                    </td>
                `
            }

            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Программа ГИА")) // гиа

            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Матрицы компетенций")) // матрицы
    
            res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Методические материалы для обеспечения ОП")) // методические материалы
        } 
        
        if (res.length > 0) {
            document.querySelector("tbody").innerHTML = res
        } else {
            document.querySelector("tbody").innerHTML = ""
        } 
        
        let showPracticNameBtns = document.querySelectorAll(".show-practic-btn")
        showPracticNameBtns.forEach(practicBtn => {
            practicBtn.addEventListener("click", function(e) {
                e.preventDefault()

                let practicNames = e.target.previousElementSibling
                practicNames.classList.add("show")

                e.target.remove()
            })
        })
    }

    //нажатие на кнопку поиска факультета
    searchBtn.addEventListener("click", function(e) {
        let facultyName = document.querySelector(".search__input").value
        if (facultyName) {
            getProfilesByFacultyName(facultyName)
        } else {
            document.querySelector("tbody").innerHTML = `
                <tr><td>Идет загрузка профилей...</td></tr>
            `
            
            pageTitle.textContent = "Образовательные программы"
            showAllProfiles()
        }
        
    })

    //получение профилей по имени факультета
    const getProfilesByFacultyName = (facultyName) => {
        document.querySelector("tbody").innerHTML = `
            <tr><td>Идет загрузка профилей...</td></tr>
        `

        //получение айди факультета
        let faculty = faculties[faculties.map(e => e.facName).indexOf(facultyName)]
        let facultyId
        let profilesFaculty

        //если факультет был найден
        if (faculty != null) {
            facultyId = faculty.facId

            //находим все профили, которые принадлежат факультету
            profilesFaculty = profiles.filter(e => e.CaseSDepartment?.FacId === facultyId)   
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
                            <span>${el.Profile.Year}</span>
                        </td>
                        <td itemprop="eduCode">
                            <span>${el.CaseSDepartment.Code}</span>
                        </td>
                        <td itemprop="eduName">
                            <span>${el.CaseSDepartment.DeptName}</span>
                        </td>
                        <td itemprop="eduLevel">
                            <span>${el.Profile.LevelEdu.Name}</span>
                        </td>
                        <td itemprop="eduProf">
                            <span>${el.Profile.ProfileName}</span>
                        </td>                    
                ` 
        
                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("ОПОП")) // опоп
                
                res += `
                    <td itemprop="eduForm">
                        <span>${el.CaseCEdukind ? el.CaseCEdukind.Edukind : ""}</span>
                    </td>
                `

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Учебный план")) // учебный план
        
                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Аннотации к РПД")) // аннотации к рпд
        
                res += `
                    <td itemprop="educationRpd">
                        <a href="/sved/eor.html?profileId=${el.Profile.Id}">Рабочие программы дисциплин</a>
                    </td>
                ` 
        
                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("КУГ")) // календарный учебный график
        
                let fileModelsRpp = el.Disciplines // рабочие программы практик
                if (fileModelsRpp.length > 0) {
                    let rpp = `<td itemprop="eduPr">`
                    rpp += '<div class="item-files">'
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
                    rpp += '</div>'
                    rpp += '<button type="button" class="show-practic-btn">показать все</button>'
    
                    res += rpp
                } else {
                    res += `
                        <td itemprop="eduPr">
                        </td>
                    `
                }

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Программа ГИА")) // гиа

                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Матрицы компетенций")) // матрицы
        
                res += generateMarkupFileModelByFileTypeId(el, getFileTypeIdByName("Методические материалы для обеспечения ОП")) // методические материалы
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

        let showPracticNameBtns = document.querySelectorAll(".show-practic-btn")
        showPracticNameBtns.forEach(practicBtn => {
            practicBtn.addEventListener("click", function(e) {
                e.preventDefault()

                let practicNames = e.target.previousElementSibling
                practicNames.classList.add("show")

                e.target.remove()
            })
        })
    }

    const getFileTypes = async () => {
        let response = await fetch(`/api/FileType/GetFileTypes`, {
            credentials: "include"
        })

        if (response.ok) {
            fileTypes = await response.json()
        }
    }

    //кнопка для входа на страницу авторизации
    loginBtn.addEventListener("click", function() {
        window.location.assign("https://oop.dgu.ru/sved/login.html")
    })
    
    getFileTypes().then(_ => getAllFaculties()).then(_ => getAllProfiles())
})