import {canUseLocalStorage, encryptWithPublicKey} from "./lib/utils";

const config = require('./config');
const _ = require('lodash');
var questlib = require('questlib');

// Global store for setting and getting trial data.
// Simpler than redux and suits our needs.

// CONSTANTS
export const ENCRYPTED_METADATA_KEY = 'encrypted_metadata';
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
export const TRIAL_TYPE_KEY = 'trialType';
export const TRIAL_NAME_KEY = 'trialName';

export function setQuestData(
  contrasts_q1,
  response_q1,
  responseTime_q1,
  contrasts_q2,
  response_q2,
  responseTime_q2) {

  const store = LocalStorageBackedStore.store;

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

  LocalStorageBackedStore.save();
}

export function getQuestData() {
  return LocalStorageBackedStore.store[QUEST_KEY];
}

export function processAndStoreData(q1, q2) {
  const store = LocalStorageBackedStore.store;
  store[PROCESSED_DATA_KEY] = questlib.ProcessQuestData(q1, q2);
  LocalStorageBackedStore.save();
}

export function getProcessedData() {
  return LocalStorageBackedStore.store[PROCESSED_DATA_KEY];
}

function getTrialKey(trialNum) {
  return TRIAL_KEY_PREFIX + trialNum;
}

export function setTrialData(trialNum, contrasts, response, responseTime, ratings) {
  const store = LocalStorageBackedStore.store;

  const key = getTrialKey(trialNum);
  store[key] = {};
  store[key][CONTRASTS_KEY] = contrasts;
  store[key][RESPONSE_KEY] = response;
  store[key][RESPONSE_TIME_KEY] = responseTime;
  store[key][RATINGS_KEY] = ratings;

  LocalStorageBackedStore.save();
}

export function getTrialData(trialNum) {
  return LocalStorageBackedStore.store[getTrialKey(trialNum)];
}

export function setEncryptedMetadata(encryptedMetadata) {
  if (encryptedMetadata !== LocalStorageBackedStore.store[ENCRYPTED_METADATA_KEY]) {
    // Reset state
    LocalStorageBackedStore.clear();

    // Update id and save store
    LocalStorageBackedStore.store[ENCRYPTED_METADATA_KEY] = encryptedMetadata;
    LocalStorageBackedStore.save();
  }
}

export function getEncryptedMetadata() {
  return LocalStorageBackedStore.store[ENCRYPTED_METADATA_KEY];
}

export function getDataSent() {
  return LocalStorageBackedStore.store[DATA_SENT_KEY];
}

export function setDataSent(dataSent) {
  LocalStorageBackedStore.store[DATA_SENT_KEY] = dataSent;
  LocalStorageBackedStore.save();
}

// Export data
export function getEncryptedStore() {
  // Inject trial type and name before encrypting store
  const dataToExport = _.clone(LocalStorageBackedStore.store);
  dataToExport[TRIAL_TYPE_KEY] = config.trialType;
  dataToExport[TRIAL_NAME_KEY] = config.trialName;
  return encryptWithPublicKey(JSON.stringify(dataToExport));
}

// Helper function that checks whether store is ready to be
// sent out.
export function isStoreComplete() {
  // Store should have encrypted id
  if (_.isUndefined(getEncryptedMetadata())) {
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

const LocalStorageBackedStore = {
   get store() {
    if (_.isUndefined(this._store)) {
      if (canUseLocalStorage()) {
        const savedStore = JSON.parse(localStorage.getItem(STORAGE_KEY));
        this._store = savedStore ? savedStore : {};
      } else {
        this._store = {};
      }
    }

    return this._store;
  },

  save() {
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
      if (config.debug) {
        console.log("saved: " + localStorage.getItem(STORAGE_KEY));
      }
    }
  },

  clear() {
    if (config.debug) {
      console.log('cleared');
    }

    this._store = undefined;

    if (canUseLocalStorage()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Expose store functions
export function getStore() {
  return LocalStorageBackedStore.store;
}

export function clearStore() {
  LocalStorageBackedStore.clear();
}

// Clear only trial data; that is, keep metadata and dataSent flag.
export function clearTrialData() {
  // Save data we want to keep
  const encryptedMetadata = getEncryptedMetadata();
  const dataSent = getDataSent();

  // Clear storage
  LocalStorageBackedStore.clear();

  // Set data without using setters so we don't trip unwanted logic
  LocalStorageBackedStore.store[ENCRYPTED_METADATA_KEY] = encryptedMetadata;
  LocalStorageBackedStore.store[DATA_SENT_KEY] = dataSent;

  // Remember to persist
  LocalStorageBackedStore.save();
}
