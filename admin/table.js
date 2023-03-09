document.addEventListener("DOMContentLoaded", function() {
    const URL = "https://localhost:44370"

    const getProfiles = async () => {
        let response = await fetch(`${URL}/Profiles/GetData`, {
            credentials: "include"
        })

        if (response.ok) {
            let profiles = await response.json()
            showProfiles(profiles)
        } 
    }

    const showProfiles = (profiles) => {
        let res = ""
        for (let el of profiles) {
            res += `
                <tr data-profileid=${el.profile.id} itemprop="eduAccred">
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
                        <span>${el.profile.termEdu} года</span>
                    </td>    
                    <td itemprop="dateEnd">
                        <span>24.04.2025</span>
                    </td>  
                    <td itemprop="language">
                        <span>русский</span>
                    </td>  
                    <td itemprop="eduPred">
                        <a>grgr</a>
                    </td>    

                ` 

            let fileModelsRpp = el.practics // рабочие программы практик
            if (fileModelsRpp.size != 0) {
                let rpp = `<td itemprop="eduPrac">`
                for (let fileModel of fileModelsRpp) {
                    rpp += `
                        <div class="item-file">
                            <a href=#>${fileModel.disciplineName}</a>
                        </div>
                    `
                }               
                res += rpp
            }

            res += `
                <td itemprop="eduEl">
                    
                </td>
            `
        }
        document.querySelector("tbody").innerHTML = res
    }

    getProfiles()
})