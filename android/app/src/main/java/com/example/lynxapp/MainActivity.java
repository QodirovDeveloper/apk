package com.example.lynxapp;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.lynx.tasm.LynxError;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import com.lynx.tasm.LynxViewClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

public class MainActivity extends Activity {
    private static final String BUNDLE = "main.lynx.bundle";

    private LynxView mLynxView;
    private TextView mErrorView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        setContentView(root);

        // Xato bo'lsa ekranda ko'rsatamiz (oq ekran o'rniga)
        mErrorView = new TextView(this);
        mErrorView.setTextColor(Color.RED);
        mErrorView.setBackgroundColor(Color.WHITE);
        mErrorView.setPadding(32, 96, 32, 32);
        mErrorView.setTextIsSelectable(true);
        ScrollView errorScroll = new ScrollView(this);
        errorScroll.addView(mErrorView);
        errorScroll.setVisibility(View.GONE);

        byte[] template = readAsset(BUNDLE);
        if (template == null) {
            root.addView(errorScroll, matchParent());
            showError("assets/" + BUNDLE + " topilmadi yoki o'qib bo'lmadi");
            return;
        }

        LynxViewBuilder builder = new LynxViewBuilder();
        builder.addBehaviors(new ImageBehavior().create());
        builder.setTemplateProvider(new AssetTemplateProvider(this));
        mLynxView = builder.build(this);
        mLynxView.addLynxViewClient(new LynxViewClient() {
            @Override
            public void onLoadFailed(String message) {
                showError("Yuklashda xato: " + message);
            }

            @Override
            public void onReceivedError(LynxError error) {
                if (error != null && error.isFatal()) {
                    showError("Lynx xatosi [" + error.getErrorCode() + "]:\n" + error.getMsg());
                }
            }
        });

        root.addView(mLynxView, matchParent());
        root.addView(errorScroll, matchParent());

        mLynxView.renderTemplateWithBaseUrl(template, new HashMap<>(), BUNDLE);
    }

    @Override
    protected void onDestroy() {
        if (mLynxView != null) {
            mLynxView.destroy();
        }
        super.onDestroy();
    }

    private void showError(String text) {
        runOnUiThread(() -> {
            CharSequence old = mErrorView.getText();
            mErrorView.setText(old.length() == 0 ? text : old + "\n\n" + text);
            ((View) mErrorView.getParent()).setVisibility(View.VISIBLE);
        });
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

    private static FrameLayout.LayoutParams matchParent() {
        return new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    }
}
