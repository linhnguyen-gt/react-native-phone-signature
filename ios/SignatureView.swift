import UIKit

@objc(SignatureView)
class SignatureView: UIView {
    private var lines: [Line] = []
    private var strokeColor: UIColor = .black
    @objc var strokeWidth: CGFloat = 6.0 {
        didSet {
            minWidth = strokeWidth * 0.5
            maxWidth = strokeWidth * 1.5
            lastWidth = strokeWidth
            setNeedsDisplay()
        }
    }
    private var showBaseline: Bool = false
    @objc var onSave: RCTDirectEventBlock?
    @objc var isSaveToLibrary: Bool = true
    @objc var outputFormat: String?

    private var lastPoint: CGPoint = .zero
    private var previousPoint: CGPoint = .zero
    private var lastVelocityX: CGFloat = 0
    private var lastVelocityY: CGFloat = 0
    private var lastWidth: CGFloat = 6.0
    private let smoothingFactor: CGFloat = 0.8
    private var minWidth: CGFloat = 3.0
    private var maxWidth: CGFloat = 8.0

    struct Line {
        var points: [CGPoint]
        var widths: [CGFloat]
        var color: UIColor
        var velocities: [CGFloat]
    }

    var hasSignature: Bool {
        return !lines.isEmpty && lines.contains { line in
            return line.points.count > 1
        }
    }

    override func draw(_ rect: CGRect) {
        super.draw(rect)

        if showBaseline {
            let baselineY = bounds.height * 0.7
            let baseline = UIBezierPath()
            baseline.move(to: CGPoint(x: 40, y: baselineY))
            baseline.addLine(to: CGPoint(x: bounds.width - 40, y: baselineY))
            UIColor.gray.withAlphaComponent(0.3).setStroke()
            baseline.lineWidth = 1.0
            baseline.stroke()
        }

        for line in lines {
            guard line.points.count > 1 else { continue }

            let path = UIBezierPath()
            path.move(to: line.points[0])

            if line.points.count == 2 {
                path.addLine(to: line.points[1])
            } else {
                for i in 0..<line.points.count - 1 {
                    let currentPoint = line.points[i]
                    let nextPoint = line.points[i + 1]

                    let midPoint = CGPoint(
                        x: (currentPoint.x + nextPoint.x) / 2,
                        y: (currentPoint.y + nextPoint.y) / 2
                    )

                    if i == 0 {
                        path.addQuadCurve(to: midPoint, controlPoint: currentPoint)
                    } else {
                        let previousPoint = i > 0 ? line.points[i - 1] : currentPoint
                        let controlPoint = CGPoint(
                            x: currentPoint.x + (nextPoint.x - previousPoint.x) * 0.12,
                            y: currentPoint.y + (nextPoint.y - previousPoint.y) * 0.12
                        )
                        path.addQuadCurve(to: midPoint, controlPoint: controlPoint)
                    }
                }

                let lastPoint = line.points.last!
                let secondLastPoint = line.points[line.points.count - 2]
                let controlPoint = CGPoint(
                    x: secondLastPoint.x + (lastPoint.x - secondLastPoint.x) * 0.4,
                    y: secondLastPoint.y + (lastPoint.y - secondLastPoint.y) * 0.4
                )
                path.addQuadCurve(to: lastPoint, controlPoint: controlPoint)
            }

            line.color.setStroke()
            path.lineWidth = line.widths[0]
            path.lineCapStyle = .round
            path.lineJoinStyle = .round
            path.stroke()
        }
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        lastPoint = point
        previousPoint = point
        lastVelocityX = 0
        lastVelocityY = 0
        lastWidth = strokeWidth

        let line = Line(
            points: [point],
            widths: [strokeWidth],
            color: strokeColor,
            velocities: [0]
        )
        lines.append(line)
        setNeedsDisplay()
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let currentPoint = touch.location(in: self)

        let velocityX = (currentPoint.x - lastPoint.x)
        let velocityY = (currentPoint.y - lastPoint.y)

        let smoothingFactor: CGFloat = 0.85

        lastVelocityX = lastVelocityX * smoothingFactor + velocityX * (1 - smoothingFactor)
        lastVelocityY = lastVelocityY * smoothingFactor + velocityY * (1 - smoothingFactor)

        let speed = sqrt(lastVelocityX * lastVelocityX + lastVelocityY * lastVelocityY)
        let normalizedSpeed = min(speed / 1000, 1.0)

        let pressure = touch.force > 0 ? touch.force : 0.3

        let targetWidth = strokeWidth * (1.4 - normalizedSpeed * 0.8) * pressure
        let clampedWidth = min(max(targetWidth, minWidth), maxWidth)
        lastWidth = lastWidth * 0.7 + clampedWidth * 0.3

        if var currentLine = lines.last {
            let distance = hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y)

            if distance > 1.0 {
                if distance > 8 {
                    let steps = Int(distance / 2)
                    for i in 1...steps {
                        let t = CGFloat(i) / CGFloat(steps + 1)
                        let tx = (1 - t) * (1 - t) * lastPoint.x + 2 * (1 - t) * t * currentPoint.x + t * t * currentPoint.x
                        let ty = (1 - t) * (1 - t) * lastPoint.y + 2 * (1 - t) * t * currentPoint.y + t * t * currentPoint.y

                        let interpolatedPoint = CGPoint(x: tx, y: ty)
                        currentLine.points.append(interpolatedPoint)
                        currentLine.widths.append(lastWidth)
                        currentLine.velocities.append(normalizedSpeed)
                    }
                }

                currentLine.points.append(currentPoint)
                currentLine.widths.append(lastWidth)
                currentLine.velocities.append(normalizedSpeed)
                lines[lines.count - 1] = currentLine

                previousPoint = lastPoint
                lastPoint = currentPoint
            }
        }

        setNeedsDisplay()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if var currentLine = lines.last {
            if let lastPoint = currentLine.points.last {
                currentLine.points.append(lastPoint)
                currentLine.widths.append(minWidth)
                lines[lines.count - 1] = currentLine
            }
        }
        setNeedsDisplay()
    }

    @objc func setShowBaseline(_ show: Bool) {
        showBaseline = show
        setNeedsDisplay()
    }

    @objc func setSignatureColor(_ color: String) {
        print("Setting signature color to:", color)
        switch color.lowercased() {
        case "red":
            strokeColor = .red
        case "blue":
            strokeColor = .blue
        case "black":
            strokeColor = .black
        case "green":
            strokeColor = .green
        case "white":
            strokeColor = .white
        case "gray", "grey":
            strokeColor = .gray
        case "darkgray", "darkgrey":
            strokeColor = .darkGray
        case "lightgray", "lightgrey":
            strokeColor = .lightGray
        case "yellow":
            strokeColor = .yellow
        case "orange":
            strokeColor = .orange
        case "purple":
            strokeColor = .purple
        case "brown":
            strokeColor = .brown
        case "cyan":
            strokeColor = .cyan
        case "magenta":
            strokeColor = .magenta
        case "clear":
            strokeColor = .clear
        default:
            // Handle hex color
            if let uiColor = UIColor(hexString: color) {
                strokeColor = uiColor
            } else {
                print("Failed to parse color:", color)
                strokeColor = .black
            }
        }
        setNeedsDisplay()
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        backgroundColor = .white
        isMultipleTouchEnabled = false
    }

    @objc func clear() {
        lines.removeAll()
        setNeedsDisplay()
    }

    func saveToImage() -> UIImage? {
        guard hasSignature else {
            let errorData: [String: Any] = [
                "error": true,
                "message": "Please draw your signature first"
            ]
            emitSaveEvent(errorData)
            return nil
        }

        UIGraphicsBeginImageContextWithOptions(bounds.size, false, UIScreen.main.scale)
        guard let context = UIGraphicsGetCurrentContext() else { return nil }

        layer.render(in: context)
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return image
    }

    func emitSaveEvent(_ data: [String: Any]) {
        onSave?(data)
    }

}

extension UIColor {
    convenience init?(hexString: String) {
        var hexSanitized = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        guard hexSanitized.count == 6 && Scanner(string: hexSanitized).scanHexInt64(&rgb) else {
            return nil
        }

        let r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
        let g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
        let b = CGFloat(rgb & 0x0000FF) / 255.0

        self.init(red: r, green: g, blue: b, alpha: 1.0)
    }
}

extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        return min(max(self, range.lowerBound), range.upperBound)
    }
}
