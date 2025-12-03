import { Router } from 'express'
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllVehicles)
router.get('/:id', getVehicleById)
router.post('/', createVehicle)
router.put('/:id', updateVehicle)
router.delete('/:id', deleteVehicle)

export default router

