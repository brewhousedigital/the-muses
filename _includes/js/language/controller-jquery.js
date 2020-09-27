// Define Variables
const body = $("body");
const modal = $(".modal-content");
const modalBody = $("#mega-modal .modal-body");
const modalClose = $("#mega-modal .modal-footer button");
const buttonsBlock = $(".generate-buttons-block");
const vocabWordsList = $(".vocab-words-list .row");
const flashcardTracker = $(".flashcard-tracker");


const msg = new SpeechSynthesisUtterance();
const voices = window.speechSynthesis.getVoices();
msg.voice = voices[11];
msg.lang = 'it';


// Browser based text to speech API
function textToSpeech() {
    let firstWord = $(".flash-card").eq(0);
    if(firstWord.attr("data-lang") === "lang-it") {
        firstWord = firstWord.find(".answer .display-2").text();
    } else {
        firstWord = firstWord.find(".question").text();
    }

    if(firstWord.includes(", ")) {
        firstWord = firstWord.replace(", ", " . . . ");
    } else {
        firstWord = firstWord + " . . ";
    }


    msg.text = firstWord;
    window.speechSynthesis.speak(msg);
}



// Flip flash card
body.on("click", ".check-answer", function() {
    let thisEl = $(this);
    let showAnswer = thisEl.parent().parent().find(".answer");
    showAnswer.css("opacity", 1);
    thisEl.parent().find(".correct-answer").prop("disabled", "");
    thisEl.parent().find(".wrong-answer").prop("disabled", "");

    textToSpeech();
});

// Correct Answer trigger
body.on("click", ".correct-answer", function() {
    let thisEl = $(this);
    let questionContainer = thisEl.parent().parent().parent().parent();
    questionContainer.remove();

    let flashcardTrackerNumber = ((15 - $(".flash-card").length) / 15) * 100;
    flashcardTrackerNumber = Math.ceil(flashcardTrackerNumber);
    flashcardTracker.css("width", flashcardTrackerNumber + "%");
    flashcardTracker.attr("aria-valuenow", flashcardTrackerNumber);

    if($(".flash-card").eq(0).length > 0) {
        $(".flash-card").eq(0).fadeIn();
    } else {
        modalBody.append("<h1 class='text-center display-1 font-italic'>Finito</h1>");
    }

});

// Wrong Answer trigger
body.on("click", ".wrong-answer", function() {
    let thisEl = $(this);
    let questionContainer = thisEl.parent().parent().parent().parent();
    questionContainer.hide();
    questionContainer.find(".answer").css("opacity", "0");
    modalBody.append(questionContainer);
    $(".flash-card").eq(0).fadeIn();
});

// Generate and append the card template to the modal
function generateCardTemplate(thisEl, question, answer, pronunciation, loopIndex, newCards) {

    // 50/50 chance to swap Answer and Question to switch things up! yeet!
    let tempAnswer = answer;
    let tempQuestion = question;
    let lang = "lang-it";
    //let languageNote = "<span class='language-note'>english</span>";
    let languageNote = "<div><img src='flag-united-states.png' alt='United States Flag' class='img-fluid' style='max-width: 30px;'></div>";
    if(Math.random() < 0.5) {
        question = tempAnswer;
        answer = tempQuestion;
        lang = "lang-en";
        //languageNote = "<span class='language-note'>italian</span>";
        languageNote = "<div><img src='flag-italy.png' alt='Italian Flag' class='img-fluid' style='max-width: 30px;'></div>";
    }


    let conjugation = "";
    let targetID = "";
    try {
        let html = "";
        let randomNumber = Math.floor(Math.random() * 100000000000);

        //console.log(newCards[loopIndex][3]['presente']);

        for(let i = 0; i < newCards[loopIndex][3]['presente'].length; i++) {
            let item = newCards[loopIndex][3]['presente'][i];
            html += i === 0 ? "<tr><td class='w-50'>" + item + "</td>" : "";
            html += i === 1 ? "<td class='w-50'>" + item + "</td></tr>" : "";
            html += i === 2 ? "<tr><td class='w-50'>" + item + "</td>" : "";
            html += i === 3 ? "<td class='w-50'>" + item + "</td></tr>" : "";
            html += i === 4 ? "<tr><td class='w-50'>" + item + "</td>" : "";
            html += i === 5 ? "<td class='w-50'>" + item + "</td></tr>" : "";
        }

        conjugation = "" +
            "<div class='collapse' id='conjugationTable" + randomNumber + "'>" +
            "<table class='table table-bordered table-dark'>" +
            "<tbody>" +
            html +
            "</tbody>" +
            "</table>" +
            "</div>";

        targetID = "<div class='mb-3'><button class='btn btn-dark btn-sm' type='button' data-toggle='collapse' data-target='#conjugationTable" + randomNumber + "' aria-expanded='' aria-controls='conjugationTable" + randomNumber + "'>Conjugations</button></div>";

        console.log("step 1", conjugation);
    } catch(e) {}

    let template = "" +
        "<div class='flash-card' data-lang='" + lang + "'>" +
        languageNote +
        "<div class='question display-1'>" + question + "</div>" +
        "<div class='answer' style='opacity: 0;'>" +
        "<div class='display-2 font-weight-bolder'>" + answer + "</div>" +
        "<div class='small mb-4'>" + pronunciation + "</div>" +
        "</div>" +
        "<div class='actions mb-5'>" +
        "<button class='btn btn-primary w-100 d-block mb-3 check-answer'>Check</button>" +
        "<div class='row'>" +
        "<div class='col-6'>" +
        "<button class='btn btn-success w-100 d-block correct-answer' disabled>Correct!</button>" +
        "</div><!-- end col -->" +
        "<div class='col-6'>" +
        "<button class='btn btn-danger w-100 d-block wrong-answer' disabled>Dang</button>" +
        "</div><!-- end col -->" +
        "</div><!-- end row -->" +
        "</div><!-- end actions -->" +
        targetID +
        conjugation +
        "</div><!-- end flash card -->";

    console.log("step 2", conjugation);

    thisEl.append(template);
}

// Generate and Append the HTML for the buttons list
function generateButtonTemplate(thisEl, id) {
    let template = "" +
        "<div class='col-md-4 col-6 mb-5 button-block'>" +
        "<button class='btn btn-primary start-flashcard mb-3' data-id='" + id + "' disabled><span class='d-block' style='font-size: 12px;'>Lesson</span>" + id + "</button>" +
        "<div class='custom-control custom-checkbox'>" +
        "<input type='checkbox' class='custom-control-input' id='" + id + "' disabled>" +
        "<label class='custom-control-label' for='" + id + "'>Learnt</label>" +
        "</div>" +
        "</div><!-- end col -->";

    thisEl.append(template);
}

// Shuffle the array so its random each time
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


// Vocab words
body.on("click", ".vocab-expand", function() {
    $(".vocab-words-list").slideToggle(200);
});


// Core Functions
$(document).ready(function() {
    // Unlock the next training row
    body.on("click", ".custom-control-input", function() {
        let thisEl = $(this);
        let parentCol = thisEl.parent().parent();

        if(thisEl.prop("checked") === true) {
            parentCol.next().find("button").prop("disabled", "");
            parentCol.next().find("input").prop("disabled", "");

            let currentCourse = parseInt(localStorage.getItem("italian-course"));
            currentCourse++;
            localStorage.setItem("italian-course", currentCourse);
        } else {
            parentCol.next().find("button").prop("disabled", true);
            parentCol.next().find("input").prop("disabled", true);

            let currentCourse = parseInt(localStorage.getItem("italian-course"));
            currentCourse--;
            localStorage.setItem("italian-course", currentCourse);
        }

    });




    // Start flashcard popup
    body.on("click", ".start-flashcard", function() {
        let thisEl = $(this);
        let thisTarget = parseInt(thisEl.attr("data-id"));
        modalBody.html("");
        let tempArray = [];
        let overflowArray = [];
        let cardCounter = null;

        flashcardTracker.css("width", "0%");
        flashcardTracker.attr("aria-valuenow", "0");

        if(thisTarget > 15) {
            // grab the latest 20
            for(let i = thisTarget; i > thisTarget - 10; i--) {
                tempArray.push(langArray[i]);
            }

            // grab everything else into its own array
            for(let i = 0; i <= thisTarget - 10; i++) {
                overflowArray.push(langArray[i]);
            }

            // shuffle so theyre in a random order
            shuffle(overflowArray);

            // now pick 5 from the whole random list (minus the first 10) and add it to the main array to make 15 total cards.
            for(let i = overflowArray.length - 1; i > overflowArray.length - 6; i--) {
                tempArray.push(overflowArray[i]);
            }

            cardCounter = 15;
        } else {
            for(let i = 0; i < thisTarget; i++) {
                tempArray.push(langArray[i]);
            }

            cardCounter = tempArray.length;
        }

        console.log(tempArray);
        shuffle(tempArray);

        for(let i = 0; i < cardCounter; i++) {
            generateCardTemplate(modalBody, tempArray[i][0], tempArray[i][1], tempArray[i][2], i, tempArray)
        }

        $('#mega-modal').modal('show');
        $(".flash-card").eq(0).fadeIn();
    });




    body.on("click", ".practice-all-btn", function() {
        let thisEl = $(this);
        let thisTarget = parseInt($(".custom-control-input:checked").length) + 1;
        modalBody.html("");
        let tempArray = [];
        let overflowArray = [];
        let cardCounter = null;

        flashcardTracker.css("width", "0%");
        flashcardTracker.attr("aria-valuenow", "0");

        if(thisTarget > 15) {
            // grab everything into its own array
            for(let i = 0; i <= thisTarget; i++) {
                overflowArray.push(langArray[i]);
            }

            // shuffle so theyre in a random order
            shuffle(overflowArray);

            // now pick 15 from the whole random list and add it to the main array to make 15 total cards.
            for(let i = 0; i < 15; i++) {
                tempArray.push(overflowArray[i]);
            }

            cardCounter = 15;
        } else {
            for(let i = 0; i < thisTarget; i++) {
                tempArray.push(langArray[i]);
            }

            cardCounter = tempArray.length;
        }

        console.log(tempArray);
        shuffle(tempArray);

        for(let i = 0; i < cardCounter; i++) {
            generateCardTemplate(modalBody, tempArray[i][0], tempArray[i][1], tempArray[i][2], i, tempArray)
        }

        $('#mega-modal').modal('show');
        $(".flash-card").eq(0).fadeIn();
    });





    // Generate buttons on load * this should use localstorage for tracking
    for(let i = 1; i <= langArray.length; i++) {
        generateButtonTemplate(buttonsBlock, i);
    }

    // Load first button
    if(localStorage.getItem("italian-course") === null) {
        localStorage.setItem("italian-course", "0");
    }
    let currentCourse = parseInt(localStorage.getItem("italian-course"));
    let firstButton = null;

    for(var i = 0; i <= currentCourse; i++) {
        firstButton = buttonsBlock.find(".button-block").eq(i);
        firstButton.find("button").prop("disabled", "");
        firstButton.find("input").prop("disabled", "");
        if(currentCourse !== i) {
            firstButton.find("input").prop("checked", true);
        }
    }

    if(currentCourse !== 0) {
        $('html, body').animate({
            scrollTop: buttonsBlock.find(".button-block").eq(currentCourse).offset().top - 20
        }, 500);
    }


    let vocabListHTML = "";
    for(let i = 0; i < langArray.length; i++) {
        let lessonNumber = i + 1;
        let italianWord = "" +
            "<div class='col-6 text-right py-2' data-toggle='tooltip' data-placement='left' title='Lesson " + lessonNumber + "'>" +
            langArray[i][1] +
            "</div>";
        let englishWord = "<div class='col-6 py-2'>" + langArray[i][0] + "</div>";
        vocabListHTML = vocabListHTML + italianWord + englishWord;
    }

    vocabWordsList.append(vocabListHTML);


    // Enable tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

});
