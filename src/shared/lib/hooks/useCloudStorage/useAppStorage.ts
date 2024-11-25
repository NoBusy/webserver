import { useCloudStorage, cloudStorage } from './useCloudStorage';


export const appStorage = {
  async set(key: string, value: unknown) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await cloudStorage.setItem(key, stringValue);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Error saving to storage: ${key}`, error);
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await cloudStorage.getItem(key);
      if (value) {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      }

      const localValue = localStorage.getItem(key);
      if (localValue) {
        try {
          return JSON.parse(localValue) as T;
        } catch {
          return localValue as unknown as T;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  }
};

export const useAppStorage = () => {
  const cloudStorage = useCloudStorage();
  
  return {
    async set(key: string, value: unknown) {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await cloudStorage.setItem(key, stringValue);
        localStorage.setItem(key, stringValue);
        return true;
      } catch (error) {
        console.error(`Error saving to storage: ${key}`, error);
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
          return true;
        } catch (e) {
          return false;
        }
      }
    },

    async get<T>(key: string): Promise<T | null> {
      try {
        const value = await cloudStorage.getItem(key);
        if (value) {
          try {
            return JSON.parse(value) as T;
          } catch {
            return value as unknown as T;
          }
        }

        const localValue = localStorage.getItem(key);
        if (localValue) {
          try {
            return JSON.parse(localValue) as T;
          } catch {
            return localValue as unknown as T;
          }
        }

        return null;
      } catch (error) {
        console.error(`Error reading from storage: ${key}`, error);
        return null;
      }
    }
  };
};