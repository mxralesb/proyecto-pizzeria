import "dotenv/config";
import bcrypt from "bcryptjs";

import {
  sequelize,
  User,
  MenuItem,
  Reservation,
  EmployeeRole,
  Employee,
  Cliente,
  Direccion,
  Telefono,
  Order,
  OrderItem,
} from "./models/index.js";

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Base de datos sincronizada");

    const adminPass = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@pizza.com",
      password: adminPass,
      role: "admin",
    });

    const clientDemoPass = await bcrypt.hash("cliente123", 10);
    await User.create({
      name: "Cliente Demo",
      email: "cliente@pizza.com",
      password: clientDemoPass,
      role: "cliente",
    });

    const clienteLogin = await Cliente.create({
      nombre: "Cliente",
      apellido: "Demo",
      correo_electronico: "cliente@pizza.com",
      contrasena: clientDemoPass,
    });

    await MenuItem.bulkCreate([
      {
        name: "Margarita",
        description:
          "Salsa de tomate San Marzano, mozzarella fresca y albahaca.",
        price: 65.0,
        category: "pizza",
        image:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Pepperoni",
        description: "Mozzarella, salsa de tomate y pepperoni crujiente.",
        price: 72.0,
        category: "pizza",
        image:
          "https://www.sortirambnens.com/wp-content/uploads/2019/02/pizza-de-peperoni.jpg",
      },
      {
        name: "Cuatro Quesos",
        description: "Mozzarella, gorgonzola, parmesano y provolone.",
        price: 78.0,
        category: "pizza",
        image:
          "https://www.hola.com/horizon/landscape/e8bb41b65869-pizzacuatroquesos-adob-t.jpg?im=Resize=(960),type=downsize",
      },
      {
        name: "Hawaiana",
        description: "Jamón, piña caramelizada y mozzarella.",
        price: 74.0,
        category: "pizza",
        image: "https://elmen.pe/wp-content/uploads/2023/05/Pizza-hawaiana.jpg",
      },
      {
        name: "Coca-Cola 600ml",
        description: "Bebida fría para acompañar.",
        price: 12.0,
        category: "bebida",
        image:
          "https://st2.depositphotos.com/1817018/7897/i/950/depositphotos_78973132-stock-photo-coca-cola-drink-glass-with.jpg",
      },
    ]);

    const roles = await EmployeeRole.bulkCreate(
      [
        { name: "Cocinero" },
        { name: "Repartidor" },
        { name: "Mesero" },
        { name: "Cajero" },
      ],
      { returning: true }
    );
    const rolId = (nombre) => roles.find((r) => r.name === nombre)?.id;

    await Employee.bulkCreate([
      {
        cui: "1234567890101",
        primer_nombre: "Juan",
        segundo_nombre: "Carlos",
        primer_apellido: "Pérez",
        segundo_apellido: "López",
        telefono: "5555-1111",
        telefono_emergencia: "5555-0000",
        fecha_contratacion: "2024-01-10",
        salario: 4500.0,
        activo: true,
        rol_id: rolId("Cocinero"),
      },
      {
        cui: "2345678901212",
        primer_nombre: "María",
        primer_apellido: "Gómez",
        telefono: "5555-2222",
        fecha_contratacion: "2024-03-05",
        salario: 4200.0,
        activo: true,
        rol_id: rolId("Mesero"),
      },
      {
        cui: "3456789012323",
        primer_nombre: "Luis",
        primer_apellido: "Ruiz",
        telefono: "5555-3333",
        fecha_contratacion: "2024-05-20",
        salario: 4300.0,
        activo: true,
        rol_id: rolId("Repartidor"),
      },
    ]);

    const passCliente = await bcrypt.hash("cliente123", 10);
    const c1 = await Cliente.create({
      nombre: "Juan",
      apellido: "Pérez",
      correo_electronico: "juan@correo.com",
      contrasena: passCliente,
    });

    await Direccion.bulkCreate([
      {
        id_cliente: c1.id_cliente,
        tipo_direccion: "Casa",
        calle: "Calle Falsa 123",
        ciudad: "Guatemala",
        estado: "Guatemala",
        codigo_postal: "01010",
      },
      {
        id_cliente: c1.id_cliente,
        tipo_direccion: "Oficina",
        calle: "Av. Reforma 456",
        ciudad: "Guatemala",
        estado: "Guatemala",
        codigo_postal: "01011",
      },
    ]);

    await Telefono.bulkCreate([
      { id_cliente: c1.id_cliente, numero: "55551111", tipo: "Movil" },
      { id_cliente: c1.id_cliente, numero: "22223333", tipo: "Casa" },
    ]);

    const menu = await MenuItem.findAll();
    const byName = (n) => menu.find((m) => m.name === n);

    const pizza4q = byName("Cuatro Quesos");
    const pepperoni = byName("Pepperoni");
    const coca = byName("Coca-Cola 600ml");

    {
      const items = [
        { menuItem: pizza4q, qty: 1 },
        { menuItem: coca, qty: 2 },
      ];
      const subtotal = items.reduce(
        (acc, it) => acc + it.menuItem.price * it.qty,
        0
      );
      const tax = +(subtotal * 0.12).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      const order = await Order.create({
        id_cliente: clienteLogin.id_cliente,
        subtotal,
        tax,      
        total,
        metodo_pago: "tarjeta",
        estado: "pagada",
      });

      for (const it of items) {
        await OrderItem.create({
          id_order: order.id_order,
          id_menu_item: it.menuItem.id,
          name: it.menuItem.name,
          price: it.menuItem.price,
          qty: it.qty,
        });
      }
    }

    {
      const items = [
        { menuItem: pepperoni, qty: 1 },
        { menuItem: coca, qty: 1 },
      ];
      const subtotal = items.reduce(
        (acc, it) => acc + it.menuItem.price * it.qty,
        0
      );
      const tax = +(subtotal * 0.12).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      const order = await Order.create({
        id_cliente: c1.id_cliente,
        subtotal,
        tax,           
        total,
        metodo_pago: "efectivo",
        estado: "pagada",
      });

      for (const it of items) {
        await OrderItem.create({
          id_order: order.id_order,
          id_menu_item: it.menuItem.id,
          name: it.menuItem.name,
          price: it.menuItem.price,
          qty: it.qty,
        });
      }
    }

    console.log("🍕 Datos iniciales insertados (usuarios, menú, roles, empleados, clientes, órdenes)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al sincronizar:", err);
    process.exit(1);
  }
})();
