const possibleColors = ["orange", "green", "pink", "yellow", "red", "blue"];
var selectedRow = 11;
var secret = [];


window.addEventListener("load", (event) => {
    var elements = [];
    secret = generateSecret();
    paintSecret(secret);
    console.log(secret);

    elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div:not(.rowAnimation)");
    addListeners(elements);

    document.getElementById("check").addEventListener("click", nextRow);
    document.addEventListener("keyup", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            let elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
            elements.forEach(item => {
                console.log(item);
                try{
                    item.removeChild(item.firstChild);
                } catch(e){
                }
            })
            nextRow();
        }
    });
});

function nextRow(){
    var elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div:not(.rowAnimation)");
    let colors = getPlayingRowColors(elements);
    if(colors.includes(undefined)){
        row = document.querySelector("#grid > div:nth-child("+selectedRow +")");
        row.classList.add("headShake");
        row.addEventListener("animationend", () => {
            row.classList.remove("headShake");
        });
    }
    else {
        console.log(colors);
        hints = checkSecret(secret, colors);
        removeListeners(elements);
        paintHints(hints)
        .then(()=>{
            if(hints.toString() == new Array(0, 0, 0, 0).toString()){
                console.log("You won");
            }
            if(selectedRow == 2){
                console.log("You lost");  
            }
            selectedRow--;
            elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
            highlightsRow();
            if(selectedRow != 1){
                addListeners(elements);
            }
        })
    }
}

function highlightsRow(){
    let row = document.querySelector("#grid > div:nth-child("+(selectedRow + 1)+")");
    let animationRow = document.querySelector("#grid > div:nth-child("+(selectedRow + 1)+") > div.rowAnimation");

    console.log(selectedRow)
    if(selectedRow == 1){
        let row2 = document.querySelector("#grid > div:nth-child("+selectedRow+")");
        row2.classList.remove("hidden");
    }
    else {
        animationRow.classList.add("animating");
        animationRow.classList.add("slideOutUp");
        row.classList.remove("selected-row");
    
        animationRow.addEventListener("animationend", () => {
            animationRow.classList.remove("animating");
            animationRow.classList.remove("slideOutUp");
            let row2 = document.querySelector("#grid > div:nth-child("+selectedRow+")");
            row2.classList.add("selected-row");
        });
    }
}

function addListeners(elements){
    elements.forEach(item => {
        item.addEventListener("click", buttonClicked);
        item.addEventListener("mouseenter", showColorMenu);
        item.addEventListener("mouseleave", hideColorMenu);
    })
}

function removeListeners(elements){
    elements.forEach(item => {
        item.removeEventListener("click", buttonClicked);
        item.removeEventListener("mouseenter", showColorMenu);
        item.removeEventListener("mouseleave", hideColorMenu);
    })
}

function showColorMenu(evt){
    let element = evt.currentTarget;
    console.log(element);
    let menuDiv = document.createElement("div");
    menuDiv.classList.add("color-menu");
    element.appendChild(menuDiv);
    
    setTimeout(()=>{
        for(let i = 0; i < possibleColors.length; i++){
            let menuItemDiv = document.createElement("div");
            menuItemDiv.classList.add("color-menu-item");
            menuItemDiv.dataset.color = possibleColors[i];
            menuItemDiv.addEventListener("click", menuItemClicked);
            menuDiv.appendChild(menuItemDiv);
        }
    }, 300);
}

function hideColorMenu(evt){
    let element = evt.currentTarget;
    element.removeChild(element.firstChild);
    console.log(element);
}

function menuItemClicked(evt){
    let element = evt.currentTarget;
    let color = element.dataset.color;
    let parent = element.parentElement.parentElement;

    if(possibleColors.includes(color)){
        parent.dataset.color = color;
        parent.classList.add("bounceIn");
        parent.addEventListener("animationend", () => {
            parent.classList.remove("bounceIn");
        });
    }
    console.log(color);
}

function getParent (element, hasClass) {
    let parent = element.parentNode

    while (parent !== document) {
        return parent.className.includes(hasClass);
    } 
}

function buttonClicked(evt){
    if(!evt.target.classList.contains("color-menu-item")){
        let element = evt.currentTarget;
        let prevColor = element.dataset.color;
        let index = -1;
        for(var i = 0; i < possibleColors.length; i++){
            if(prevColor === possibleColors[i]){
                index = i;
                break;
            } 
        }
        if(index >= possibleColors.length - 1) index = -1;
        element.dataset.color = possibleColors[index + 1];
        element.classList.add("bounceIn");
        element.addEventListener("animationend", () => {
            element.classList.remove("bounceIn");
        });
    }
}

function generateSecret(){
    let secret = [];
    for(let i = 0; i < 4; i++){
        secret[i] = possibleColors[Math.floor(Math.random() * 6)];
    }
    return secret;
}

function checkSecret(secret, combination){
    console.log(secret);
    console.log(combination);
    let partialCombination = [];
    let result = [];
    let updatedSecret = [...secret];
    for(let i = 0; i < secret.length; i++){
        if(combination[i] == secret[i]){
            partialCombination.push(null);
            updatedSecret.splice(i, 1, "");
            result.push(0);
        }
        else {
            partialCombination.push(combination[i]);
        }
    }
    console.log(partialCombination);

    for(let i = 0; i < secret.length; i++){
        if(updatedSecret.includes(partialCombination[i])){
            updatedSecret.splice(updatedSecret.indexOf(partialCombination[i]));
            result.push(1);
        }
    }
    console.log(result);
    result.sort();
    return result;
}

function getPlayingRowColors(elements){
    let combination = [];
    elements.forEach(item => {
        combination.push(item.dataset.color);
    });
    return combination;
}

function paintSecret(secret){
    let elements = document.querySelectorAll("#secret > div");
    let i = 0;
    elements.forEach(item => {
        item.dataset.color = secret[i];
        i++;
    });
}

function paintHints(hint){
    return new Promise(resolve => {
        let hintElements = document.querySelectorAll("#check-grid > div:nth-child("+selectedRow+") > div");
        let i = 0;
        let defaultWait = 350;
        let additionalTime = 300;
        for(let j = 0; j < hint.length; j++){
            setTimeout(()=>{
                if(hint[j] == 0 || hint[j] == 1){
                    console.log( hintElements[i])
                    hintElements[i].classList.add("tada");
                    hintElements[i].dataset.hint = hint[j] ;
                }
                i++;
            }, defaultWait + (additionalTime * j));
        }
        setTimeout(()=>{
            resolve('resolved');
        }, defaultWait + (additionalTime * 2));
    });
}
