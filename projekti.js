// Jona Gecaj Start

class User {
  constructor({ id, name, email, passwordHash }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  getRole() {
    return this.constructor.name;
  }
}

class Student extends User {
  constructor({ id, name, email, passwordHash, studentId, phoneNumber }) {
    super({ id, name, email, passwordHash });
    this.studentId = studentId;
    this.phoneNumber = phoneNumber;
  }
}

class Staff extends User {
  constructor({ id, name, email, passwordHash, staffRole }) {
    super({ id, name, email, passwordHash });
    this.staffRole = staffRole;
  }
}

class UserRepository {
  findByEmail(email) {
    throw new Error("Not implemented");
  }

  save(user) {
    throw new Error("Not implemented");
  }
}

class LocalUserRepository extends UserRepository {
  constructor() {
    super();
    this.users = new Map();
  }

  findByEmail(email) {
    return this.users.get(email) || null;
  }

  save(user) {
    this.users.set(user.email, user);
    return user;
  }

  findById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  getAll() {
    return Array.from(this.users.values());
  }
}

class AuthenticationManager {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  registerStudent({ name, email, passwordHash, studentId, phoneNumber }) {
    const existingUser = this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const student = new Student({
      id: this._generateId(),
      name,
      email,
      passwordHash,
      studentId,
      phoneNumber
    });

    return this.userRepository.save(student);
  }

  registerStaff({ name, email, passwordHash, staffRole }) {
    const existingUser = this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const staff = new Staff({
      id: this._generateId(),
      name,
      email,
      passwordHash,
      staffRole
    });

    return this.userRepository.save(staff);
  }

  login(email, password) {
    const user = this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== password) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  _generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Jona Gecaj End








//Jona Berbatovci Start

class MenuItem {
  constructor({ id, name, price, category, isAvailable = true }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.isAvailable = isAvailable;
  }

  cloneSnapshot() {
    return new MenuItemSnapshot({
      name: this.name,
      price: this.price,
      category: this.category
    });
  }
}


class MenuItemSnapshot {
  constructor({ name, price, category }) {
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

class MenuRepository {
  loadMenu() {
    throw new Error("Not implemented");
  }

  saveMenuItem(item) {
    throw new Error("Not implemented");
  }

  removeMenuItem(id) {
    throw new Error("Not implemented");
  }
}


class LocalMenuRepository extends MenuRepository {
  constructor() {
    super();
    this.menuItems = new Map(); 
  }

  loadMenu() {
    return Array.from(this.menuItems.values()).filter(item => item.isAvailable);
  }

  saveMenuItem(item) {
    this.menuItems.set(item.id, item);
    return item;
  }

  removeMenuItem(id) {
    const item = this.menuItems.get(id);
    if (item) {
      this.menuItems.delete(id);
      return true;
    }
    return false;
  }

  findById(id) {
    return this.menuItems.get(id) || null;
  }
}


class MenuService {
  constructor(menuRepository) {
    this.menuRepository = menuRepository;
  }

  getMenu() {
    return this.menuRepository.loadMenu();
  }

  addMenuItem(item) {
    return this.menuRepository.saveMenuItem(item);
  }

  updateMenuItem(item) {
    return this.menuRepository.saveMenuItem(item);
  }

  removeMenuItem(id) {
    return this.menuRepository.removeMenuItem(id);
  }

  getMenuItemById(id) {
    return this.menuRepository.findById(id);
  }
}


class MenuServiceProxy {
  constructor(menuService, currentUserProvider) {
    this.menuService = menuService;
    this.currentUserProvider = currentUserProvider; 
  }

  _getCurrentUser() {
    return this.currentUserProvider ? this.currentUserProvider() : null;
  }

  _ensureStaff() {
    const user = this._getCurrentUser();
    if (!user || !(user instanceof Staff)) {
      throw new Error("Only staff members can modify the menu");
    }
  }

  getMenu() {

    return this.menuService.getMenu();
  }

  getMenuItemById(id) {
    return this.menuService.getMenuItemById(id);
  }

  addMenuItem(item) {
    this._ensureStaff();
    return this.menuService.addMenuItem(item);
  }

  updateMenuItem(item) {
    this._ensureStaff();
    return this.menuService.updateMenuItem(item);
  }

  removeMenuItem(id) {
    this._ensureStaff();
    return this.menuService.removeMenuItem(id);
  }
}
//Jona Berbatovci End









//Elion Sahiti Start

class CartItem {
  constructor({ menuItemId, quantity }) {
    this.menuItemId = menuItemId;
    this.quantity = quantity;
  }
}

class Cart {
  constructor({ id, studentId }) {
    this.id = id;
    this.studentId = studentId;
    this.items = new Map(); 
  }

  addItem(menuItemId, qty) {
    const existingItem = this.items.get(menuItemId);
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      this.items.set(menuItemId, new CartItem({ menuItemId, quantity: qty }));
    }
    return this;
  }

  removeItem(menuItemId) {
    this.items.delete(menuItemId);
    return this;
  }

  getTotal() {
    return 0;
  }

  clear() {
    this.items.clear();
    return this;
  }

  getItems() {
    return Array.from(this.items.values());
  }
}

class CartService {
  constructor(menuServiceProxy) {
    this.menuServiceProxy = menuServiceProxy;
    this.carts = new Map(); 
  }

  loadCart(studentId) {
    if (!this.carts.has(studentId)) {
      this.carts.set(
        studentId,
        new Cart({
          id: this._generateId(),
          studentId
        })
      );
    }
    return this.carts.get(studentId);
  }

  getCart(studentId) {
    return this.loadCart(studentId);
  }

  addItem(studentId, menuItemId, qty) {
    const cart = this.loadCart(studentId);
    const menuItem = this.menuServiceProxy.getMenuItemById(menuItemId);

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    if (!menuItem.isAvailable) {
      throw new Error("Menu item is not available");
    }

    cart.addItem(menuItemId, qty);
    return cart;
  }

  removeItem(studentId, menuItemId) {
    const cart = this.loadCart(studentId);
    cart.removeItem(menuItemId);
    return cart;
  }

  clearCart(studentId) {
    const cart = this.loadCart(studentId);
    cart.clear();
    return true;
  }

  _generateId() {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class OrderItem {
  constructor({ menuItemSnapshot, quantity }) {
    this.menuItemSnapshot = menuItemSnapshot;
    this.quantity = quantity;
  }

  getSubtotal() {
    return this.menuItemSnapshot.price * this.quantity;
  }
}

class Order {
  constructor({ id, studentId, status, createdAt, items = [] }) {
    this.id = id;
    this.studentId = studentId;
    this.status = status || "pending";
    this.createdAt = createdAt || new Date();
    this.items = items; 
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }
}

class OrderRepository {
  loadOrders() {
    throw new Error("Not implemented");
  }

  findById(id) {
    throw new Error("Not implemented");
  }

  save(order) {
    throw new Error("Not implemented");
  }
}

class LocalOrderRepository extends OrderRepository {
  constructor() {
    super();
    this.orders = new Map(); 
  }

  loadOrders() {
    return Array.from(this.orders.values());
  }

  findById(id) {
    return this.orders.get(id) || null;
  }

  save(order) {
    this.orders.set(order.id, order);
    return order;
  }

  findByStudentId(studentId) {
    return Array.from(this.orders.values()).filter(
      order => order.studentId === studentId
    );
  }
}

//Elion Sahiti End
//Ensar Avdiu Start

class PaymentStrategy {
  pay(amount) {
    throw new Error("Not implemented");
  }
}

class CardPaymentStrategy extends PaymentStrategy {
  pay(amount) {
   
    console.log(`Processing card payment of $${amount}`);
   
    return Math.random() > 0.1; 
  }
}

class CashPaymentStrategy extends PaymentStrategy {
  pay(amount) {

    console.log(`Processing cash payment of $${amount}`);
    return true;
  }
}

class PaymentFactory {
  constructor() {
    this.registry = new Map();
    this._registerDefaults();
  }

  _registerDefaults() {
    this.register("card", () => new CardPaymentStrategy());
    this.register("cash", () => new CashPaymentStrategy());
  }

  register(paymentType, creator) {
    this.registry.set(paymentType, creator);
  }

  create(paymentType) {
    const creator = this.registry.get(paymentType);
    if (!creator) {
      throw new Error(`Payment type '${paymentType}' is not supported`);
    }
    return creator();
  }
}

class PaymentProcessor {
  constructor(paymentFactory) {
    this.paymentFactory = paymentFactory || new PaymentFactory();
  }

  process(amount, paymentType) {
    const strategy = this.paymentFactory.create(paymentType);
    return strategy.pay(amount);
  }
}


class EmailNotification {
  send(to, message) {
    console.log(`[EMAIL] To: ${to}\nMessage: ${message}`);
    return true;
  }
}

class SMSNotification {
  send(to, message) {
    console.log(`[SMS] To: ${to}\nMessage: ${message}`);
    return true;
  }
}

class NotificationService {
  constructor() {
    this.emailNotification = new EmailNotification();
    this.smsNotification = new SMSNotification();
  }

  sendEmail(to, message) {
    return this.emailNotification.send(to, message);
  }

  sendSMS(to, message) {
    return this.smsNotification.send(to, message);
  }
}

class OrderNotificationHandler {
  constructor(notificationService) {
    this.notificationService = notificationService || new NotificationService();
  }

  notifyOrderPlaced(order) {
    const message = `Your order #${order.id} has been placed successfully. Total: $${order.getTotal()}`;
    this.notificationService.sendEmail(
      `student_${order.studentId}@example.com`,
      message
    );
    this.notificationService.sendSMS(`+1234567890`, message);
  }

  notifyStatusChanged(order) {
    const message = `Your order #${order.id} status has been updated to: ${order.status}`;
    this.notificationService.sendEmail(
      `student_${order.studentId}@example.com`,
      message
    );
    this.notificationService.sendSMS(`+1234567890`, message);
  }
}



class OrderService {
  constructor(
    orderRepository,
    paymentProcessor,
    orderNotificationHandler,
    menuServiceProxy,
    cartService
  ) {
    this.orderRepository = orderRepository;
    this.paymentProcessor = paymentProcessor;
    this.orderNotificationHandler = orderNotificationHandler;
    this.menuServiceProxy = menuServiceProxy;
    this.cartService = cartService;
  }

  placeOrder(studentId, paymentType) {
    const cart = this.cartService.loadCart(studentId);
    
    if (cart.getItems().length === 0) {
      throw new Error("Cart is empty");
    }

    
    const menu = this.menuServiceProxy.getMenu();
    const menuMap = new Map(menu.map(item => [item.id, item]));
    let calculatedTotal = 0;
    for (const cartItem of cart.getItems()) {
      const menuItem = menuMap.get(cartItem.menuItemId);
      if (menuItem) {
        calculatedTotal += menuItem.price * cartItem.quantity;
      }
    }

    const finalTotalAmount = calculatedTotal;

    const paymentResult = this.paymentProcessor.process(
      finalTotalAmount,
      paymentType
    );

    if (!paymentResult) {
      throw new Error("Payment failed");
    }

    const orderItems = cart.getItems().map(cartItem => {
      const menuItem = menuMap.get(cartItem.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${cartItem.menuItemId} not found`);
      }
      const snapshot = menuItem.cloneSnapshot();
      return new OrderItem({
        menuItemSnapshot: snapshot,
        quantity: cartItem.quantity
      });
    });

    const order = new Order({
      id: this._generateId(),
      studentId,
      status: "pending",
      createdAt: new Date(),
      items: orderItems
    });

    const savedOrder = this.orderRepository.save(order);

    this.cartService.clearCart(studentId);

    this.orderNotificationHandler.notifyOrderPlaced(savedOrder);

    return savedOrder;
  }

  updateStatus(orderId, newStatus) {
    const order = this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.updateStatus(newStatus);
    const updatedOrder = this.orderRepository.save(order);

    this.orderNotificationHandler.notifyStatusChanged(updatedOrder);

    return updatedOrder;
  }

  _generateId() {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

//Ensar Avdiu End