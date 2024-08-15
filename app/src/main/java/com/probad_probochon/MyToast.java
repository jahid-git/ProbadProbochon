package com.probad_probochon;

import android.widget.*;
import android.content.*;
import android.view.*;
import android.app.*;

public class MyToast{

    private static Toast currentToast;

    public static void showShort(Context context, String message){
        if(currentToast != null) currentToast.cancel();
        LayoutInflater inflater = ((Activity)context).getLayoutInflater();
        View layout = inflater.inflate(R.layout.custom_toast, (ViewGroup) ((Activity) context).findViewById(R.id.root));
        TextView text = (TextView) layout.findViewById(R.id.message);

        text.setText(message);

        Toast toast = new Toast(context);

        toast.setDuration(Toast.LENGTH_SHORT);

        toast.setView(layout);
        toast.show();
        currentToast = toast;
    }

    public static void showLong(Context context, String message){
        if(currentToast != null) currentToast.cancel();
        LayoutInflater inflater = ((Activity)context).getLayoutInflater();
        View layout = inflater.inflate(R.layout.custom_toast, (ViewGroup) ((Activity) context).findViewById(R.id.root));
        TextView text = (TextView) layout.findViewById(R.id.message);

        text.setText(message);

        Toast toast = new Toast(context);

        toast.setDuration(Toast.LENGTH_LONG);
        toast.setView(layout);
        toast.show();
        currentToast = toast;
    }

    public static Toast getCurrentToast(){
        return currentToast;
    }
}
