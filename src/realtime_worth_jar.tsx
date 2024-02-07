import React from 'react';
import catDanceImgSrc from './catdance.gif';
import catVibeImgSrc from './catvibe.gif';
import dollarImgSrc from './dollar.png';
import dogeImgSrc from './doge.gif';
import jarImgSrc from './jar.png';
import pennyImgSrc from './penny.png';
import powellImgSrc from './powell.gif';
import AffirmationContainer from './affirmation';
import Timer from './timer';
import styles from './realtime_worth_jar.module.css';
import { getRandomRange } from './utils';

const targetFps = 60;
const targetMillisPerFrame = Math.round(1000 / targetFps);

type MoneyData = {
  img: string;
  halfWidth: number;
  x: number;
  deltaX: number;
  maxX: number;
  y: number;
  deltaY: number;
  maxY: number;
  rotation: number;
  deltaRotation: number;
  flip: number;
  deltaFlip: number;
  scaleY: number;
  minScaleY: number;
};

type PennyModeData = {
  timer: Timer;
  enabled: boolean;
  pennyOffset: number;
};

const dollarImage = new Image();
dollarImage.src = dollarImgSrc;
const pennyImage = new Image();
pennyImage.src = pennyImgSrc;

function RealtimeWorthJar() {
  const [enableSimulation, setEnableSimulation] =
    React.useState<boolean>(false);
  const width = Math.min(window.innerWidth, 600);
  const height = window.innerHeight;
  const dimensionRef = React.useRef<{ width: number; height: number }>({
    width,
    height,
  });
  const dollarsPerMillisRef = React.useRef<number>(0);

  function startSimulation(dollarsPerHour: number) {
    setEnableSimulation(true);
    dollarsPerMillisRef.current = dollarsPerHour / 60 / 60 / 1000;
  }

  return (
    <div
      className={styles.body}
      style={{
        width: dimensionRef.current.width,
        height: dimensionRef.current.height,
      }}
    >
      {enableSimulation ? (
        <Simulation
          dimensions={dimensionRef.current}
          dollarsPerMillis={dollarsPerMillisRef.current}
        />
      ) : (
        <IntroScreen startSimulation={startSimulation} />
      )}
    </div>
  );
}

function IntroScreen({ startSimulation }: { startSimulation: Function }) {
  const [hourlyIncome, setHourlyIncome] = React.useState<string>('10');
  const workHoursPerYear = 2080;
  const hourlyIncomeNumber = Number(hourlyIncome);
  const annualIncomeNumber = hourlyIncomeNumber * workHoursPerYear;

  let errorMessage: React.ReactElement | null = null;
  if (hourlyIncomeNumber <= 0) {
    errorMessage = (
      <div className={styles.incomeFormErrorMessage}>
        Please come back when you actually start making money
      </div>
    );
  } else if (annualIncomeNumber > 3999999) {
    // Cap income at $4 million.
    errorMessage = (
      <div className={styles.incomeFormErrorMessage}>
        Unfortunately our modest jar cannot handle your gigantic worth :(
        Although we cannot accommodate, we want to at least thank you for your
        very giga-worthy contribution to society, the world, and the value of
        life!
      </div>
    );
  }

  function handleAnnualIncomeChange(e: React.FormEvent<HTMLInputElement>) {
    const anuualIncome = Number((e.target as HTMLInputElement).value);
    setHourlyIncome(String(anuualIncome / workHoursPerYear));
  }

  function handleHourlyIncomeChange(e: React.FormEvent<HTMLInputElement>) {
    setHourlyIncome((e.target as HTMLInputElement).value);
  }

  function handleStartClick() {
    if (errorMessage) {
      return;
    }
    startSimulation(hourlyIncomeNumber);
  }

  return (
    <div className={styles.introScreen}>
      <div className={styles.introScreenContent}>
        <div className={styles.introScreenTitle}>
          Realtime Worth Jar <img src={jarImgSrc} alt=''></img>
        </div>
        <p>
          When you’re sitting through yet another meeting, have you ever
          wondered
          <b>“why am I even still here? What am I doing all this for?”</b> Well
          we’ve got the answer for you!
        </p>
        <p>
          The <b>Realtime Worth Jar</b> (RWJ) can help!
        </p>
        <p>
          This tool will efficiently remind you in real time of just why you’re
          still doing this with the only one life that you’ve got!
        </p>
        <div className={styles.incomeForm}>
          <div className={styles.incomeInputRow}>
            <label>annual income: $</label>
            <input
              className={styles.incomeInput}
              id='annualIncome'
              type='number'
              onInput={handleAnnualIncomeChange}
              maxLength={1}
              value={String(annualIncomeNumber) || ''}
            ></input>
          </div>
          <div className={styles.incomeInputRow}>
            <label>or hourly income: $</label>
            <input
              className={styles.incomeInput}
              id='hourlyIncome'
              type='number'
              onInput={handleHourlyIncomeChange}
              value={hourlyIncome || ''}
            ></input>
          </div>
          {errorMessage}
          <button
            className={styles.introScreenStartButton}
            onClick={handleStartClick}
          >
            start
          </button>
        </div>
      </div>
    </div>
  );
}

function Simulation({
  dimensions,
  dollarsPerMillis,
}: {
  dimensions: { width: number; height: number };
  dollarsPerMillis: number;
}) {
  const [currentTime, setCurrentTime] = React.useState<number>(Date.now());
  const simlationStartTimeRef = React.useRef<number>(Date.now());
  const moneyMountTopRef = React.useRef(dimensions.height - 25);
  const moneyDataListRef = React.useRef<Array<MoneyData>>([
    newDollarData(dimensions.width, moneyMountTopRef.current),
  ]);
  const moneyCountRef = React.useRef(1);
  const prevTimeRef = React.useRef(currentTime);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pennyModeRef = React.useRef<PennyModeData>({
    timer: new Timer(3 * 60 * 1000), // 3 minute initial timer
    enabled: false,
    pennyOffset: 0,
  });

  const millisPerFrame = currentTime - prevTimeRef.current;

  React.useEffect(() => {
    // Runs once per frame.
    function updateFrame() {
      prevTimeRef.current = currentTime;
      setCurrentTime(Date.now());

      // Update money count.
      if (pennyModeRef.current.enabled) {
        const prevMoneyCount = moneyCountRef.current;
        moneyCountRef.current += dollarsPerMillis * millisPerFrame;
        const pennyCount =
          Math.floor(moneyCountRef.current * 100) -
          Math.floor(prevMoneyCount * 100);
        for (let i = 0; i < pennyCount; i++) {
          moneyDataListRef.current.push(
            newPennyData(dimensions.width, moneyMountTopRef.current)
          );
          pennyModeRef.current.pennyOffset =
            (pennyModeRef.current.pennyOffset + 1) % 100;
        }
      } else {
        const prevMoneyCount = moneyCountRef.current;
        moneyCountRef.current += dollarsPerMillis * millisPerFrame;
        const moneyOffsetFromPenny = pennyModeRef.current.pennyOffset * 0.01;
        if (
          Math.floor(prevMoneyCount - moneyOffsetFromPenny) !==
          Math.floor(moneyCountRef.current - moneyOffsetFromPenny)
        ) {
          moneyDataListRef.current.push(
            newDollarData(dimensions.width, moneyMountTopRef.current)
          );
        }
      }
    }
    const intervalId = setInterval(() => updateFrame(), targetMillisPerFrame);
    return () => {
      clearInterval(intervalId);
    };
  }, [currentTime, dollarsPerMillis, dimensions.width, millisPerFrame]);

  function maybeUpdatePennyMode() {
    if (pennyModeRef.current.timer.isOffCooldown()) {
      if (pennyModeRef.current.enabled) {
        pennyModeRef.current.enabled = false;
        // 5 minutes for next penny mode.
        pennyModeRef.current.timer.newCooldownTimeAndReset(5 * 60 * 1000);
      } else {
        pennyModeRef.current.enabled = true;
        // Enable penny mode for 15 seconds.
        pennyModeRef.current.timer.newCooldownTimeAndReset(15 * 1000);
      }
    }
  }

  function maybeMergeLandedMoneyOntoCanvas() {
    const landedMoneyCount = moneyDataListRef.current.reduce(
      (n, m) => (hasMoneyDataLanded(m) ? n + 1 : n),
      0
    );
    if (landedMoneyCount < 10) {
      return;
    }
    const context = canvasRef?.current?.getContext('2d', {
      willReadFrequently: true,
    });
    if (!context) {
      return;
    }
    const stillFallingMoneyDataList = [];
    for (const moneyData of moneyDataListRef.current) {
      if (hasMoneyDataLanded(moneyData)) {
        const image = moneyData.img === dollarImgSrc ? dollarImage : pennyImage;
        context.save();
        context.translate(
          moneyData.x + image.width / 2,
          moneyData.y + image.height / 2
        );
        context.rotate((moneyData.rotation * Math.PI) / 180);
        context.scale(1, moneyData.scaleY);
        context.translate(-image.width / 2, -image.height / 2);
        context.drawImage(image, 0, 0);
        context.restore();
      } else {
        stillFallingMoneyDataList.push(moneyData);
      }
      moneyDataListRef.current = stillFallingMoneyDataList;
    }

    const imageWidth = canvasRef.current!.width;
    const imageHeight = canvasRef.current!.height;
    const imageData = context.getImageData(0, 0, imageWidth, imageHeight).data;
    for (let y = 0; y < imageData.length; y += imageWidth * 4) {
      let filledPixelsCount = 0;
      for (let x = y; x < y + imageWidth * 4; x += 4) {
        const a = imageData[x + 3];
        if (a > 0) {
          filledPixelsCount++;
        }
      }
      // First row with 95% of pixels filled is the top.
      const foundFullRow = filledPixelsCount / imageWidth > 0.95;
      const newMountTop = y / (imageWidth * 4);
      if (foundFullRow && newMountTop < moneyMountTopRef.current) {
        moneyMountTopRef.current = newMountTop;
        break;
      }
    }
  }

  maybeMergeLandedMoneyOntoCanvas();
  maybeUpdatePennyMode();

  return (
    <>
      <div className={styles.topRow}>
        <div className={styles.topRowContent}>
          <TimeDisplay
            totalSecondsPassed={
              (currentTime - simlationStartTimeRef.current) / 1000
            }
          />
          <div>Worth: ${moneyCountRef.current.toFixed(2)}</div>
        </div>
      </div>
      <MoneyContainer
        moneyDataList={moneyDataListRef.current}
        millisPerFrame={millisPerFrame}
        dimensions={dimensions}
        canvasRef={canvasRef}
        enablePennyMode={pennyModeRef.current.enabled}
      />
    </>
  );
}

/**
 *
 * @param n
 * @returns {string}
 */
function toTwoDigitsString(n: number) {
  if (n < 10) {
    return '0' + n;
  }
  return String(n);
}

function TimeDisplay({ totalSecondsPassed }: { totalSecondsPassed: number }) {
  const hours = Math.floor(totalSecondsPassed / (60 * 60));
  const minutes = Math.floor((totalSecondsPassed / 60) % 60);
  const seconds = Math.floor(totalSecondsPassed % 60);

  return (
    <div>
      Time worked: {hours > 0 && hours + ':'}
      {toTwoDigitsString(minutes) + ':'}
      {toTwoDigitsString(seconds)}
    </div>
  );
}

function MoneyContainer({
  moneyDataList,
  millisPerFrame,
  dimensions,
  canvasRef,
  enablePennyMode,
}: {
  moneyDataList: Array<MoneyData>;
  millisPerFrame: number;
  dimensions: { width: number; height: number };
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  enablePennyMode: boolean;
}) {
  const moneyItems = moneyDataList.map((d, i) => (
    <Money key={i} moneyData={d} millisPerFrame={millisPerFrame} />
  ));
  return (
    <div className={styles.moneyContainer}>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
      ></canvas>
      {moneyItems}
      <img
        className={styles.moneyContainerOverlay}
        src={jarImgSrc}
        alt=''
      ></img>
      {enablePennyMode ? <PennyMode /> : <AffirmationContainer />}
    </div>
  );
}

function Money({
  moneyData,
  millisPerFrame,
}: {
  moneyData: MoneyData;
  millisPerFrame: number;
}) {
  updateMoneyData(moneyData, millisPerFrame);
  return (
    <img
      className={styles.money}
      src={moneyData.img}
      alt='MONEY!'
      style={{
        rotate: moneyData.rotation + 'deg',
        left: moneyData.x,
        top: moneyData.y,
        scale: '1 ' + moneyData.scaleY,
      }}
    ></img>
  );
}

function PennyMode() {
  return (
    <div className={styles.moneyContainerOverlay}>
      <div className={styles.pennyModeBackground}></div>
      <img
        className={styles.pennyModeImage}
        src={powellImgSrc}
        alt=''
        style={{
          left: '25%',
          top: '20%',
          width: '75%',
          rotate: '7deg',
          scale: '-1, 1',
        }}
      />
      <img
        className={styles.pennyModeImage}
        src={catVibeImgSrc}
        alt=''
        style={{
          left: '-5%',
          top: '60%',
          width: '75%',
          rotate: '7deg',
        }}
      />
      <img
        className={styles.pennyModeImage}
        src={catDanceImgSrc}
        alt=''
        style={{
          left: '0%',
          top: '85%',
          width: '200px',
          rotate: '7deg',
        }}
      />
      <img
        className={styles.pennyModeImage}
        src={dogeImgSrc}
        alt=''
        style={{ left: '15%', top: '10%', rotate: '-15deg' }}
      />
      <img
        className={styles.pennyModeImage}
        src={dogeImgSrc}
        alt=''
        style={{ left: '60%', top: '75%', width: '35%', rotate: '10deg' }}
      />
      <div className={styles.pennyModeText}>PENNY MODE</div>;
    </div>
  );
}

/**
 *
 * @returns {MoneyData}
 */
function newDollarData(maxX: number, maxY: number) {
  const halfWidth = 100;
  return {
    img: dollarImgSrc,
    halfWidth,
    x: getRandomRange(0, maxX - halfWidth),
    deltaX: getRandomRange(-0.01, 0.01),
    maxX: maxX - 2 * halfWidth,
    y: -200,
    maxY: getRandomRange(maxY - 25, maxY),
    deltaY: getRandomRange(0.035, 0.045),
    rotation: getRandomRange(0, 360),
    deltaRotation:
      getRandomRange(0.005, 0.02) * Math.sign(getRandomRange(-1, 1)),
    flip: getRandomRange(0, 6.28),
    deltaFlip: getRandomRange(0.00025, 0.0005),
    scaleY: 0,
    minScaleY: 0.05,
  };
}

/**
 *
 * @returns {MoneyData}
 */
function newPennyData(maxX: number, maxY: number) {
  const halfWidth = 25;
  return {
    img: pennyImgSrc,
    halfWidth,
    x: getRandomRange(0, maxX - halfWidth),
    maxX: maxX - halfWidth,
    deltaX: getRandomRange(-0.01, 0.01),
    y: -50,
    deltaY: getRandomRange(0.4, 0.5),
    maxY: getRandomRange(maxY - 25, maxY),
    rotation: getRandomRange(0, 360),
    deltaRotation: getRandomRange(0.1, 0.2) * Math.sign(getRandomRange(-1, 1)),
    flip: getRandomRange(0, 6.28),
    deltaFlip: getRandomRange(0.006, 0.01),
    scaleY: 0,
    minScaleY: 0.1,
  };
}

function hasMoneyDataLanded(moneyData: MoneyData) {
  return moneyData.y >= moneyData.maxY;
}

function updateMoneyData(moneyData: MoneyData, millisPerFrame: number) {
  if (hasMoneyDataLanded(moneyData)) {
    return;
  }
  moneyData.y = moneyData.y + moneyData.deltaY * millisPerFrame;
  moneyData.x = Math.max(
    0,
    Math.min(moneyData.x + moneyData.deltaX * millisPerFrame, moneyData.maxX)
  );

  moneyData.rotation =
    (moneyData.rotation + moneyData.deltaRotation * millisPerFrame) % 360;

  moneyData.flip += moneyData.deltaFlip * millisPerFrame;
  moneyData.scaleY = Math.sin(moneyData.flip);
  // Make the money alaways have some thickness.
  if (Math.abs(moneyData.scaleY) < moneyData.minScaleY) {
    moneyData.scaleY = Math.sign(moneyData.scaleY) * moneyData.minScaleY;
  }
}

export default RealtimeWorthJar;
