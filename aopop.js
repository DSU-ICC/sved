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

    //показ всех существующих профилей с названиями их факультетов
    const showAllProfiles = () => {

        //переменная для хранения разметки таблицы с профилями
        let res = ""

        for (let el of profiles) { 
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
    
            res += generateMarkupFileModelByFileTypeId(el, 9) // аопоп
            
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

    //кнопка для входа на страницу авторизации
    loginBtn.addEventListener("click", function() {
        window.location.assign("/login.html")
    })
    
    
    getAllProfiles()
})