
Parse.initialize("shigJB9XCez1AUJ6AHUPzNJoVwUU6NcXzS7YgLsl", "9BL5QjU9qGK3Hhfj9e1B3HnlkrdZaVa3WmjKBBuV");
Parse.serverURL = "https://parseapi.back4app.com";

let deckMap = new Map();
deckMap.set('standard', ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '1988', '1987', '1986']);
deckMap.set('fibonacci', ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144', '1988', '1987', '1986']);
deckMap.set('hours', ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144', '1988', '1987', '1986']);
deckMap.set('shirt', ['XS', 'S', 'M', 'L', 'XL', 'XXL', '1988', '1987', '1986']);
deckMap.set('risk', ['G', 'Y', 'O', 'V', 'R', '1988', '1987', '1986']);

let spCharMap = new Map();
spCharMap.set('1988', '∞');
spCharMap.set('1987', '?');
spCharMap.set('1986', '☕️');

let toasts = document.getElementById('toasts');
let errorTypes = ['info', 'success', 'error'];

function showToast(message = null, type = null, timeout = null) {
    const notif = document.createElement('div');
    notif.classList.add('toast');
    notif.classList.add(type ? errorTypes[type] : errorTypes[0]);

    notif.innerText = message ? message : 'No message';

    toasts.appendChild(notif);

    if (timeout!=null) {
        setTimeout(() => {
            notif.remove();
        }, timeout);
    }
}

function showTimedToast(message = null, type = null) {
    showToast(message, type, 3000);
}

function saveLocalData(room, name, id) {
    try {
        let jsonData = {}
        jsonData['room'] = room;
        jsonData['name'] = name;
        jsonData['id'] = id;
        let data = JSON.stringify(jsonData);
        localStorage.setItem('scrumble', data);

        localStorage.setItem('room', room);
        localStorage.setItem('name', name);
        localStorage.setItem('id', id);
    }catch(error) {
        console.log("saveLocalData: " + error);
    }
}

function clearLocalData() {
    saveLocalData("", "", "");
}

function getLocalData() {
    
    let result = new Map();
    let data = JSON.parse(localStorage.getItem('scrumble'));
    // console.log("LocalData: " + JSON.stringify(data));
    
    for(var i in data){
        result.set(i, data[i]);
    }

    return result;
}

