package com.rnvisionproject;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

import org.opencv.android.OpenCVLoader;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "RNVisionProject";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if(OpenCVLoader.initDebug()) Log.d("TAG", "OpenCv Modul Added");

    loadCascade();
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the rendered you wish to use (Fabric or the older renderer).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
  }

  //REQUIRED ON FACE DETECTION  TO COPY MODEL FILE IN LOCAL PHONE
  public String loadCascade(){
    String cascadePath = "";

    try {
      //BASE FILE IN APP>SRC>MAIN>RES>RAW   !!!
      InputStream is = this.getResources().openRawResource(R.raw.haarcascade_frontalface_alt);

      //COPY TO LOCAL PHONE
      File cascadeDir = this.getDir("cascade", Context.MODE_PRIVATE);
      File mCascadeFile = new File(cascadeDir, "haarcascade_frontalface_alt.xml");

      FileOutputStream os = new FileOutputStream(mCascadeFile);
      byte[] buffer = new byte[4096];
      int bytesRead;
      while ((bytesRead = is.read(buffer)) != -1) {
        os.write(buffer, 0, bytesRead);
      }

      is.close();
      os.close();


      cascadePath = mCascadeFile.getAbsolutePath();
      //SEE THE FILE PATH HERE vvv
      Log.d("TAG", "findFace cascadePath Face: "+mCascadeFile.getAbsolutePath());

//      /data/user/0/com.rnvisionproject/app_cascade/XMLFILENAME.XML
    } catch (IOException e) {
      Log.d("TAG", "findFace: error" + e);
      e.printStackTrace();
    }

    try {
      //BASE FILE IN APP>SRC>MAIN>RES>RAW   !!!
      InputStream isEy = this.getResources().openRawResource(R.raw.haarcascade_eye_tree_eyeglasses);
      //COPY TO LOCAL PHONE
      File cascadeDir = this.getDir("cascade", Context.MODE_PRIVATE);
      File EyCascadeFile = new File(cascadeDir,"haarcascade_eye_tree_eyeglasses.xml");

      FileOutputStream os = new FileOutputStream(EyCascadeFile);
      byte[] buffer = new byte[4096];
      int bytesRead;
      while ((bytesRead = isEy.read(buffer)) != -1) {
        os.write(buffer, 0, bytesRead);
      }

      isEy.close();
      os.close();

      //SEE THE FILE PATH HERE vvv
      Log.d("TAG", "findFace e cascadePath Eye: "+EyCascadeFile.getAbsolutePath());
//      /data/user/0/com.rnvisionproject/app_cascade/haarcascade_eye_tree_eyeglasses.xml
    } catch (IOException e) {
      Log.d("TAG", "findFace: error" + e);
      e.printStackTrace();
    }

    return cascadePath;
  }
}
