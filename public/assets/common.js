let userData = []

fetch('/getUserData', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        userData = data
    })
    .catch(err => console.log(err))
