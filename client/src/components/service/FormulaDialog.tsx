import { useEffect } from "react"
import { toast } from "react-toastify"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { StatusBadge } from "@/components/layout/StatusBadge"
import { serviceFormulaService } from "@/services/service-formula.service"
import type { ServiceFormula, ServiceFormulaInput } from "@/types"

const formulaSchema = z.object({
  code: z.string().min(1, "Mã biểu thức là bắt buộc"),
  name: z.string().min(1, "Tên biểu thức là bắt buộc"),
  description: z.string().optional(),
  formulaType: z.enum(['quantity', 'price'], {
    errorMap: () => ({ message: "Loại biểu thức phải là 'quantity' hoặc 'price'" }),
  }),
  formulaExpression: z.string().optional(),
  isActive: z.boolean().default(true),
})

type FormulaFormData = z.infer<typeof formulaSchema>

interface FormulaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewMode: "create" | "edit" | "view"
  selectedFormula: ServiceFormula | null
  onSuccess: () => void
  defaultFormulaType?: 'quantity' | 'price'
}

export function FormulaDialog({
  open,
  onOpenChange,
  viewMode,
  selectedFormula,
  onSuccess,
  defaultFormulaType,
}: FormulaDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormulaFormData>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      isActive: true,
      formulaType: defaultFormulaType || 'quantity',
    },
  })

  useEffect(() => {
    if (selectedFormula && (viewMode === "edit" || viewMode === "view")) {
      reset({
        code: selectedFormula.code,
        name: selectedFormula.name,
        description: selectedFormula.description || "",
        formulaType: selectedFormula.formulaType,
        formulaExpression: selectedFormula.formulaExpression || "",
        isActive: selectedFormula.isActive,
      })
    } else {
      reset({
        code: "",
        name: "",
        description: "",
        formulaType: defaultFormulaType || 'quantity',
        formulaExpression: "",
        isActive: true,
      })
    }
  }, [selectedFormula, viewMode, reset, defaultFormulaType])

  const onSubmit = async (data: FormulaFormData) => {
    try {
      const formulaData: ServiceFormulaInput = {
        code: data.code,
        name: data.name,
        description: data.description,
        formulaType: data.formulaType,
        formulaExpression: data.formulaExpression,
        isActive: data.isActive,
      }

      if (viewMode === "create") {
        await serviceFormulaService.create(formulaData)
        toast.success("Thêm biểu thức thành công")
      } else if (viewMode === "edit" && selectedFormula) {
        await serviceFormulaService.update(selectedFormula.id, formulaData)
        toast.success("Cập nhật biểu thức thành công")
      }
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to save formula:", error)
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
          `Không thể ${viewMode === "create" ? "thêm" : "cập nhật"} biểu thức. Vui lòng thử lại.`
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[800px] max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {viewMode === "create" && "Thêm biểu thức mới"}
            {viewMode === "edit" && "Sửa thông tin biểu thức"}
            {viewMode === "view" && "Chi tiết biểu thức"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">
                Mã biểu thức <span className="text-red-500">(*)</span>
              </Label>
              <Input
                id="code"
                placeholder="Mã biểu thức"
                {...register("code")}
                disabled={viewMode === "view"}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="formulaType">
                Loại biểu thức <span className="text-red-500">(*)</span>
              </Label>
              <Select
                id="formulaType"
                {...register("formulaType")}
                disabled={viewMode === "view" || viewMode === "edit"}
                className={errors.formulaType ? "border-red-500" : ""}
              >
                <option value="quantity">Tính số lượng</option>
                <option value="price">Tính đơn giá</option>
              </Select>
              {errors.formulaType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.formulaType.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="name">
                Tên biểu thức <span className="text-red-500">(*)</span>
              </Label>
              <Input
                id="name"
                placeholder="Tên biểu thức"
                {...register("name")}
                disabled={viewMode === "view"}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Ghi chú</Label>
              <textarea
                id="description"
                {...register("description")}
                disabled={viewMode === "view"}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập ghi chú..."
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="formulaExpression">Biểu thức công thức</Label>
              <textarea
                id="formulaExpression"
                {...register("formulaExpression")}
                disabled={viewMode === "view"}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Nhập biểu thức công thức..."
              />
            </div>

            {viewMode !== "view" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Kích hoạt
                </Label>
              </div>
            )}
          </div>

          {viewMode === "view" && selectedFormula && (
            <div>
              <Label>Trạng thái</Label>
              <div className="mt-2">
                <StatusBadge
                  status={selectedFormula.isActive ? "active" : "inactive"}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {viewMode === "view" ? "Đóng" : "Hủy"}
            </Button>
            {viewMode !== "view" && (
              <Button type="submit" className="w-full sm:w-auto">
                {viewMode === "create" ? "Thêm" : "Cập nhật"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

