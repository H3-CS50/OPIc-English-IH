package com.h3cs50.opicih;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin riêng của app: lưu file mẫu vào Download / chia sẻ file.
        registerPlugin(FileSaverPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
