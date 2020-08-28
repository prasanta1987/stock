let firebaseConfig = {
    apiKey: "AIzaSyBp9j1irJlYlTzu0NhrJe4ngyxDXi4HCH4",
    authDomain: "pran-home.firebaseapp.com",
    databaseURL: "https://pran-home.firebaseio.com",
    projectId: "pran-home",
    storageBucket: "pran-home.appspot.com",
    messagingSenderId: "802658990350",
    appId: "1:802658990350:web:248bfdad28bc7a7c657f5f"
}


firebase.initializeApp(firebaseConfig);


let db = firebase.firestore()
let collection = db.collection('stockHistoricalData')

collection
    // .where('1593973800000.SYMBOL', '==', 'AXISBANK')
    .where('1593973800000.HIGH_PRICE', '>', 500)
    .get()
    .then(doc => {
        doc.forEach(data => {
            console.log(data.data())
        })
    })
    .catch(err => console.log(err))


