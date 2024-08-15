package com.probad_probochon;

import android.app.Activity;
import android.os.PersistableBundle;
import android.os.Bundle;
import android.webkit.WebView;
import android.os.Build;
import android.view.View;
import android.webkit.WebSettings;

public class PaymentActivity extends Activity
{
	private WebView pwebview;

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.payment_dialog);
		pwebview = (WebView) findViewById(R.id.payment_webview);
		//pwebview.setWebViewClient(new MyWebViewClient());
		//pwebview.setWebChromeClient(new MyWebChromeClient());
		pwebview.getSettings().setJavaScriptEnabled(true);
		pwebview.getSettings().setAllowFileAccess(true);
		pwebview.getSettings().setLightTouchEnabled(true);
        pwebview.getSettings().setEnableSmoothTransition(true);
        pwebview.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        pwebview.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
		
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
            pwebview.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } else {
            pwebview.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
		pwebview.loadUrl("https:///www.google.com");
	}

	@Override
	public void onBackPressed()
	{
		if(pwebview.canGoBack()){
			pwebview.goBack();
			return;
		}
		super.onBackPressed();
	}
	
}
