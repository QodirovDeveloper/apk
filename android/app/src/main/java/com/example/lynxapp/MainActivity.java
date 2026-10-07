package com.example.lynxapp;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.lynx.tasm.LynxEnv;
import com.lynx.tasm.LynxError;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import com.lynx.tasm.LynxViewClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;

public class MainActivity extends Activity {
    static final String TAG = "LynxApp";
    private static final String BUNDLE = "main.lynx.bundle";

    private final long mStart = SystemClock.uptimeMillis();
    private LynxView mLynxView;
    private TextView mLogView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.DKGRAY);
        setContentView(root);

        // Diagnostika paneli (vaqtincha): pastda har bir bosqich yoziladi
        mLogView = new TextView(this);
        mLogView.setTextColor(Color.GREEN);
        mLogView.setTextSize(11);
        mLogView.setPadding(16, 16, 16, 16);
        mLogView.setTextIsSelectable(true);
        ScrollView logScroll = new ScrollView(this);
        logScroll.setBackgroundColor(0xCC000000);
        logScroll.addView(mLogView);
        FrameLayout.LayoutParams logParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(220), Gravity.BOTTOM);

        log("ABI: " + Arrays.toString(Build.SUPPORTED_ABIS) + ", Android " + Build.VERSION.RELEASE);
        if (MainApplication.initError != null) {
            log("INIT XATO:\n" + MainApplication.initError);
        }

        try {
            log("Lynx " + LynxEnv.inst().getLynxVersion()
                    + ", native yuklandi: " + LynxEnv.inst().isNativeLibraryLoaded());

            byte[] template = readAsset(BUNDLE);
            if (template == null) {
                log("XATO: assets/" + BUNDLE + " topilmadi");
                root.addView(logScroll, logParams);
                return;
            }
            log("bundle: " + template.length + " bayt");

            LynxViewBuilder builder = new LynxViewBuilder();
            builder.addBehaviors(new ImageBehavior().create());
            builder.setTemplateProvider(new AssetTemplateProvider(this));
            mLynxView = builder.build(this);
            mLynxView.addLynxViewClient(new LynxViewClient() {
                @Override
                public void onPageStart(String url) {
                    log("onPageStart " + url);
                }

                @Override
                public void onLoadSuccess() {
                    log("onLoadSuccess");
                }

                @Override
                public void onFirstScreen() {
                    log("onFirstScreen");
                }

                @Override
                public void onRuntimeReady() {
                    log("onRuntimeReady");
                }

                @Override
                public void onLoadFailed(String message) {
                    log("onLoadFailed: " + message);
                }

                @Override
                public void onReceivedError(LynxError error) {
                    if (error != null) {
                        log("XATO [" + error.getErrorCode() + "/" + error.getLevel() + "]: "
                                + error.getMsg());
                    }
                }
            });
            root.addView(mLynxView, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

            log("render boshlandi");
            mLynxView.renderTemplateWithBaseUrl(template, new HashMap<>(), BUNDLE);
        } catch (Throwable t) {
            log("EXCEPTION:\n" + Log.getStackTraceString(t));
        }

        root.addView(logScroll, logParams);
    }

    @Override
    protected void onDestroy() {
        if (mLynxView != null) {
            mLynxView.destroy();
        }
        super.onDestroy();
    }

    private void log(String text) {
        String line = "+" + (SystemClock.uptimeMillis() - mStart) + "ms " + text;
        Log.i(TAG, line);
        runOnUiThread(() -> mLogView.append(line + "\n"));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private byte[] readAsset(String name) {
        try (InputStream in = getAssets().open(name);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int length;
            while ((length = in.read(buffer)) != -1) {
                out.write(buffer, 0, length);
            }
            return out.toByteArray();
        } catch (IOException e) {
            return null;
        }
    }
}
