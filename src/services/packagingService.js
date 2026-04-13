// src/services/packagingService.js
// Mock implementation - Replace with real API calls when backend is ready

import axios from './axiosInstance';
import { API_URLS } from '../config/api';

// const BASE_URL = `${API_URLS.MAIN}/api/packaging`;

// ============================================================================
// MOCK DATA - Remove this section when connecting to real API
// ============================================================================

const MOCK_TASKS = [
  {
    taskId: 1,
    orderId: "DH-8901",
    orderType: "FRESH",
    customerId: 123,
    customerName: "Nguyễn Thị Mai",
    customerPhone: "0901234567",
    deliveryAddress: "123 Hoàng Hoa Thám, Ba Đình, Hà Nội",
    itemCount: 3,
    totalWeight: 1.2,
    weightUnit: "KILOGRAM",
    deadline: "2026-04-08T10:00:00Z",
    priority: "HIGH",
    status: "WAITING",
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    specialInstructions: "Giao trước 10:00, khách yêu cầu gọi điện trước khi giao",
    requiresRefrigeration: true,
    createdAt: "2026-04-08T07:30:00Z",
    startedAt: null,
    completedAt: null
  },
  {
    taskId: 2,
    orderId: "DH-8902",
    orderType: "FROZEN",
    customerId: 124,
    customerName: "Trần Văn Hùng",
    customerPhone: "0912345678",
    deliveryAddress: "456 Láng Hạ, Đống Đa, Hà Nội",
    itemCount: 5,
    totalWeight: 2.5,
    weightUnit: "KILOGRAM",
    deadline: "2026-04-08T14:00:00Z",
    priority: "MEDIUM",
    status: "PACKAGING",
    assignedEmployeeId: 45,
    assignedEmployeeName: "Nguyễn Thị Cẩm",
    specialInstructions: null,
    requiresRefrigeration: true,
    createdAt: "2026-04-08T07:00:00Z",
    startedAt: "2026-04-08T08:15:00Z",
    completedAt: null
  },
  {
    taskId: 3,
    orderId: "DH-8903",
    orderType: "DRY",
    customerId: 125,
    customerName: "Lê Thị Hoa",
    customerPhone: "0923456789",
    deliveryAddress: "789 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    itemCount: 2,
    totalWeight: 0.8,
    weightUnit: "KILOGRAM",
    deadline: "2026-04-08T16:00:00Z",
    priority: "LOW",
    status: "QUALITY_CHECK",
    assignedEmployeeId: 46,
    assignedEmployeeName: "Trần Văn Nam",
    specialInstructions: null,
    requiresRefrigeration: false,
    createdAt: "2026-04-08T06:30:00Z",
    startedAt: "2026-04-08T07:00:00Z",
    completedAt: "2026-04-08T07:25:00Z"
  },
  {
    taskId: 4,
    orderId: "DH-8904",
    orderType: "FRESH",
    customerId: 126,
    customerName: "Phạm Minh Tuấn",
    customerPhone: "0934567890",
    deliveryAddress: "321 Giải Phóng, Hai Bà Trưng, Hà Nội",
    itemCount: 4,
    totalWeight: 1.8,
    weightUnit: "KILOGRAM",
    deadline: "2026-04-08T11:30:00Z",
    priority: "HIGH",
    status: "WAITING",
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    specialInstructions: "Hàng dễ vỡ, cẩn thận khi đóng gói",
    requiresRefrigeration: true,
    createdAt: "2026-04-08T07:45:00Z",
    startedAt: null,
    completedAt: null
  },
  {
    taskId: 5,
    orderId: "DH-8905",
    orderType: "FRESH",
    customerId: 127,
    customerName: "Vũ Thị Lan",
    customerPhone: "0945678901",
    deliveryAddress: "654 Cầu Giấy, Cầu Giấy, Hà Nội",
    itemCount: 6,
    totalWeight: 3.2,
    weightUnit: "KILOGRAM",
    deadline: "2026-04-08T15:00:00Z",
    priority: "MEDIUM",
    status: "READY_FOR_DELIVERY",
    assignedEmployeeId: 47,
    assignedEmployeeName: "Lê Hoàng Duy",
    specialInstructions: null,
    requiresRefrigeration: true,
    createdAt: "2026-04-08T06:00:00Z",
    startedAt: "2026-04-08T06:30:00Z",
    completedAt: "2026-04-08T07:15:00Z"
  }
];

const MOCK_TASK_DETAIL = {
  taskId: 1,
  orderId: "DH-8901",
  orderType: "FRESH",
  customer: {
    customerId: 123,
    name: "Nguyễn Thị Mai",
    phone: "0901234567",
    email: "mai@example.com",
    deliveryAddress: "123 Hoàng Hoa Thám, Ba Đình, Hà Nội"
  },
  items: [
    {
      productDetailId: 501,
      productName: "Cà chua bi",
      quantity: 2,
      unit: "KILOGRAM",
      warehouseLocation: "Kho A - Rack 3 - Level 2",
      requiresRefrigeration: true,
      expiryDate: "2026-04-15"
    },
    {
      productDetailId: 502,
      productName: "Xà lách xoăn",
      quantity: 500,
      unit: "GRAM",
      warehouseLocation: "Kho A - Fridge 1",
      requiresRefrigeration: true,
      expiryDate: "2026-04-12"
    },
    {
      productDetailId: 503,
      productName: "Dầu ăn Simply",
      quantity: 1,
      unit: "LITER",
      warehouseLocation: "Kho B - Rack 1 - Level 1",
      requiresRefrigeration: false,
      expiryDate: "2027-01-01"
    }
  ],
  packagingRequirements: {
    boxSize: "LARGE",
    needsIcePack: true,
    icePackCount: 2,
    needsInsulation: true,
    fragile: false
  },
  timeline: {
    orderPlaced: "2026-04-08T07:30:00Z",
    readyForPackaging: "2026-04-08T08:00:00Z",
    packagingStarted: null,
    packagingCompleted: null,
    qualityCheckPassed: null,
    readyForDelivery: null
  },
  priority: "HIGH",
  status: "WAITING",
  deadline: "2026-04-08T10:00:00Z",
  specialInstructions: "Giao trước 10:00, khách yêu cầu gọi điện trước khi giao",
  assignedEmployee: null
};

const MOCK_STATS = {
  waitingCount: 3,
  packagingCount: 2,
  qualityCheckCount: 1,
  readyForDeliveryCount: 5,
  activeEmployees: 3,
  totalPackagingEmployees: 5,
  averagePackagingTime: 18.5,
  completedToday: 12,
  onTimeRate: 0.92
};

const MOCK_EMPLOYEES = [
  {
    employeeId: 45,
    name: "Nguyễn Thị Cẩm",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    role: "Packaging Staff",
    status: "BUSY",
    currentTaskId: 2,
    currentTaskOrderId: "DH-8902",
    currentTaskProgress: 65,
    stats: {
      ordersToday: 8,
      ordersThisWeek: 43,
      averageTimePerOrder: 17.5,
      onTimeRate: 0.95
    },
    shiftStart: "2026-04-08T07:00:00Z",
    shiftEnd: "2026-04-08T15:00:00Z"
  },
  {
    employeeId: 46,
    name: "Trần Văn Nam",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
    role: "Packaging Staff",
    status: "AVAILABLE",
    currentTaskId: null,
    currentTaskOrderId: null,
    currentTaskProgress: 0,
    stats: {
      ordersToday: 6,
      ordersThisWeek: 38,
      averageTimePerOrder: 19.2,
      onTimeRate: 0.88
    },
    shiftStart: "2026-04-08T07:00:00Z",
    shiftEnd: "2026-04-08T15:00:00Z"
  },
  {
    employeeId: 47,
    name: "Lê Hoàng Duy",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    role: "Packaging Staff",
    status: "BUSY",
    currentTaskId: 5,
    currentTaskOrderId: "DH-8905",
    currentTaskProgress: 90,
    stats: {
      ordersToday: 10,
      ordersThisWeek: 52,
      averageTimePerOrder: 15.8,
      onTimeRate: 0.98
    },
    shiftStart: "2026-04-08T07:00:00Z",
    shiftEnd: "2026-04-08T15:00:00Z"
  },
  {
    employeeId: 48,
    name: "Phạm Thị Hương",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    role: "Packaging Staff",
    status: "BREAK",
    currentTaskId: null,
    currentTaskOrderId: null,
    currentTaskProgress: 0,
    stats: {
      ordersToday: 5,
      ordersThisWeek: 35,
      averageTimePerOrder: 20.1,
      onTimeRate: 0.85
    },
    shiftStart: "2026-04-08T07:00:00Z",
    shiftEnd: "2026-04-08T15:00:00Z"
  },
  {
    employeeId: 49,
    name: "Hoàng Văn Minh",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    role: "Packaging Staff",
    status: "OFFLINE",
    currentTaskId: null,
    currentTaskOrderId: null,
    currentTaskProgress: 0,
    stats: {
      ordersToday: 0,
      ordersThisWeek: 0,
      averageTimePerOrder: 0,
      onTimeRate: 0
    },
    shiftStart: "2026-04-08T13:00:00Z",
    shiftEnd: "2026-04-08T21:00:00Z"
  }
];

const MOCK_EMPLOYEE_TASK_HISTORY = {
  employeeId: 45,
  employeeName: "Nguyễn Thị Cẩm",
  date: "2026-04-08",
  tasks: [
    {
      taskId: 11,
      orderId: "DH-8891",
      startedAt: "2026-04-08T07:15:00Z",
      completedAt: "2026-04-08T07:32:00Z",
      duration: 17,
      status: "COMPLETED",
      onTime: true
    },
    {
      taskId: 12,
      orderId: "DH-8892",
      startedAt: "2026-04-08T07:35:00Z",
      completedAt: "2026-04-08T07:58:00Z",
      duration: 23,
      status: "COMPLETED",
      onTime: true
    },
    {
      taskId: 13,
      orderId: "DH-8893",
      startedAt: "2026-04-08T08:00:00Z",
      completedAt: "2026-04-08T08:15:00Z",
      duration: 15,
      status: "COMPLETED",
      onTime: true
    }
  ],
  totalTasks: 8,
  averageDuration: 18.5,
  totalWorkTime: 148
};

const MOCK_INSTRUCTIONS = [
  {
    categoryType: "FRESH",
    categoryName: "Sản phẩm tươi sống",
    icon: "🥬",
    steps: [
      "Kiểm tra nhiệt độ sản phẩm (2-4°C)",
      "Sử dụng túi cách nhiệt chuyên dụng",
      "Thêm ice pack theo yêu cầu (1 pack/kg)",
      "Dán nhãn \"HÀNG TƯƠI SỐNG - GIAO NHANH\"",
      "Ghi rõ hạn sử dụng trên nhãn"
    ],
    videoUrl: "https://video.example.com/fresh-packaging.mp4"
  },
  {
    categoryType: "FROZEN",
    categoryName: "Sản phẩm đông lạnh",
    icon: "❄️",
    steps: [
      "Kiểm tra nhiệt độ sản phẩm (-18°C)",
      "Sử dụng thùng xốp chuyên dụng",
      "Ice pack tối thiểu 3 miếng/đơn",
      "Dán niêm phong nhiệt độ",
      "Dán nhãn \"ĐÔNG LẠNH - GIAO NHANH\""
    ],
    videoUrl: "https://video.example.com/frozen-packaging.mp4"
  },
  {
    categoryType: "DRY",
    categoryName: "Sản phẩm khô",
    icon: "📦",
    steps: [
      "Kiểm tra bao bì sản phẩm nguyên vẹn",
      "Sử dụng giấy đệm chống va đập",
      "Xếp sản phẩm nặng xuống dưới",
      "Dán nhãn cẩn thận, dễ nhìn",
      "Niêm phong thùng hàng"
    ],
    videoUrl: "https://video.example.com/dry-packaging.mp4"
  }
];

// ============================================================================
// MOCK HELPER FUNCTIONS
// ============================================================================

const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          type: 'GOOD',
          detail: data
        }
      });
    }, delay);
  });
};

const mockApiError = (message, delay = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({
        response: {
          data: {
            type: 'ERROR',
            message: message
          }
        }
      });
    }, delay);
  });
};

// ============================================================================
// API FUNCTIONS - Currently using mock data
// ============================================================================

/**
 * Get list of packaging tasks with filters
 * @param {Object} params - Query parameters
 * @param {number} params.pageNum - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 * @param {string} params.status - Filter by status (WAITING | PACKAGING | QUALITY_CHECK | READY_FOR_DELIVERY)
 * @param {string} params.priority - Filter by priority (HIGH | MEDIUM | LOW)
 * @param {number} params.employeeId - Filter by assigned employee
 * @param {string} params.searchTerm - Search by order ID or customer name
 * @param {string} params.deadlineBefore - Filter by deadline (ISO date)
 * @param {string} params.sortBy - Sort field (deadline | priority | createdAt)
 * @param {string} params.sortOrder - Sort order (ASC | DESC)
 */
export const getPackagingTasks = (params = {}) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/tasks`, { params });

  // Mock implementation
  let filteredTasks = [...MOCK_TASKS];

  // Apply filters
  if (params.status) {
    filteredTasks = filteredTasks.filter(task => task.status === params.status);
  }
  if (params.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
  }
  if (params.employeeId) {
    filteredTasks = filteredTasks.filter(task => task.assignedEmployeeId === params.employeeId);
  }
  if (params.searchTerm) {
    const search = params.searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.orderId.toLowerCase().includes(search) ||
      task.customerName.toLowerCase().includes(search)
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filteredTasks.sort((a, b) => {
      let aVal = a[params.sortBy];
      let bVal = b[params.sortBy];

      if (params.sortOrder === 'DESC') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  // Apply pagination
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedTasks = filteredTasks.slice(start, end);

  return mockApiCall({
    tasks: paginatedTasks,
    totalElements: filteredTasks.length,
    totalPages: Math.ceil(filteredTasks.length / pageSize),
    currentPage: pageNum
  });
};

/**
 * Get detailed information for a specific packaging task
 * @param {number} taskId - Task ID
 */
export const getPackagingTaskById = (taskId) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/tasks/${taskId}`);

  // Mock implementation
  const task = MOCK_TASKS.find(t => t.taskId === taskId);

  if (!task) {
    return mockApiError(`Task with ID ${taskId} not found`);
  }

  // Create detailed task based on mock template
  const detailedTask = {
    ...MOCK_TASK_DETAIL,
    taskId: task.taskId,
    orderId: task.orderId,
    orderType: task.orderType,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline,
    specialInstructions: task.specialInstructions,
    customer: {
      customerId: task.customerId,
      name: task.customerName,
      phone: task.customerPhone,
      email: `${task.customerName.toLowerCase().replace(/\s/g, '')}@example.com`,
      deliveryAddress: task.deliveryAddress
    },
    assignedEmployee: task.assignedEmployeeId ? {
      employeeId: task.assignedEmployeeId,
      name: task.assignedEmployeeName,
      avatarUrl: `https://i.pravatar.cc/150?img=${task.assignedEmployeeId}`
    } : null,
    timeline: {
      ...MOCK_TASK_DETAIL.timeline,
      packagingStarted: task.startedAt,
      packagingCompleted: task.completedAt
    }
  };

  return mockApiCall(detailedTask);
};

/**
 * Start packaging task - Assign employee and begin packaging
 * @param {number} taskId - Task ID
 * @param {number} employeeId - Employee ID to assign
 */
export const startPackagingTask = (taskId, employeeId) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.post(`${BASE_URL}/tasks/${taskId}/start`, { employeeId });

  // Mock implementation
  const task = MOCK_TASKS.find(t => t.taskId === taskId);

  if (!task) {
    return mockApiError(`Task with ID ${taskId} not found`);
  }

  if (task.status !== 'WAITING') {
    return mockApiError('Task is not in WAITING status');
  }

  // Update mock task
  task.status = 'PACKAGING';
  task.assignedEmployeeId = employeeId;
  task.startedAt = new Date().toISOString();

  const employee = MOCK_EMPLOYEES.find(e => e.employeeId === employeeId);
  if (employee) {
    task.assignedEmployeeName = employee.name;
    employee.status = 'BUSY';
    employee.currentTaskId = taskId;
    employee.currentTaskOrderId = task.orderId;
  }

  return mockApiCall({
    taskId: task.taskId,
    status: task.status,
    assignedEmployeeId: task.assignedEmployeeId,
    startedAt: task.startedAt,
    message: "Bắt đầu đóng gói thành công"
  });
};

/**
 * Complete packaging task - Mark as ready for quality check
 * @param {number} taskId - Task ID
 * @param {Object} data - Completion data
 * @param {number} data.employeeId - Employee ID
 * @param {string} data.notes - Optional notes
 */
export const completePackagingTask = (taskId, data) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.put(`${BASE_URL}/tasks/${taskId}/complete`, data);

  // Mock implementation
  const task = MOCK_TASKS.find(t => t.taskId === taskId);

  if (!task) {
    return mockApiError(`Task with ID ${taskId} not found`);
  }

  if (task.status !== 'PACKAGING') {
    return mockApiError('Task is not in PACKAGING status');
  }

  // Update mock task
  task.status = 'QUALITY_CHECK';
  task.completedAt = new Date().toISOString();

  // Update employee status
  const employee = MOCK_EMPLOYEES.find(e => e.employeeId === data.employeeId);
  if (employee) {
    employee.status = 'AVAILABLE';
    employee.currentTaskId = null;
    employee.currentTaskOrderId = null;
    employee.stats.ordersToday += 1;
  }

  return mockApiCall({
    taskId: task.taskId,
    status: task.status,
    completedAt: task.completedAt,
    message: "Hoàn thành đóng gói"
  });
};

/**
 * Perform quality check on packaged order
 * @param {number} taskId - Task ID
 * @param {Object} data - Quality check data
 * @param {number} data.inspectorEmployeeId - Inspector employee ID
 * @param {boolean} data.passed - Whether quality check passed
 * @param {Object} data.checklist - Checklist items
 * @param {string} data.notes - Optional notes
 * @param {Array<string>} data.photoUrls - Optional photo URLs
 */
export const performQualityCheck = (taskId, data) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.post(`${BASE_URL}/tasks/${taskId}/quality-check`, data);

  // Mock implementation
  const task = MOCK_TASKS.find(t => t.taskId === taskId);

  if (!task) {
    return mockApiError(`Task with ID ${taskId} not found`);
  }

  if (task.status !== 'QUALITY_CHECK') {
    return mockApiError('Task is not in QUALITY_CHECK status');
  }

  // Update mock task
  if (data.passed) {
    task.status = 'READY_FOR_DELIVERY';
  } else {
    task.status = 'PACKAGING'; // Send back to packaging if failed
  }

  return mockApiCall({
    taskId: task.taskId,
    status: task.status,
    qualityCheckPassed: data.passed,
    checkedAt: new Date().toISOString(),
    message: data.passed ? "Kiểm tra chất lượng thành công" : "Không đạt chuẩn, cần đóng gói lại"
  });
};

/**
 * Get packaging statistics for dashboard
 * @param {string} date - Optional date (ISO format, default: today)
 */
export const getPackagingStats = (date) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/stats`, { params: { date } });

  // Mock implementation - calculate from current MOCK_TASKS
  const stats = {
    waitingCount: MOCK_TASKS.filter(t => t.status === 'WAITING').length,
    packagingCount: MOCK_TASKS.filter(t => t.status === 'PACKAGING').length,
    qualityCheckCount: MOCK_TASKS.filter(t => t.status === 'QUALITY_CHECK').length,
    readyForDeliveryCount: MOCK_TASKS.filter(t => t.status === 'READY_FOR_DELIVERY').length,
    activeEmployees: MOCK_EMPLOYEES.filter(e => e.status === 'BUSY').length,
    totalPackagingEmployees: MOCK_EMPLOYEES.length,
    averagePackagingTime: MOCK_STATS.averagePackagingTime,
    completedToday: MOCK_STATS.completedToday,
    onTimeRate: MOCK_STATS.onTimeRate
  };

  return mockApiCall(stats);
};

/**
 * Get list of packaging employees with availability status
 * @param {string} status - Optional filter by status (AVAILABLE | BUSY | BREAK | OFFLINE)
 * @param {boolean} includeStats - Include performance statistics
 */
export const getPackagingEmployees = (status, includeStats = true) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/../employees/packaging`, { params: { status, includeStats } });

  // Mock implementation
  let employees = [...MOCK_EMPLOYEES];

  if (status) {
    employees = employees.filter(e => e.status === status);
  }

  if (!includeStats) {
    employees = employees.map(e => {
      const { stats, ...employeeWithoutStats } = e;
      return employeeWithoutStats;
    });
  }

  return mockApiCall(employees);
};

/**
 * Get task history for a specific employee
 * @param {number} employeeId - Employee ID
 * @param {string} date - Optional date (ISO format, default: today)
 * @param {number} pageNum - Page number
 * @param {number} pageSize - Page size
 */
export const getEmployeeTaskHistory = (employeeId, date, pageNum = 1, pageSize = 10) => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/../employees/${employeeId}/tasks`, {
  //   params: { date, pageNum, pageSize }
  // });

  // Mock implementation
  const employee = MOCK_EMPLOYEES.find(e => e.employeeId === employeeId);

  if (!employee) {
    return mockApiError(`Employee with ID ${employeeId} not found`);
  }

  return mockApiCall({
    ...MOCK_EMPLOYEE_TASK_HISTORY,
    employeeId,
    employeeName: employee.name
  });
};

/**
 * Get packaging instructions by product type
 */
export const getPackagingInstructions = () => {
  // TODO: Replace with real API call when backend is ready
  // return axios.get(`${BASE_URL}/instructions`);

  // Mock implementation
  return mockApiCall(MOCK_INSTRUCTIONS);
};
