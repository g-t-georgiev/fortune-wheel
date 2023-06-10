import { getSideLen } from './utils/polygon.js';
import { rand } from './utils/helpers.js';
import appConfig from './app.config.js';

const SECTORS_COUNT = 14;
const ANGLE_PER_SECTOR = 360 / SECTORS_COUNT;

let winningSector = null;

let requestId;
let isSpinning = false;
let targetTimeInMs = 15e3;
let startTime = null;
let rotationStep = 12;
let rotationProgress = 0;
let rotationsCount = 0;

let appWrapper = document.querySelector('.app-wrapper');
let wheelContainerEl = appWrapper.querySelector('.wheel-container-outer');
let spinBtn = wheelContainerEl?.querySelector('.wheel-start-btn');
let wheelSectorsContainerEl = wheelContainerEl?.querySelector('.wheel-container-inner');
let sectorEls = wheelSectorsContainerEl?.querySelectorAll('.wheel-sector');
let hoverFeature = window.matchMedia('(hover: hover)');

const setWheelSectorsBlockSize = function (sector, parentContainer) {
    const wheelRect = parentContainer.getBoundingClientRect();
    const wheelRadius = wheelRect.width / 1.95;
    const sideLen = getSideLen(SECTORS_COUNT, wheelRadius);
    console.log(sideLen);
    sector.style.setProperty('--wheel-sector-block-size', sideLen + 'px');
};

document.addEventListener('DOMContentLoaded', () => {
    if (
        !wheelContainerEl ||
        !wheelSectorsContainerEl ||
        !spinBtn
    ) {
        // create wheel outer container if not defined
        !wheelContainerEl &&
            (
                wheelContainerEl = document.createElement('div'),
                wheelContainerEl.classList.add('wheel-container-outer')
            );

        // create wheel inner container if not defined
        !wheelSectorsContainerEl &&
            (
                wheelSectorsContainerEl = document.createElement('div'),
                wheelSectorsContainerEl.classList.add('wheel-container-inner'),
                wheelContainerEl.append(wheelSectorsContainerEl)
            );

        // create wheel start button if not defined
        !spinBtn &&
            (
                spinBtn = document.createElement('button'),
                spinBtn.setAttribute('type', 'button'),
                spinBtn.classList.add('wheel-start-btn'),
                spinBtn.textContent = 'Go',
                wheelContainerEl.append(spinBtn)
            );

        // console.log(wheelContainerEl, wheelSectorsContainerEl, spinBtn);


        // append elements in their respective parent elements if not already connected to the DOM
        !wheelContainerEl.isConnected && appWrapper.append(wheelContainerEl);
    }

    sectorEls = [...wheelSectorsContainerEl.querySelectorAll('.wheel-sector')];

    if (!sectorEls.length) {

        for (let i = 0; i < SECTORS_COUNT; i++) {
            const dataSrc = appConfig.data[i];

            const sector = document.createElement('div');
            sector.classList.add('wheel-sector', `clr-${dataSrc.color}`);
            sector.dataset.id = dataSrc.id;
            sector.dataset.value = dataSrc.value;

            const sectorHoverOverlay = document.createElement('div');
            sectorHoverOverlay.classList.add('wheel-sector-overlay');

            const sectorContent = document.createElement('div');
            sectorContent.classList.add('wheel-sector-content');
            sectorContent.textContent = dataSrc.text;

            sector.append(sectorHoverOverlay, sectorContent);

            sectorEls.push(sector);
        }

        wheelSectorsContainerEl.append(...sectorEls);
    }

    sectorEls.forEach(sector => {
        setWheelSectorsBlockSize(sector, sector.parentElement);
    });

    const startBtnClickHandler = function () {
        if (isSpinning) {
            // Do something while wheel is spinning...
            return;
        }

        isSpinning = true;
        requestId = window.requestAnimationFrame(animationFrameCb);
    };

    if (hoverFeature.matches) {
        spinBtn.addEventListener('click', startBtnClickHandler);
    } else {
        spinBtn.addEventListener('pointerdown', startBtnClickHandler);
    }
});

window.addEventListener('resize', () => {
    sectorEls.forEach(sector => {
        setWheelSectorsBlockSize(sector, sector.parentElement);
    });
});

// Wheel spin logic

// Easing function
function easeInCubic(t) {
    return t * t * t;
}

const animationFrameCb = function (timestamp) {
    if (startTime == null) {
        startTime = timestamp;
    }

    const elapsedTime = timestamp - startTime;
    const timeProgress = elapsedTime / targetTimeInMs;
    const easingFactor = easeInCubic(1 - timeProgress);
    const rotationProgressWithEasing = rotationStep * easingFactor;

    if (elapsedTime < targetTimeInMs) {
        // rotationProgress += rotationStep;
        rotationProgress += rotationProgressWithEasing;

        if (rotationProgress >= 360) {
            rotationsCount++;
            console.log(`${rotationsCount} rotation(s) occurred`);
        }

        rotationProgress = rotationProgress % 360;

        wheelSectorsContainerEl.style.setProperty('transform', `rotateZ(${rotationProgress}deg)`);
        window.requestAnimationFrame(animationFrameCb);
    } else {
        isSpinning = false;
        startTime = null;
        rotationsCount = 0;

        // Calculate the angle of the winning sector
        const angleOffset = ANGLE_PER_SECTOR / 2;
        const winningSectorAngle = 360 - rotationProgress + angleOffset;
        const sectorsCount = sectorEls.length;
        const anglePerSector = 360 / sectorsCount;

        // Determine the winning sector index
        let winningSectorIndex = Math.floor(winningSectorAngle / anglePerSector);
        winningSectorIndex = winningSectorIndex % sectorsCount;

        winningSector = sectorEls[winningSectorIndex];

        console.log(`Winning sector angle: ${winningSectorAngle}`);
        console.log(`Winning sector index: ${winningSectorIndex}`);
        console.log('Winning sector:', winningSector);
        console.log(`Rotation: ${rotationProgress}; Time elapsed from start: ${elapsedTime}`);
        cancelAnimationFrame(requestId);
    }
};

