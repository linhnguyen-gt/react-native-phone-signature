package com.phonesignature

import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import java.io.File
import java.io.FileOutputStream

class SignatureView(context: Context) : View(context) {
    private val paint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 6f
        color = Color.BLACK
    }

    private val pathList = mutableListOf<Path>()
    private var currentPath: Path? = null
    private var lastX = 0f
    private var lastY = 0f

    override fun onDraw(canvas: Canvas) {
        canvas.drawColor(Color.WHITE)
        pathList.forEach { path ->
            canvas.drawPath(path, paint)
        }
        currentPath?.let { path ->
            canvas.drawPath(path, paint)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val x = event.x
        val y = event.y

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                currentPath = Path().apply {
                    moveTo(x, y)
                }
                lastX = x
                lastY = y
            }
            MotionEvent.ACTION_MOVE -> {
                currentPath?.quadTo(lastX, lastY, (x + lastX) / 2, (y + lastY) / 2)
                lastX = x
                lastY = y
            }
            MotionEvent.ACTION_UP -> {
                currentPath?.let { path ->
                    pathList.add(path)
                }
                currentPath = null
            }
        }
        invalidate()
        return true
    }

    fun clear() {
        pathList.clear()
        currentPath = null
        invalidate()
    }

    fun setStrokeWidth(width: Float) {
        paint.strokeWidth = width
        invalidate()
    }

    fun isEmpty(): Boolean {
        return pathList.isEmpty() && currentPath == null
    }

    fun saveToFile(filePath: String): Boolean {
        if (isEmpty()) return false

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        draw(canvas)

        return try {
            FileOutputStream(filePath).use { out: FileOutputStream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out)
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        } finally {
            bitmap.recycle()
        }
    }

    fun getBitmap(): Bitmap {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        draw(canvas)
        return bitmap
    }
}
