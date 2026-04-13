export const deliveryOrders = [
  {
    id: 'del-001',
    orderId: 'DH-8901',
    status: 'PENDING',
    priority: 'NORMAL',
    customer: {
      id: 'cust-001',
      name: 'Nguyễn Thị Mai',
      phone: '0912345678',
      address: '123 Hoàng Hoa Thám, Ba Đình, Hà Nội',
      coordinates: { lat: 21.0285, lng: 105.8542 }
    },
    driver: null,
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-001',
        productName: 'Cá hồi tươi',
        quantity: 2,
        unitPrice: 150000,
        totalPrice: 300000
      },
      {
        productId: 'prod-002',
        productName: 'Tôm sú',
        quantity: 1,
        unitPrice: 200000,
        totalPrice: 200000
      }
    ],
    totalAmount: 500000,
    shippingFee: 35000,
    distance: 4.2,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    estimatedDeliveryTime: '2026-04-09T14:30:00Z',
    actualDeliveryTime: null,
    createdAt: '2026-04-09T10:00:00Z',
    updatedAt: '2026-04-09T10:00:00Z',
    notes: 'Gọi trước khi giao 15 phút',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-09T10:00:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo'
      }
    ]
  },
  {
    id: 'del-002',
    orderId: 'DH-8902',
    status: 'DELIVERING',
    priority: 'URGENT',
    customer: {
      id: 'cust-002',
      name: 'Trần Văn Hùng',
      phone: '0987654321',
      address: '789 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      coordinates: { lat: 21.0015, lng: 105.8125 }
    },
    driver: {
      id: 'drv-001',
      name: 'Lê Hoàng Duy',
      phone: '0901234567',
      vehicleType: 'MOTORCYCLE',
      currentLocation: { lat: 21.0100, lng: 105.8200 }
    },
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-003',
        productName: 'Mực tươi',
        quantity: 3,
        unitPrice: 120000,
        totalPrice: 360000
      }
    ],
    totalAmount: 360000,
    shippingFee: 30000,
    distance: 3.8,
    paymentMethod: 'PAID',
    paymentStatus: 'PAID',
    estimatedDeliveryTime: '2026-04-09T13:00:00Z',
    actualDeliveryTime: null,
    createdAt: '2026-04-09T09:30:00Z',
    updatedAt: '2026-04-09T11:30:00Z',
    notes: '',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-09T09:30:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo'
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-09T10:00:00Z',
        updatedBy: 'admin-001',
        notes: 'Phân công cho tài xế Lê Hoàng Duy'
      },
      {
        status: 'PICKED_UP',
        timestamp: '2026-04-09T11:00:00Z',
        updatedBy: 'drv-001',
        notes: 'Đã lấy hàng tại kho'
      },
      {
        status: 'DELIVERING',
        timestamp: '2026-04-09T11:30:00Z',
        updatedBy: 'drv-001',
        notes: 'Đang trên đường giao hàng'
      }
    ]
  },
  {
    id: 'del-003',
    orderId: 'DH-8903',
    status: 'DELIVERED',
    priority: 'NORMAL',
    customer: {
      id: 'cust-003',
      name: 'Phạm Thị Lan',
      phone: '0976543210',
      address: '321 Giải Phóng, Hai Bà Trưng, Hà Nội',
      coordinates: { lat: 20.9985, lng: 105.8415 }
    },
    driver: {
      id: 'drv-002',
      name: 'Nguyễn Văn Minh',
      phone: '0911223344',
      vehicleType: 'MOTORCYCLE',
      currentLocation: { lat: 20.9985, lng: 105.8415 }
    },
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-004',
        productName: 'Cá thu',
        quantity: 1,
        unitPrice: 180000,
        totalPrice: 180000
      },
      {
        productId: 'prod-005',
        productName: 'Ghẹ',
        quantity: 2,
        unitPrice: 250000,
        totalPrice: 500000
      }
    ],
    totalAmount: 680000,
    shippingFee: 40000,
    distance: 5.1,
    paymentMethod: 'COD',
    paymentStatus: 'PAID',
    estimatedDeliveryTime: '2026-04-08T15:00:00Z',
    actualDeliveryTime: '2026-04-08T14:45:00Z',
    createdAt: '2026-04-08T12:00:00Z',
    updatedAt: '2026-04-08T14:45:00Z',
    notes: '',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-08T12:00:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo'
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-08T12:30:00Z',
        updatedBy: 'admin-001',
        notes: 'Phân công cho tài xế Nguyễn Văn Minh'
      },
      {
        status: 'PICKED_UP',
        timestamp: '2026-04-08T13:00:00Z',
        updatedBy: 'drv-002',
        notes: 'Đã lấy hàng tại kho'
      },
      {
        status: 'DELIVERING',
        timestamp: '2026-04-08T13:30:00Z',
        updatedBy: 'drv-002',
        notes: 'Đang trên đường giao hàng'
      },
      {
        status: 'DELIVERED',
        timestamp: '2026-04-08T14:45:00Z',
        updatedBy: 'drv-002',
        notes: 'Giao hàng thành công'
      }
    ]
  },
  {
    id: 'del-004',
    orderId: 'DH-8904',
    status: 'FAILED',
    priority: 'NORMAL',
    customer: {
      id: 'cust-004',
      name: 'Hoàng Văn Đức',
      phone: '0965432109',
      address: '555 Cầu Giấy, Cầu Giấy, Hà Nội',
      coordinates: { lat: 21.0333, lng: 105.7943 }
    },
    driver: {
      id: 'drv-003',
      name: 'Trần Thị Hương',
      phone: '0944556677',
      vehicleType: 'MOTORCYCLE',
      currentLocation: { lat: 21.0245, lng: 105.8412 }
    },
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-006',
        productName: 'Bạch tuộc',
        quantity: 1,
        unitPrice: 300000,
        totalPrice: 300000
      }
    ],
    totalAmount: 300000,
    shippingFee: 35000,
    distance: 4.5,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    estimatedDeliveryTime: '2026-04-07T16:00:00Z',
    actualDeliveryTime: null,
    createdAt: '2026-04-07T13:00:00Z',
    updatedAt: '2026-04-07T15:30:00Z',
    notes: '',
    failureReason: 'CUSTOMER_NOT_AVAILABLE',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-07T13:00:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo'
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-07T13:30:00Z',
        updatedBy: 'admin-001',
        notes: 'Phân công cho tài xế Trần Thị Hương'
      },
      {
        status: 'PICKED_UP',
        timestamp: '2026-04-07T14:00:00Z',
        updatedBy: 'drv-003',
        notes: 'Đã lấy hàng tại kho'
      },
      {
        status: 'DELIVERING',
        timestamp: '2026-04-07T14:30:00Z',
        updatedBy: 'drv-003',
        notes: 'Đang trên đường giao hàng'
      },
      {
        status: 'FAILED',
        timestamp: '2026-04-07T15:30:00Z',
        updatedBy: 'drv-003',
        notes: 'Khách hàng không nghe máy, không có mặt tại địa chỉ'
      }
    ]
  },
  {
    id: 'del-005',
    orderId: 'DH-8905',
    status: 'PENDING',
    priority: 'URGENT',
    customer: {
      id: 'cust-005',
      name: 'Vũ Thị Thu',
      phone: '0933221100',
      address: '888 Láng, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0180, lng: 105.8020 }
    },
    driver: null,
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-007',
        productName: 'Cá ngừ',
        quantity: 1,
        unitPrice: 280000,
        totalPrice: 280000
      },
      {
        productId: 'prod-008',
        productName: 'Sò điệp',
        quantity: 2,
        unitPrice: 150000,
        totalPrice: 300000
      }
    ],
    totalAmount: 580000,
    shippingFee: 32000,
    distance: 3.5,
    paymentMethod: 'PAID',
    paymentStatus: 'PAID',
    estimatedDeliveryTime: '2026-04-09T12:30:00Z',
    actualDeliveryTime: null,
    createdAt: '2026-04-09T09:00:00Z',
    updatedAt: '2026-04-09T09:00:00Z',
    notes: 'Hàng cần giao gấp, khách VIP',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-09T09:00:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo - Ưu tiên cao'
      }
    ]
  },
  {
    id: 'del-006',
    orderId: 'DH-8906',
    status: 'DELIVERING',
    priority: 'NORMAL',
    customer: {
      id: 'cust-006',
      name: 'Đỗ Minh Tuấn',
      phone: '0922334455',
      address: '100 Trường Chinh, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0050, lng: 105.8200 }
    },
    driver: {
      id: 'drv-004',
      name: 'Nguyễn Thị Cẩm',
      phone: '0955667788',
      vehicleType: 'MOTORCYCLE',
      currentLocation: { lat: 21.0080, lng: 105.8250 }
    },
    warehouse: {
      id: 'wh-001',
      name: 'Kho Hà Nội',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      coordinates: { lat: 21.0245, lng: 105.8412 }
    },
    items: [
      {
        productId: 'prod-009',
        productName: 'Tôm hùm',
        quantity: 1,
        unitPrice: 500000,
        totalPrice: 500000
      }
    ],
    totalAmount: 500000,
    shippingFee: 30000,
    distance: 2.8,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    estimatedDeliveryTime: '2026-04-09T13:30:00Z',
    actualDeliveryTime: null,
    createdAt: '2026-04-09T10:30:00Z',
    updatedAt: '2026-04-09T11:45:00Z',
    notes: '',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-04-09T10:30:00Z',
        updatedBy: 'system',
        notes: 'Đơn hàng được tạo'
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-04-09T11:00:00Z',
        updatedBy: 'admin-001',
        notes: 'Phân công cho tài xế Nguyễn Thị Cẩm'
      },
      {
        status: 'PICKED_UP',
        timestamp: '2026-04-09T11:30:00Z',
        updatedBy: 'drv-004',
        notes: 'Đã lấy hàng tại kho'
      },
      {
        status: 'DELIVERING',
        timestamp: '2026-04-09T11:45:00Z',
        updatedBy: 'drv-004',
        notes: 'Đang trên đường giao hàng'
      }
    ]
  }
];
