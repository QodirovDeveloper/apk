package com.example.lynxapp;

import android.content.Context;
import android.content.SharedPreferences;

import com.lynx.jsbridge.LynxMethod;
import com.lynx.jsbridge.LynxModule;
import com.lynx.react.bridge.Callback;
import com.lynx.tasm.behavior.LynxContext;

// localStorage o'rniga: ma'lumotlarni SharedPreferences'da saqlaydi.
// Lynx hujjatidagi "Native Modules" namunasi asosida.
public class NativeLocalStorageModule extends LynxModule {
    private static final String PREF_NAME = "TimeManagementStorage";

    public NativeLocalStorageModule(Context context) {
        super(context);
    }

    private SharedPreferences prefs() {
        Context context = mContext instanceof LynxContext
                ? ((LynxContext) mContext).getContext()
                : mContext;
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    @LynxMethod
    public void setStorageItem(String key, String value) {
        prefs().edit().putString(key, value).apply();
    }

    @LynxMethod
    public void getStorageItem(String key, Callback callback) {
        callback.invoke(prefs().getString(key, null));
    }

    @LynxMethod
    public void clearStorage() {
        prefs().edit().clear().apply();
    }
}
