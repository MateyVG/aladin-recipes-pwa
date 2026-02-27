// =====================================================
// OFFLINE DB - Placeholder
// Временно решение за липсващ файл
// =====================================================

export const syncService = {
  syncData: async () => {
    console.log('Sync service - placeholder');
    return { success: true };
  },
  
  enableAutoSync: () => {
    console.log('Auto sync enabled - placeholder');
  },
  
  disableAutoSync: () => {
    console.log('Auto sync disabled - placeholder');
  },
  
  initSyncListeners: () => {
    console.log('Init sync listeners - placeholder');
  },
  
  storeLocally: async (key, value) => {
    console.log('Store locally - placeholder:', key);
    return true;
  },
  
  getLocalData: async (key) => {
    console.log('Get local data - placeholder:', key);
    return [];
  },
  
  queueAction: async (table, action, data) => {
    console.log('Queue action - placeholder:', table, action);
    return true;
  }
};

export const offlineDB = {
  get: async (key) => {
    console.log('OfflineDB get - placeholder:', key);
    return null;
  },
  
  set: async (key, value) => {
    console.log('OfflineDB set - placeholder:', key);
    return true;
  },
  
  delete: async (key) => {
    console.log('OfflineDB delete - placeholder:', key);
    return true;
  },
  
  clear: async () => {
    console.log('OfflineDB clear - placeholder');
    return true;
  },
  
  open: async () => {
    console.log('OfflineDB open - placeholder');
    return true;
  }
};

export default { syncService, offlineDB };