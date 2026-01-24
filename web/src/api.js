const BASE_URL = "https://internops-2.onrender.com"

export async function fetchHistory(){
    try{
        const res = await fetch(`${BASE_URL}/web/dashboard/history`)
        const data = await res.json()
        if(data.status == "success"){
            return data.data.history
        }
        return []
    }catch(err){
        console.log(err)
    }
}

export async function fetchAnalysisHistory() {
    try{
        const res = await fetch(`${BASE_URL}/web/analysis/history`)
        const data = await res.json()
        if(data.status == "success"){
            return data.data.history
        }
        return []
    }catch(err){
        console.log(err)
    }
}

export async function fetchAnalysisReport(id) {
    try{
        const res = await fetch(`${BASE_URL}/web/analysis/report/${id}`)
        const data = await res.json()
        if (data.status == "success"){
            return data.report
        }
        return {}
    }catch(err){
        console.log(err)
    }
}