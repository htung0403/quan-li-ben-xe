import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUIStore } from "@/store/ui.store"

interface ShiftSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SHIFTS = [
  { id: "ca-1", name: "Ca 1 (06:00 - 14:00)" },
  { id: "ca-2", name: "Ca 2 (14:00 - 22:00)" },
  { id: "ca-3", name: "Ca 3 (22:00 - 06:00)" },
  { id: "hanh-chinh", name: "Hành chính (07:30 - 17:00)" },
]

export function ShiftSelectionDialog({ open, onOpenChange }: ShiftSelectionDialogProps) {
  const { currentShift, setCurrentShift } = useUIStore()
  const [selectedShift, setSelectedShift] = useState(currentShift)

  const handleSave = () => {
    setCurrentShift(selectedShift)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chọn ca trực</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup value={selectedShift} onValueChange={setSelectedShift}>
            {SHIFTS.map((shift) => (
              <div key={shift.id} className="flex items-center space-x-2">
                <RadioGroupItem value={shift.name} id={shift.id} />
                <Label htmlFor={shift.id}>{shift.name}</Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="<Trống>" id="empty" />
                <Label htmlFor="empty">Không chọn (Trống)</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
