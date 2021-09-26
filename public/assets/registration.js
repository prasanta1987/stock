const btn = document.querySelector('.rgisbtn')
const name = document.querySelector('#name')


btn.addEventListener('click', () => {
    let userName = name.value
    fetch(`/updateName/${userName}`, { method: 'POST' })
        .then(res => {
            if (res.status == 200) {
                // setTimeout(() => { window.location = '/' }, 1000)
            }
        })
        .catch(err => console.log(err))
})
