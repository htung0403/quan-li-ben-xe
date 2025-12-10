import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAuthStore } from "@/store/auth.store"
import { MainLayout } from "@/components/layout/MainLayout"
import { PublicLayout } from "@/components/layout/PublicLayout"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import HomePage from "@/pages/HomePage"
import Dashboard from "@/pages/Dashboard"
import DieuDo from "@/pages/DieuDo"
import ThanhToan from "@/pages/ThanhToan"
import TaoMoiDonHang from "@/pages/TaoMoiDonHang"
import QuanLyXe from "@/pages/QuanLyXe"
import QuanLyLaiXe from "@/pages/QuanLyLaiXe"
import QuanLyDonViVanTai from "@/pages/QuanLyDonViVanTai"
import QuanLyTuyen from "@/pages/QuanLyTuyen"
import QuanLyBenDen from "@/pages/QuanLyBenDen"
import BaoCao from "@/pages/BaoCao"
import Profile from "@/pages/Profile"
import BangGiaVeDienTu from "@/pages/pricing/BangGiaVeDienTu"
import BangGiaLenhVanChuyen from "@/pages/pricing/BangGiaLenhVanChuyen"
import BangGiaChuKySo from "@/pages/pricing/BangGiaChuKySo"
import BangGiaHoaDonDienTu from "@/pages/pricing/BangGiaHoaDonDienTu"
import HuongDanBanVeUyThac from "@/pages/guide/HuongDanBanVeUyThac"
import LienHe from "@/pages/LienHe"
import XeXuatBen from "@/pages/XeXuatBen"
import XeTraKhach from "@/pages/XeTraKhach"
import XeKhongDuDieuKien from "@/pages/XeKhongDuDieuKien"
import BaoCaoXeTraKhach from "@/pages/BaoCaoXeTraKhach"
import BaoCaoTongHopTuyen from "@/pages/BaoCaoTongHopTuyen"
import BaoCaoTongHop from "@/pages/BaoCaoTongHop"
import BaoCaoDoanhThuBenBanVe from "@/pages/BaoCaoDoanhThuBenBanVe"
import BaoCaoCapPhepRaBen from "@/pages/BaoCaoCapPhepRaBen"
import BaoCaoChamCongDangTai from "@/pages/BaoCaoChamCongDangTai"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/home"
          element={<Navigate to="/" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dieu-do"
          element={
            <ProtectedRoute>
              <MainLayout disablePadding>
                <DieuDo />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/thanh-toan"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ThanhToan />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/thanh-toan/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ThanhToan />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/thanh-toan/tao-moi"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TaoMoiDonHang />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/truyen-tai/xe-xuat-ben"
          element={
            <ProtectedRoute>
              <MainLayout>
                <XeXuatBen />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/truyen-tai/xe-tra-khach"
          element={
            <ProtectedRoute>
              <MainLayout>
                <XeTraKhach />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/truyen-tai/xe-khong-du-dieu-kien"
          element={
            <ProtectedRoute>
              <MainLayout>
                <XeKhongDuDieuKien />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-ly-xe"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QuanLyXe />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-ly-lai-xe"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QuanLyLaiXe />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-ly-don-vi-van-tai"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QuanLyDonViVanTai />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-ly-tuyen"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QuanLyTuyen />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-ly-ben-den"
          element={
            <ProtectedRoute>
              <MainLayout>
                <QuanLyBenDen />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCao />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/xe-tra-khach"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoXeTraKhach />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/tong-hop-tuyen"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoTongHopTuyen />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/tong-hop"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoTongHop />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/doanh-thu-ben-ban-ve"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoDoanhThuBenBanVe />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/cap-phep-ra-ben"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoCapPhepRaBen />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bao-cao/cham-cong-dang-tai"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BaoCaoChamCongDangTai />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <Profile />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing/electronic-ticket"
          element={
            <PublicLayout>
              <BangGiaVeDienTu />
            </PublicLayout>
          }
        />
        <Route
          path="/pricing/dispatch-order"
          element={
            <PublicLayout>
              <BangGiaLenhVanChuyen />
            </PublicLayout>
          }
        />
        <Route
          path="/pricing/icorp-signature"
          element={
            <PublicLayout>
              <BangGiaChuKySo />
            </PublicLayout>
          }
        />
        <Route
          path="/pricing/icorp-invoice"
          element={
            <PublicLayout>
              <BangGiaHoaDonDienTu />
            </PublicLayout>
          }
        />
        <Route
          path="/guide/bus-station/consignment"
          element={<HuongDanBanVeUyThac />}
        />
        <Route
          path="/lien-he"
          element={
            <PublicLayout>
              <LienHe />
            </PublicLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

