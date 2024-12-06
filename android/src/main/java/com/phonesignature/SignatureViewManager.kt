package com.phonesignature

import android.content.ContentValues
import android.graphics.Bitmap
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.io.File
import java.io.FileOutputStream
import android.util.Log

class SignatureViewManager : SimpleViewManager<SignatureView>() {
    private var isSaveToLibrary: Boolean = true

    override fun getName() = "RNSignatureView"

    override fun createViewInstance(context: ThemedReactContext): SignatureView {
        return SignatureView(context)
    }

    @ReactProp(name = "strokeWidth", defaultFloat = 6f)
    fun setStrokeWidth(view: SignatureView, strokeWidth: Float) {
        view.setStrokeWidth(strokeWidth)
    }

    @ReactProp(name = "isSaveToLibrary", defaultBoolean = true)
    fun setIsSaveToLibrary(view: SignatureView, saveToLibrary: Boolean) {
        Log.d("SignatureViewManager", "setIsSaveToLibrary: $saveToLibrary")
        isSaveToLibrary = saveToLibrary
    }

    @ReactProp(name = "showBaseline", defaultBoolean = false)
    fun setShowBaseline(view: SignatureView, show: Boolean) {
        Log.d(TAG, "setShowBaseline: $show")
        view.setShowBaseline(show)
    }

    @ReactProp(name = "signatureColor")
    fun setSignatureColor(view: SignatureView, color: String?) {
        Log.d(TAG, "setSignatureColor: $color")
        color?.let {
            view.setSignatureColor(it)
        }
    }

    @ReactProp(name = "outputFormat")
    fun setOutputFormat(view: SignatureView, format: String?) {
        Log.d(TAG, "setOutputFormat: $format")
        format?.let {
            view.setOutputFormat(it)
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put("onSave", MapBuilder.of("registrationName", "onSave"))
            .put("onClear", MapBuilder.of("registrationName", "onClear"))
            .build()
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of(
            "clear", COMMAND_CLEAR,
            "save", COMMAND_SAVE
        )
    }

    override fun receiveCommand(view: SignatureView, commandId: Int, args: ReadableArray?) {
        Log.d("SignatureViewManager", "receiveCommand: commandId=$commandId")
        when (commandId) {
            COMMAND_CLEAR -> {
                Log.d("SignatureViewManager", "Clearing signature")
                view.clear()
                sendEvent(view, "onClear")
            }
            COMMAND_SAVE -> {
                val fileName = "signature_${System.currentTimeMillis()}.jpg"
                Log.d("SignatureViewManager", "Saving signature: fileName=$fileName, isSaveToLibrary=$isSaveToLibrary")
                if (isSaveToLibrary) {
                    saveSignatureToGallery(view, fileName)
                } else {
                    saveSignatureToTemp(view, fileName)
                }
            }
        }
    }

    private fun saveSignatureToGallery(view: SignatureView, fileName: String) {
        Log.d("SignatureViewManager", "saveSignatureToGallery: Starting to save $fileName")

        if (view.isEmpty()) {
            val errorEvent = Arguments.createMap().apply {
                putBoolean("error", true)
                putString("message", "Please draw your signature first")
            }
            sendEvent(view, "onSave", errorEvent)
            return
        }

        val context = view.context
        val contentResolver = context.contentResolver

        try {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE,
                    if (fileName.endsWith(".png")) "image/png" else "image/jpeg")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/Signatures")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val imageUri = contentResolver.insert(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues
            )

            imageUri?.let { uri ->
                contentResolver.openOutputStream(uri)?.use { outputStream ->
                    val bitmap = view.getBitmap()
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
                    bitmap.recycle()
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    contentValues.clear()
                    contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                    contentResolver.update(uri, contentValues, null, null)
                }

                contentResolver.query(
                    uri,
                    arrayOf(
                        MediaStore.MediaColumns.DATA,
                        MediaStore.MediaColumns.WIDTH,
                        MediaStore.MediaColumns.HEIGHT,
                        MediaStore.MediaColumns.SIZE
                    ),
                    null,
                    null,
                    null
                )?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val path = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA))
                        val width = cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.WIDTH))
                        val height = cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.HEIGHT))
                        val size = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE))

                        val event = Arguments.createMap().apply {
                            putString("path", path)
                            putString("uri", uri.toString())
                            putString("name", fileName)
                            putInt("width", width)
                            putInt("height", height)
                            putDouble("size", size.toDouble())
                        }
                        sendEvent(view, "onSave", event)
                    }
                }
            }
            Log.d("SignatureViewManager", "saveSignatureToGallery: Successfully saved to gallery")
        } catch (e: Exception) {
            Log.e("SignatureViewManager", "saveSignatureToGallery: Error saving signature", e)
            e.printStackTrace()
        }
    }

    private fun saveSignatureToTemp(view: SignatureView, fileName: String) {
        Log.d("SignatureViewManager", "saveSignatureToTemp: Starting to save $fileName")

        if (view.isEmpty()) {
            val errorEvent = Arguments.createMap().apply {
                putBoolean("error", true)
                putString("message", "Please draw your signature first")
            }
            sendEvent(view, "onSave", errorEvent)
            return
        }

        try {
            val file = File(view.context.cacheDir, fileName)
            Log.d("SignatureViewManager", "saveSignatureToTemp: Saving to path: ${file.absolutePath}")

            val bitmap = view.getBitmap()
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out)
            }
            bitmap.recycle()

            val event = Arguments.createMap().apply {
                putString("path", file.absolutePath)
                putString("uri", "file://${file.absolutePath}")
                putString("name", fileName)
                putInt("width", bitmap.width)
                putInt("height", bitmap.height)
                putDouble("size", file.length().toDouble())
            }
            Log.d("SignatureViewManager", "saveSignatureToTemp: Successfully saved. File size: ${file.length()}")
            sendEvent(view, "onSave", event)
        } catch (e: Exception) {
            Log.e("SignatureViewManager", "saveSignatureToTemp: Error saving signature", e)
            e.printStackTrace()
        }
    }

    private fun sendEvent(view: SignatureView, eventName: String, params: com.facebook.react.bridge.WritableMap? = null) {
        Log.d("SignatureViewManager", "sendEvent: Sending $eventName event")
        val reactContext = view.context as ReactContext
        reactContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, eventName, params)
    }

    companion object {
        private const val COMMAND_CLEAR = 1
        private const val COMMAND_SAVE = 2
        private const val TAG = "SignatureViewManager"
    }
}
