import {process_data} from "./lib/VisualQuest.js"

// Global store for setting and getting trial data.
// Simpler than redux and suits our needs.

const store = {};

export const QUEST_KEY = 'quest';
export const Q1_KEY = 'q1';
export const Q2_KEY = 'q2';

export const PROCESSED_DATA_KEY = 'processedData';

export const TRIAL_KEY_PREFIX = 'trial_';
export const RESPONSE_KEY = 'response';
export const RESPONSE_TIME_KEY = 'responseTime';
export const RATINGS_KEY = 'ratings';
export const CONTRASTS_KEY = 'contrasts';

export function getStore() {
  return store;
}

export function setQuestData(
  contrasts_q1,
  response_q1,
  responseTime_q1,
  contrasts_q2,
  response_q2,
  responseTime_q2) {

  // set up objects
  store[QUEST_KEY] = {};
  store[QUEST_KEY][Q1_KEY] = {};
  store[QUEST_KEY][Q2_KEY] = {};

  store[QUEST_KEY][Q1_KEY][CONTRASTS_KEY] = contrasts_q1;
  store[QUEST_KEY][Q1_KEY][RESPONSE_KEY] = response_q1;
  store[QUEST_KEY][Q1_KEY][RESPONSE_TIME_KEY] = responseTime_q1;

  store[QUEST_KEY][Q2_KEY][CONTRASTS_KEY] = contrasts_q2;
  store[QUEST_KEY][Q2_KEY][RESPONSE_KEY] = response_q2;
  store[QUEST_KEY][Q2_KEY][RESPONSE_TIME_KEY] = responseTime_q2;
}

export function getQuestData() {
  return store[QUEST_KEY];
}

export function processAndStoreData(q1, q2) {
  store[PROCESSED_DATA_KEY] = process_data(q1, q2);
}

export function getProcessedData() {
  return store[PROCESSED_DATA_KEY];
}

function getTrialKey(trialNum) {
  return TRIAL_KEY_PREFIX + trialNum;
}

export function setTrialData(trialNum, contrasts, response, responseTime, ratings) {
  const key = getTrialKey(trialNum);
  store[key] = {};
  store[key][CONTRASTS_KEY] = contrasts;
  store[key][RESPONSE_KEY] = response;
  store[key][RESPONSE_TIME_KEY] = responseTime;
  store[key][RATINGS_KEY] = ratings;
}

export function getTrialData(trialNum) {
  return store[getTrialKey(trialNum)];
}
