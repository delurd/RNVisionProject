package com.rnvisionproject;


import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.Image;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.opencv.android.OpenCVLoader;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.MatOfRect;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;

import android.content.ContentResolver;
import android.util.Log;

import org.opencv.android.OpenCVLoader;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.*;

public class OpenCvModule extends ReactContextBaseJavaModule{
    OpenCvModule(ReactApplicationContext context){
        super(context);
    }
    private Context contex;
    @NonNull
    @Override
    public String getName() {
        return "OpenCvModule";
    }

    @ReactMethod
    public void callEventFaceDetect(String UriImage, ReadableMap windowSize, Promise promise){

        String modulAdded = "";
        if(OpenCVLoader.initDebug()) modulAdded = " modul added";

        Mat image = Imgcodecs.imread(UriImage);
        Mat deSizeImage = new Mat();
        Imgproc.resize(image, deSizeImage, new Size(windowSize.getDouble("width"),windowSize.getDouble("height")), 0, 0, Imgproc.INTER_AREA);

        try {
            WritableMap hasil = findFace(deSizeImage);

            promise.resolve(hasil);
        }catch (Exception e){
            promise.reject(e);
        }

    }

    private WritableMap findFace(Mat image){
//        findEye(image);

        WritableMap returnFaces = Arguments.createMap();
        CascadeClassifier faceDetector = new CascadeClassifier();

        //CHECK FILE CASCADE (GET URI FILE CASCADE FROM MAINACTIVITY.JAVA) vvvv
        if (!faceDetector.load("data/user/0/com.rnvisionproject/app_cascade/haarcascade_frontalface_alt.xml")) {
            Log.d("TAG", "findFace: Error loading face cascade:" );
        }else{

            Log.d("TAG", "findFace: load cascade");
            Mat frameGray = new Mat();
            Imgproc.cvtColor(image, frameGray, Imgproc.COLOR_BGR2GRAY);
            Imgproc.equalizeHist(frameGray, frameGray);

            //DETECT FACES
            MatOfRect faces = new MatOfRect();
            faceDetector.detectMultiScale(frameGray, faces);

            WritableArray faceArr = Arguments.createArray();
            for (Rect faceRect : faces.toArray()) {
                Log.d("TAG", "findFace: rect "+ faceRect);
                faceArr.pushMap(getRect(faceRect));
            }

            returnFaces.putArray("facesArray", faceArr);
        }
        return returnFaces;
    }

    private void findEye(Mat image){
        WritableMap returnEye = Arguments.createMap();
        CascadeClassifier eyeDetector = new CascadeClassifier();

        if (!eyeDetector.load("data/user/0/com.rnvisionproject/app_cascade/haarcascade_eye_tree_eyeglasses.xml")) {
            Log.d("TAG", "findFace: Error loading eye cascade:" );
        }else{
            Log.d("TAG", "findEye: true");

            Mat frameGray = new Mat();
            Imgproc.cvtColor(image, frameGray, Imgproc.COLOR_BGR2GRAY);
            Imgproc.equalizeHist(frameGray, frameGray);
            MatOfRect eyes = new MatOfRect();

            eyeDetector.detectMultiScale(frameGray, eyes);

            Log.d("TAG", "findEye: " +eyes);
            Log.d("TAG", "findEye: " +eyes.toArray().length);
            Log.d("TAG", "findEye: list" +eyes.toList());
            List<Rect> listOfEyes = eyes.toList();
            for (Rect eye : eyes.toArray()) {
                Log.d("TAG", "findEye: arr"+eye);
            }
        }

    }

    @ReactMethod
    public void callEventKTPDetect(String data, ReadableMap windowSize, Promise promise){

        Mat image = Imgcodecs.imread(data);
        Mat deSizeImage = new Mat();
        Imgproc.resize(image, deSizeImage, new Size(windowSize.getDouble("width"),windowSize.getDouble("height")), 0, 0, Imgproc.INTER_AREA);

        try {

            WritableMap hasil = findAreaKTP(deSizeImage);

            promise.resolve(hasil);
        }catch (Exception e){
            promise.reject(e);
        }

    }



    private WritableMap findAreaKTP(Mat image){
        WritableMap dataReturn = Arguments.createMap();

        Integer blueRangeSelection  = 20; //20-90
        Integer[] _blueRangeSelection  = {40,20,60,90,70}; //20-90
        Integer forEachCounter = 0;
        for (Integer blueColor : _blueRangeSelection){
            forEachCounter = ++forEachCounter;

            Mat processImage = image.clone();
            Mat img = Mat.zeros(image.rows(), image.cols(), CvType.CV_8UC3);

            //>>>>>>>>>>>>>PRE PROCESSING
            Imgproc.cvtColor(processImage,processImage, Imgproc.COLOR_BGR2HSV);

            //SELECT BLUE COLOR AND REMOVE OTHER
            Core.inRange(processImage, new Scalar(blueColor,10,200,0), new Scalar(130,200,255,1), processImage);
            Imgproc.GaussianBlur(processImage, processImage,new Size(7,7),1);
            Imgproc.Canny(processImage, processImage, 200, 25);

            
            //>>>>>>>>>>>>>PROCESSING
            Mat drawRect = Mat.zeros(image.rows(), image.cols(),CvType.CV_8UC3);
            WritableArray hasil = Arguments.createArray();
            final List<MatOfPoint> contourImage = new ArrayList<>();

            Imgproc.findContours(processImage, contourImage, new Mat(), Imgproc.RETR_CCOMP, Imgproc.CHAIN_APPROX_SIMPLE);
            for (MatOfPoint contour : contourImage) {
               double contourArea = Imgproc.contourArea(contour);

               if(contourArea > 100){
                    WritableMap result = Arguments.createMap();
                    MatOfPoint2f point = new MatOfPoint2f();

                    contour.convertTo(point, CvType.CV_32F);

                    //GET POINT
                    Imgproc.approxPolyDP(point, point,0.02*Imgproc.arcLength(point, true), true);
                    Integer sumPoin = point.toArray().length;
                    Point[] poinArr = point.toArray();
                    
                    //GET RECT (KOTAK)
                    final Rect react = Imgproc.boundingRect(contour);
                    Imgproc.rectangle(drawRect, new Point(react.x, react.y), new Point(react.x+ react.width, react.y+react.height), new Scalar(255,0,0), 2, Imgproc.LINE_AA, 0);

                    result.putMap("Rect", this.getRect(react));
                    result.putInt("PointCount", sumPoin);
                    result.putArray("PointValue", getPoin(poinArr));


                    hasil.pushMap(result);
               }
            }

            //PROCESS DRAW RECT BASED FROM ALL RECT
            Mat canyRect = new Mat();
            Imgproc.Canny(drawRect, canyRect, 200, 25);

            final Rect reactAll = Imgproc.boundingRect(canyRect);
            double rectWidth = reactAll.width;
            double rectHeight = reactAll.height;

            //DETECT KTP BY ASPECT RATIO
            boolean KTPDetect = false;
            // if(rectWidth/(rectHeight/11) >= 16 && rectWidth/(rectHeight/11) <= 18){
            if(rectWidth/(rectHeight/5) >= 6 && rectWidth/(rectHeight/5) <= 8){
                KTPDetect = true;
                dataReturn.putMap("globalRect", this.getRect(reactAll));
                dataReturn.putBoolean("KTP", KTPDetect);
                dataReturn.putMap("Resolution", getSizeMatImage(image));
                dataReturn.putArray("detail", hasil);
                dataReturn.putInt("loop", forEachCounter);

                break;
            }
            if(forEachCounter == _blueRangeSelection.length){
                dataReturn.putMap("globalRect", this.getRect(reactAll));
                dataReturn.putBoolean("KTP", KTPDetect);
                dataReturn.putMap("Resolution", getSizeMatImage(image));
                dataReturn.putArray("detail", hasil);
                dataReturn.putInt("loop", forEachCounter);
            }

         }


        return dataReturn;

    }

    public WritableMap getSizeMatImage(Mat image){
        WritableMap size = Arguments.createMap();

        size.putDouble("height", image.size().height);
        size.putDouble("width", image.size().width);

        return size;
    };

    public WritableMap getRect(Rect rect) {
        WritableMap rectObject = Arguments.createMap();

        WritableMap rectPosition = Arguments.createMap();
        WritableMap rectSize = Arguments.createMap();

        rectPosition.putInt("left", rect.x);
        rectPosition.putInt("top", rect.y);

        rectSize.putInt("width", rect.width);
        rectSize.putInt("height", rect.height);

        rectObject.putMap("position", rectPosition);
        rectObject.putMap("size", rectSize);

        return rectObject;
    }

    public WritableArray getPoin(Point[] poin){
        WritableArray arrPoin = Arguments.createArray();

        for (Point point : poin) {
            WritableMap subPoin = Arguments.createMap();

            subPoin.putDouble("x", point.x);
            subPoin.putDouble("y", point.y);

            arrPoin.pushMap(subPoin);
        }

        return arrPoin;
    }

}

