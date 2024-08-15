package com.probad_probochon;

import android.app.*;
import android.os.*;
import android.webkit.WebView;
import android.webkit.CookieManager;
import android.content.SharedPreferences;
import android.text.ClipboardManager;
import android.webkit.WebViewClient;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;
import android.webkit.WebSettings;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.content.DialogInterface;
import android.webkit.JsPromptResult;
import java.io.File;
import android.text.TextUtils;
import java.text.SimpleDateFormat;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.Locale;
import android.media.AudioManager;
import android.view.WindowManager;
import java.util.HashMap;
import com.google.android.gms.vision.text.TextRecognizer;
import com.google.android.gms.vision.Frame;
import android.graphics.BitmapFactory;
import android.util.SparseArray;
import com.google.android.gms.vision.text.TextBlock;
import android.graphics.Bitmap;
import java.io.IOException;
import android.graphics.pdf.PdfRenderer;
import android.graphics.Canvas;
import android.graphics.Color;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.Manifest;
import android.support.v4.content.ContextCompat;
import java.util.List;
import android.content.pm.PackageManager;
import java.util.Map;
import android.widget.Toast;
import java.util.ArrayList;
import android.content.ContentValues;
import android.view.LayoutInflater;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener, TextToSpeech.OnUtteranceCompletedListener
{
	public static final int REQUEST_ID_MULTIPLE_PERMISSIONS= 7;
	
	private WebView webview;
	private SharedPreferences sp;
    private ClipboardManager clipboard;
	private TextToSpeech tts;
	private AudioManager audioManager;
	private WindowManager.LayoutParams lp;
	private JsPromptResult jsResult;
	private ProgressDialog pdia;
	private ParcelFileDescriptor fileDescriptor; 
	private PdfRenderer renderer;
	private boolean isImgsProcess;
	private boolean isProcessCancel;
	
    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
		sp = getSharedPreferences("data_base",Context.MODE_PRIVATE);
		setAppTheme(sp.getString("theme","light"));
        
		super.onCreate(savedInstanceState);
		CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.setAcceptFileSchemeCookies(true);
        
		setContentView(R.layout.main);
        
		lp = getWindow().getAttributes();
		
		tts = new TextToSpeech(this, this);
		
		audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
		
        clipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        
		webview = (WebView) findViewById(R.id.webview);
		webview.setWebViewClient(new MyWebViewClient());
		webview.setWebChromeClient(new MyWebChromeClient());
		webview.getSettings().setJavaScriptEnabled(true);
		webview.getSettings().setAllowFileAccess(true);
		webview.getSettings().setLightTouchEnabled(true);
        webview.getSettings().setEnableSmoothTransition(true);
        webview.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webview.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
		
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
            webview.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } else {
            webview.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
		webview.loadUrl("file:///android_asset/index.html");
    }
	
	@Override
	public void onBackPressed() {
		runJavaScript("onBackPressed();", "");
	}
	
	public void runJavaScript(String code,String err){
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			webview.evaluateJavascript("try{"+code+"}catch(e){"+err+"}", null);
		} else {
			webview.loadUrl("javascript:try{"+code+"}catch(e){"+err+"}");
		}
	}
	
	private void setAppTheme(String theme){
		if(theme.equalsIgnoreCase("dark")){
			setTheme(R.style.AppThemeDark);
		} else {
			setTheme(R.style.AppTheme);
		}
	}
	
	private void setScreenBrightnessTo(float brightness) {
        if (lp.screenBrightness == brightness) {
            return;
        }
        lp.screenBrightness = brightness;
        getWindow().setAttributes(lp);
    }
	
	private void setFullscreen(boolean fullscreen)
	{
		WindowManager.LayoutParams attrs = getWindow().getAttributes();
		if (fullscreen)
		{
			attrs.flags |= WindowManager.LayoutParams.FLAG_FULLSCREEN;
			getWindow().setAttributes(attrs);
		}
		else
		{
			attrs.flags &= ~WindowManager.LayoutParams.FLAG_FULLSCREEN;
			getWindow().setAttributes(attrs);
			setAppTheme(sp.getString("theme","light"));
		}
	}
	
	private float getScreenBrightness(){
		return android.provider.Settings.System.getInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS,-1);
	}

	@Override
	public void onInit(int status)
	{
		if (status == TextToSpeech.SUCCESS) {
			tts.setOnUtteranceCompletedListener(this);
		}
	}
	
	@Override
	public void onUtteranceCompleted(String message)
	{
		runJavaScript("ttsDone('"+message+"');","");
	}
	
	private void speak(String text) {
		if(text != null) {
			tts.speak(text, TextToSpeech.QUEUE_ADD, null);
		}
	}
	
	private class MyWebViewClient extends WebViewClient
	{
		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url)
		{
			if (url.startsWith("file:")) {
                return false;
            }
			startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));
			return true;
		}
	}
	
	private class MyWebChromeClient extends WebChromeClient
	{

		@Override
		public void onProgressChanged(WebView view, int newProgress)
		{
			super.onProgressChanged(view, newProgress);
		}

		@Override
		public boolean onJsTimeout()
		{
			return super.onJsTimeout();
		}
		
		@Override
		public boolean onConsoleMessage(ConsoleMessage consoleMessage)
		{
            String type = "null";
            if(ConsoleMessage.MessageLevel.LOG == consoleMessage.messageLevel()){
                type = "LOG";
            } else if(ConsoleMessage.MessageLevel.DEBUG == consoleMessage.messageLevel()){
                type = "DEBUG";
            } else if(ConsoleMessage.MessageLevel.ERROR == consoleMessage.messageLevel()){
                type = "ERROR";
            } else if(ConsoleMessage.MessageLevel.TIP == consoleMessage.messageLevel()){
                type = "TIP";
            } else if(ConsoleMessage.MessageLevel.WARNING == consoleMessage.messageLevel()){
                type = "WARNING";
            }
            runJavaScript("onConsole('" + consoleMessage.message() + "'," + consoleMessage.lineNumber() + ",' " + type + "');","");
			return true;
		}

		@Override
		public boolean onJsAlert(WebView view, String url, String message, final JsResult result)
		{
			AlertDialog.Builder dia = new AlertDialog.Builder(view.getContext());
            dia.setTitle("Alert");
            dia.setMessage(message);
			dia.setCancelable(false);
			dia.setIcon(android.R.drawable.ic_dialog_alert);
            dia.setPositiveButton("Close", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						result.confirm();
					}
				});
            dia.show();
            return true;
		}

		@Override
		public boolean onJsConfirm(WebView view, String url, String message,final JsResult result)
		{
			AlertDialog.Builder dia = new AlertDialog.Builder(view.getContext());
			dia.setTitle("Confirm");
            dia.setMessage(message);
			dia.setCancelable(false);
			dia.setIcon(android.R.drawable.ic_dialog_alert);
            dia.setPositiveButton("OK", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						result.confirm();
					}
				});
            dia.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						result.cancel();
					}
				});
            dia.show();
            return true;
		}

		@Override
		public boolean onJsPrompt(final WebView view,final String url,final String message,final String defaultValue, final JsPromptResult result)
		{
			try{
                if(message.equalsIgnoreCase("#finish")){
					finish();
                } else if(message.equalsIgnoreCase("#reload")){
                    webview.reload();
                } else if(message.equalsIgnoreCase("#toast")){
                    MyToast.showShort(view.getContext(),defaultValue);
                } else if(message.equalsIgnoreCase("#vibrate")){
                    Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(Integer.parseInt(defaultValue), VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(Integer.parseInt(defaultValue));
                    }
                } else if(message.equalsIgnoreCase("#recreate")){
					recreate();
                } else if(message.equalsIgnoreCase("#change_brightness")){
					setScreenBrightnessTo(Float.parseFloat(defaultValue)/100);
                } else if(message.equalsIgnoreCase("#get_brightness")){
                    result.confirm((int)(getScreenBrightness()/2.55f)+"");
                } else if(message.equalsIgnoreCase("#open_app")){
                    Intent intent = getPackageManager().getLaunchIntentForPackage(defaultValue);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                    result.confirm("done");
                } else if(message.equalsIgnoreCase("#install_app")){
                    Intent intent = new Intent("android.intent.action.INSTALL_PACKAGE");
                    intent.setDataAndType(Uri.fromFile(new File(defaultValue)), "application/vnd.android.package-archive");
                    intent.addFlags(1);
                    intent.putExtra("android.intent.extra.NOT_UNKNOWN_SOURCE", true);
                    startActivity(intent);
                    result.confirm("done");
                } else if(message.equalsIgnoreCase("#uninstall_app")){
                    Intent intent = new Intent(Intent.ACTION_DELETE);
                    intent.setData(Uri.parse("package:" + defaultValue));
                    startActivity(intent);
                    result.confirm("done");
                } else if(message.equalsIgnoreCase("#set_data")){
                    String[] param = defaultValue.split("#");
                    sp.edit().putString(param[0],param[1]).commit();
                } else if(message.equalsIgnoreCase("#get_data")){
                    String[] param = defaultValue.split("#");
                    result.confirm(sp.getString(param[0],param[1]));
                } else if(message.equalsIgnoreCase("#remove_data")){
                    sp.edit().remove(defaultValue).commit();
                } else if(message.equalsIgnoreCase("#clear_data")){
                    sp.edit().clear().commit();
                } else if(message.equalsIgnoreCase("#get_copy")){
                    result.confirm(clipboard.getText().toString());
                } else if(message.equalsIgnoreCase("#set_copy")){
                    clipboard.setText(defaultValue);
                } else if(message.equalsIgnoreCase("#make_path")){
                    FileUtil.makeDir(defaultValue);
                } else if(message.equalsIgnoreCase("#delete_path")){
                    FileUtil.deleteFile(defaultValue);
                } else if(message.equalsIgnoreCase("#copy_path")){
                    String[] param = defaultValue.split("#");
                    FileUtil.copyFolder(new File(param[0]),new File(param[1]));
                } else if(message.equalsIgnoreCase("#copy_asset_path")){
                    String[] param = defaultValue.split("#");
                    FileUtil.copyAssetFolder(MainActivity.this,param[0],param[1]);
                } else if(message.equalsIgnoreCase("#move_path")){
                    String[] param = defaultValue.split("#");
                    FileUtil.moveFolder(new File(param[0]),new File(param[1]));
                } else if(message.equalsIgnoreCase("#write_file")){
                    String[] param = defaultValue.split("#__#___#__#");
                    FileUtil.writeFile(param[0],param[1]);
                } else if(message.equalsIgnoreCase("#read_file")){
                    result.confirm(FileUtil.readFile(defaultValue));
                } else if(message.equalsIgnoreCase("#move_file")){
                    String[] param = defaultValue.split("#");
                    FileUtil.moveFile(param[0],param[1]);
                } else if(message.equalsIgnoreCase("#copy_file")){
                    String[] param = defaultValue.split("#");
                    FileUtil.copyFile(param[0],param[1]);
                    result.confirm("done");
                    return true;
                } else if(message.equalsIgnoreCase("#copy_asset_file")){
                    String[] param = defaultValue.split("#");
                    FileUtil.copyAssetFile(MainActivity.this,param[0],param[1]);
                    result.confirm("done");
                    return true;
                } else if(message.equalsIgnoreCase("#rename")){
                    String[] param = defaultValue.split("#");
                    File oldFile = new File(param[0]);
                    String newFilePath = param[0].replace(oldFile.getName(), param[1]);
                    File newFile = new File(newFilePath);
                    FileUtil.moveFolder(oldFile, newFile);
                }  else if(message.equalsIgnoreCase("#is_file")){
                    if(FileUtil.isFile(defaultValue)){
                        result.confirm("true");
                    }else{
                        result.cancel();
                    }
                    return true;
                } else if(message.equalsIgnoreCase("#is_folder")){
                    if(FileUtil.isDirectory(defaultValue)){
                        result.confirm("true");
                    }else{
                        result.cancel();
                    }
                    return true;
                } else if(message.equalsIgnoreCase("#is_path")){
                    if(FileUtil.isExistFile(defaultValue)){
                        result.confirm("true");
                    }else{
                        result.cancel();
                    }
                    return true;
                } else if(message.equalsIgnoreCase("#get_file_size")){
                    result.confirm(FileUtil.getFileSize(FileUtil.getFileLength(defaultValue)));
                    return true;
                } else if(message.equalsIgnoreCase("#get_file_length")){
                    result.confirm(FileUtil.getFileLength(defaultValue)+"");
                    return true;
                } else if(message.equalsIgnoreCase("#get_file_last_modified")){
                    File f = new File(defaultValue);
                    result.confirm(f.lastModified()+"");
                    return true;
                } else if(message.equalsIgnoreCase("#get_file_time")){
                    String[] param = defaultValue.split("#");
                    File f = new File(param[0]);
                    result.confirm(new SimpleDateFormat(param[1]).format(f.lastModified()));
                    return true;
                } else if(message.equalsIgnoreCase("#get_files_folders")){
                    File[] f = new File(defaultValue).listFiles();
                    String files = "";
                    for(File file : f){
                        files += file.getAbsolutePath()+",";
                    }
                    if(files == ""){
                        result.confirm("");
                        return true;
                    }
                    result.confirm(files.substring(0,files.length()-1));
                    return true;
                } else if(message.equalsIgnoreCase("#get_files")){
                    File[] f = new File(defaultValue).listFiles();
                    String files = "";
                    for(File file : f){
                        if(file.isFile()){
                            files += file.getAbsolutePath() + ",";
                        }
                    }
                    if(files == ""){
                        result.confirm("");
                        return true;
                    }
                    result.confirm(files.substring(0,files.length()-1));
                    return true;
                } else if(message.equalsIgnoreCase("#get_folders")){
                    File[] f = new File(defaultValue).listFiles();
                    String files = "";
                    for(File file : f){
                        if(file.isDirectory()){
                            files += file.getAbsolutePath()+",";
                        }
                    }
                    if(files == ""){
                        result.confirm("");
                        return true;
                    }
                    result.confirm(files.substring(0,files.length()-1));
                    return true;
                } else if(message.equalsIgnoreCase("#get_storages")){
                    String storages = Environment.getExternalStorageDirectory().getAbsolutePath()+",";
                    final String rawSecondaryStorage = System.getenv("SECONDARY_STORAGE");
                    if (!TextUtils.isEmpty(rawSecondaryStorage)) {
                        String[] externalCards = rawSecondaryStorage.split(":");
                        for (int i = 0; i < externalCards.length; i++) {
                            storages += externalCards[i] + ",";
                        }
                    }
                    result.confirm(storages.substring(0,storages.length()-1));
				} else if(message.equalsIgnoreCase("#facebook")){
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("fb://profile/" + defaultValue)));
                    } catch (Exception e) {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.facebook.com/" + defaultValue)));
                    }
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#youtube")){
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.youtube.com/watch?v="+defaultValue)));
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#update")){
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id="+getApplicationContext().getPackageName())));
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#rate")){
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id="+getApplicationContext().getPackageName())));
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#share")){
                    Intent sharingIntent = new Intent(android.content.Intent.ACTION_SEND);
                    sharingIntent.setType("text/plain");
                    String shareBody = shareBody = "Application Link : https://play.google.com/store/apps/details?id="+getApplicationContext().getPackageName();
                    String shareSub = "Share App Link";
                    sharingIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, shareSub);
                    sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, shareBody);
                    startActivity(Intent.createChooser(sharingIntent, "Share using"));
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#feedback")){
                    Intent feedbackEmail = new Intent(Intent.ACTION_SENDTO);
                    feedbackEmail.putExtra(Intent.EXTRA_SUBJECT, "Feedback");
                    feedbackEmail.setData(Uri.parse("mailto:jahidsite0@gmail.com"));
                    feedbackEmail.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(feedbackEmail);
                    result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#stop_speak")){
					tts.stop();
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#start_speak")){
					speak(defaultValue);
					result.confirm("done");
				} else if(message.equalsIgnoreCase("#is_speaking")){
					if(tts.isSpeaking()){
						result.confirm("true");
					} else {
						result.confirm("false");
					}
					return true;
				} else if(message.equalsIgnoreCase("#speak_speed")){
					tts.setSpeechRate(Float.parseFloat(defaultValue)/15f);
					result.confirm("done");
					return true;
                } else if(message.equalsIgnoreCase("#sound_volume")){
					audioManager.setStreamVolume(AudioManager.STREAM_MUSIC,Integer.parseInt(defaultValue),0);
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#set_fullscreen")){
					if(defaultValue.equalsIgnoreCase("true")){
						setFullscreen(true);
					} else {
						setFullscreen(false);
					}
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#import_img")){
					Intent intent = new Intent();
					intent.setType("image/*");
					intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
					intent.setAction(Intent.ACTION_GET_CONTENT);
					startActivityForResult(Intent.createChooser(intent,"Select images"), 100);
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#import_pdf")){
					Intent intent = new Intent();
					intent.setType("application/pdf");
					intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);
					intent.setAction(Intent.ACTION_GET_CONTENT);
					startActivityForResult(Intent.createChooser(intent,"Select PDF file"), 200);
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#pdf_to_text")){
					String[] param = defaultValue.split("#");
					isImgsProcess = false;
                    new ImagePross().execute(param);
					result.confirm("done");
					return true;
				} else if(message.equalsIgnoreCase("#checkPermission")){
					jsResult = result;
					checkAndroidVersion();
					return true;
				} else if(message.equalsIgnoreCase("#open_payment_dialog")){
					startActivity(new Intent(MainActivity.this,PaymentActivity.class));
					result.confirm("done");
					return true;
				}
			}catch(Exception ex){
                result.cancel();
				runJavaScript("onConsole('"+ ex.getMessage() +"',0,'RUN_ERROR');","");
			}
			result.confirm("done");
			return true;
		}
	}

	@Override
	protected void onResume()
	{
		super.onResume();
		runJavaScript("onResume()","");
	}
	
	private class ImagePross extends AsyncTask<String,Integer,String>
	{
		@Override
		protected void onPreExecute()
		{
			super.onPreExecute();
			pdia = new ProgressDialog(MainActivity.this);
			pdia.setTitle("Processing...");
			pdia.setMessage("Please wite few time!");
			pdia.setCancelable(false);
			pdia.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
			pdia.setButton("Cancel",new DialogInterface.OnClickListener(){
					@Override
					public void onClick(DialogInterface d,int i){
						d.dismiss();
						isProcessCancel = true;
					}
				});
			pdia.show();
			isProcessCancel = false;
		}
		

		@Override
		protected String doInBackground(String[] data)
		{
			String text = "";
			if(isImgsProcess){
				pdia.setMax(data.length);
				int i = 0;
				for(String p: data){
					pdia.setProgress(++i);
					if(isProcessCancel){
						return null;
					}
					pdia.setMessage("Image:"+i+"/"+data.length+"\nPath:"+p);
					if(p != null) text += "\nImage:"+i+".\n" + getTextFormImg(p);
				}
			} else {
				text = getTextFromPDF(Integer.parseInt(data[0]),Integer.parseInt(data[1]));
			}
			return text;
		}

		@Override
		protected void onPostExecute(String result)
		{
			super.onPostExecute(result);
			pdia.dismiss();
			if(!isProcessCancel){
				result = result.replaceAll("\n","##__##");
				result = result.replaceAll("'","@@__@@");
				if(result != ""){
					runJavaScript("setTextReaderText('"+ result +"');","");
				} else {
					runJavaScript("setTextReaderText('No text found.');","");
				}
			}
		}
		
	}
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data)
	{
		super.onActivityResult(requestCode, resultCode, data);
		String[] paths;
		if(requestCode == 100 && resultCode == Activity.RESULT_OK){
			if(data.getClipData() != null){
				int count = data.getClipData().getItemCount();
				paths = new String[count];
				for(int i = 0;i < count;i++){
					paths[i] = FileUtil.convertUriToFilePath(MainActivity.this,data.getClipData().getItemAt(i).getUri());
				}
			} else {
				paths = new String[1];
				paths[0] = FileUtil.convertUriToFilePath(MainActivity.this,data.getData());
			}
			isImgsProcess = true;
			new ImagePross().execute(paths);
		}
		else if(requestCode == 200 && resultCode == Activity.RESULT_OK){
			try{
				fileDescriptor = ParcelFileDescriptor.open(new File(FileUtil.convertUriToFilePath(MainActivity.this,data.getData())), ParcelFileDescriptor.MODE_READ_ONLY);
				renderer = new PdfRenderer(fileDescriptor);
				int pageCount = renderer.getPageCount();
				runJavaScript("showPdfSettingsDialog("+pageCount+");","");
			} catch (Exception e){
			}
		}
	}
	
	private String getTextFormImg(String path){
		TextRecognizer textRecognizer = new TextRecognizer.Builder(getApplicationContext()).build();
		Frame imageFrame = new Frame.Builder().setBitmap(BitmapFactory.decodeFile(path)).build();
		String imageText = "";
		SparseArray<TextBlock> textBlocks = textRecognizer.detect(imageFrame);
		for (int i = 0; i < textBlocks.size(); i++) {
			TextBlock textBlock = textBlocks.get(textBlocks.keyAt(i));
			imageText += textBlock.getValue();
		}
		return imageText;
	}
	
	private String getTextFormImg(Bitmap b){
		TextRecognizer textRecognizer = new TextRecognizer.Builder(getApplicationContext()).build();
		Frame imageFrame = new Frame.Builder().setBitmap(b).build();
		String imageText = "";
		SparseArray<TextBlock> textBlocks = textRecognizer.detect(imageFrame);

		for (int i = 0; i < textBlocks.size(); i++) {
			TextBlock textBlock = textBlocks.get(textBlocks.keyAt(i));
			imageText += textBlock.getValue();
		}
		return imageText;
	}
	
    private String getTextFromPDF(int start,int end) {
		String str = "";
		final int pageCount = renderer.getPageCount();
		if(start < 0 || start > end || start > pageCount){
			start = 0;
		}
		if(end > pageCount || end < 0){
			end = pageCount;
		}
		if(end < 1){
			end = 1;
		}
		if(end-start < 0){
			pdia.setMax(end);
		} else {
			pdia.setMax(end-start);
		}
		try{
			for (int i = start,j = 1; i < end; i++, j++) {
				if(isProcessCancel){
					return null;
				}
				pdia.setProgress(j);
				pdia.setMessage("Page:"+(i+1)+"/"+end);
				PdfRenderer.Page page = renderer.openPage(i);
				Bitmap bitmap = Bitmap.createBitmap(page.getWidth(), page.getHeight(),Bitmap.Config.ARGB_8888);
				Canvas canvas = new Canvas(bitmap);
				canvas.drawColor(Color.WHITE);
				canvas.drawBitmap(bitmap, 0, 0, null);
				page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
				page.close();
				str += "\nPage:"+(i+1)+".\n" + getTextFormImg(bitmap);
			}
		} catch (Exception e){
			return null;
		}
		return str;
    }
	
	private void checkAndroidVersion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
			if(checkAndRequestPermissions()){
				jsResult.confirm("true");
			} else {
				jsResult.confirm("false");
			}
        }
    }

	private boolean checkAndRequestPermissions() {
        int camera = ContextCompat.checkSelfPermission(MainActivity.this,
													   Manifest.permission.CAMERA);
        int wtite = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        int read = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.READ_EXTERNAL_STORAGE);
        List<String> listPermissionsNeeded = new ArrayList<>();
        if (wtite != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
        }
        if (camera != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.CAMERA);
        }
        if (read != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }
        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(MainActivity.this, listPermissionsNeeded.toArray(new String[listPermissionsNeeded.size()]), REQUEST_ID_MULTIPLE_PERMISSIONS);
            return false;
        }
        return true;
    }


	@Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case REQUEST_ID_MULTIPLE_PERMISSIONS: {
					Map<String, Integer> perms = new HashMap<>();
					// Initialize the map with both permissions
					perms.put(Manifest.permission.WRITE_EXTERNAL_STORAGE, PackageManager.PERMISSION_GRANTED);
					perms.put(Manifest.permission.CAMERA, PackageManager.PERMISSION_GRANTED);
					perms.put(Manifest.permission.READ_EXTERNAL_STORAGE, PackageManager.PERMISSION_GRANTED);
					// Fill with actual results from user
					if (grantResults.length > 0) {
						for (int i = 0; i < permissions.length; i++)
							perms.put(permissions[i], grantResults[i]);
						// Check for both permissions
						if (perms.get(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
                            && perms.get(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED && perms.get(Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
							// process the normal flow
							//else any one or both the permissions are not granted
						} else {
							//permission is denied (this is the first time, when "never ask again" is not checked) so ask again explaining the usage of permission
//                        // shouldShowRequestPermissionRationale will return true
							//show the dialog or snackbar saying its necessary and try again otherwise proceed with setup.
							if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.WRITE_EXTERNAL_STORAGE) || ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.CAMERA) || ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.READ_EXTERNAL_STORAGE)) {
								showDialogOK("Camera and Storage Permission required for this app",
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            switch (which) {
                                                case DialogInterface.BUTTON_POSITIVE:
                                                    checkAndRequestPermissions();
                                                    break;
                                                case DialogInterface.BUTTON_NEGATIVE:
                                                    // proceed with logic by disabling the related features or quit the app.
                                                    break;
                                            }
                                        }
                                    });
							}
							//permission is denied (and never ask again is  checked)
							//shouldShowRequestPermissionRationale will return false
							else {
								Toast.makeText(MainActivity.this, "Go to settings and enable permissions", Toast.LENGTH_LONG)
                                    .show();
								//                            //proceed with logic by disabling the related features or quit the app.
							}
						}
					}
				}
        }

    }

    private void showDialogOK(String message, DialogInterface.OnClickListener okListener) {
        new AlertDialog.Builder(MainActivity.this)
			.setMessage(message)
			.setCancelable(false)
			.setPositiveButton("OK", okListener)
			.create()
			.show();
    }
}
