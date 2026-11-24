package ar.entren.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

/** Opens the Supabase OAuth URL in the system browser, which can return via the app scheme. */
@CapacitorPlugin(name = "AuthBrowser")
public class AuthBrowserPlugin extends Plugin {
    @PluginMethod
    public void open(PluginCall call) {
        String raw = call.getString("url");
        if (raw == null || raw.isBlank()) {
            call.reject("OAuth URL is missing");
            return;
        }
        try {
            getContext().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(raw)));
            call.resolve(new JSObject());
        } catch (Exception e) {
            call.reject("Could not open the browser", e);
        }
    }
}
