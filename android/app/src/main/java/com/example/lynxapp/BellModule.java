package com.example.lynxapp;

import android.app.Activity;
import android.content.Context;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;

import com.lynx.jsbridge.LynxMethod;
import com.lynx.jsbridge.LynxModule;
import com.lynx.tasm.behavior.LynxContext;

// Qo'ng'iroq ovozi, tebranish va taymer ishlayotganda ekranni yoqiq ushlab turish.
public class BellModule extends LynxModule {
    private final Handler mMain = new Handler(Looper.getMainLooper());

    public BellModule(Context context) {
        super(context);
    }

    private Context context() {
        return mContext instanceof LynxContext ? ((LynxContext) mContext).getContext() : mContext;
    }

    @LynxMethod
    public void ring() {
        mMain.post(() -> {
            try {
                ToneGenerator tone = new ToneGenerator(AudioManager.STREAM_ALARM, 90);
                // uch marta qisqa "din"
                for (int i = 0; i < 3; i++) {
                    mMain.postDelayed(() -> tone.startTone(ToneGenerator.TONE_PROP_BEEP, 280), i * 420L);
                }
                mMain.postDelayed(tone::release, 1600);
            } catch (RuntimeException ignored) {
                // ba'zi qurilmalarda ToneGenerator band bo'lishi mumkin
            }
            vibrate();
        });
    }

    private void vibrate() {
        Vibrator vibrator = (Vibrator) context().getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null || !vibrator.hasVibrator()) return;
        long[] pattern = {0, 250, 170, 250, 170, 250};
        if (Build.VERSION.SDK_INT >= 26) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
        } else {
            vibrator.vibrate(pattern, -1);
        }
    }

    @LynxMethod
    public void keepAwake(boolean on) {
        Context c = context();
        if (!(c instanceof Activity)) return;
        Activity activity = (Activity) c;
        activity.runOnUiThread(() -> {
            if (on) {
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });
    }
}
