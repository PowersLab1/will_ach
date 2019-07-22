import {process_data} from "./lib/VisualQuest.js"
import {canUseSessionStorage} from "./lib/utils";

const _ = require('lodash');

// Global store for setting and getting trial data.
// Simpler than redux and suits our needs.

// CONSTANTS

export const ENCRYPTED_ID_KEY = 'encrypted_id';
export const QUEST_KEY = 'quest';
export const Q1_KEY = 'q1';
export const Q2_KEY = 'q2';

export const PROCESSED_DATA_KEY = 'processedData';

export const TRIAL_KEY_PREFIX = 'trial_';
export const RESPONSE_KEY = 'response';
export const RESPONSE_TIME_KEY = 'responseTime';
export const RATINGS_KEY = 'ratings';
export const CONTRASTS_KEY = 'contrasts';
export const DATA_SENT_KEY = 'dataSent';

export const STORAGE_KEY = 'store';

export function setQuestData(
  contrasts_q1,
  response_q1,
  responseTime_q1,
  contrasts_q2,
  response_q2,
  responseTime_q2) {

  const store = SessionStorageBackedStore.store;

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

  SessionStorageBackedStore.save();
}

export function getQuestData() {
  return SessionStorageBackedStore.store[QUEST_KEY];
}

export function processAndStoreData(q1, q2) {
  const store = SessionStorageBackedStore.store;
  store[PROCESSED_DATA_KEY] = process_data(q1, q2);
  SessionStorageBackedStore.save();
}

export function getProcessedData() {
  return SessionStorageBackedStore.store[PROCESSED_DATA_KEY];
}

function getTrialKey(trialNum) {
  return TRIAL_KEY_PREFIX + trialNum;
}

export function setTrialData(trialNum, contrasts, response, responseTime, ratings) {
  const store = SessionStorageBackedStore.store;

  const key = getTrialKey(trialNum);
  store[key] = {};
  store[key][CONTRASTS_KEY] = contrasts;
  store[key][RESPONSE_KEY] = response;
  store[key][RESPONSE_TIME_KEY] = responseTime;
  store[key][RATINGS_KEY] = ratings;

  SessionStorageBackedStore.save();
}

export function getTrialData(trialNum) {
  return SessionStorageBackedStore.store[getTrialKey(trialNum)];
}

export function setEncryptedId(encryptedId) {
  if (encryptedId !== SessionStorageBackedStore.store[ENCRYPTED_ID_KEY]) {
    // Reset state
    SessionStorageBackedStore.clear();

    // Update id and save store
    SessionStorageBackedStore.store[ENCRYPTED_ID_KEY] = encryptedId;
    SessionStorageBackedStore.save();
  }
}

export function getEncryptedId() {
  return SessionStorageBackedStore.store[ENCRYPTED_ID_KEY];
}

export function getDataSent() {
  return SessionStorageBackedStore.store[DATA_SENT_KEY];
}

export function setDataSent(dataSent) {
  SessionStorageBackedStore.store[DATA_SENT_KEY] = dataSent;
  SessionStorageBackedStore.save();
}

// Export data
export function getStoreJSONString() {
  return JSON.stringify(SessionStorageBackedStore.store);
}

// Helper function that checks whether store is ready to be
// sent out.
export function isStoreComplete() {
  // Store should have encrypted id
  if (_.isUndefined(getEncryptedId())) {
    return false;
  }

  // Make sure we have quest trial data
  if (_.isUndefined(getQuestData())) {
    return false;
  }

  // Make sure we have data from four TTs
  for (let i = 1; i <= 4; i++) {
    if (_.isUndefined(getTrialData(i))) {
      return false;
    }
  }

  // It looks like we have all the data we need.
  // The store is complete
  return true;
}

/********************************
 *                              *
 *          Store defn          *
 *                              *
 ********************************/

const SessionStorageBackedStore = {
   get store() {
    if (_.isUndefined(this._store)) {
      if (canUseSessionStorage()) {
        const savedStore = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
        this._store = savedStore ? savedStore : {};
      } else {
        this._store = {};
      }
    }

    return this._store;
  },

  save() {
    if (canUseSessionStorage()) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
      console.log("saved: " + sessionStorage.getItem(STORAGE_KEY));
    }
  },

  clear() {
    console.log('cleared');
    this._store = undefined;

    if (canUseSessionStorage()) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Expose store functions
export function getStore() {
  return SessionStorageBackedStore.store;
}

export function clearStore() {
  return SessionStorageBackedStore.clear();
}
