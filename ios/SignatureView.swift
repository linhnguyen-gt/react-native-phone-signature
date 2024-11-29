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

    @objc func setStrokeWidth(_ width: CGFloat) {
        strokeWidth = width
        setNeedsDisplay()
    }

    @objc func setShowBaseline(_ show: Bool) {
        showBaseline = show
        setNeedsDisplay()
    }

    @objc func setSignatureColor(_ color: String) {
        if let uiColor = UIColor(hexString: color) {
            strokeColor = uiColor
            setNeedsDisplay()
        }
    }

    @objc func setOutputFormat(_ format: String) {
        // Handle output format if needed
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
            let baselinePath = UIBezierPath()
            let y = rect.height - 40
            baselinePath.move(to: CGPoint(x: 20, y: y))
            baselinePath.addLine(to: CGPoint(x: rect.width - 20, y: y))
            UIColor.gray.setStroke()
            baselinePath.lineWidth = 0.5
            baselinePath.stroke()
        }

        // Draw signature
        strokeColor.setStroke()
        for line in lines {
            let path = UIBezierPath()
            path.lineWidth = strokeWidth
            path.lineCapStyle = .round
            path.lineJoinStyle = .round

            path.move(to: line.points[0])
            for point in line.points.dropFirst() {
                path.addLine(to: point)
            }
            path.stroke()
        }
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let point = touch.location(in: self)
        lines.append(Line(points: [point]))
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

    // ... rest of the methods (saveToImage, etc.) ...
}

extension UIColor {
    convenience init?(hexString: String) {
        let r, g, b: CGFloat

        if hexString.hasPrefix("#") {
            let start = hexString.index(hexString.startIndex, offsetBy: 1)
            let hexColor = String(hexString[start...])

            if hexColor.count == 6 {
                let scanner = Scanner(string: hexColor)
                var hexNumber: UInt64 = 0

                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff0000) >> 16) / 255
                    g = CGFloat((hexNumber & 0x00ff00) >> 8) / 255
                    b = CGFloat(hexNumber & 0x0000ff) / 255

                    self.init(red: r, green: g, blue: b, alpha: 1.0)
                    return
                }
            }
        }
        return nil
    }
}
