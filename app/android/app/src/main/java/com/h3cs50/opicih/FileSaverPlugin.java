package com.h3cs50.opicih;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Saves small files created by the app (question templates) to the public Downloads
 * folder, or hands them to the Android share sheet. No storage permission is needed:
 * Android 10+ uses MediaStore, older versions use the app's own external folder.
 */
@CapacitorPlugin(name = "FileSaver")
public class FileSaverPlugin extends Plugin {

    private static String safeName(String name) {
        String n = name == null ? "" : name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return n.isEmpty() ? "file.txt" : n;
    }

    private static byte[] bytesOf(PluginCall call) {
        String b64 = call.getString("base64");
        return b64 == null ? null : Base64.decode(b64, Base64.DEFAULT);
    }

    @PluginMethod
    public void save(PluginCall call) {
        String filename = safeName(call.getString("filename"));
        String mime = call.getString("mimeType", "application/octet-stream");
        byte[] bytes = bytesOf(call);
        if (bytes == null) {
            call.reject("missing data");
            return;
        }
        try {
            JSObject ret = new JSObject();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver resolver = getContext().getContentResolver();
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) throw new IOException("cannot create file");
                try (OutputStream os = resolver.openOutputStream(uri)) {
                    if (os == null) throw new IOException("cannot open file");
                    os.write(bytes);
                }
                String saved = filename;
                try (Cursor c = resolver.query(uri, new String[] { MediaStore.MediaColumns.DISPLAY_NAME }, null, null, null)) {
                    if (c != null && c.moveToFirst()) saved = c.getString(0);
                }
                ret.put("folder", "Download");
                ret.put("filename", saved);
            } else {
                File dir = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir == null) throw new IOException("no external storage");
                if (!dir.exists() && !dir.mkdirs()) throw new IOException("cannot create folder");
                File file = new File(dir, filename);
                try (FileOutputStream fos = new FileOutputStream(file)) {
                    fos.write(bytes);
                }
                ret.put("folder", dir.getAbsolutePath());
                ret.put("filename", filename);
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("save failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void share(PluginCall call) {
        String filename = safeName(call.getString("filename"));
        String mime = call.getString("mimeType", "application/octet-stream");
        String title = call.getString("title", filename);
        byte[] bytes = bytesOf(call);
        if (bytes == null) {
            call.reject("missing data");
            return;
        }
        try {
            File dir = new File(getContext().getCacheDir(), "shared");
            if (!dir.exists() && !dir.mkdirs()) throw new IOException("cannot create folder");
            File file = new File(dir, filename);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(bytes);
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(mime);
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, filename);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, title);
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(chooser);
            call.resolve();
        } catch (Exception e) {
            call.reject("share failed: " + e.getMessage());
        }
    }
}
