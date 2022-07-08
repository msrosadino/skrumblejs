let activeSubs = false;
const nav = document.querySelector('.nav')
window.addEventListener('scroll', fixNav)

function fixNav() {
    if(window.scrollY > nav.offsetHeight + 150) {
        nav.classList.add('active')
    } else {
        nav.classList.remove('active')
    }
}

// Livequery initialization ===========================================
var client = new Parse.LiveQueryClient({
    applicationId: 'shigJB9XCez1AUJ6AHUPzNJoVwUU6NcXzS7YgLsl',
    serverURL: 'wss://scrumble.b4a.io',
    javascriptKey: '9BL5QjU9qGK3Hhfj9e1B3HnlkrdZaVa3WmjKBBuV'
});
client.open();

window.addEventListener('beforeunload', function (e) {
    console.log('beforeunload');
    // e.preventDefault();
    // e.returnValue = 'Closing subscription';
    if (activeSubs) {
        subscription.unsubscribe();
        Parse.LiveQuery.close();
    }

});


// Database query ===================================================

let Online = Parse.Object.extend("Online");
let localData = getLocalData();
let userName = localData.get('name');
let roomName = localData.get('room');
let yourId = localData.get('id');;
let onlineUsers = [];
let cardSelected = '';
let deckType = 'standard';
let deckData = [];
let revealVote = false;
let isAdmin = false;

async function logoutUser() {
    let param = {one:roomName, two:yourId}
    await Parse.Cloud.run("removeUser", param).then(() => {
        clearLocalData();
    }, (error) => {
        console.log('Unable to logout\nError: ' + error);
    });
}

async function getOnlineUsers() {

    const param = {one:roomName};
    onlineUsers = await Parse.Cloud.run("getOnlineUsers", param);

}

async function loadOnlineUsers() {
    
    const gridContainer = document.getElementById('online-user');
    gridContainer.innerHTML = "";
    for (let i = 0; i < onlineUsers.length; i++) {
      const object = onlineUsers[i];
      if (object.get('admin')) {
        userId = object.get('objectId');
        revealVote = object.get("reveal");
        deckType = object.get("deck");
        isAdmin = object.get("name").trim() == userName;
        showDetails(object);
        continue;
      }
      generateUserCard(object, gridContainer);
    }
}

function generateUserCard(online, parent) {

    const grid = document.createElement('div');

    const vote = online.get("vote");
    const voted = revealVote || (vote == null || vote === "")
        ? 'card-box-normal' : 'card-box-voted';

    let displayLabel = getSpValue(online.get("vote"));
    let hideContent = revealVote ? `<div class="vote-shown">${displayLabel}</div>`
        : `<div><object><img src="../resource/profile.png"><object></div>`;

    let you = online.get("name") + " (You)"
    let name = userName === online.get("name") ? you : online.get("name");

    const userCard = `
        <section>
            <div class=${voted}>
                <div><span>${name}</span></div>
                ${hideContent}
            </div>
        </section>
    `;

    grid.innerHTML = userCard

    parent.appendChild(grid);

}

async function cardClick(data){
    if (revealVote) {
        showTimedToast('Voting is already closed', 0)
        return
    }
    cardSelected = data
    generateCardDeck();

    const param = {one:roomName, two:yourId, three:data};
    await Parse.Cloud.run("updateVote", param).then((results)=>{
        if (!results.success) {
            showTimedToast(results.message, 2);
            cardSelected = "";
            generateCardDeck();
        }
    }, (error) => {
        showTimedToast(JSON.stringify(error), 0);
        cardSelected = "";
        generateCardDeck();
    });
}

function showDetails(admin) {

    deckType = admin.get('deck').toLowerCase()
    deckData = deckMap.get(deckType)

    const detailsContainer = document.getElementById('details');
    detailsContainer.innerHTML = ""
    const detailsDiv = document.createElement('div')

    let dt = deckType.charAt(0).toUpperCase() + deckType.slice(1);

    const detailsContent =`
        <div class="details">
            <div>Room Name : ${admin.get('room')}</div>
            <div class="space"></div>
            <div>Scrum Master : ${admin.get('name')}</div>
            <div class="space"></div>
            <div>Deck Type : ${dt}</div>
        </div>
    `;

    detailsDiv.innerHTML = detailsContent

    detailsContainer.appendChild(detailsDiv);

    if (isAdmin) {
        generateAdminControls();
    } else {
        generateCardDeck();
    }

}

function getSpValue(card) {
    let finalChar = spCharMap.get(card);
    return finalChar == null ? card : finalChar;
}

function generateAdminControls() {

    let contContainer = document.getElementById('controls');
    let child = contContainer.children.length;
    if (child > 0) {
        contContainer.innerHTML = "";
    }

    const controlsContainer = document.getElementById('controls');
    const section = document.createElement('div')

    const controls =`
      <div class="btn-group">
        <button onclick="revealCards()">Reveal Cards</button>
        <button onclick="resetCards()">Reset Cards</button>

        <div class="dropdown">
          <button onclick="showDropdown()">Deck Type</button>
          <div id="deckList" class="dropdown-content">
            <a onclick="setDeckType('standard')" href="#">Standard</a>
            <a onclick="setDeckType('fibonacci')" href="#">Fibonacci</a>
            <a onclick="setDeckType('hours')" href="#">Hours</a>
            <a onclick="setDeckType('shirt')" href="#">Shirt</a>
            <a onclick="setDeckType('risk')" href="#">Risk</a>
          </div>
        </div>


      </div>
    `;

    section.innerHTML = controls

    controlsContainer.appendChild(section);
}

function showDropdown() {
  document.getElementById("deckList").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('button')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

async function setDeckType(deck) {

    const param = {one:roomName, two:yourId, three:deck};
    await Parse.Cloud.run("setDeckType", param).then((results)=>{
        if (!results.success) {
            showTimedToast(results.message, 2);
            showDetails(object[0]);
        }else{
            showTimedToast(results.message, 1);
        }
    }, (error) => {
        console.log("setDeckType" + error);
        showTimedToast(error, 0);
    });
}

function generateCardDeck() {

    let contContainer = document.getElementById('controls');
    let child = contContainer.children.length;
    if (child > 0) {
        contContainer.innerHTML = "";
    }

    for (var i = 0; i < deckData.length; i++) {
        
        const controlsContainer = document.getElementById('controls');
        const section = document.createElement('section')
        section.classList.add('deck')

        let card = deckData[i]
        let displayLabel = getSpValue(card);

        let setClass =  revealVote ? "card-deck-normal" : (cardSelected == card ? "card-deck-selected" : "card-deck-normal")
        const cardItem =`
            <div class=${setClass} onclick="cardClick(${card})">
                <div><span>${displayLabel}</span></div>
            </div>
        `;

        section.innerHTML = cardItem

        controlsContainer.appendChild(section);
    }
}

async function resetCards() {
    const param = {one:roomName}
    await Parse.Cloud.run("resetCardVote", param).then((results)=>{
        showTimedToast(results.message, 1);
    }, (error)=>{
        showTimedToast(error, 1);
    });
}

async function revealCards() {
    const param = {one:roomName}
    await Parse.Cloud.run("revealCardVote", param).then((results)=>{
        showTimedToast(results.message, 1);
    });
}

async function loadData() {
    await getOnlineUsers();
    loadOnlineUsers();
}

function isUserExist() {
    userName = localStorage.getItem('name');
    roomName = localStorage.getItem('room');
    yourId = localStorage.getItem('id');
    return (userName != undefined && roomName != undefined && yourId != undefined) 
    && (userName.length > 0 && roomName.length > 0 && yourId.length > 0)
}

async function init() {
    console.log(`${userName} * ${roomName} * ${yourId}`);
    if (isUserExist()) {
        loadData();
    } else {
        //window.location.href = '../index.html';
    }

}

init();

// Live query subscription ===========================================

let query = new Parse.Query('Online');
let subscription = client.subscribe(query);
activeSubs = true;

subscription.on('create', (object) => {
  console.log('object created');
  for (var i = 0; i < onlineUsers.length; i++) {
      let user = onlineUsers[i];
      if (user.get('objectId') == object.get("objectId")) {
        onlineUsers[i] = object;
        break;
      }
  }
  loadOnlineUsers();
});

subscription.on('update', (object) => {
  console.log('object updated');
  if (object.get("admin")) {
    revealVote = object.get("reveal")
    deckType = object.get("deck")
  }else{
    for (var i = 0; i < onlineUsers.length; i++) {
        let o = onlineUsers[i];
        if (o.get("objectId") === object.get("objectId")) {
            o = object;
            break;
        }
    }
  }
  loadOnlineUsers();
});

subscription.on('enter', (object) => {
  console.log('object entered');
});

subscription.on('leave', (object) => {
  console.log('object left');
});

subscription.on('delete', (object) => {
  console.log('object deleted');
  try {
      for (var i = 0; i < onlineUsers.length; i++) {
          let user = onlineUsers[i];
          if (user.get('objectId') == object.get("objectId")) {
            onlineUsers.splice(i, 1);
            break;
          }
      }
      loadOnlineUsers();
  } catch (error) {
    console.log(error);
  }
});

subscription.on('close', () => {
  console.log('subscription closed');
  activeSubs = false;
});

// Window process ====================================

// window.addEventListener( "pageshow", function ( event ) {
//   var historyTraversal = event.persisted || ( typeof window.performance != "undefined" && window.performance.navigation.type === 2 );
//   if ( historyTraversal ) {
//     // Handle page restore.
//     //alert('refresh');
//     window.location.reload();
//   }
// });

// window.onfocus = () => {
//     console.log('onfocus');
//     if (!activeSubs) {
//         console.log('activeSubs - onfocus');
//         location.reload();
//     }
// };

// window.onblur = function() {
//     console.log('onblur');
//     if (!activeSubs) {
//         console.log('activeSubs - onblur');
//         location.reload();
//     }
// };

window.onload= function() {
    console.log('1 - onblur');
    window.onfocus= function () {
    console.log('2 - onfocus');
        if (!activeSubs) {
            console.log('3 - onfocus > reload');
            location.reload();
        }
    }
};
