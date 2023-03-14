const possibleColors = ["orange", "green", "pink", "yellow", "red", "blue"];
var selectedRow = 11;
var secret = [];
var difficulty;

window.addEventListener("load", chooseDifficulty);

/***
 * Show difficuty menu
 */
function chooseDifficulty(){
    document.getElementById("difficulty-popup").classList.remove("hidden");
    let difficultyButtons = document.querySelectorAll("#difficulty-popup div div.item");
    difficultyButtons.forEach(item => {
        item.addEventListener("click", setDifficulty);
    });
}

/***
 * Apply selected difficulty
 */
function setDifficulty(evt){
    document.getElementById("difficulty-popup").classList.add("hidden");
    difficulty = parseInt(evt.currentTarget.dataset.difficulty);
    
    resetBoard();
}

/***
 * Reset the board from the previous game
 */
function resetBoard(){
    selectedRow = 11;
    secret = generateSecret(difficulty);

    document.getElementById("secret").classList.add("hidden");

    var elements = document.querySelectorAll("#grid div[data-color]");
    console.log(elements)
    elements.forEach(item => {
        item.removeAttribute("data-color");
    });
    elements = document.querySelectorAll("#check-grid div[data-hint]");
    elements.forEach(item => {
        item.removeAttribute("data-hint");
    });

    elements = document.querySelectorAll("#grid .selected-row");
    console.log(elements)
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("selected-row");
    }

    let row = document.querySelector("#grid > div:nth-child("+selectedRow+")");
    row.classList.add("selected-row");

    paintSecret(secret);
    highlightsRow();
    console.log(secret);

    elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div:not(.rowAnimation)");
    addListeners(elements);

    addNextRowListeners();
}

/***
 * Checks the clicked keyboard key, remove eventual color menu and calls the function to 
 * check the current row and go on with the next
 */
function nextRowKeyboard(event){
    if (event.key === "Enter" || event.key === " ") {
        let elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
        elements.forEach(item => {
            try{
                item.removeChild(item.firstChild);
            } catch(e){
            }
        })
        nextRow();
    }
}

function addNextRowListeners(){
    document.getElementById("check").addEventListener("click", nextRow);
    document.addEventListener("keyup", nextRowKeyboard);
}

function removeNextRowListeners(){
    document.getElementById("check").removeEventListener("click", nextRow);
    document.removeEventListener("keyup", nextRowKeyboard);
}

/***
 * Remove listeners to the check row button and re-add after a few time in order to not skip rows due to spam of inputs
 * 
 * Remove listeners from the row that was played in the previous round
 * 
 * Add listeners to the new row elements
 * 
 * Check if the game is won or lost
 * 
 * Color black/white tacks on the left of the board
 * 
 * Play highlighted row change animation
 */
function nextRow(){
    console.log("remove")
    removeNextRowListeners();
    var elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div:not(.rowAnimation)");
    let colors = getPlayingRowColors(elements);

    setTimeout(() => {
        addNextRowListeners();
    }, 700);

    if(colors.includes(undefined)){
        row = document.querySelector("#grid > div:nth-child("+selectedRow +")");
        row.classList.add("headShake");
        row.addEventListener("animationend", () => {
            row.classList.remove("headShake");
        });
    }
    else {
        hints = checkSecret(secret, colors);
        removeListeners(elements);
        paintHints(hints)
        .then(()=>{
            if(hints.toString() == new Array(0, 0, 0, 0).toString()){
                console.log("You won");
                let secretRow = document.querySelector("#grid > div:nth-child(1)")
                secretRow.classList.remove("hidden");
                setTimeout(()=>{
                    endGame(0);
                }, 1500);
            }
            else if(selectedRow == 2){
                console.log("You lost");  
                let secretRow = document.querySelector("#grid > div:nth-child(1)")
                secretRow.classList.remove("hidden");
                setTimeout(()=>{
                    endGame(1);
                }, 1500);
            }
            else{
                selectedRow--;
                elements = document.querySelectorAll("#grid > div:nth-child("+selectedRow+") > div");
                highlightsRow();
                addListeners(elements);
            }
        })
    }
}

/***
 * Display game win / game lost popup
 * @param {boolean} winLose 0: Game won 1: Game lost
 */
function endGame(winLose){
    var popup = document.getElementById("end-game-popup");
    popup.classList.remove("hidden");

    h1 = document.querySelector("#end-game-popup h1");

    if(winLose == 0){
        h1.textContent = "YOU WON!";
    }
    else if(winLose == 1){
        h1.textContent = "You lost...";
    }
    document.getElementById("checkBoard-button").addEventListener("click", ()=>{
        console.log(popup.classList)
        popup.classList.add("hidden");
        setTimeout(()=>{
            document.addEventListener("click", showPopUp);
        }, 300)
        
        function showPopUp(){
            popup.classList.remove("hidden");
            document.removeEventListener("click", showPopUp);
        }
    });

    document.getElementById("tryAgain-button").addEventListener("click", ()=>{
        popup.classList.add("hidden");
        resetBoard();
    });
    document.getElementById("changeDifficulty-button").addEventListener("click", ()=>{
        popup.classList.add("hidden");
        resetBoard();
        chooseDifficulty();
    });
}

/***
 * Remove the old highlighted row and highlight the new row, 
 * doing trickery in order to "animate" only the background of the tacks and not also the tacks themselfes.
 */
function highlightsRow(){
    let row = document.querySelector("#grid > div:nth-child("+(selectedRow + 1)+")");
    let animationRow = document.querySelector("#grid > div:nth-child("+(selectedRow + 1)+") > div.rowAnimation");

    if(selectedRow == 1){
        let row2 = document.querySelector("#grid > div:nth-child("+selectedRow+")");
        row2.classList.remove("hidden");
    }
    else if(selectedRow == 11){

    }
    else{
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

/***
 * Add listeners to all tacks of the row is being played
 * @param {Elements} elements array of dom elements
 */ 
function addListeners(elements){
    elements.forEach(item => {
        item.addEventListener("wheel", showColorMenu);

        item.addEventListener("click", buttonClicked);
        item.addEventListener("mouseenter", showColorMenu);
        item.addEventListener("mouseleave", hideColorMenu);
    })
}

/***
 * Remove listeners to all tacks of the row last round was played
 * @param {Elements} elements array of dom elements
 */ 
function removeListeners(elements){
    elements.forEach(item => {
        item.removeEventListener("click", buttonClicked);
        item.removeEventListener("mouseenter", showColorMenu);
        item.removeEventListener("mouseleave", hideColorMenu);
    })
}

function showColorMenu(evt){
    let element = evt.currentTarget;
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
        //Checks that the menu is not uside the screen and recenters it if needed
        let position = menuDiv.getBoundingClientRect();
        if(position.x < 0) {
            menuDiv.style.right = 147 + position.x +"px";
        }
        if(position.right > document.documentElement.clientWidth){
            menuDiv.style.right = position.right - document.documentElement.clientWidth + 147 +"px";
        }
    }, 300);
}

function hideColorMenu(evt){
    let element = evt.currentTarget;
    element.removeChild(element.firstChild);
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

/****
 * Requires one of the following prefixes: 
 * 
 * 0: No repeating colors
 * 
 * 1: 50% there is a single color repeated twice
 * 
 * 2: Random but colors can't be repeated more than twice
 * 
 * 3: Full random (a single color can even appear four times, or there can also be 4 differents colors)
 * @param {int} difficulty difficulty value of the game
 * 
 */
function generateSecret(difficulty){
    let actualPossibleColors = possibleColors.slice();
    let secret = [];
    switch(difficulty){
        case 0:
            for(let i = 0; i < 4; i++){
                let index = Math.floor(Math.random() * actualPossibleColors.length);
                secret[i] = actualPossibleColors[index];
                actualPossibleColors.splice(index, 1);
            }
            break;
        case 1:
            while(secret.length < 4){
                let index = Math.floor(Math.random() * actualPossibleColors.length);
                secret.push(actualPossibleColors[index]);
                if(secret.length == 1){
                    if(Date.now() % 2){
                        secret.push(actualPossibleColors[index]);
                    }
                }
                actualPossibleColors.splice(index, 1);
            }
            let currentIndex = secret.length,  randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [secret[currentIndex], secret[randomIndex]] = [secret[randomIndex], secret[currentIndex]];
            }
            break;
        case 2:
            while(secret.length < 4){
                let index = Math.floor(Math.random() * actualPossibleColors.length);
                secret.push(actualPossibleColors[index]);
                let newArray = secret.slice();
                newArray.sort();
                if(newArray.length > 2){
                    if(newArray[newArray.length - 1] === newArray[newArray.length - 2] && newArray[newArray.length - 2] === newArray[newArray.length - 3]){
                        actualPossibleColors.splice(index, 1);
                        secret.pop();
                    }
                    if(newArray.length > 3){
                        if(newArray[newArray.length - 2] === newArray[newArray.length - 3] && newArray[newArray.length - 3] === newArray[newArray.length - 4]){
                            actualPossibleColors.splice(index, 1);
                            secret.pop();
                        }
                    }
                }           
            }
            break;
        case 3:
            for(let i = 0; i < 4; i++){
                secret[i] = actualPossibleColors[Math.floor(Math.random() * actualPossibleColors.length)];
            }
            break;
    }
    return secret;
}

/***
 * Checks if the combination elements are present inside the secret ones.
 * 
 * Returns an array of:
 * 
 *  0: color right in the right index)
 * 
 *  1: color right in wrong index
 * @param {string[]} secret array of colors to guess
 * @param {string[]} combination array of colors inputted by the user
 */
function checkSecret(secret, combination){
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

    for(let i = 0; i < secret.length; i++){
        if(updatedSecret.includes(partialCombination[i])){
            updatedSecret.splice(updatedSecret.indexOf(partialCombination[i], 1, ""));
            result.push(1);
        }
    }
    result.sort();
    return result;
}

/***
 * Get the color of the tacks played by the player
 * 
 * Returns an array of string
 * @param {string[]} elements array of HTML dom elements childs of the playing row
 */
function getPlayingRowColors(elements){
    let combination = [];
    elements.forEach(item => {
        combination.push(item.dataset.color);
    });
    return combination;
}

/***
 * Change the color of tacks to guess in the id=secret div
 * @param {string[]} secret array of colours to guess
 */
function paintSecret(secret){
    let elements = document.querySelectorAll("#secret > div");
    let i = 0;
    elements.forEach(item => {
        item.dataset.color = secret[i];
        i++;
    });
}

/***
 * color the black/white tacks on the left side of the boards, timing the animations
 * @param {int[]} hint array of 0/1, result of the comparison between
 *  playing sequence and sequence to guess
 * 
 * return a promise in order to sincronise the animations
 */
function paintHints(hint){
    return new Promise(resolve => {
        let hintElements = document.querySelectorAll("#check-grid > div:nth-child("+selectedRow+") > div");
        let i = 0;
        let defaultWait = 350;
        let additionalTime = 300;
        let animationsToWait = 0;
        for(let j = 0; j < hint.length; j++){
            if(hint[j] == 0 || hint[j] == 1){
                setTimeout(()=>{
                    hintElements[i].classList.add("tada");
                    hintElements[i].dataset.hint = hint[j] ;
                    i++;
                }, defaultWait + (additionalTime * animationsToWait));
                animationsToWait++;
            }
        }
        setTimeout(()=>{
            resolve('resolved');
        }, defaultWait + (additionalTime * animationsToWait));
    });
}
