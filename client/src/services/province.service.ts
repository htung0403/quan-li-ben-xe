// Service để gọi API provinces.open-api.vn
// API documentation: https://provinces.open-api.vn/

export interface Province {
  code: number
  name: string
  districts?: District[]
}

export interface District {
  code: number
  name: string
  wards?: Ward[]
}

export interface Ward {
  code: number
  name: string
}

const API_BASE_V1 = 'https://provinces.open-api.vn/api/v1'
const API_BASE_V2 = 'https://provinces.open-api.vn/api/v2'

export const provinceService = {
  // V1 API - Trước sáp nhập
  // GET /api/v1/p/ - Lấy danh sách tỉnh
  getProvincesV1: async (): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_V1}/p/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch provinces: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },

  // GET /api/v1/p/{code}?depth=2 - Lấy districts của tỉnh
  getDistrictsByProvinceV1: async (provinceCode: number): Promise<District[]> => {
    const response = await fetch(`${API_BASE_V1}/p/${provinceCode}?depth=2`)
    if (!response.ok) {
      throw new Error(`Failed to fetch districts: ${response.statusText}`)
    }
    const data = await response.json()
    return data.districts || []
  },

  // GET /api/v1/d/{code}?depth=2 - Lấy wards của district
  getWardsByDistrictV1: async (districtCode: number): Promise<Ward[]> => {
    const response = await fetch(`${API_BASE_V1}/d/${districtCode}?depth=2`)
    if (!response.ok) {
      throw new Error(`Failed to fetch wards: ${response.statusText}`)
    }
    const data = await response.json()
    return data.wards || []
  },

  // V2 API - Sau sáp nhập
  // GET /api/v2/p/ - Lấy danh sách tỉnh
  getProvincesV2: async (): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_V2}/p/`)
    if (!response.ok) {
      throw new Error(`Failed to fetch provinces: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },

  // GET /api/v2/p/{code}?depth=2 - Lấy wards (phường/xã) trực tiếp từ tỉnh (sau sáp nhập)
  getWardsByProvinceV2: async (provinceCode: number): Promise<Ward[]> => {
    const response = await fetch(`${API_BASE_V2}/p/${provinceCode}?depth=2`)
    if (!response.ok) {
      throw new Error(`Failed to fetch wards: ${response.statusText}`)
    }
    const data = await response.json()
    return data.wards || []
  },

  // Tìm kiếm tỉnh
  searchProvincesV1: async (query: string): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_V1}/p/search/?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Failed to search provinces: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },

  // Tìm kiếm district
  searchDistrictsV1: async (query: string, provinceCode: number): Promise<District[]> => {
    const response = await fetch(`${API_BASE_V1}/d/search/?q=${encodeURIComponent(query)}&p=${provinceCode}`)
    if (!response.ok) {
      throw new Error(`Failed to search districts: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  },
}

