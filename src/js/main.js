import { getSideLen } from './utils/polygon.js';
import { rand, easeInCubic } from './utils/helpers.js';
import appConfig from './app.config.js';

let requestId;
let isSpinning = false;
let startTime = null;
let winningSector = null;
let rotationDurationMs = 5e3;
let rotationStepDeg = 12;
let rotationProgressDeg = 0;
let rotationsCount = 0;

let appWrapper = document.querySelector('.app-wrapper');
let wheelContainerEl = appWrapper.querySelector('.wheel-container-outer');
let spinBtn = wheelContainerEl?.querySelector('.wheel-start-btn');
let wheelSectorsContainerEl = wheelContainerEl?.querySelector('.wheel-container-inner');
let sectorEls = wheelSectorsContainerEl?.querySelectorAll('.wheel-sector');
let hoverFeature = window.matchMedia('(hover: hover)');

const setWheelSectorsBlockSize = function (sector, parentContainer) {
    const wheelRect = parentContainer.getBoundingClientRect();
    const wheelRadius = wheelRect.width / 2;
    const sideLen = Math.floor(getSideLen(appConfig.data.length, wheelRadius));
    console.log(`Sector block size: ${sideLen}px; \nWheel size: ${wheelRect.width}px / ${wheelRect.height}px`);
    sector.style.setProperty('--wheel-sector-block-size',  `${sideLen}px`);
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
        for (let i = 0; i < appConfig.data.length; i++) {
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
        rotationDurationMs = rand(4.5e3, 5e3);
        rotationStepDeg = rand(12, 15);
        startTime = performance.now();
        wheelSpinHandler(startTime);
        // Disable spin button when spin is being triggered
        spinBtn.toggleAttribute('disabled', isSpinning);
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

const wheelSpinHandler = function (timestamp) {
    if (startTime == null) {
        startTime = timestamp;
    }

    const elapsedTimeMs = timestamp - startTime;
    const timeProgress = elapsedTimeMs / rotationDurationMs;
    const easingFactor = easeInCubic(1 - timeProgress);
    // console.log(`Easing factor: ${easingFactor}`);
    const rotationProgressWithEasing = rotationStepDeg * easingFactor;
    // console.log(`Rotation progress w/out easing: ${rotationStepDeg}deg`);
    // console.log(`Rotation progress w/ easing: ${rotationProgressWithEasing}deg`);

    if (elapsedTimeMs < rotationDurationMs) {
        rotationProgressDeg += rotationProgressWithEasing;

        if (rotationProgressDeg >= 360) {
            rotationsCount++;
            console.log(`${rotationsCount} rotation(s) occurred`);
        }

        rotationProgressDeg = rotationProgressDeg % 360;

        wheelSectorsContainerEl.style.setProperty('transform', `rotateZ(${rotationProgressDeg}deg)`);
        requestId = window.requestAnimationFrame(wheelSpinHandler);
    } else {
        isSpinning = false;
        startTime = null;
        rotationsCount = 0;

        // Calculate the angle of the winning sector
        const sectorsCount = sectorEls.length;
        const anglePerSectorDeg = Number(Number.prototype.toFixed.call(360 / sectorsCount, 2));
        let winningSectorAngleDeg = 360 - rotationProgressDeg;

        // Determine the winning sector index
        let winningSectorIndex = Math.round(winningSectorAngleDeg / anglePerSectorDeg);
        winningSectorIndex = winningSectorIndex % sectorsCount;

        winningSector = sectorEls[winningSectorIndex];

        console.log(`Winning sector angle: ${winningSectorAngleDeg}deg`);
        console.log(`Winning sector index: ${winningSectorIndex}`);
        console.log('Winning sector:', winningSector);
        console.log(`Rotation: ${rotationProgressDeg}deg; Time elapsed from start: ${elapsedTimeMs}ms`);
        cancelAnimationFrame(requestId);
        // Enable spin button upon spin end
        spinBtn.toggleAttribute('disabled', isSpinning);
    }
};

