import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/DatePicker";
import { dispatchService } from "@/services/dispatch.service";
import type { DispatchRecord } from "@/types";

interface ChoXeRaBenDialogProps {
  record: DispatchRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChoXeRaBenDialog({
  record,
  onClose,
  onSuccess,
}: ChoXeRaBenDialogProps) {
  const [exitTime, setExitTime] = useState<Date | undefined>(new Date());
  const [passengerCount, setPassengerCount] = useState(
    record.passengersDeparting?.toString() || "0"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!exitTime) {
      toast.error("Vui lòng chọn thời gian ra bến");
      return;
    }

    setIsLoading(true);
    try {
      await dispatchService.recordExit(
        record.id,
        exitTime.toISOString(),
        parseInt(passengerCount)
      );
      toast.success("Cho xe ra bến thành công!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to record exit:", error);
      toast.error("Không thể cho xe ra bến. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Biển kiểm soát
          </Label>
          <Input
            value={record.vehiclePlateNumber}
            readOnly
            className="bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <Label
            htmlFor="exitTime"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Thời gian ra bến (*)
          </Label>
          <div className="relative">
            <DateTimePicker
              date={exitTime || null}
              onDateChange={setExitTime}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="passengerCount"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Số khách xuất bến
          </Label>
          <Input
            id="passengerCount"
            type="number"
            value={passengerCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassengerCount(e.target.value)
            }
            required
            className="flex-1"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          HỦY
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Đang xử lý..." : "XÁC NHẬN"}
        </Button>
      </div>
    </form>
  );
}
