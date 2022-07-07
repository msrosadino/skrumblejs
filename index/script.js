const labels = document.querySelectorAll('.form-control label')

labels.forEach(label => {
    label.innerHTML = label.innerText
        .split('')
        .map((letter, idx) => `<span style="transition-delay:${idx * 50}ms">${letter}</span>`)
        .join('')
})

let localData = getLocalData()
let userName = localData.get('name');
let roomName = localData.get('room');
let objectId = localData.get('id');
if (objectId != null && objectId.length > 0) {
    logoutUser();
}

const btnEnter = document.getElementById("enter");
const btnCreate = document.getElementById("create");

btnEnter.addEventListener("click", enterValidate);
btnCreate.addEventListener("click", createValidate);

let Online = Parse.Object.extend("Online")

async function enterValidate(e){
    e.preventDefault();
    validateInputs(1)
}

async function createValidate(e){
    e.preventDefault();
    validateInputs(0);
}

async function logoutUser() {
    let param = {one:roomName, two:objectId}
    await Parse.Cloud.run("removeUser", param).then(() => {
        clearLocalData();
    }, (error) => {
        console.log('Unable to logout\nError: ' + error);
    });
}

async function validateInputs(action) {

    const roomName = document.getElementById("input-room").value;
    const userName = document.getElementById("input-name").value;

    if (roomName === "") {
        showToast("Room name should not be empty", 0);
        return;
    }

    if (userName === "") {
        showToast("Your name should not be empty", 0);
        return;
    }

    let roomParam = {one:roomName}
    let roomCheck = await Parse.Cloud.run("roomChecker", roomParam);

    if (action === 0) {
        if (roomCheck.data == 1) {
            showToast("Room already exist.", 2);
        } else {
            userEntry(roomName, userName, true);
        }
        return;
    }

    if (action === 1){
        if (roomCheck.data == 1) {
            userEntry(roomName, userName, false);
        } else {
            showToast("Room does not exist.", 2);
        }
        return;
    }

}

async function userEntry(roomName, userName, admin) {
    btnEnter.disable = true;
    btnCreate.disable = true;
    showTimedToast("Entering the room...", 0);
    const param = {one:roomName, two:userName, three:admin}
    await Parse.Cloud.run("userEntry", param).then((results)=>{
        if (results.success) {
            console.log(results);
            let user = JSON.parse(results.data);
            saveLocalData(roomName, userName, user.objectId);
            console.log("Login: " + JSON.stringify(getLocalData()));
            window.location.href = 'home/home.html';
            btnEnter.disable = false;
            btnCreate.disable = false;
        } else {
            showTimedToast(results.message, 2);
        }
    }, (error)=>{
        showToast(error, 2);
        btnEnter.disable = false;
        btnCreate.disable = false;
    });

}

window.addEventListener( "pageshow", function ( event ) {
    console.log('pageshow');
      var historyTraversal = event.persisted || ( typeof window.performance != "undefined" && window.performance.navigation.type === 2 );
      if ( historyTraversal ) {
        // Handle page restore.
        //alert('refresh');
        window.location.reload();
      }
});

