import '../css/style.css';
const pathToImgs = require.context('../img', true);

const playButton = document.querySelector('.button-play');
playButton.addEventListener('click', loadGame);

// Temporary loads the game
// TODO: Remove in last version
document.addEventListener('DOMContentLoaded', loadGame);

function loadGame() {
  hideLandingPage();
  showGameField();
  registerPlayer();

  // Temporary loads game
  // TODO: Remove in last version
  toggleRegisterFieldVisibitity();
  startGame(0);
  chooseSpell();
}

function generateMonster() {
  // Array for monster parts
  // Now we use only one part for the whole body
  let parts = [];
  let monster = document.createElement('img');
  monster.src = pathToImgs('./monster-1.png', true);

  return monster;
}

function showHeroes(hero, monster) {
  let heroContainer = document.querySelector('.hero');
  heroContainer.appendChild(hero);

  let monsterContainer = document.querySelector('.monster');
  monsterContainer.appendChild(monster);

  heroContainer.classList.add('hero--appear');
  monsterContainer.classList.add('monster--appear');
}

function startGame(char, level = 1) {
  let character = document.createElement('img');
  character.src = pathToImgs(CHARACTERS[0][char], true);
  let monster = generateMonster();

  showHeroes(character, monster);

  // Level by default is 1
  // If level === 1 showGuide() (guidance how to play, where to click and so on)
  // When monster will be defeated, we can call startGame()
  // again with incremented level
}

function showGameField() {
  let gameField = document.querySelector('.game-container');
  gameField.classList.remove('game-container--hidden');
}

function hideLandingPage() {
  let landing = document.querySelector('.landing-container');
  landing.classList.add('landing-container--hidden');
}

function toggleRegisterFieldVisibitity() {
  let form = document.querySelector('.register-form');
  form.classList.toggle('register-form--hidden');
}

function registerPlayer() {
  toggleRegisterFieldVisibitity();
  initCharacterSelectField();
  let login;
  let mail;
  let char;

  let form = document.querySelector('.register-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    login = document.getElementById('login').value;
    mail = document.getElementById('email').value;
    char = document.querySelector('.role__slide--active').getAttribute('data-slide');
    toggleRegisterFieldVisibitity();
    startGame(char);
  });
}

// this array can be used to make character consist of several parts
// you have to add in array below array of sources to images
// that will be different variants of a body part
// you also have to duplicate .part-select element in index.html
const CHARACTERS = [
  ['./char1.gif',
    './char2.gif',
    './char3.gif']
];


function initCharacterSelectField() {

  let characterSelect = document.querySelector('.character-select');
  let partSelect = [...document.querySelectorAll('.part-select')];
  let roleSliders = [...document.querySelectorAll('.role__slider')];

  roleSliders.forEach((slider, index) => {
    setParts(slider, CHARACTERS[index], index);
  });

  partSelect.forEach((slider) => {
    setSliderEvents(slider);
  });

}

function setParts(slider, sources, index) {

  for (let i = 0; i < sources.length; i++) {
    let partSlide = document.createElement('div');
    partSlide.classList.add('role__slide');
    partSlide.setAttribute('data-slide', i);
    partSlide.style.left = i * 248 + 'px';

    let character = document.createElement('img');
    character.setAttribute('src', pathToImgs(sources[i], true));

    if (i === 0) {
      partSlide.classList.add('role__slide--active');
    }

    slider.appendChild(partSlide);
    partSlide.appendChild(character);
  }
}

function setSliderEvents(slider) {
  // TODO: add listeners for keyboard
  slider.addEventListener('click', slide);
}

function slide(e) {

  let slider = this;
  let slides = [...(slider.querySelector('.role__slider')).children];

  let slidesList = slider.querySelector('.role__slider');
  let activeSlide = slider.querySelector('.role__slide--active');

  let clickedButton = e.target;

  // PREVIOUS BUTTON
  // check if clicked button is 'previous button'
  if (clickedButton.classList.contains('role__prev-button')) {

    // check if active indicator is the first one
    if (activeSlide === slidesList.firstElementChild) {

      // make the last slide active
      let lastSlide = slidesList.lastElementChild;
      lastSlide.classList.add('role__slide--active');

      // switch to the last slide
      let lastSlideNumber = lastSlide.getAttribute('data-slide');
      slides.forEach(slide => {
        slide.style.transform = 'translateX(' + lastSlideNumber * -248 + 'px)';
      });

    } else {
      // make previous indicator active
      let prevSlide = activeSlide.previousElementSibling;
      prevSlide.classList.add('role__slide--active');

      // switch to previous slide
      let prevSlideNumber = prevSlide.getAttribute('data-slide');
      slides.forEach(slide => {
        slide.style.transform = 'translateX(' + prevSlideNumber * -248 + 'px)';
      });
    }

    activeSlide.classList.remove('role__slide--active');
  }

  // NEXT BUTTON
  // check if clicked button is 'next button'
  if (clickedButton.classList.contains('role__next-button')) {

    //check if active indicator is the last one
    if (activeSlide === slidesList.lastElementChild) {

      // make the first indicator active
      let firstSlide = slidesList.firstElementChild;
      firstSlide.classList.add('role__slide--active');

      // switch to the first slide
      let firstSlideNumber = firstSlide.getAttribute('data-slide');
      slides.forEach(slide => {
        slide.style.transform = 'translateX(' + firstSlideNumber * -248 + 'px)';
      });

    } else {

      // make next indicator active
      let nextSlide = activeSlide.nextElementSibling;
      nextSlide.classList.add('role__slide--active');

      // switch to the next slide
      let nextSlideNumber = nextSlide.getAttribute('data-slide');
      slides.forEach(slide => {
        slide.style.transform = 'translateX(' + nextSlideNumber * -248 + 'px)';
      });
    }

    activeSlide.classList.remove('role__slide--active');
  }
}

//Modal dialogue - Choose a Spell
function chooseSpell() {
  let modalChooseSpell = document.getElementById('modal-choose-spell');
  let modalContentChooseSpell = document.getElementById('modal-content-choose-spell');

  toggleElementVisibitity(modalChooseSpell);

  document.body.addEventListener('click', (e) => {
    //event.target is read only
    let eventTarget = e.target;
    let isModalContantClicked = false;

    while (eventTarget !== document.body) {
      if ( eventTarget === modalContentChooseSpell ) {
        isModalContantClicked = true;
      }
      eventTarget = eventTarget.parentElement;
    }

    if (!isModalContantClicked) {
      toggleElementVisibitity(modalChooseSpell);
    }
  });
}

function toggleElementVisibitity(element) {
  element.classList.toggle('modal--hidden');
}