import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { serviceChargeService } from "@/services/service-charge.service";
import type { ServiceType } from "@/types";

interface ThemDichVuDialogProps {
  dispatchRecordId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ThemDichVuDialog({
  dispatchRecordId,
  open,
  onClose,
  onSuccess,
}: ThemDichVuDialogProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadServiceTypes();
      setQuantity(1);
      setUnitPrice(0);
      setSelectedServiceTypeId("");
    }
  }, [open]);

  const loadServiceTypes = async () => {
    try {
      const types = await serviceChargeService.getServiceTypes(true);
      setServiceTypes(types);
    } catch (error) {
      console.error("Failed to load service types:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    }
  };

  const handleServiceTypeChange = (typeId: string) => {
    setSelectedServiceTypeId(typeId);
    const type = serviceTypes.find((t) => t.id === typeId);
    if (type) {
      setUnitPrice(type.basePrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceTypeId) {
      toast.warning("Vui lòng chọn loại dịch vụ");
      return;
    }

    setIsLoading(true);
    try {
      await serviceChargeService.create({
        dispatchRecordId,
        serviceTypeId: selectedServiceTypeId,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
      });
      toast.success("Thêm dịch vụ thành công");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add service:", error);
      toast.error("Không thể thêm dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Thêm dịch vụ</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceType">Loại dịch vụ</Label>
            <Select
              id="serviceType"
              value={selectedServiceTypeId}
              onChange={(e) => handleServiceTypeChange(e.target.value)}
              required
              className="mt-1"
            >
              <option value="">Chọn dịch vụ</option>
              {serviceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Số lượng</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="unitPrice">Đơn giá (VNĐ)</Label>
            <Input
              id="unitPrice"
              type="number"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
              className="mt-1"
              required
            />
          </div>

          <div className="pt-2 border-t flex justify-between items-center">
            <span className="font-semibold">Thành tiền:</span>
            <span className="font-bold text-lg text-blue-600">
              {(quantity * unitPrice).toLocaleString("vi-VN")} VNĐ
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Thêm"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
