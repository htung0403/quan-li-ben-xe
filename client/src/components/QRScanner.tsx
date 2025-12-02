import { useState, useEffect, useRef, useCallback } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onScanSuccess: (text: string) => void
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)
  
  const qrCodeRef = useRef<Html5Qrcode | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const scannerId = "qr-reader"

  // Memoize hàm tính toán kích thước
  const getQRBoxSize = useCallback(() => {
    if (typeof window === "undefined") return { width: 250, height: 250 }
    
    const minSize = 200
    const maxSize = 350
    const viewportWidth = window.innerWidth
    
    // Tính toán dựa trên chiều rộng viewport
    const size = Math.min(
      Math.max(viewportWidth * 0.7, minSize),
      maxSize
    )
    
    return { width: size, height: size }
  }, [])

  // Memoize hàm dừng quét
  const stopScanning = useCallback(async () => {
    if (qrCodeRef.current) {
      try {
        const state = qrCodeRef.current.getState()
        // State 2 = SCANNING, State 3 = PAUSED
        if (state === 2 || state === 3) {
          await qrCodeRef.current.stop()
        }
        await qrCodeRef.current.clear()
      } catch (err) {
        console.debug("Error stopping QR scanner:", err)
      } finally {
        qrCodeRef.current = null
        setIsScanning(false)
        setHasProcessed(false)
      }
    }
  }, [])

  // Debounce scan success để tránh quét trùng
  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now()
    const timeSinceLastScan = now - lastScanTimeRef.current
    
    // Chỉ xử lý nếu đã qua 500ms từ lần quét trước
    if (timeSinceLastScan < 500 || hasProcessed) {
      return
    }
    
    lastScanTimeRef.current = now
    setHasProcessed(true)
    onScanSuccess(decodedText)
    
    // Tự động dừng sau khi quét thành công
    setTimeout(() => {
      stopScanning()
      setScanning(false)
    }, 100)
  }, [hasProcessed, onScanSuccess, stopScanning])

  // Xử lý lỗi camera
  const getErrorMessage = useCallback((err: any): string => {
    let errorMessage = "Không thể khởi động camera. "
    
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      errorMessage += "Vui lòng cấp quyền truy cập camera."
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      errorMessage += "Không tìm thấy camera."
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      errorMessage += "Camera đang được sử dụng bởi ứng dụng khác."
    } else if (err.name === "OverconstrainedError") {
      errorMessage += "Cấu hình camera không được hỗ trợ."
    } else {
      errorMessage += "Vui lòng thử lại."
    }
    
    return errorMessage
  }, [])

  // Effect xử lý quét
  useEffect(() => {
    if (scanning && !isScanning) {
      const startScanning = async () => {
        try {
          // Kiểm tra browser support
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Browser không hỗ trợ camera")
          }

          // Khởi tạo Html5Qrcode với config đơn giản
          const html5QrCode = new Html5Qrcode(scannerId, {
            verbose: false,
          })
          qrCodeRef.current = html5QrCode

          const qrBoxSize = getQRBoxSize()
          
          // Cấu hình đơn giản và ổn định
          const config: any = {
            fps: 10,
            qrbox: qrBoxSize,
            aspectRatio: 1.0,
            disableFlip: false,
          }

          // Thử camera sau trước
          try {
            await html5QrCode.start(
              { facingMode: "environment" },
              config,
              handleScanSuccess,
              (errorMessage) => {
                // Bỏ qua các lỗi không quan trọng
                if (
                  errorMessage.includes("No QR code found") ||
                  errorMessage.includes("QR code parse error") ||
                  errorMessage.includes("NotFoundException")
                ) {
                  return
                }
              }
            )
          } catch (cameraError: any) {
            // Nếu camera sau không có, thử camera trước
            console.log("Environment camera not available, trying user camera...")
            await html5QrCode.start(
              { facingMode: "user" },
              config,
              handleScanSuccess,
              (errorMessage) => {
                if (
                  errorMessage.includes("No QR code found") ||
                  errorMessage.includes("QR code parse error") ||
                  errorMessage.includes("NotFoundException")
                ) {
                  return
                }
              }
            )
          }
          
          setIsScanning(true)
          setError(null)
          setHasProcessed(false)
        } catch (err: any) {
          console.error("Error starting QR scanner:", err)
          setError(getErrorMessage(err))
          setScanning(false)
          setIsScanning(false)
        }
      }
      
      startScanning()
    } else if (!scanning && isScanning) {
      stopScanning()
    }

    return () => {
      if (isScanning) {
        stopScanning()
      }
    }
  }, [scanning, isScanning, getQRBoxSize, handleScanSuccess, stopScanning, getErrorMessage])

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (qrCodeRef.current) {
        stopScanning()
      }
    }
  }, [stopScanning])

  return (
    <div className="space-y-4">
      {!scanning ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <QrCode className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              Nhấn nút bên dưới để bắt đầu quét QR code
            </p>
            <Button onClick={() => setScanning(true)} size="lg">
              Bắt đầu quét
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            id={scannerId} 
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ 
              minHeight: "400px",
              position: "relative",
              maxWidth: "100%",
            }}
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setScanning(false)
              stopScanning()
            }} 
            className="w-full"
            size="lg"
          >
            Dừng quét
          </Button>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      <div className="text-sm text-gray-500 space-y-1">
        <p>• Đảm bảo camera có quyền truy cập</p>
        <p>• Đặt QR code trong khung quét</p>
        <p>• Đảm bảo đủ ánh sáng</p>
        <p>• Giữ điện thoại ổn định để quét tốt hơn</p>
      </div>
    </div>
  )
}