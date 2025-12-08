import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { operatorService } from "@/services/operator.service"
import { Operator, OperatorInput } from "@/types"

const operatorSchema = z.object({
  name: z.string().min(1, "Tên đơn vị là bắt buộc"),
  code: z.string().min(1, "Mã đơn vị là bắt buộc"),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc"),
  isTicketDelegated: z.boolean().optional(),
  province: z.string().min(1, "Tỉnh/Thành phố là bắt buộc"),
  district: z.string().min(1, "Quận/Huyện là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  representativeName: z.string().min(1, "Người đại diện là bắt buộc"),
  representativePosition: z.string().min(1, "Chức vụ là bắt buộc"),
})

type OperatorFormData = z.infer<typeof operatorSchema>

interface OperatorFormProps {
  operator: Operator | null
  mode: "create" | "edit"
  onClose: () => void
}

export function OperatorForm({ operator, mode, onClose }: OperatorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    defaultValues: operator
      ? {
          name: operator.name,
          code: operator.code,
          taxCode: operator.taxCode || "",
          isTicketDelegated: operator.isTicketDelegated,
          province: operator.province || "",
          district: operator.district || "",
          address: operator.address || "",
          phone: operator.phone || "",
          email: operator.email || "",
          representativeName: operator.representativeName || "",
          representativePosition: operator.representativePosition || "",
        }
      : {
          isTicketDelegated: false,
      },
  })

  const isTicketDelegated = watch("isTicketDelegated")

  const onSubmit = async (data: OperatorFormData) => {
    try {
      const operatorData: OperatorInput = {
        ...data,
      }

      if (mode === "create") {
        await operatorService.create(operatorData)
        toast.success("Thêm đơn vị vận tải thành công")
      } else if (operator && mode === "edit") {
        await operatorService.update(operator.id, operatorData)
        toast.success("Cập nhật đơn vị vận tải thành công")
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to save operator:", error)
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.error || error.message
      
      if (errorMessage?.includes("already exists") || errorMessage?.includes("duplicate key")) {
        toast.error("Mã đơn vị đã tồn tại. Vui lòng sử dụng mã khác.")
      } else {
        toast.error(errorMessage || "Có lỗi xảy ra. Vui lòng thử lại.")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div className="space-y-6 w-full">
        {/* Section 1: Thông tin đơn vị vận tải */}
        <div className="space-y-4 w-full">
          <h3 className="text-xl font-semibold text-center">Thông tin đơn vị vận tải</h3>
          
          <div className="flex items-center space-x-2">
             <Checkbox 
              id="isTicketDelegated" 
              checked={isTicketDelegated}
              onChange={(e) => {
                setValue("isTicketDelegated", e.target.checked)
              }}
            />
            <Label htmlFor="isTicketDelegated" className="font-normal">Doanh nghiệp ủy thác bến xe bán vé</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="code">Mã đơn vị <span className="text-red-500">*</span></Label>
              <Input id="code" {...register("code")} placeholder="DV001" />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế <span className="text-red-500">*</span></Label>
              <Input id="taxCode" {...register("taxCode")} />
              {errors.taxCode && <p className="text-sm text-red-500">{errors.taxCode.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên đơn vị <span className="text-red-500">*</span></Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
              <Input id="province" {...register("province")} />
              {errors.province && <p className="text-sm text-red-500">{errors.province.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện <span className="text-red-500">*</span></Label>
              <Input id="district" {...register("district")} />
              {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>
        </div>

        {/* Section 2: Thông tin người đại diện pháp luật */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin người đại diện pháp luật</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="representativeName">Đại diện <span className="text-red-500">*</span></Label>
              <Input id="representativeName" {...register("representativeName")} />
              {errors.representativeName && <p className="text-sm text-red-500">{errors.representativeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativePosition">Chức vụ <span className="text-red-500">*</span></Label>
              <Input id="representativePosition" {...register("representativePosition")} />
              {errors.representativePosition && <p className="text-sm text-red-500">{errors.representativePosition.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : (mode === "create" ? "Thêm mới" : "Lưu thay đổi")}
        </Button>
      </div>
    </form>
  )
}
