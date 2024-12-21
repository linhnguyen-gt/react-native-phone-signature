package com.phonesignature

import android.content.Context
import android.graphics.*
import android.util.Log
import android.view.MotionEvent
import android.view.View
import java.io.File
import java.io.FileOutputStream

class SignatureView(context: Context) : View(context) {
    init {
        setWillNotDraw(false)
        clipToOutline = true
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        clipBounds = Rect(0, 0, w, h)
    }

    private val signaturePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 6f
        color = Color.BLACK
    }

    private val baselinePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 2f
        color = Color.GRAY
        alpha = 120
    }

    private val guidelinePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 0.5f
        color = Color.parseColor("#E5E5E5")
        pathEffect = DashPathEffect(floatArrayOf(10f, 10f), 0f)
    }

    private val pathList = mutableListOf<Path>()
    private var currentPath: Path? = null
    private var lastX = 0f
    private var lastY = 0f

    private var lastVelocityX = 0f
    private var lastVelocityY = 0f
    private val smoothingFactor = 0.8f

    private var showBaseline: Boolean = false
    private var outputFormat: Bitmap.CompressFormat = Bitmap.CompressFormat.JPEG

    private var customBackgroundColor: Int = Color.WHITE

    fun setShowBaseline(show: Boolean) {
        showBaseline = show
        invalidate()
    }

    fun setOutputFormat(format: String) {
        outputFormat = when (format.uppercase()) {
            "PNG" -> Bitmap.CompressFormat.PNG
            else -> Bitmap.CompressFormat.JPEG
        }
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawColor(customBackgroundColor)

        val baselineY = height * 0.7f
        val topGuidelineY = baselineY - 60f
        val bottomGuidelineY = baselineY + 60f

        // canvas.drawLine(40f, topGuidelineY, width - 40f, topGuidelineY, guidelinePaint)
        if (showBaseline) {
            canvas.drawLine(40f, baselineY, width - 40f, baselineY, baselinePaint)
        }
        // canvas.drawLine(40f, bottomGuidelineY, width - 40f, bottomGuidelineY, guidelinePaint)

        pathList.forEach { path ->
            canvas.drawPath(path, signaturePaint)
        }
        currentPath?.let { path ->
            canvas.drawPath(path, signaturePaint)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val x = event.x
        val y = event.y
        val pressure = event.pressure.coerceIn(0.1f, 1f)

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                currentPath = Path().apply {
                    moveTo(x, y)
                }
                lastX = x
                lastY = y
                lastVelocityX = 0f
                lastVelocityY = 0f
            }
            MotionEvent.ACTION_MOVE -> {
                val velocityX = (x - lastX)
                val velocityY = (y - lastY)

                lastVelocityX = lastVelocityX * smoothingFactor + velocityX * (1 - smoothingFactor)
                lastVelocityY = lastVelocityY * smoothingFactor + velocityY * (1 - smoothingFactor)

                val speed = Math.sqrt((lastVelocityX * lastVelocityX + lastVelocityY * lastVelocityY).toDouble()).toFloat()
                val normalizedSpeed = (speed / 100f).coerceIn(0f, 1f)
                signaturePaint.strokeWidth = (8f * pressure * (1f - normalizedSpeed * 0.5f))

                currentPath?.quadTo(
                    lastX,
                    lastY,
                    (x + lastX) / 2,
                    (y + lastY) / 2
                )

                lastX = x
                lastY = y
            }
            MotionEvent.ACTION_UP -> {
                currentPath?.let { path ->
                    pathList.add(path)
                }
                currentPath = null
                signaturePaint.strokeWidth = 6f
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
        signaturePaint.strokeWidth = width
        invalidate()
    }

    fun isEmpty(): Boolean {
        return pathList.isEmpty() && currentPath == null
    }

    fun saveToFile(filePath: String): Boolean {
        if (isEmpty()) return false

        val bitmap = when (outputFormat) {
            Bitmap.CompressFormat.PNG -> {
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bitmap)
                draw(canvas)
                bitmap
            }
            else -> {
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bitmap)
                canvas.drawColor(Color.WHITE)
                draw(canvas)
                bitmap
            }
        }

        return try {
            FileOutputStream(filePath).use { out ->
                bitmap.compress(outputFormat, 100, out)
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

        if (outputFormat != Bitmap.CompressFormat.PNG) {
            canvas.drawColor(Color.WHITE)
        } else {
            canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
        }

        draw(canvas)
        return bitmap
    }

    fun setStrokeColor(color: Int) {
        signaturePaint.color = color
        invalidate()
    }

    fun setBaselineColor(color: Int) {
        baselinePaint.color = color
        invalidate()
    }

    fun setGuidelineColor(color: Int) {
        guidelinePaint.color = color
        invalidate()
    }

    fun setGuidelinesVisible(visible: Boolean) {
        baselinePaint.alpha = if (visible) 255 else 0
        guidelinePaint.alpha = if (visible) 255 else 0
        invalidate()
    }

    fun setSignatureColor(color: String) {
        try {
            val newColor = when (color.lowercase()) {
                "red" -> Color.RED
                "blue" -> Color.BLUE
                "black" -> Color.BLACK
                "green" -> Color.GREEN
                "white" -> Color.WHITE
                "gray", "grey" -> Color.GRAY
                "darkgray", "darkgrey" -> Color.DKGRAY
                "lightgray", "lightgrey" -> Color.LTGRAY
                "yellow" -> Color.YELLOW
                "cyan" -> Color.CYAN
                "magenta" -> Color.MAGENTA
                "transparent", "clear" -> Color.TRANSPARENT
                "purple" -> Color.parseColor("#800080")
                "brown" -> Color.parseColor("#A52A2A")
                "orange" -> Color.parseColor("#FFA500")
                else -> Color.parseColor(color) // For hex colors
            }
            signaturePaint.color = newColor
            invalidate()
        } catch (e: IllegalArgumentException) {
            Log.e("SignatureView", "Invalid color format: $color", e)
            // Fallback to black if color parsing fails
            signaturePaint.color = Color.BLACK
        }
    }

    override fun setBackgroundColor(color: Int) {
        customBackgroundColor = color
        invalidate()
    }
}
