let userData = sessionStorage

    fetch('/getUserData',{method : 'POST'})
    .then(res=>res.json())
    .then(data=>{

        sessionStorage.name = data.name
        sessionStorage.watchList = data.watchList
    })
    .catch(err=>console.log(err))
