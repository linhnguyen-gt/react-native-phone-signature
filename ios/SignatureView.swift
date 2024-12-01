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
    private let smoothingFactor: CGFloat = 0.7
    private var minWidth: CGFloat = 3.0
    private var maxWidth: CGFloat = 8.0

    struct Line {
        var points: [CGPoint]
        var widths: [CGFloat]
        var color: UIColor
        var velocities: [CGFloat]
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

                    if i == 0 {
                        let midPoint = CGPoint(
                            x: (currentPoint.x + nextPoint.x) / 2,
                            y: (currentPoint.y + nextPoint.y) / 2
                        )
                        path.addQuadCurve(to: midPoint, controlPoint: currentPoint)
                    } else if i == line.points.count - 2 {
                        path.addQuadCurve(to: nextPoint, controlPoint: currentPoint)
                    } else {
                        let midPoint = CGPoint(
                            x: (currentPoint.x + nextPoint.x) / 2,
                            y: (currentPoint.y + nextPoint.y) / 2
                        )
                        path.addQuadCurve(to: midPoint, controlPoint: currentPoint)
                    }
                }
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

        lastVelocityX = lastVelocityX * smoothingFactor + velocityX * (1 - smoothingFactor)
        lastVelocityY = lastVelocityY * smoothingFactor + velocityY * (1 - smoothingFactor)

        let speed = sqrt(lastVelocityX * lastVelocityX + lastVelocityY * lastVelocityY)
        let normalizedSpeed = min(speed / 1000, 1.0)  // Adjusted speed normalization

        let pressure = touch.force > 0 ? touch.force : 0.3
        let targetWidth = strokeWidth * (1.3 - normalizedSpeed) * pressure
        let clampedWidth = targetWidth.clamped(to: minWidth...maxWidth)

        lastWidth = lastWidth * 0.6 + clampedWidth * 0.4

        if var currentLine = lines.last {
            let distance = hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y)
            if distance > 1.0 {
                if distance > 10 {
                    let steps = Int(distance / 5)
                    for i in 1...steps {
                        let t = CGFloat(i) / CGFloat(steps + 1)
                        let interpolatedPoint = CGPoint(
                            x: lastPoint.x + (currentPoint.x - lastPoint.x) * t,
                            y: lastPoint.y + (currentPoint.y - lastPoint.y) * t
                        )
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
        if color == "red" {
            strokeColor = .red
        } else if let uiColor = UIColor(hexString: color) {
            strokeColor = uiColor
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
        print("Converting hex color:", hexString)
        var hex = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        if hex.hasPrefix("#") {
            hex.remove(at: hex.startIndex)
        }

        var rgb: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&rgb)

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
