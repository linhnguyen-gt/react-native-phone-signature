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

class SignatureViewManager : SimpleViewManager<SignatureView>() {
    override fun getName() = "RNSignatureView"

    override fun createViewInstance(context: ThemedReactContext): SignatureView {
        return SignatureView(context)
    }

    @ReactProp(name = "strokeWidth", defaultFloat = 6f)
    fun setStrokeWidth(view: SignatureView, strokeWidth: Float) {
        view.setStrokeWidth(strokeWidth)
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
        when (commandId) {
            COMMAND_CLEAR -> {
                view.clear()
                sendEvent(view, "onClear")
            }
            COMMAND_SAVE -> {
                val fileName = "signature_${System.currentTimeMillis()}.jpg"
                saveSignatureToGallery(view, fileName)
            }
        }
    }

    private fun saveSignatureToGallery(view: SignatureView, fileName: String) {
        val context = view.context
        val contentResolver = context.contentResolver

        try {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/Signatures")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            // Lưu file vào MediaStore
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

                // Lấy thông tin file sau khi lưu
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
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sendEvent(view: SignatureView, eventName: String, params: com.facebook.react.bridge.WritableMap? = null) {
        val reactContext = view.context as ReactContext
        reactContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, eventName, params)
    }

    companion object {
        private const val COMMAND_CLEAR = 1
        private const val COMMAND_SAVE = 2
    }
}
