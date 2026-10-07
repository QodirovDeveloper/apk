// Android'dagi Native Module'lar (android/app/src/main/java/com/example/lynxapp/)
declare let NativeModules: {
  NativeLocalStorageModule?: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string, callback: (value: string | null) => void): void;
    clearStorage(): void;
  };
  BellModule?: {
    ring(): void;
    keepAwake(on: boolean): void;
  };
};
