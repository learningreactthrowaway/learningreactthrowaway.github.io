import React from 'react';
import Timer from './timer';
import styles from './realtime_worth_jar.module.css';
import { getRandomRange } from './utils';

const affirmations = [
  'Great job',
  'Wow',
  'Keep going',
  'Fantastic',
  'Stay Hydrated',
  'Watch your posture',
  'Keep winning',
  'So successful',
  'Keep going',
  'You can do this',
  'So talented',
  'You deserve wealth',
  'Dream big',
  'Go get ’em!',
  'You’re on fire!',
  'You got this',
  'You are magic',
  'You rock',
  'Awesome work',
  'Marvelous',
  'You’re making a difference!',
  'Amazing impact',
  'wonderful job',
  'incredible',
  'outstanding',
];

function AffirmationContainer() {
  const affirmationListRef = React.useRef<Array<string>>(getNewAffirmations());
  const affirmationIndexRef = React.useRef<number>(0);
  const rotationRef = React.useRef<number>(0);
  const timerRef = React.useRef<Timer>(new Timer(1));

  const rotationDirection = affirmationIndexRef.current % 2 === 0 ? -1 : 1;
  const showAffirmationStyle =
    timerRef.current.getTimeLeft() < 1000 ? '' : ' ' + styles.show;
  if (timerRef.current.isOffCooldown()) {
    timerRef.current.newCooldownTimeAndReset(getRandomRange(15000, 25000));
    affirmationIndexRef.current += 1;
    if (affirmationIndexRef.current === affirmationListRef.current.length) {
      affirmationIndexRef.current = 0;
      affirmationListRef.current = getNewAffirmations();
    }
    rotationRef.current = getRandomRange(5, 10) * rotationDirection;
  }
  rotationRef.current += 0.01 * -rotationDirection;

  return (
    <div
      className={styles.affirmation + showAffirmationStyle}
      style={{ rotate: rotationRef.current + 'deg' }}
    >
      {affirmationListRef.current[affirmationIndexRef.current]}
    </div>
  );
}

/**
 *
 * @returns {Array<string>}
 */
function getNewAffirmations() {
  return shuffle(affirmations).map((a) => addExclaimations(a));
}

/**
 *
 * @param string
 * @returns {string}
 */
function addExclaimations(string: string) {
  const probability = Math.random();
  let count = 1;
  if (probability < 0.1) {
    count = 3;
  } else if (probability < 0.4) {
    count = 2;
  }
  for (let i = 0; i < count; i++) {
    string += '!';
  }
  return string;
}

/**
 *
 * @param array
 * @returns {Array<any>}
 */
function shuffle(array: Array<any>) {
  return array
    .map((a) => ({ order: Math.random(), value: a }))
    .sort((a, b) => a.order - b.order)
    .map((a) => a.value);
}

export default AffirmationContainer;
