package com.example.lynxapp;

import android.app.Activity;
import android.os.Bundle;

import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LynxViewBuilder viewBuilder = new LynxViewBuilder();
        viewBuilder.setTemplateProvider(new AssetTemplateProvider(this));
        LynxView lynxView = viewBuilder.build(this);
        setContentView(lynxView);

        // app/src/main/assets/main.lynx.bundle
        lynxView.renderTemplateUrl("main.lynx.bundle", "");
    }
}
