import UIKit

@objc(SignatureView)
class SignatureView: UIView {
    private var path = UIBezierPath()
    private var lines: [Line] = []
    private var strokeColor: UIColor = .black
    private var strokeWidth: CGFloat = 1.5
    private var showBaseline: Bool = false
    @objc var onSave: RCTDirectEventBlock?
    @objc var isSaveToLibrary: Bool = true
    @objc var outputFormat: String?

    @objc func setStrokeWidth(_ width: CGFloat) {
        strokeWidth = width
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
        print("SignatureView - Clearing signature")  // Debug log
        lines.removeAll()
        path = UIBezierPath()
        setNeedsDisplay() // Force redraw
    }

    override func draw(_ rect: CGRect) {
        super.draw(rect)

        // Draw baseline if enabled
        if showBaseline {
            let baseline = UIBezierPath()
            baseline.move(to: CGPoint(x: 0, y: bounds.height * 0.7))
            baseline.addLine(to: CGPoint(x: bounds.width, y: bounds.height * 0.7))
            UIColor.gray.withAlphaComponent(0.3).setStroke()
            baseline.lineWidth = 1.0
            baseline.stroke()
        }

        // Draw signature lines with their respective colors
        for line in lines {
            let path = UIBezierPath()
            if let firstPoint = line.points.first {
                path.move(to: firstPoint)
                for point in line.points.dropFirst() {
                    path.addLine(to: point)
                }
            }
            line.color.setStroke()
            path.lineWidth = strokeWidth
            path.lineCapStyle = .round
            path.lineJoinStyle = .round
            path.stroke()
        }
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        let line = Line(points: [point], color: strokeColor)
        lines.append(line)
        setNeedsDisplay()
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        if var currentLine = lines.last {
            currentLine.points.append(point)
            lines[lines.count - 1] = currentLine
            setNeedsDisplay()
        }
    }

    struct Line {
        var points: [CGPoint]
        var color: UIColor
    }

    func saveToImage() -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(bounds.size, false, UIScreen.main.scale)
        guard let context = UIGraphicsGetCurrentContext() else { return nil }

        // Draw view content
        layer.render(in: context)

        // Get the image
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return image
    }

    func emitSaveEvent(_ data: [String: Any]) {
        print("SignatureView - About to emit save event")
        print("Event data:", data)

        // Send data directly without extra nesting
        onSave?(data)
    }

    // ... rest of the methods (saveToImage, etc.) ...
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
