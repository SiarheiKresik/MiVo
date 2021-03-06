import "../assets/css/style.css";
import monsterNames from './json/monsterNames.json';
import dictionary from './json/dictionary.json';
import words from './json/words.json';
import antonyms from './json/antonyms.json';
import oddWords from './json/oddword.json';
import casesDB from './json/cases.json';
import animals from './json/animals.json';
import spelling from './json/spelling.json';
import questions from './json/questions.json';
import cities from './json/cities.json';
import colors from './json/word-colors.json';
import monsterPhrases from './json/monsterPhrases.json';
import heroPhrases from './json/heroPhrases';
import $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui/ui/widgets/selectable';
import 'jquery-ui/ui/disable-selection';
import View from "./View";

$(document).ready(registerPlayer);

function initHero(heroName, char) {
  $(".hero").css("backgroundPosition", -(12 - char) * 267 + "px 0");
  view.setHeroName(heroName);
}

function registerPlayer() {

  let form = $(".register-form");
  let infoPanel = $(".game-info-panel");
  view.initCharacterSelectField();
  let login;
  let mail;
  let char;

  form.on("submit", e => {
    e.preventDefault();
    login = $("#login").val();
    mail = $("#email").val();
    char = $(".role__slide--active").attr("data-slide");
    view.toggleElementVisibility(form);
    view.toggleElementVisibility(infoPanel);
    initHero(login, char);
    startGame();
  });
}

function startGame(level = 1) {

  view.setFullHealth();
  let mp3 = require('./../assets/audio/round-1-fight.mp3');
  let audioPlayer = new Audio(mp3);

  if (level !== 1) {
    changeMonster();
    mp3 = require('./../assets/audio/r2d2.mp3');
    audioPlayer = new Audio(mp3);
  } else {
    generateMonster();
    view.showHeroes();
  }

  let monsterName = generateMonsterName();
  view.setLevel(level);
  view.setMonsterName(monsterName);
  
  $(".monster").one( 'transitionend', view.showFightBox)
  .one( 'transitionend', audioPlayer.play.bind(audioPlayer));

  $(".fight-box").one('animationend', () => {
    
    let greetingsHeroMessage = `${getRandomPhrase(heroPhrases.hello)}, ${$(".state__name--monster").text().split(" ")[2]}!`;
    sayAfterDelay(view.showHeroMessage.bind(view), greetingsHeroMessage, 1000);

    let greetingsMonsterMessage = `${getRandomPhrase(monsterPhrases.hello)}, ${$(".state__name--hero").text() ? $(".state__name--hero").text() : "чужестранец"}!`;
    sayAfterDelay(view.showMonsterMessage.bind(view), greetingsMonsterMessage, 3000);

    if (level === 1) {
      setTimeout(chooseSpell, 5000);
    } else {
      let modalChooseSpell = $('#choose-spell');
      setTimeout(() => { view.toggleElementVisibility(modalChooseSpell); }, 5000);
    }
  });
}

function generateMonster() {
  let headsNum = 28;
  let bodiesNum = 23;
  let satellitesNum = 5;

  let monsterHead = $("<div>")
    .addClass("monster__head")
    .css('backgroundPosition',
      Math.round(Math.random() * (headsNum + 1)) * 184 + "px 0");

  let monsterBody = $("<div>")
    .addClass("monster__body")
    .css('backgroundPosition',
      Math.round(Math.random() * (bodiesNum + 1)) * 234 + "px 0");

  let monsterSatellite = $("<div>")
    .addClass("monster__satellite")
    .css('backgroundPosition',
      Math.round(Math.random() * (satellitesNum + 1)) * 92 + "px 0");

  let monsterFigure = $('<div>')
    .addClass('monster__figure')
    .append(monsterHead)
    .append(monsterBody);

  let monster = $('.monster')
    .append(monsterFigure)
    .append(monsterSatellite);

  createMonsterDialogue(monsterFigure);
}

function createMonsterDialogue(monsterDiv) {

  let monsterMessage = $("<p>")
    .addClass("dialogue__monster-message");

  let monsterDialogue = $("<div>")
    .addClass("dialogue__monster")
    .addClass("dialogue--hidden")
    .append(monsterMessage);

  monsterDiv.append(monsterDialogue);
}

function changeMonster() {
  let monster = $('.monster');
  monster.addClass('monster--hide')
  .one('transitionend', () => {
    view.clearContainer(monster);
    generateMonster();
    monster.removeClass('monster--hide');
  });
}

function generateMonsterName() {

  let name = '';
  let i = 0;
  let j = 0;
  let k = 0;

  i = getRandomInt(0, monsterNames.adj.length - 1);
  name += monsterNames.adj[i] + ' ';
  j = getRandomInt(0, monsterNames.root.length - 1);
  name += monsterNames.root[j] + ' ';
  k = getRandomInt(0, monsterNames.name.length - 1);
  name += monsterNames.name[k];

  return name;
}

function chooseSpell() {

  let modalChooseSpell = $('#choose-spell');
  view.toggleElementVisibility(modalChooseSpell);
  generateSpellsForNextRound();

  $('body').on('click', view.checkModalChooseSpellClicked);
}

function setSpellTask(spell, generateSpellTask) {
  let modalChooseSpell = $('#choose-spell');
  let taskScreen = $('#task');
  spell.on('click', () => {
    view.toggleElementVisibility(modalChooseSpell);
    $('body').off('click', view.checkModalChooseSpellClicked);
  });
  spell.on('click', () => {
    view.toggleElementVisibility(taskScreen);
  });
  spell.on('click', generateSpellTask);
}

function fightRound(isAnswerCorrect, correctAnswer) {

  let isDead = false;
  let modalChooseSpell = $('#choose-spell');
  let monsterHealth = $('.state__health-monster');
  let heroHealth = $('.state__health-hero');

  let answerToShow = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
  answerToShow = capitalizeFirstLetter(answerToShow);

  if (isAnswerCorrect) {

    view.showMonsterMessage(getRandomPhrase(monsterPhrases.surprise));
    view.showHeroMessage(getRandomPhrase(heroPhrases.correctAnswer));
    isDead = damageOpponent('monster', monsterHealth, maxDamageFromUser);

    if (isDead) {
      return;
    }

    $('.spell').one('animationend', () => {
      isDead = damageOpponent('hero', heroHealth, maxDamageFromMonster);
      if (!isDead) {
        setTimeout(() => {
          view.toggleElementVisibility(modalChooseSpell);
        }, 4000);
      }
    });

    if (isDead) {
      return;
    }
  } else {
    let messageMonsterSay = getRandomPhrase(monsterPhrases.wrongAnswer);
    sayAfterDelay(view.showMonsterMessage.bind(view), messageMonsterSay, 0);
    messageMonsterSay = getRandomPhrase(monsterPhrases.correctAnswer);
    sayAfterDelay(view.showMonsterMessage.bind(view), `${messageMonsterSay} ${answerToShow}`, 700);
    isDead = damageOpponent('hero', heroHealth, maxDamageFromMonster);

    $('.spell').one('animationend', () => {
      if (!isDead) {
        setTimeout(() => {
          view.toggleElementVisibility(modalChooseSpell);
        }, 1000);
      }
    });

    if (isDead) {
      return;
    }
  }

  generateSpellsForNextRound();
}

function getRandomPhrase(arrayOfPhrases) {
  let randomPhraseNumber = getRandomInt(0, arrayOfPhrases.length - 1);
  return arrayOfPhrases[randomPhraseNumber];
}

function damageOpponent(opponent, opponentHealth, maxDamage) {

  const monsterAnimations = ['fist-monster', 'meteorite-monster'];
  const heroAnimations = ['fist-hero', 'meteorite-hero'];

  let currentDamage = Math.floor((Math.random() * maxDamage));
  let durationSpellAnimation = 2000;

  let isDead = checkIsDead(opponentHealth, currentDamage);

  let animation;
  let phrase;
  let message;
  let messageToSay;

  if (opponent === 'monster') {
    animation = heroAnimations;
    phrase = monsterPhrases;
    message = view.showMonsterMessage.bind(view);
  } else {
    animation = monsterAnimations;
    phrase = heroPhrases;
    message = view.showHeroMessage.bind(view);
  }

  let mp3 = require('./../assets/audio/punch.mp3');

  if (currentDamage > maxDamage * 0.8) {
    durationSpellAnimation = view.castSpell(animation[1]);
    messageToSay = getRandomPhrase(phrase.criticalDamage);
    sayAfterDelay(message, messageToSay, durationSpellAnimation);
    mp3 = require('./../assets/audio/meteorite.mp3');
  } else if (currentDamage < maxDamage * 0.2) {
    durationSpellAnimation = view.castSpell(animation[0]);
    messageToSay = getRandomPhrase(phrase.weakDamage);
    sayAfterDelay(message, messageToSay, durationSpellAnimation);
    mp3 = require('./../assets/audio/weakHit.mp3');
  } else {
    durationSpellAnimation = view.castSpell(animation[0]);
    messageToSay = getRandomPhrase(phrase.normalDamage);
    sayAfterDelay(message, messageToSay, durationSpellAnimation);
  }

  $('.spell').one('animationend', () => {
    view.reduceHealth(opponentHealth, currentDamage);

    const audioPlayer = new Audio(mp3);
    audioPlayer.play();

    if (isDead) {
      if (opponent === 'monster') {
        opponentHealth.one('transitionend', () => {
          let mp3 = require('./../assets/audio/applause.mp3');
          let audioPlayer = new Audio(mp3);
          audioPlayer.play();
          finishRound();
          setTimeout(() => {
            startGame(+($('.level__num').text()) + 1);
          }, 2000);
        });
      } else {
        opponentHealth.one('transitionend', () => {
          let mp3 = require('./../assets/audio/gameOver.mp3');
          const audioPlayer = new Audio(mp3);
          setTimeout(() => {
            audioPlayer.play();
          }, 2000);
          finishGame();
        });
      }
    }
  });

  return isDead;
}

function checkIsDead(healthBar, currentDamage) {
  let health = Number.parseInt(view.getWidth(healthBar));
  if (health - currentDamage <= 0) {
    return true;
  }
  return false;
}

let maxDamageFromUser = 60;
let maxDamageFromMonster = 40;

function finishRound() {
  view.showHeroMessage(getRandomPhrase(heroPhrases.victory));
  maxDamageFromUser -= 1;
  maxDamageFromMonster += 2;
}

function finishGame() {
  let messageMonsterSay = getRandomPhrase(monsterPhrases.victory);
  sayAfterDelay(view.showMonsterMessage.bind(view), messageMonsterSay, 0);

  let winner = {};

  winner.nickName = $('#login').val() || "Грут-аноним";
  winner.email = $('#email').val() || "groot@groot.I.am";

  let currentLevel = $('.level__num').text();

  winner.monsterKilled = +currentLevel - 1;

  let bestPlayers = JSON.parse(localStorage.getItem('top-players')) || [];

  bestPlayers = compareWinnerWithBestPlayers(winner, bestPlayers);

  setTimeout(() => {
    view.showBestPlayers(bestPlayers).bind(view);
  }, 2500);

  localStorage.setItem('top-players', JSON.stringify(bestPlayers));
}

function compareWinnerWithBestPlayers(winner, bestPlayers) {
  const maxNumberOfTopPlayers = 4;
  let currentTopPlayers = bestPlayers.length;

  for (let i = 0; i < maxNumberOfTopPlayers; i++) {
    if (bestPlayers[i] === undefined) {
      bestPlayers.push(winner);
      break;
    } else if (bestPlayers[i].monsterKilled < winner.monsterKilled) {
      bestPlayers.splice(i, 0, winner);

      if (bestPlayers.length === maxNumberOfTopPlayers + 1) {
        bestPlayers.pop();
      }
      break;
    }
  }
  return bestPlayers;
}

function generateTask(taskMessage, conditions, correctAnswer, className, isSortable = false, isSelectable = false) {
  view.toggleSortable(isSortable);
  view.toggleSelectable(isSelectable);

  let taskCondContainer = view.getCondContainer();
  view.clearContainer(taskCondContainer);
  view.showTaskMessage(taskMessage);
  taskCondContainer.addClass('task__condition--' + className);

  let userInput;

  if (className !== 'sortletters' &&
    className !== 'oddword' &&
    className !== 'cases' &&
    className !== 'spelling' &&
    className !== 'comparison' &&
    className !== 'truth-or-lie' &&
    className !== 'city-or-country') {
    userInput = view.createInputForAnswer();
    conditions.push(userInput);
  }

  const taskForm = view.getTaskForm();
  view.appendCondition(taskCondContainer, conditions);

  taskForm.on('submit', solveTask);
  let userAnswer;
  function solveTask() {
    if (userInput) {
      userAnswer = getUserAnswer(className, userInput);
    } else {
      userAnswer = getUserAnswer(className);
    }

    let isAnswerCorrect = checkAnswer(userAnswer, correctAnswer);
    event.preventDefault();
    view.closeTask(taskForm, solveTask);
    fightRound(isAnswerCorrect, correctAnswer);
  }
}

function checkAnswer(userAnswer, correctAnswer) {

  let isCorrect = false;
  if (+userAnswer === correctAnswer || userAnswer === correctAnswer || userAnswer.toLocaleLowerCase() === correctAnswer) {
    return true;
  } else if (Array.isArray(correctAnswer)) {
    correctAnswer.forEach(answer => {
      if (answer === userAnswer || userAnswer.toLocaleLowerCase() === answer) {
        isCorrect = true;
      }
    });
  }

  return isCorrect;
}

function capitalizeFirstLetter(string) {
  if (typeof string === "string") {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return string;
}

function getUserAnswer(className, userInput) {
  if (userInput) {
    return userInput.val();
  }

  let container = view.getCondContainer();
  switch (className) {
    case 'sortletters':
      let letters = [...container.children()];
      letters = letters.map((letter) => {
        return letter.innerText;
      });
      return letters.join('');
      break;
    case 'oddword':
    case 'comparison':
    case 'truth-or-lie':
    case 'city-or-country':
      let select = $('.ui-selected').text();
      return select;
      break;
    case 'cases':
    case 'spelling':
    case 'remember-words':
      return $('.task__input').val();
      break;

    default:
      break;
  }
}

function generateTaskAntonyms() {

  const taskName = "antonyms";
  const taskMessage = "Наколдуй антоним";
  let conditions;

  const keys = ['word', 'antonym'];

  const randomPair = antonyms[getRandomInt(0, antonyms.length - 1)];
  const randomIndex = getRandomInt(0, 1);
  const randomKey = keys[randomIndex];
  const correctAnswerKey = keys[Math.abs(randomIndex - 1)];

  const word = randomPair[randomKey];
  const correctAnswer = randomPair[correctAnswerKey];

  conditions = [word];

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskListening() {

  const taskName = "listening";
  const taskMessage = "Напиши услышанное слово";
  let conditions;

  const randomSet = dictionary[getRandomInt(0, dictionary.length - 1)];
  const word = randomSet['word'];
  const correctAnswer = word;

  utterance.text = word;

  let button = $('<button>')
    .addClass('task__repeat-button')
    .text('Послушать');

  button.on('click', listenAgain);

  function listenAgain() {
    event.preventDefault();
    window.speechSynthesis.speak(utterance);
  }

  conditions = [button];

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskSortLetters() {

  const taskName = 'sortletters';
  const taskMessage = "Двигай буквы и собери слово";
  let conditions = [];

  const randomWord = words[getRandomInt(0, words.length - 1)];
  const correctAnswer = randomWord;
  const letters = shuffle(correctAnswer.split(''));

  letters.forEach((letter) => {
    conditions.push(letter);
  });

  generateTask(taskMessage, conditions, correctAnswer, taskName, true, false);
}

function generateTaskOddWord() {

  const taskName = 'oddword';
  const taskMessage = "Выбери лишнее слово";
  let conditions = [];

  const randomSet = oddWords[getRandomInt(0, oddWords.length - 1)];
  const correctAnswer = randomSet['oddWord'];
  const words = shuffle(randomSet['words']);

  words.forEach((word) => {
    conditions.push(word);
  });

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, true);
}

function generateTaskTranslation() {

  const taskName = "translation";
  const taskMessage = "Переведи слово";
  let conditions;

  const randomSet = dictionary[getRandomInt(0, dictionary.length - 1)];
  const word = randomSet['word'];
  const correctAnswer = randomSet['translation'];

  conditions = [word];

  generateTask(taskMessage, conditions, correctAnswer, taskName);

}

function generateTaskMath() {

  const taskName = 'math';
  const taskMessage = "Реши пример";
  let conditions;

  const min = 1;
  const max = 10;

  const operations = ['add', 'sub', 'mult', 'div'];

  let correctAnswer;
  let firstNumber = getRandomInt(min, max);
  let secondNumber = getRandomInt(min, max);
  let mathOperator;
  let mathOperation = operations[getRandomInt(0, 3)];

  switch (mathOperation) {
    case 'add':
      mathOperator = '+';
      correctAnswer = firstNumber + secondNumber;
      break;
    case 'sub':
      mathOperator = '-';
      if (firstNumber < secondNumber) {
        [firstNumber, secondNumber] = [secondNumber, firstNumber];
      }
      correctAnswer = firstNumber - secondNumber;
      break;
    case 'mult':
      mathOperator = '*';
      correctAnswer = firstNumber * secondNumber;
      break;
    case 'div':
      mathOperator = '÷';
      correctAnswer = firstNumber;
      firstNumber = firstNumber * secondNumber;
      break;
    default:
      break;
  }

  const EQUALS = '=';

  conditions = [firstNumber, mathOperator, secondNumber, EQUALS];

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskCases() {

  const taskName = 'cases';
  const taskMessage = "Введите слово в правильном падеже";
  let conditions = [];

  const cases = casesDB['cases'];
  const randomSet = casesDB['words'][getRandomInt(0, casesDB['words'].length - 1)];
  const randomCaseIndex = getRandomInt(1, randomSet.length - 1);
  const correctAnswer = randomSet[randomCaseIndex];

  for (let i = 0; i < cases.length; i++) {
    conditions.push(cases[i]);
    if (i === randomCaseIndex) {
      let userInput = view.createInputForAnswer(taskName);
      conditions.push(userInput);
    } else {
      conditions.push(randomSet[i]);
    }
  }

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskGuessAnimal() {

  const taskName = "guess-animal";
  const taskMessage = "Напиши имя животного";
  let conditions;

  const randomAnimal = animals[getRandomInt(0, animals.length - 1)];
  const randomAnimalPos = randomAnimal['coordinates'];
  const correctAnswer = randomAnimal['answers'];

  let img = $('<img>')
    .addClass('task__img')
    .css('backgroundPosition', randomAnimalPos);
  conditions = [img];

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskSpelling() {

  const taskName = 'spelling';
  const taskMessage = "Вставь букву, две или ничего";
  let conditions = [];

  const randomSet = spelling[getRandomInt(0, spelling.length - 1)];
  const firstPart = randomSet['firstPart'];
  const secondPart = randomSet['secondPart'];
  const correctAnswer = randomSet['letter'];

  let userInput = view.createInputForAnswer(taskName);
  conditions.push(userInput);

  conditions = [firstPart, userInput, secondPart];

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskSequence() {

  const taskName = "sequence";
  const taskMessage = "Какое число будет следующим";
  let conditions = [];

  const randomNumber = getRandomInt(0, 50);
  const stepInSequence = getRandomInt(1, 9);
  const isAddition = getRandomInt(0, 1);
  let correctAnswer;

  if (isAddition) {
    conditions.push(randomNumber);
    conditions.push(randomNumber + stepInSequence);
    conditions.push(randomNumber + 2 * stepInSequence);

    correctAnswer = randomNumber + 3 * stepInSequence;
  } else {
    conditions.push(randomNumber + 3 * stepInSequence);
    conditions.push(randomNumber + 2 * stepInSequence);
    conditions.push(randomNumber + stepInSequence);

    correctAnswer = randomNumber;
  }

  generateTask(taskMessage, conditions, correctAnswer, taskName);
}

function generateTaskComparison() {
  const taskName = 'comparison';
  const taskMessage = 'Сравни числа';
  let conditions;

  const signs = ['>', '<', '='];

  const firstNumber = getRandomInt(1, 100);
  const secondNumber = getRandomInt(1, 100);

  let correctAnswer;

  if (firstNumber > secondNumber) {
    correctAnswer = signs[0];
  } else if (firstNumber < secondNumber) {
    correctAnswer = signs[1];
  } else {
    correctAnswer = signs[2];
  }

  let condCont = $('<div>')
    .addClass('comparison__nums')
    .append($('<p>').text(firstNumber))
    .append($('<p>').text('?'))
    .append($('<p>').text(secondNumber));

  conditions = [condCont];

  signs.forEach((sign) => {
    conditions.push(sign);
  });

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, true);
}

function generateTaskTruthOrLie() {
  const taskName = 'truth-or-lie';
  const taskMessage = 'Правда или нет, что:';
  let conditions;

  let questionIndex = getRandomInt(0, questions.length - 1);
  let question = questions[questionIndex]['question'];

  let correctAnswer = questions[questionIndex]['answer'];

  let questionCont = $('<div>')
    .addClass('truth-or-lie__question')
    .append($('<p>').text(question));

  conditions = [questionCont, 'правда', 'ложь'];

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, true);
}

function generateTaskCityOrCountry() {
  const taskName = 'city-or-country';
  const taskMessage = 'Город или страна?';
  let conditions;

  let randomSet = cities[getRandomInt(0, 1)];
  let nameIndex = getRandomInt(0, randomSet['names'].length - 1);
  let name = randomSet['names'][nameIndex];

  let correctAnswer = randomSet['answer'];

  let nameCont = $('<div>')
    .addClass('city-or-country__name')
    .append($('<p>').text(name));

  conditions = [nameCont, 'город', 'страна'];

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, true);
}

function generateTaskWordColor() {
  const taskName = 'word-color';
  let taskMessage;
  let conditions;
  let correctAnswer;

  let randomColorObj = colors['colors'][getRandomInt(0, colors['colors'].length - 1)];
  let color = randomColorObj['color'];
  let colorName = randomColorObj['name'];
  let word = colors['words'][getRandomInt(0, colors['words'].length - 1)];

  if (getRandomInt(0, 1) === 1) {
    taskMessage = 'Введите цвет слова (не само слово)';
    correctAnswer = colorName;
  } else {
    taskMessage = 'Введите само слово (не его цвет)';
    correctAnswer = word;
  }

  let button = $('<button>')
    .addClass('task__show-button')
    .text('Показать слово')
    .on('click', showWord);

  function showWord() {
    event.preventDefault();
    wordCont.css('visibility', 'visible');
    setTimeout(() => { wordCont.css('visibility', 'hidden') }, 1000);
    $(this).attr('disabled', 'disabled');
  }

  let wordCont = $('<p>')
    .addClass('task__color')
    .css('visibility', 'hidden')
    .css('color', color)
    .text(word);

  conditions = [button, wordCont];

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, false);
}

function generateTaskRememberWords() {
  const taskName = 'remember-words';
  let taskMessage = 'Запомни пять слов и запиши то, которое исчезнет';
  let conditions = [];
  let correctAnswer;

  let randomWords = [];
  for (let i = 0; i < 5; i++) {
    let word = words[getRandomInt(0, words.length - 1)];
    if (randomWords.indexOf(word) === -1) {
      randomWords.push(word);
    } else {
      i--;
    }
  }

  let button = $('<button>')
    .addClass('task__show-button')
    .text('Показать слова')
    .on('click', showWords);

  conditions.push(button);

  let disappearWordIndex = getRandomInt(0, randomWords.length - 1);
  randomWords.forEach((word, index) => {
    if (index === disappearWordIndex) {
      let p = $('<p>')
        .addClass('hide')
        .text(word);
      conditions.push(p);
      correctAnswer = word;
    } else {
      conditions.push(word);
    }
  });


  function showWords() {
    event.preventDefault();
    $('.task__condition--remember-words p')
      .css('visibility', 'visible');
    setTimeout(() => { $('.task__condition--remember-words p.hide').css('visibility', 'hidden') }, 2000);
    $(this).attr('disabled', 'disabled');
  }

  generateTask(taskMessage, conditions, correctAnswer, taskName, false, false);
}

function generateSpellsForNextRound(numberOfSpells = 4) {

  const taskMath = 'task--math';
  const taskTranslation = 'task--translation';
  const taskSortLetters = 'task--sort-letters';
  const taskListening = 'task--listening';
  const taskAntonyms = 'task--antonyms';
  const taskOddWord = 'task--odd-word';
  const taskCases = 'task--cases';
  const taskAnimals = 'task--animals';
  const taskSpelling = 'task--spelling';
  const taskSequence = 'task--sequence';
  const taskComparison = 'task--comparison';
  const taskTruthOrLie = 'task--truth-or-lie';
  const taskCityOrCountry = 'task--city-or-country';
  const taskWordColor = 'task--word-colors';
  const taskRememberWords = 'task--remember-words';

  const TASKS = [
    taskMath,
    taskTranslation,
    taskSortLetters,
    taskListening,
    taskAntonyms,
    taskOddWord,
    taskCases,
    taskAnimals,
    taskSpelling,
    taskSequence,
    taskComparison,
    taskTruthOrLie,
    taskCityOrCountry,
    taskWordColor,
    taskRememberWords
  ];

  const spells = $('#spells');

  view.clearContainer(spells);

  let taskOptions = TASKS.slice(0);

  let maxNumberOfSpells = taskOptions.length;

  if (numberOfSpells > maxNumberOfSpells) {
    numberOfSpells = maxNumberOfSpells;
  }

  for (let i = 0; i < numberOfSpells; i++) {

    let randomIndex = getRandomInt(0, taskOptions.length - 1);
    let randomTaskInArray = taskOptions.splice(randomIndex, 1);
    let randomTask = randomTaskInArray[0];

    let spell = $('<img>')
      .addClass("spells__item")
      .addClass(randomTask);

    spells.append(spell);

    switch (randomTask) {
      case taskMath:
        setSpellTask(spell, generateTaskMath);
        break;
      case taskTranslation:
        setSpellTask(spell, generateTaskTranslation);
        break;
      case taskSortLetters:
        setSpellTask(spell, generateTaskSortLetters);
        break;
      case taskListening:
        setSpellTask(spell, generateTaskListening);
        break;
      case taskAntonyms:
        setSpellTask(spell, generateTaskAntonyms);
        break;
      case taskOddWord:
        setSpellTask(spell, generateTaskOddWord);
        break;
      case taskCases:
        setSpellTask(spell, generateTaskCases);
        break;
      case taskAnimals:
        setSpellTask(spell, generateTaskGuessAnimal);
        break;
      case taskSpelling:
        setSpellTask(spell, generateTaskSpelling);
        break;
      case taskSequence:
        setSpellTask(spell, generateTaskSequence);
        break;
      case taskComparison:
        setSpellTask(spell, generateTaskComparison);
        break;
      case taskTruthOrLie:
        setSpellTask(spell, generateTaskTruthOrLie);
        break;
      case taskCityOrCountry:
        setSpellTask(spell, generateTaskCityOrCountry);
        break;
      case taskWordColor:
        setSpellTask(spell, generateTaskWordColor);
        break;
      case taskRememberWords:
        setSpellTask(spell, generateTaskRememberWords);
        break;
    }
  }
}

function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sayAfterDelay(func, message, delay) {
  setTimeout(() => {
    func(message);
  }, delay);
}

$(function () {
  $(".task__condition").sortable({
    axis: "x",
    cursor: "move"
  });
  $(".task__condition").disableSelection();
});

$(function () {
  $(".task__condition").selectable();
});

// Object used to speak
let utterance = new SpeechSynthesisUtterance();

// View object
let view = new View();