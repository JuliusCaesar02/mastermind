const possibleColors = ["red", "green", "black", "yellow", "white", "blue"];
var selectedRow = 1;
var secret = [];


window.addEventListener("load", (event) => {
    var elements = [];
    secret = generateSecret();
    paintSecret(secret);
    console.log(secret);

    elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
    addListeners(elements);

    document.getElementById("check").addEventListener("click", ((e)=>{
        let colors = getPlayingRowColors(elements);
        console.log(colors);
        hints = checkSecret(secret, colors);
        if(hints == [1, 1, 1, 1]){
            console.log("You won");
        }
        else console.log(hints);
        removeListeners(elements);
        paintHints(hints);
        selectedRow++;
        elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
        addListeners(elements);
    }));
});

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
    let menuWrapper = document.createElement("div");
    menuDiv.classList.add("color-menu");
    menuWrapper.classList.add("color-menu-wrapper");
    element.appendChild(menuWrapper);
    menuWrapper.appendChild(menuDiv);

    for(let i = 0; i < possibleColors.length; i++){
        let menuItemDiv = document.createElement("div");
        menuItemDiv.classList.add("color-menu-item");
        menuItemDiv.dataset.color = possibleColors[i];
        menuItemDiv.addEventListener("click", menuItemClicked);
        menuDiv.appendChild(menuItemDiv);
    }
}

function hideColorMenu(evt){
    let element = evt.currentTarget;
    element.removeChild(element.firstChild);
    console.log(element);
}

function menuItemClicked(evt){
    let element = evt.currentTarget;
    let color = element.dataset.color;
    let parent = element.parentElement.parentElement.parentElement;

    if(possibleColors.includes(color)){
        parent.dataset.color = color;
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
    if(!evt.target.classList.contains("color-menu") && !evt.target.classList.contains("color-menu-item")){
        let element = evt.currentTarget;
        let prevColor = element.dataset.color;
        let index = 0;
        for(var i = 0; i < possibleColors.length; i++){
            if(prevColor === possibleColors[i]){
                index = i;
                break;
            } 
        }
        element.dataset.color = possibleColors[index + 1];
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
    let elements = document.querySelectorAll("#secret > div > div");
    let i = 0;
    elements.forEach(item => {
        item.dataset.color = secret[i];
        i++;
    });
}

function paintHints(hint){
    elements = document.querySelectorAll("#check-grid > div:nth-child("+selectedRow+") > div");
    let i = 0;
    console.log(elements)
    console.log(hint)
    hint.forEach(item => {
        console.log(item)
        if(item == 0){
            elements[i].dataset.hint = 0;
        }
        else if(item == 1){
            elements[i].dataset.hint = 1;
        }
        i++;
    });
}